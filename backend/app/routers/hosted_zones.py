from math import ceil
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from ..database import get_db
from ..models import HostedZone, DNSRecord, User
from ..schemas import (
    HostedZoneCreate,
    HostedZoneUpdate,
    HostedZoneOut,
    HostedZoneListResponse
)
from .auth import get_current_user

router = APIRouter(prefix="/api/hosted-zones", tags=["hosted-zones"])


@router.get("", response_model=HostedZoneListResponse)
def list_hosted_zones(
    search: Optional[str] = Query(None, description="Search query"),
    type: Optional[str] = Query(None, description="Filter by type (Public/Private)"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    query = db.query(HostedZone)

    if search:
        search_filter = f"%{search.strip()}%"
        query = query.filter(
            or_(
                HostedZone.name.ilike(search_filter),
                HostedZone.description.ilike(search_filter),
                HostedZone.id.ilike(search_filter)
            )
        )

    if type and type != "All":
        query = query.filter(HostedZone.type == type)

    total = query.count()
    total_pages = max(1, ceil(total / limit))
    offset = (page - 1) * limit

    zones = query.order_by(HostedZone.created_at.desc()).offset(offset).limit(limit).all()

    return HostedZoneListResponse(
        items=[HostedZoneOut.model_validate(z) for z in zones],
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )


@router.post("", response_model=HostedZoneOut, status_code=status.HTTP_201_CREATED)
def create_hosted_zone(
    payload: HostedZoneCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    # Ensure zone name is normalized (e.g. example.com or example.com.)
    clean_name = payload.name.strip().lower()
    if clean_name.endswith("."):
        clean_name = clean_name[:-1]

    # Check for duplicate
    existing = db.query(HostedZone).filter(HostedZone.name == clean_name).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Hosted zone '{clean_name}' already exists with ID {existing.id}."
        )

    zone = HostedZone(
        user_id=user.id,
        name=clean_name,
        type=payload.type,
        description=payload.description or "",
        status="Active",
        vpc_id=payload.vpc_id,
        vpc_region=payload.vpc_region
    )
    db.add(zone)
    db.commit()
    db.refresh(zone)

    # Real Route 53 automatically assigns 4 name servers and an SOA record upon creation!
    ns_servers = (
        f"ns-123.awsdns-15.com.\n"
        f"ns-789.awsdns-34.net.\n"
        f"ns-1024.awsdns-00.org.\n"
        f"ns-1536.awsdns-20.co.uk."
    )
    ns_record = DNSRecord(
        hosted_zone_id=zone.id,
        name=zone.name,
        type="NS",
        ttl=172800,
        value=ns_servers,
        routing_policy="Simple"
    )
    soa_record = DNSRecord(
        hosted_zone_id=zone.id,
        name=zone.name,
        type="SOA",
        ttl=900,
        value=f"ns-123.awsdns-15.com. awsdns-hostmaster.amazon.com. 1 7200 900 1209600 86400",
        routing_policy="Simple"
    )
    db.add(ns_record)
    db.add(soa_record)
    db.commit()
    db.refresh(zone)

    return HostedZoneOut.model_validate(zone)


@router.get("/{zone_id}", response_model=HostedZoneOut)
def get_hosted_zone(
    zone_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    zone = db.query(HostedZone).filter(HostedZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hosted zone not found")
    return HostedZoneOut.model_validate(zone)


@router.put("/{zone_id}", response_model=HostedZoneOut)
def update_hosted_zone(
    zone_id: str,
    payload: HostedZoneUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    zone = db.query(HostedZone).filter(HostedZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hosted zone not found")

    if payload.description is not None:
        zone.description = payload.description
    if payload.status is not None:
        zone.status = payload.status

    db.commit()
    db.refresh(zone)
    return HostedZoneOut.model_validate(zone)


@router.delete("/{zone_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_hosted_zone(
    zone_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    zone = db.query(HostedZone).filter(HostedZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hosted zone not found")

    db.delete(zone)
    db.commit()
    return None
