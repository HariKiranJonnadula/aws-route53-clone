import {
  HostedZone,
  HostedZoneListResponse,
  DNSRecord,
  DNSRecordListResponse,
  ZoneExportResponse,
  User,
} from '@/types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

function getAuthHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('route53_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return {} as T;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data?.detail || response.statusText || 'An unexpected error occurred';
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // Auth
  login: async (email: string, password: string) => {
    return request<{ access_token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  logout: async () => {
    return request<{ message: string }>('/api/auth/logout', { method: 'POST' });
  },
  getMe: async () => {
    return request<User>('/api/auth/me');
  },

  // Hosted Zones
  listHostedZones: async (params: {
    search?: string;
    type?: string;
    page?: number;
    limit?: number;
  } = {}) => {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.set('search', params.search);
    if (params.type && params.type !== 'All') searchParams.set('type', params.type);
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());

    return request<HostedZoneListResponse>(`/api/hosted-zones?${searchParams.toString()}`);
  },

  getHostedZone: async (id: string) => {
    return request<HostedZone>(`/api/hosted-zones/${id}`);
  },

  createHostedZone: async (payload: {
    name: string;
    type: 'Public' | 'Private';
    description?: string;
    vpc_id?: string;
    vpc_region?: string;
  }) => {
    return request<HostedZone>('/api/hosted-zones', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateHostedZone: async (
    id: string,
    payload: { description?: string; status?: string }
  ) => {
    return request<HostedZone>(`/api/hosted-zones/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  deleteHostedZone: async (id: string) => {
    return request<void>(`/api/hosted-zones/${id}`, {
      method: 'DELETE',
    });
  },

  // DNS Records
  listRecords: async (
    zoneId: string,
    params: {
      search?: string;
      type?: string;
      page?: number;
      limit?: number;
    } = {}
  ) => {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.set('search', params.search);
    if (params.type && params.type !== 'All') searchParams.set('type', params.type);
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());

    return request<DNSRecordListResponse>(
      `/api/hosted-zones/${zoneId}/records?${searchParams.toString()}`
    );
  },

  getRecord: async (recordId: string) => {
    return request<DNSRecord>(`/api/records/${recordId}`);
  },

  createRecord: async (
    zoneId: string,
    payload: {
      name: string;
      type: string;
      ttl: number;
      value: string;
      routing_policy?: string;
      weight?: number | null;
      priority?: number | null;
      port?: number | null;
    }
  ) => {
    return request<DNSRecord>(`/api/hosted-zones/${zoneId}/records`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateRecord: async (
    recordId: string,
    payload: {
      name?: string;
      type?: string;
      ttl?: number;
      value?: string;
      routing_policy?: string;
      weight?: number | null;
      priority?: number | null;
      port?: number | null;
    }
  ) => {
    return request<DNSRecord>(`/api/records/${recordId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  deleteRecord: async (recordId: string) => {
    return request<void>(`/api/records/${recordId}`, {
      method: 'DELETE',
    });
  },

  bulkDeleteRecords: async (zoneId: string, recordIds: string[]) => {
    return request<{ deleted_count: number }>(
      `/api/hosted-zones/${zoneId}/records/bulk-delete`,
      {
        method: 'POST',
        body: JSON.stringify({ record_ids: recordIds }),
      }
    );
  },

  // Export / Import
  exportZone: async (zoneId: string) => {
    return request<ZoneExportResponse>(`/api/hosted-zones/${zoneId}/export`);
  },

  importBind: async (zoneId: string, content: string) => {
    return request<{ created_count: number; errors: string[] }>(
      `/api/hosted-zones/${zoneId}/import-bind`,
      {
        method: 'POST',
        body: JSON.stringify({ content }),
      }
    );
  },
};
