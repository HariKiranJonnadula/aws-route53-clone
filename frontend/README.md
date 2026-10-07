# Amazon Route 53 Console — Frontend Application


A pixel-accurate clone of the **AWS Route 53 Management Console** built using **Next.js (App Router)**, **TypeScript**, and the **AWS Cloudscape Design System**.

---

## Overview

This application delivers an authentic AWS Route 53 user experience, designed to mirror the navigation, layout, typography, controls, and workflows of the real AWS Management Console.

### Key Highlights
- **AWS Design Language**: Accurate color tokens (Squid Ink `#232f3e`, AWS Orange `#ec7211`, Cloudscape Blue `#0972d3`), breadcrumbs, flashbars, compact tables, and modal dialogs.
- **Dynamic DNS Record Forms**: Adapts fields dynamically based on record type (`A`, `AAAA`, `CNAME`, `TXT`, `MX`, `NS`, `PTR`, `SRV`, `CAA`).
- **Full Hosted Zone & Record Management**: Search, filter, pagination, batch deletion, and automatic zone apex formatting.
- **BIND Zone File & JSON Support**: One-click import and export in standard RFC 1035 BIND format or JSON.
- **Dark Mode Support**: Toggle between AWS Console dark and light modes.
- **Session Persistence**: Mock authentication with automatic session preservation across refreshes.

---

## Directory Structure

```text
frontend/
├── app/
│   ├── layout.tsx                     # Root application shell with AuthProvider
│   ├── globals.css                    # AWS Cloudscape design tokens and theme variables
│   ├── page.tsx                       # Default route redirecting to /hosted-zones
│   ├── login/page.tsx                 # AWS sign-in screen with 1-click demo login
│   ├── dashboard/page.tsx             # Route 53 metrics and service overview
│   ├── hosted-zones/
│   │   ├── page.tsx                   # Hosted Zones table, search, filter & CRUD
│   │   └── [zoneId]/page.tsx          # DNS Records management & bulk operations
│   ├── traffic-policies/page.tsx      # Polished "Coming Soon" section
│   ├── health-checks/page.tsx         # Polished "Coming Soon" section
│   ├── resolver/page.tsx              # Polished "Coming Soon" section
│   └── profiles/page.tsx              # Polished "Coming Soon" section
├── components/
│   ├── layout/
│   │   ├── TopNav.tsx                 # AWS header with search, region, account & dark mode
│   │   ├── Sidebar.tsx                # Collapsible Route 53 sidebar navigation
│   │   ├── Breadcrumb.tsx             # AWS-style navigation breadcrumb
│   │   └── AppShell.tsx               # Layout wrapper with auth guard
│   ├── ui/
│   │   ├── Badge.tsx                  # Status and record type badges
│   │   ├── Modal.tsx                  # Accessible AWS confirmation modals
│   │   ├── Notification.tsx           # AWS Flashbar notification banners
│   │   ├── Pagination.tsx             # Table pagination with configurable page size
│   │   └── ComingSoonPage.tsx         # Placeholder component for roadmap features
│   ├── hosted-zones/
│   │   ├── CreateZoneModal.tsx        # Public / Private zone creation form
│   │   ├── EditZoneModal.tsx          # Zone description and status updates
│   │   └── DeleteZoneModal.tsx        # Destructive delete confirmation modal
│   └── records/
│       ├── RecordFormModal.tsx        # Dynamic form for 9 DNS record types
│       ├── DeleteRecordModal.tsx      # Record deletion confirmation modal
│       ├── BulkDeleteModal.tsx        # Multi-select record batch deletion
│       ├── ExportZoneModal.tsx        # RFC 1035 BIND and JSON exporter
│       └── ImportBindModal.tsx        # BIND zone file parser and importer
├── lib/
│   ├── api.ts                         # Type-safe API client connecting to FastAPI backend
│   └── auth-context.tsx               # Auth provider and session hydration
├── types/
│   └── index.ts                       # Shared TypeScript data models
└── package.json
```

---

## Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm** (v9+) or **pnpm** / **yarn**
- The FastAPI backend service should be running (default: `http://localhost:8000`)

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. (Optional) Configure environment variables:
   Create a `.env.local` file in the `frontend` directory if your backend runs on a non-default host:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```
   *If omitted, it defaults to `http://127.0.0.1:8000`.*

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## Demo Credentials

The application includes built-in mock authentication with pre-seeded credentials:

| Field | Value |
|---|---|
| **Email** | `demo@route53.local` |
| **Password** | `demo123` |

> **Tip:** You can also click the **"1-Click Auto Fill & Sign In"** button on the login screen for instant access.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the Next.js development server with Turbopack on port 3000. |
| `npm run build` | Compiles and builds the production-ready application bundle. |
| `npm run start` | Serves the production build. |
| `npm run lint` | Runs Next.js code linters. |

---

## Key User Workflows

### 1. Hosted Zones Management (`/hosted-zones`)
- **View Zones**: Browse all public and private zones with record count, status, and IDs.
- **Search & Filter**: Search by domain name or zone ID; filter by `Public` or `Private`.
- **Create Zone**: Click **"Create hosted zone"** to define a new public or private VPC domain.
- **Edit / Delete**: Select a zone row to update description or permanently delete it.

### 2. DNS Record Management (`/hosted-zones/[zoneId]`)
- **Inspect Records**: Click any zone to view its complete DNS records table.
- **Create Record**: Click **"Create record"** to open the dynamic modal. Changing the **Record Type** updates the form fields automatically (e.g., IPv4 fields for `A`, Priority and Mail Server for `MX`, SRV target/port/weight for `SRV`).
- **Bulk Operations**: Select multiple records using checkboxes and click **"Delete (N)"** to remove them in batch.
- **Export Zone**: Click **"Export zone"** to view, copy, or download the zone as an **RFC 1035 BIND Zone file** or **JSON**.
- **Import Records**: Click **"Import records"** to upload a `.zone` file or paste BIND records directly.

### 3. Theme Customization
- Use the **Moon / Sun** toggle in the top-right header to switch between AWS Console Light and Dark modes.
