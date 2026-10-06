from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


# Auth Schemas
class LoginRequest(BaseModel):
    email: str
    password: str


class UserOut(BaseModel):
    id: str
    email: str
    name: str
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# Hosted Zone Schemas
class HostedZoneCreate(BaseModel):
    name: str = Field(..., description="Domain name, e.g. example.com")
    type: str = Field(default="Public", description="Public or Private")
    description: Optional[str] = ""
    vpc_id: Optional[str] = None
    vpc_region: Optional[str] = None


class HostedZoneUpdate(BaseModel):
    description: Optional[str] = None
    status: Optional[str] = None


class HostedZoneOut(BaseModel):
    id: str
    name: str
    type: str
    description: Optional[str]
    status: str
    record_count: int
    vpc_id: Optional[str]
    vpc_region: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class HostedZoneListResponse(BaseModel):
    items: List[HostedZoneOut]
    total: int
    page: int
    limit: int
    total_pages: int


# DNS Record Schemas
class DNSRecordCreate(BaseModel):
    name: str
    type: str  # A, AAAA, CNAME, TXT, MX, NS, PTR, SRV, CAA, SOA
    ttl: int = 300
    value: str
    routing_policy: str = "Simple"
    weight: Optional[int] = None
    priority: Optional[int] = None
    port: Optional[int] = None


class DNSRecordUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    ttl: Optional[int] = None
    value: Optional[str] = None
    routing_policy: Optional[str] = None
    weight: Optional[int] = None
    priority: Optional[int] = None
    port: Optional[int] = None


class DNSRecordOut(BaseModel):
    id: str
    hosted_zone_id: str
    name: str
    type: str
    ttl: int
    value: str
    routing_policy: str
    weight: Optional[int]
    priority: Optional[int]
    port: Optional[int]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DNSRecordListResponse(BaseModel):
    items: List[DNSRecordOut]
    total: int
    page: int
    limit: int
    total_pages: int


# BIND / JSON Import & Export Schemas
class BindImportRequest(BaseModel):
    content: str


class BindImportResponse(BaseModel):
    created_count: int
    errors: List[str] = []


class ZoneExportResponse(BaseModel):
    zone: HostedZoneOut
    records: List[DNSRecordOut]
    bind_format: str
