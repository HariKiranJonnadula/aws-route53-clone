export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface HostedZone {
  id: string;
  name: string;
  type: 'Public' | 'Private';
  description?: string;
  status: string;
  record_count: number;
  vpc_id?: string | null;
  vpc_region?: string | null;
  created_at: string;
  updated_at: string;
}

export interface HostedZoneListResponse {
  items: HostedZone[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export type DNSRecordType =
  | 'A'
  | 'AAAA'
  | 'CNAME'
  | 'TXT'
  | 'MX'
  | 'NS'
  | 'PTR'
  | 'SRV'
  | 'CAA'
  | 'SOA';

export interface DNSRecord {
  id: string;
  hosted_zone_id: string;
  name: string;
  type: DNSRecordType;
  ttl: number;
  value: string;
  routing_policy: string;
  weight?: number | null;
  priority?: number | null;
  port?: number | null;
  created_at: string;
  updated_at: string;
}

export interface DNSRecordListResponse {
  items: DNSRecord[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface ZoneExportResponse {
  zone: HostedZone;
  records: DNSRecord[];
  bind_format: string;
}

export interface FlashNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
}
