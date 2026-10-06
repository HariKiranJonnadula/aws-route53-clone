# Amazon Route 53 Web Application Clone

[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2016-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript%205-blue?logo=typescript)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.10%2B-blue?logo=python)](https://www.python.org/)
[![SQLite](https://img.shields.io/badge/Database-SQLite%203-003B57?logo=sqlite)](https://www.sqlite.org/)
[![AWS Design](https://img.shields.io/badge/Design-AWS%20Cloudscape-FF9900?logo=amazon-aws)](https://cloudscape.design/)

A full-stack, production-ready clone of the **Amazon Route 53** web application. This project faithfully recreates the authentic **AWS Management Console** experience, complete with persistent storage, a robust RESTful API, dynamic record configuration, and DNS zone management workflows.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Key Features](#key-features)
3. [Quickstart & Local Setup](#quickstart--local-setup)
4. [Demo Credentials & Seed Data](#demo-credentials--seed-data)
5. [User Guide & Workflows](#user-guide--workflows)
6. [API Specification](#api-specification)
7. [Database Schema](#database-schema)
8. [Project Structure](#project-structure)
9. [Bonus Features](#bonus-features)
10. [Production Deployment](#production-deployment)

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
                     |  - Next.js 16 App Router & TypeScript                                |
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
                     |  - Persistent storage in route53.db                                  |
                     |  - Relational schema: users -> hosted_zones -> dns_records           |
                     +----------------------------------------------------------------------+
```

---

## Key Features

### 1. Authentic AWS Route 53 Look and Feel
- **AWS Console Shell**: Squid Ink header (`#232f3e`), search shortcut (`Alt+S`), region badge (`Global (Route 53)`), account dropdown, and dark mode toggle.
- **Persistent Route 53 Sidebar**: Collapsible navigation with links to Dashboard, Hosted zones, Traffic policies, Health checks, Resolver, and Profiles.
- **AWS Design Elements**: Accurate breadcrumbs, compact tables with selectable rows, Cloudscape blue links (`#0972d3`), AWS orange action buttons (`#ec7211`), flashbars, and modal dialogs.

### 2. Complete Hosted Zone Management
- Create **Public** or **Private** hosted zones (with VPC ID & Region associations).
- Automatic generation of 4 AWS Name Servers (`NS`) and Start of Authority (`SOA`) records upon zone creation.
- Real-time search by domain name or zone ID.
- Filter by Public vs. Private zone types.
- Paginated table with customizable items per page.
- Edit descriptions and status, or delete with safety confirmation.

### 3. Dynamic DNS Records Management
- Full CRUD for all common DNS record types:
  - **A**: Maps to IPv4 addresses (single or multi-line).
  - **AAAA**: Maps to IPv6 addresses.
  - **CNAME**: Canonical domain aliases.
  - **TXT**: Text strings, SPF, DKIM verification (auto-quotes).
  - **MX**: Mail exchange hosts with configurable priority.
  - **NS**: Authoritative name server delegations.
  - **PTR**: Reverse lookup domain pointers.
  - **SRV**: Service records with priority, weight, port, and target.
  - **CAA**: Certificate authority authorizations with flags and tags (`issue`, `issuewild`, `iodef`).
  - **SOA**: Start of authority serial and timers.
- **Dynamic Form**: Fields automatically adjust based on the selected record type.
- **TTL Presets**: 60s (1m), 300s (5m), 900s (15m), 3600s (1h), 86400s (1d), or custom seconds.
- **Routing Policies**: Simple, Weighted, Latency, Failover, Geolocation.

---

## Quickstart & Local Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: v3.10 or higher
- **Git**

---

### Step 1: Start the Backend (FastAPI)

1. Open a terminal and enter the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   - **Windows (PowerShell)**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\activate
     ```
   - **Linux / macOS**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Launch the FastAPI server:
   ```bash
   uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```

- Backend API: `http://localhost:8000`
- Interactive Swagger Docs: `http://localhost:8000/docs`

---

### Step 2: Start the Frontend (Next.js)

1. Open a **second terminal** and enter the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch the development server:
   ```bash
   npm run dev
   ```

4. Open your web browser:
   ```text
   http://localhost:3000
   ```

---

## Demo Credentials & Seed Data

The database is pre-seeded on first run with demo credentials and realistic hosted zones:

| Field | Demo Credential |
|---|---|
| **Email** | `demo@route53.local` |
| **Password** | `demo123` |

> On the login page, you can also click the **"1-Click Auto Fill & Sign In"** button for immediate access.

### Pre-seeded Hosted Zones
1. **`example.com`** *(Public Zone)*: 9 records (`A`, `AAAA`, `CNAME`, `MX`, `TXT`, `CAA`, `NS`, `SOA`).
2. **`company.internal`** *(Private VPC Zone)*: 5 records (`A` for database/redis, `SRV` for SIP, `NS`, `SOA`).
3. **`cloudservices.io`** *(Public Zone)*: 4 records (`A`, `CNAME`, `NS`, `SOA`).

---

## User Guide & Workflows

### 1. Logging In
Navigate to `http://localhost:3000/login`. Enter the demo credentials or click **1-Click Auto Fill & Sign In**. Your session persists in the browser across page reloads.

### 2. Managing Hosted Zones
- View your hosted zones at `/hosted-zones`.
- To create a zone, click **"Create hosted zone"**, specify your domain name (e.g., `myproject.com`), choose **Public** or **Private**, and click submit. Route 53 will automatically assign 4 name servers and an SOA record.
- Search and filter by type using the search bar and dropdown.
- Click any zone name to enter its record management console.

### 3. Managing DNS Records
- Inside a hosted zone (`/hosted-zones/[zoneId]`), click **"Create record"**.
- Change the **Record type** dropdown — the form dynamically displays only relevant fields (e.g., mail server and priority for MX, or IPv4 inputs for A).
- To edit, select a record and click **"Edit record"**.
- To delete, select one or more records and click **"Delete record"** or **"Delete (N)"**.

### 4. Exporting & Importing
- **Export**: Click **"Export zone"** to view, copy, or download the zone as a standard **RFC 1035 BIND Zone file** or structured **JSON**.
- **Import**: Click **"Import records"** to upload a `.zone` file or paste BIND record syntax directly.

---

## API Specification

Interactive Swagger documentation is available at `http://localhost:8000/docs`.

### Authentication
- `POST /api/auth/login` — Authenticate and receive session token.
- `POST /api/auth/logout` — End session.
- `GET /api/auth/me` — Retrieve current authenticated profile.

### Hosted Zones
- `GET /api/hosted-zones` — List hosted zones with pagination (`page`, `limit`), `search`, and `type`.
- `POST /api/hosted-zones` — Create a hosted zone (auto-creates NS and SOA records).
- `GET /api/hosted-zones/{id}` — Retrieve a hosted zone by ID.
- `PUT /api/hosted-zones/{id}` — Update description or status.
- `DELETE /api/hosted-zones/{id}` — Delete hosted zone and cascade delete its records.

### DNS Records
- `GET /api/hosted-zones/{zone_id}/records` — List records for a zone with pagination, search, and type filter.
- `POST /api/hosted-zones/{zone_id}/records` — Create a DNS record in the zone.
- `GET /api/records/{id}` — Retrieve a record by ID.
- `PUT /api/records/{id}` — Update record value, TTL, or routing parameters.
- `DELETE /api/records/{id}` — Delete a record.
- `POST /api/hosted-zones/{zone_id}/records/bulk-delete` — Batch delete multiple records.

### Export & Import
- `GET /api/hosted-zones/{zone_id}/export` — Export zone records as BIND file and JSON.
- `POST /api/hosted-zones/{zone_id}/import-bind` — Import records from BIND zone text.

---

## Database Schema

Relational SQLite schema managed with SQLAlchemy 2.0:

```
+--------------------+           +----------------------+           +---------------------+
|       users        |           |     hosted_zones     |           |     dns_records     |
+--------------------+           +----------------------+           +---------------------+
| id (PK)            | 1       * | id (PK)              | 1       * | id (PK)             |
| email (Unique)     |---------->| user_id (FK)         |---------->| hosted_zone_id (FK) |
| password_hash      |           | name                 |           | name                |
| name               |           | type (Public/Private)|           | type (A, CNAME...)  |
| created_at         |           | description          |           | ttl                 |
+--------------------+           | status               |           | value               |
                                 | vpc_id               |           | routing_policy      |
                                 | vpc_region           |           | weight / priority   |
                                 | created_at           |           | port                |
                                 | updated_at           |           | created_at          |
                                 +----------------------+           +---------------------+
```

*Foreign keys are enforced with `ondelete="CASCADE"`. Deleting a hosted zone cleanly deletes all associated DNS records.*

---

## Project Structure

```text
AWS Route53/
├── frontend/                              # Next.js Application
│   ├── app/
│   │   ├── layout.tsx                     # Root AWS shell layout & AuthProvider
│   │   ├── globals.css                    # AWS Cloudscape design tokens
│   │   ├── login/page.tsx                 # AWS sign-in console
│   │   ├── dashboard/page.tsx             # Route 53 resource overview
│   │   ├── hosted-zones/
│   │   │   ├── page.tsx                   # Hosted Zones table, search, filter, CRUD
│   │   │   └── [zoneId]/page.tsx          # DNS Records management & bulk operations
│   │   ├── traffic-policies/              # Placeholder section
│   │   ├── health-checks/                 # Placeholder section
│   │   ├── resolver/                      # Placeholder section
│   │   └── profiles/                      # Placeholder section
│   ├── components/
│   │   ├── layout/                        # TopNav, Sidebar, Breadcrumb, AppShell
│   │   ├── ui/                            # Modal, Badge, Pagination, Flashbar Notification
│   │   ├── hosted-zones/                  # Zone creation, edit, and deletion modals
│   │   └── records/                       # Dynamic record forms, bulk delete, import/export
│   ├── lib/
│   │   ├── api.ts                         # Type-safe API client wrapper
│   │   └── auth-context.tsx               # Persistent session context
│   ├── types/index.ts                     # TypeScript data interfaces
│   └── README.md                          # Frontend-specific documentation
│
├── backend/                               # FastAPI Application
│   ├── app/
│   │   ├── main.py                        # FastAPI entrypoint & CORS configuration
│   │   ├── database.py                    # SQLite connection & sessionmaker
│   │   ├── models.py                      # SQLAlchemy models with cascade relations
│   │   ├── schemas.py                     # Pydantic v2 schemas
│   │   ├── seed.py                        # Auto-seed generator with realistic data
│   │   └── routers/
│   │       ├── auth.py                    # Authentication endpoints
│   │       ├── hosted_zones.py            # Hosted Zone endpoints
│   │       ├── records.py                 # DNS Record endpoints
│   │       └── export_import.py           # BIND zone file parser & exporter
│   ├── requirements.txt                   # Python dependencies
│   └── route53.db                         # SQLite persistent database file
│
├── .gitignore
└── README.md                              # Main project documentation
```

---

## Bonus Features

- **Import DNS records from BIND zone files**: Upload `.zone` files or paste RFC 1035 zone syntax directly into any hosted zone.
- **Export Hosted Zones**: One-click export to standard BIND format or JSON with download and clipboard copy buttons.
- **Bulk Operations**: Checkbox multi-selection for batch deleting records.
- **Dark Mode**: Toggleable AWS Console dark/light theme in the top header.
- **Safety Confirmations**: Confirmation guard requiring users to type `"delete"` when deleting a hosted zone.

---

## Production Deployment

### Frontend (Vercel)
1. Push repository to GitHub.
2. Import the `frontend/` folder into Vercel.
3. Configure the environment variable:
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend-api-url.com
   ```

### Backend (Render / Fly.io / Docker)
Deploy the `backend/` directory using Docker with a persistent disk attached for the SQLite database:
```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```
Mount a persistent volume to `/app/route53.db` so all hosted zones and records persist across container restarts.
