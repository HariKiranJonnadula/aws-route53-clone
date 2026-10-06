from math import ceil
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import or_

from ..database import get_db
from ..models import HostedZone, DNSRecord, User
from ..schemas import (
    DNSRecordCreate,
    DNSRecordUpdate,
    DNSRecordOut,
    DNSRecordListResponse
)
from .auth import get_current_user

router = APIRouter(tags=["dns-records"])


class BulkDeleteRequest(BaseModel):
    record_ids: List[str]


def normalize_record_name(name: str, zone_name: str) -> str:
    name = name.strip()
    zone_name = zone_name.strip().rstrip(".")
    if not name or name == "@":
        return zone_name
    name = name.rstrip(".")
    if not name.endswith(zone_name):
        return f"{name}.{zone_name}"
    return name


@router.get("/api/hosted-zones/{zone_id}/records", response_model=DNSRecordListResponse)
def list_dns_records(
    zone_id: str,
    search: Optional[str] = Query(None, description="Search query"),
    type: Optional[str] = Query(None, description="Record type filter"),
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    zone = db.query(HostedZone).filter(HostedZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hosted zone not found")

    query = db.query(DNSRecord).filter(DNSRecord.hosted_zone_id == zone_id)

    if search:
        search_filter = f"%{search.strip()}%"
        query = query.filter(
            or_(
                DNSRecord.name.ilike(search_filter),
                DNSRecord.value.ilike(search_filter),
                DNSRecord.type.ilike(search_filter)
            )
        )

    if type and type != "All":
        query = query.filter(DNSRecord.type == type.upper())

    total = query.count()
    total_pages = max(1, ceil(total / limit))
    offset = (page - 1) * limit

    records = query.order_by(DNSRecord.name.asc(), DNSRecord.type.asc()).offset(offset).limit(limit).all()

    return DNSRecordListResponse(
        items=[DNSRecordOut.model_validate(r) for r in records],
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )


@router.post("/api/hosted-zones/{zone_id}/records", response_model=DNSRecordOut, status_code=status.HTTP_201_CREATED)
def create_dns_record(
    zone_id: str,
    payload: DNSRecordCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    zone = db.query(HostedZone).filter(HostedZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hosted zone not found")

    full_name = normalize_record_name(payload.name, zone.name)

    # Validate duplicate for simple routing
    existing = db.query(DNSRecord).filter(
        DNSRecord.hosted_zone_id == zone_id,
        DNSRecord.name == full_name,
        DNSRecord.type == payload.type.upper(),
        DNSRecord.routing_policy == payload.routing_policy
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Record of type {payload.type} with name '{full_name}' already exists in this hosted zone."
        )

    record = DNSRecord(
        hosted_zone_id=zone_id,
        name=full_name,
        type=payload.type.upper(),
        ttl=payload.ttl,
        value=payload.value.strip(),
        routing_policy=payload.routing_policy or "Simple",
        weight=payload.weight,
        priority=payload.priority,
        port=payload.port
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return DNSRecordOut.model_validate(record)


@router.get("/api/records/{record_id}", response_model=DNSRecordOut)
def get_dns_record(
    record_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    record = db.query(DNSRecord).filter(DNSRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record not found")
    return DNSRecordOut.model_validate(record)


@router.put("/api/records/{record_id}", response_model=DNSRecordOut)
def update_dns_record(
    record_id: str,
    payload: DNSRecordUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    record = db.query(DNSRecord).filter(DNSRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record not found")

    if payload.name is not None:
        zone = db.query(HostedZone).filter(HostedZone.id == record.hosted_zone_id).first()
        record.name = normalize_record_name(payload.name, zone.name if zone else "")
    if payload.type is not None:
        record.type = payload.type.upper()
    if payload.ttl is not None:
        record.ttl = payload.ttl
    if payload.value is not None:
        record.value = payload.value.strip()
    if payload.routing_policy is not None:
        record.routing_policy = payload.routing_policy
    if payload.weight is not None:
        record.weight = payload.weight
    if payload.priority is not None:
        record.priority = payload.priority
    if payload.port is not None:
        record.port = payload.port

    db.commit()
    db.refresh(record)
    return DNSRecordOut.model_validate(record)


@router.delete("/api/records/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_dns_record(
    record_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    record = db.query(DNSRecord).filter(DNSRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record not found")

    # In Route 53, standard NS and SOA apex records usually cannot be deleted without special care, but let user delete custom records
    db.delete(record)
    db.commit()
    return None


@router.post("/api/hosted-zones/{zone_id}/records/bulk-delete", status_code=status.HTTP_200_OK)
def bulk_delete_records(
    zone_id: str,
    payload: BulkDeleteRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    deleted_count = db.query(DNSRecord).filter(
        DNSRecord.hosted_zone_id == zone_id,
        DNSRecord.id.in_(payload.record_ids)
    ).delete(synchronize_session=False)
    db.commit()
    return {"deleted_count": deleted_count}
