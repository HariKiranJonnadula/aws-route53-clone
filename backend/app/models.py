import datetime
import uuid
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from .database import Base


def generate_zone_id():
    return "Z" + uuid.uuid4().hex[:12].upper()


def generate_record_id():
    return "REC-" + uuid.uuid4().hex[:12].upper()


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=False, default="AWS Demo User")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    hosted_zones = relationship("HostedZone", back_populates="user", cascade="all, delete-orphan")


class HostedZone(Base):
    __tablename__ = "hosted_zones"

    id = Column(String, primary_key=True, default=generate_zone_id)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String, index=True, nullable=False)
    type = Column(String, default="Public", nullable=False)  # "Public" or "Private"
    description = Column(Text, default="", nullable=True)
    status = Column(String, default="Active", nullable=False)
    vpc_id = Column(String, nullable=True)
    vpc_region = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="hosted_zones")
    records = relationship("DNSRecord", back_populates="hosted_zone", cascade="all, delete-orphan")

    @property
    def record_count(self):
        return len(self.records)


class DNSRecord(Base):
    __tablename__ = "dns_records"

    id = Column(String, primary_key=True, default=generate_record_id)
    hosted_zone_id = Column(String, ForeignKey("hosted_zones.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String, index=True, nullable=False)
    type = Column(String, index=True, nullable=False)  # A, AAAA, CNAME, TXT, MX, NS, PTR, SRV, CAA, SOA
    ttl = Column(Integer, default=300, nullable=False)
    value = Column(Text, nullable=False)  # multi-line or single record value
    routing_policy = Column(String, default="Simple", nullable=False)
    weight = Column(Integer, nullable=True)
    priority = Column(Integer, nullable=True)
    port = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    hosted_zone = relationship("HostedZone", back_populates="records")
