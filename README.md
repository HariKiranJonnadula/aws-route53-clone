# Amazon Route 53 Web Application Clone

A production-grade, full-stack clone of the **AWS Route 53** web application built with **Next.js (TypeScript)**, **FastAPI (Python)**, and **SQLite (SQLAlchemy)**. The user interface accurately recreates the AWS Management Console / Cloudscape design system, core workflows, and DNS record management experience.

---

## Architecture Overview

```
                                      +------------------------------------+
                                      |          Web Browser               |
                                      +------------------------------------+
                                                        |
                                                        |  HTTP / REST (Port 3000)
                                                        v
                     +----------------------------------------------------------------------+
                     |                           Frontend (Next.js)                         |
                     |  - App Router (React 19 / TypeScript)                                |
                     |  - AWS Management Console UI (Cloudscape Design Tokens)              |
                     |  - Dynamic Record Creation (A, AAAA, CNAME, TXT, MX, NS, SRV, CAA)   |
                     |  - BIND Zone RFC 1035 Import / Export + JSON Exporter                |
                     |  - Bulk Operations, Search, Type Filters, Pagination & Dark Mode     |
                     +----------------------------------------------------------------------+
                                                        |
                                                        |  REST API (JSON)
                                                        v
                     +----------------------------------------------------------------------+
                     |                           Backend (FastAPI)                          |
                     |  - High-performance Async Python API (Port 8000)                     |
                     |  - Pydantic v2 validation & serialization schemas                    |
                     |  - SQLAlchemy ORM with foreign keys & cascade deletions              |
                     |  - Auto-generation of apex NS & SOA records upon zone creation       |
                     |  - RFC 1035 BIND Zone File Parser & Serializer                       |
                     +----------------------------------------------------------------------+
                                                        |
                                                        |  SQLAlchemy Engine
                                                        v
                     +----------------------------------------------------------------------+
                     |                          Database (SQLite)                           |
                     |  - route53.db                                                        |
                     |  - Tables: users, hosted_zones, dns_records                          |
                     |  - Persistent storage across reboots                                 |
                     +----------------------------------------------------------------------+
```

---

## Directory Structure

```text
AWS Route53/
├── frontend/
│   ├── app/
│   │   ├── layout.tsx                     # Root AWS shell layout with AuthProvider
│   │   ├── globals.css                    # AWS Cloudscape design tokens & dark mode
│   │   ├── page.tsx                       # Redirects to /hosted-zones
│   │   ├── login/page.tsx                 # AWS sign-in console with 1-click demo login
│   │   ├── dashboard/page.tsx             # Route 53 resource overview & metrics
│   │   ├── hosted-zones/
│   │   │   ├── page.tsx                   # Hosted zones table, search, filters, CRUD
│   │   │   └── [zoneId]/page.tsx          # DNS Record management table & bulk actions
│   │   ├── traffic-policies/page.tsx      # Polished "Coming Soon" section
│   │   ├── health-checks/page.tsx         # Polished "Coming Soon" section
│   │   ├── resolver/page.tsx              # Polished "Coming Soon" section
│   │   └── profiles/page.tsx              # Polished "Coming Soon" section
│   ├── components/
│   │   ├── layout/                        # TopNav (search, region, account), Sidebar, Breadcrumb
│   │   ├── ui/                            # Modal, Badge, Pagination, Flashbar Notification
│   │   ├── hosted-zones/                  # CreateZoneModal, EditZoneModal, DeleteZoneModal
│   │   └── records/                       # RecordFormModal, DeleteRecordModal, BulkDeleteModal,
│   │                                      # ExportZoneModal, ImportBindModal
│   ├── lib/
│   │   ├── api.ts                         # Type-safe API client wrapper
│   │   └── auth-context.tsx               # Persistent session context
│   ├── types/index.ts                     # TypeScript data contracts & schemas
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── main.py                        # FastAPI application entrypoint & CORS setup
│   │   ├── database.py                    # SQLite engine and session factory
│   │   ├── models.py                      # SQLAlchemy models with cascade relations
│   │   ├── schemas.py                     # Pydantic validation & response schemas
│   │   ├── seed.py                        # Default seed generator with realistic zones
│   │   └── routers/
│   │       ├── auth.py                    # Login, logout, current user (/api/auth)
│   │       ├── hosted_zones.py            # Hosted Zone CRUD & search (/api/hosted-zones)
│   │       ├── records.py                 # DNS Records CRUD & bulk actions (/api/records)
│   │       └── export_import.py           # BIND zone & JSON import/export
│   ├── requirements.txt
│   └── route53.db                         # SQLite database file
│
└── README.md
```

---

## Database Schema

### 1. `users`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | VARCHAR | PRIMARY KEY | UUID string |
| `email` | VARCHAR | UNIQUE, NOT NULL | Account email (e.g. `demo@route53.local`) |
| `password_hash` | VARCHAR | NOT NULL | SHA-256 hashed password |
| `name` | VARCHAR | NOT NULL | Display name (`AWS Route53 Admin`) |
| `created_at` | DATETIME | DEFAULT utcnow | Account creation timestamp |

### 2. `hosted_zones`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | VARCHAR | PRIMARY KEY | AWS Zone ID format (e.g. `Z04281923G78Q29KLMNO`) |
| `user_id` | VARCHAR | FOREIGN KEY -> `users.id` | Zone owner |
| `name` | VARCHAR | NOT NULL, INDEX | Domain name (e.g. `example.com`) |
| `type` | VARCHAR | NOT NULL | `"Public"` or `"Private"` |
| `description` | TEXT | NULLABLE | Comments or description |
| `status` | VARCHAR | DEFAULT `"Active"` | Operational status |
| `vpc_id` | VARCHAR | NULLABLE | Associated VPC ID (for private zones) |
| `vpc_region` | VARCHAR | NULLABLE | Associated VPC Region |
| `created_at` | DATETIME | DEFAULT utcnow | Timestamp |
| `updated_at` | DATETIME | DEFAULT utcnow | Timestamp |

### 3. `dns_records`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | VARCHAR | PRIMARY KEY | Record ID format (`REC-XXXXXXXXXXXX`) |
| `hosted_zone_id` | VARCHAR | FOREIGN KEY -> `hosted_zones.id` (CASCADE) | Zone reference |
| `name` | VARCHAR | NOT NULL, INDEX | Full FQDN record name |
| `type` | VARCHAR | NOT NULL, INDEX | `A`, `AAAA`, `CNAME`, `TXT`, `MX`, `NS`, `PTR`, `SRV`, `CAA`, `SOA` |
| `ttl` | INTEGER | NOT NULL (DEFAULT 300) | Time-To-Live in seconds |
| `value` | TEXT | NOT NULL | Record data / routing target |
| `routing_policy` | VARCHAR | DEFAULT `"Simple"` | `Simple`, `Weighted`, `Latency`, `Failover`, `Geolocation` |
| `weight` | INTEGER | NULLABLE | Weight for weighted routing |
| `priority` | INTEGER | NULLABLE | Priority (for MX, SRV) |
| `port` | INTEGER | NULLABLE | Port number (for SRV) |
| `created_at` | DATETIME | DEFAULT utcnow | Creation timestamp |
| `updated_at` | DATETIME | DEFAULT utcnow | Modification timestamp |

---

## API Documentation

FastAPI provides interactive Swagger documentation available at `http://localhost:8000/docs`.

### Authentication Endpoints
- `POST /api/auth/login`: Authenticate with email & password. Returns JWT/Bearer token and user profile.
- `POST /api/auth/logout`: Clears session.
- `GET /api/auth/me`: Retrieves current authenticated user.

### Hosted Zone Endpoints
- `GET /api/hosted-zones`: List hosted zones with pagination (`page`, `limit`), `search` query, and `type` filter (`Public`/`Private`).
- `POST /api/hosted-zones`: Create a new hosted zone. Automatically generates apex **NS** and **SOA** records matching real Route 53 behavior.
- `GET /api/hosted-zones/{id}`: Retrieve a single hosted zone by ID.
- `PUT /api/hosted-zones/{id}`: Update hosted zone description or status.
- `DELETE /api/hosted-zones/{id}`: Delete hosted zone and cascade delete all its records.

### DNS Record Endpoints
- `GET /api/hosted-zones/{zone_id}/records`: List records for a zone with pagination, search by name or value, and type filtering (`A`, `CNAME`, etc.).
- `POST /api/hosted-zones/{zone_id}/records`: Create a new DNS record. Formats relative names against the zone apex.
- `GET /api/records/{id}`: Get record details.
- `PUT /api/records/{id}`: Update record name, TTL, value, or routing parameters.
- `DELETE /api/records/{id}`: Delete a single record.
- `POST /api/hosted-zones/{zone_id}/records/bulk-delete`: Bulk delete multiple records in one transaction.

### Bonus: BIND Zone File & JSON Import/Export
- `GET /api/hosted-zones/{zone_id}/export`: Export hosted zone as RFC 1035 BIND Zone file or structured JSON.
- `POST /api/hosted-zones/{zone_id}/import-bind`: Parse and import an RFC 1035 zone file into the hosted zone.

---

## Quickstart & Local Setup

### Prerequisites
- Node.js v18+ (tested with v22)
- Python 3.10+ (tested with 3.12)

### 1. Run the Backend API

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
The backend API is now running at `http://localhost:8000`.  
Swagger documentation is available at `http://localhost:8000/docs`.

### 2. Run the Frontend Application

In another terminal window:

```bash
cd frontend

# Install dependencies
npm install

# Start Next.js development server
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## Demo Credentials & Seed Data

On initial backend startup, the SQLite database is automatically seeded with a demo administrator account and realistic hosted zones and DNS records:

- **Demo Email**: `demo@route53.local`
- **Demo Password**: `demo123`
- *(A 1-Click "Quick Demo Sign In" button is also provided on the login page for convenience)*

### Seed Hosted Zones
1. **`example.com`** (Public Hosted Zone)
   - Contains 9 records: `A`, `AAAA`, `CNAME` (`www`), `A` (`api`), `MX` (`mail`), `TXT` (`v=spf1`), `CAA`, `NS`, `SOA`.
2. **`company.internal`** (Private Hosted Zone)
   - Associated with VPC `vpc-0a1b2c3d4e5f67890` in `us-east-1`.
   - Contains internal `A` records (`db`, `redis`), `SRV` record (`_sip._tcp`), `NS`, and `SOA`.
3. **`cloudservices.io`** (Public Hosted Zone)
   - Contains microservices endpoints: `A`, `CNAME` (`auth`), `NS`, `SOA`.

---

## AWS Route 53 Features Recreated

- **AWS Cloudscape Navigation**: AWS top navigation bar with service search input, region display (`Global (Route 53)`), account dropdown, and dark mode toggle.
- **Persistent Route 53 Sidebar**: Collapsible DNS management navigation (Dashboard, Hosted zones, Traffic policies, Health checks, Resolver, Profiles).
- **Dynamic Record Creation Form**: Tailored inputs depending on selected record type:
  - `A` / `AAAA`: IPv4 / IPv6 addresses
  - `CNAME`: Canonical name target domain
  - `TXT`: Quoted text strings (SPF, verification)
  - `MX`: Mail priority and mail exchange host
  - `SRV`: Priority, weight, port, and service target
  - `CAA`: Flags, tag (`issue`, `issuewild`, `iodef`), and CA value
  - `TTL`: Quick presets (60s, 300s, 900s, 3600s, 86400s) or custom integer
- **Safety Confirmations**: Guard modals for destructive actions (e.g. typing "delete" to delete a hosted zone, warnings when modifying apex NS/SOA records).
- **Search & Filters**: Real-time filtering by subdomain name, target IP/value, and record type.
- **Bonus Features**:
  - **Export Zone**: Export as standard RFC 1035 BIND Zone file or JSON.
  - **Import Zone**: Import records by uploading or pasting BIND zone files.
  - **Bulk Deletion**: Multi-select records with checkboxes and batch delete.
  - **Dark Mode**: Dark mode toggle in the top bar.

---

## Production Deployment Guide

### Frontend (e.g. Vercel)
1. Deploy the `frontend/` directory to Vercel.
2. Set the environment variable:
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend-api.onrender.com
   ```

### Backend (e.g. Render / Fly.io / Railway / Docker)
Deploy the `backend/` directory with persistent disk storage enabled for SQLite (`route53.db`), or mount a Docker volume:
```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
VOLUME ["/app/data"]
ENV DB_PATH=/app/data/route53.db
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```
