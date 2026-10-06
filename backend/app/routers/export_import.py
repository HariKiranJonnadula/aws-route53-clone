import re
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import HostedZone, DNSRecord, User
from ..schemas import (
    HostedZoneOut,
    DNSRecordOut,
    ZoneExportResponse,
    BindImportRequest,
    BindImportResponse
)
from .auth import get_current_user

router = APIRouter(prefix="/api/hosted-zones", tags=["export-import"])


@router.get("/{zone_id}/export", response_model=ZoneExportResponse)
def export_hosted_zone(
    zone_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    zone = db.query(HostedZone).filter(HostedZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hosted zone not found")

    records = db.query(DNSRecord).filter(DNSRecord.hosted_zone_id == zone_id).order_by(DNSRecord.name, DNSRecord.type).all()

    # Generate standard RFC 1035 BIND Zone File
    lines = [
        f";; BIND Zone file for {zone.name}",
        f";; Exported from AWS Route 53 Clone",
        f"$ORIGIN {zone.name}.",
        f"$TTL 300\n"
    ]

    for rec in records:
        rel_name = rec.name
        if rel_name == zone.name:
            rel_name = "@"
        elif rel_name.endswith(f".{zone.name}"):
            rel_name = rel_name[:-len(f".{zone.name}")]

        # Multi-line values
        val_lines = rec.value.split("\n")
        for val in val_lines:
            val_clean = val.strip()
            if not val_clean:
                continue
            if rec.type == "MX" and rec.priority:
                lines.append(f"{rel_name:<20} {rec.ttl:<6} IN  MX    {rec.priority} {val_clean}")
            elif rec.type == "SRV" and rec.port:
                lines.append(f"{rel_name:<20} {rec.ttl:<6} IN  SRV   {rec.priority or 0} {rec.weight or 0} {rec.port} {val_clean}")
            else:
                lines.append(f"{rel_name:<20} {rec.ttl:<6} IN  {rec.type:<5} {val_clean}")

    bind_content = "\n".join(lines)

    return ZoneExportResponse(
        zone=HostedZoneOut.model_validate(zone),
        records=[DNSRecordOut.model_validate(r) for r in records],
        bind_format=bind_content
    )


@router.post("/{zone_id}/import-bind", response_model=BindImportResponse)
def import_bind_zone(
    zone_id: str,
    payload: BindImportRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    zone = db.query(HostedZone).filter(HostedZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hosted zone not found")

    lines = payload.content.splitlines()
    created = 0
    errors = []

    # Simple regex parser for standard BIND lines:
    # [name] [ttl] [IN] [type] [value...]
    pattern = re.compile(
        r"^(?P<name>\S+)\s+(?:(?P<ttl>\d+)\s+)?(?:IN\s+)?(?P<type>[A-Za-z0-9]+)\s+(?P<value>.+)$",
        re.IGNORECASE
    )

    for idx, raw_line in enumerate(lines, 1):
        line = raw_line.strip()
        if not line or line.startswith(";") or line.startswith("$"):
            continue

        match = pattern.match(line)
        if not match:
            continue

        data = match.groupdict()
        rtype = data["type"].upper()
        if rtype not in ["A", "AAAA", "CNAME", "TXT", "MX", "NS", "PTR", "SRV", "CAA"]:
            continue

        name_part = data["name"].strip()
        ttl = int(data["ttl"]) if data["ttl"] else 300
        val = data["value"].strip()

        # Normalize name
        if name_part == "@" or name_part == f"{zone.name}.":
            record_name = zone.name
        elif name_part.endswith("."):
            record_name = name_part[:-1]
        elif not name_part.endswith(zone.name):
            record_name = f"{name_part}.{zone.name}"
        else:
            record_name = name_part

        try:
            rec = DNSRecord(
                hosted_zone_id=zone.id,
                name=record_name,
                type=rtype,
                ttl=ttl,
                value=val,
                routing_policy="Simple"
            )
            db.add(rec)
            db.commit()
            created += 1
        except Exception as e:
            db.rollback()
            errors.append(f"Line {idx}: {str(e)}")

    return BindImportResponse(created_count=created, errors=errors)
