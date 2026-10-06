import hashlib
from sqlalchemy.orm import Session
from .models import User, HostedZone, DNSRecord


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def seed_database(db: Session):
    # Check if demo user already exists
    demo_user = db.query(User).filter(User.email == "demo@route53.local").first()
    if not demo_user:
        demo_user = User(
            email="demo@route53.local",
            password_hash=hash_password("demo123"),
            name="AWS Route53 Admin"
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)

    # Check if hosted zones exist
    existing_zones = db.query(HostedZone).count()
    if existing_zones == 0:
        # Zone 1: example.com (Public)
        zone1 = HostedZone(
            id="Z04281923G78Q29KLMNO",
            user_id=demo_user.id,
            name="example.com",
            type="Public",
            description="Production public hosted zone for primary domain",
            status="Active"
        )
        db.add(zone1)
        db.commit()

        # Records for example.com
        records_z1 = [
            DNSRecord(
                hosted_zone_id=zone1.id,
                name="example.com",
                type="A",
                ttl=300,
                value="93.184.216.34",
                routing_policy="Simple"
            ),
            DNSRecord(
                hosted_zone_id=zone1.id,
                name="example.com",
                type="AAAA",
                ttl=300,
                value="2606:2800:220:1:248:1893:25c8:1946",
                routing_policy="Simple"
            ),
            DNSRecord(
                hosted_zone_id=zone1.id,
                name="www.example.com",
                type="CNAME",
                ttl=300,
                value="example.com",
                routing_policy="Simple"
            ),
            DNSRecord(
                hosted_zone_id=zone1.id,
                name="api.example.com",
                type="A",
                ttl=60,
                value="54.239.28.85\n54.239.28.86",
                routing_policy="Simple"
            ),
            DNSRecord(
                hosted_zone_id=zone1.id,
                name="example.com",
                type="MX",
                ttl=3600,
                priority=10,
                value="mail.example.com",
                routing_policy="Simple"
            ),
            DNSRecord(
                hosted_zone_id=zone1.id,
                name="example.com",
                type="TXT",
                ttl=300,
                value='"v=spf1 include:_spf.google.com ~all"',
                routing_policy="Simple"
            ),
            DNSRecord(
                hosted_zone_id=zone1.id,
                name="example.com",
                type="CAA",
                ttl=300,
                value='0 issue "amazon.com"',
                routing_policy="Simple"
            ),
            DNSRecord(
                hosted_zone_id=zone1.id,
                name="example.com",
                type="NS",
                ttl=172800,
                value="ns-123.awsdns-15.com.\nns-789.awsdns-34.net.\nns-1024.awsdns-00.org.\nns-1536.awsdns-20.co.uk.",
                routing_policy="Simple"
            ),
            DNSRecord(
                hosted_zone_id=zone1.id,
                name="example.com",
                type="SOA",
                ttl=900,
                value="ns-123.awsdns-15.com. awsdns-hostmaster.amazon.com. 1 7200 900 1209600 86400",
                routing_policy="Simple"
            )
        ]
        db.add_all(records_z1)

        # Zone 2: company.internal (Private)
        zone2 = HostedZone(
            id="Z08192301K39P01WXYZQ",
            user_id=demo_user.id,
            name="company.internal",
            type="Private",
            description="Internal corporate network VPC DNS resolution",
            status="Active",
            vpc_id="vpc-0a1b2c3d4e5f67890",
            vpc_region="us-east-1"
        )
        db.add(zone2)
        db.commit()

        records_z2 = [
            DNSRecord(
                hosted_zone_id=zone2.id,
                name="db.company.internal",
                type="A",
                ttl=300,
                value="10.0.4.15",
                routing_policy="Simple"
            ),
            DNSRecord(
                hosted_zone_id=zone2.id,
                name="redis.company.internal",
                type="A",
                ttl=60,
                value="10.0.5.20",
                routing_policy="Simple"
            ),
            DNSRecord(
                hosted_zone_id=zone2.id,
                name="_sip._tcp.company.internal",
                type="SRV",
                ttl=300,
                priority=10,
                weight=60,
                port=5060,
                value="sipserver.company.internal",
                routing_policy="Simple"
            ),
            DNSRecord(
                hosted_zone_id=zone2.id,
                name="company.internal",
                type="NS",
                ttl=172800,
                value="ns-512.awsdns-00.com.\nns-1024.awsdns-01.net.",
                routing_policy="Simple"
            ),
            DNSRecord(
                hosted_zone_id=zone2.id,
                name="company.internal",
                type="SOA",
                ttl=900,
                value="ns-512.awsdns-00.com. awsdns-hostmaster.amazon.com. 1 7200 900 1209600 86400",
                routing_policy="Simple"
            )
        ]
        db.add_all(records_z2)

        # Zone 3: cloudservices.io (Public)
        zone3 = HostedZone(
            id="Z09923847J12M45QRSTU",
            user_id=demo_user.id,
            name="cloudservices.io",
            type="Public",
            description="Microservices infrastructure gateway",
            status="Active"
        )
        db.add(zone3)
        db.commit()

        records_z3 = [
            DNSRecord(
                hosted_zone_id=zone3.id,
                name="cloudservices.io",
                type="A",
                ttl=300,
                value="13.248.169.48",
                routing_policy="Simple"
            ),
            DNSRecord(
                hosted_zone_id=zone3.id,
                name="auth.cloudservices.io",
                type="CNAME",
                ttl=300,
                value="login.cloudservices.io",
                routing_policy="Simple"
            ),
            DNSRecord(
                hosted_zone_id=zone3.id,
                name="cloudservices.io",
                type="NS",
                ttl=172800,
                value="ns-200.awsdns-25.com.\nns-400.awsdns-50.org.",
                routing_policy="Simple"
            ),
            DNSRecord(
                hosted_zone_id=zone3.id,
                name="cloudservices.io",
                type="SOA",
                ttl=900,
                value="ns-200.awsdns-25.com. awsdns-hostmaster.amazon.com. 1 7200 900 1209600 86400",
                routing_policy="Simple"
            )
        ]
        db.add_all(records_z3)

        db.commit()
