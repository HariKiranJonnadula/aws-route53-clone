'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { Notification } from '@/components/ui/Notification';
import { CreateZoneModal } from '@/components/hosted-zones/CreateZoneModal';
import { EditZoneModal } from '@/components/hosted-zones/EditZoneModal';
import { DeleteZoneModal } from '@/components/hosted-zones/DeleteZoneModal';
import { api } from '@/lib/api';
import { HostedZone, FlashNotification } from '@/types';
import {
  Search,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  RefreshCw,
  Filter,
} from 'lucide-react';

export default function HostedZonesPage() {
  const router = useRouter();
  const [zones, setZones] = useState<HostedZone[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Notification state
  const [notification, setNotification] = useState<FlashNotification | null>(null);

  const fetchZones = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.listHostedZones({
        search,
        type: typeFilter,
        page,
        limit,
      });
      setZones(res.items);
      setTotal(res.total);
      setTotalPages(res.total_pages);
    } catch (err: any) {
      setNotification({
        id: Date.now().toString(),
        type: 'error',
        message: err?.message || 'Failed to fetch hosted zones.',
      });
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, page, limit]);

  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

  const selectedZone = zones.find((z) => z.id === selectedZoneId) || null;

  const handleSelectZone = (id: string) => {
    setSelectedZoneId((prev) => (prev === id ? null : id));
  };

  const handleZoneCreated = (newZone: HostedZone) => {
    setNotification({
      id: Date.now().toString(),
      type: 'success',
      title: 'Hosted zone created',
      message: `Hosted zone "${newZone.name}" created successfully with ID ${newZone.id}. Default NS and SOA records were generated.`,
    });
    fetchZones();
  };

  const handleZoneUpdated = (updatedZone: HostedZone) => {
    setNotification({
      id: Date.now().toString(),
      type: 'success',
      title: 'Hosted zone updated',
      message: `Hosted zone "${updatedZone.name}" was updated successfully.`,
    });
    fetchZones();
  };

  const handleZoneDeleted = (zoneId: string) => {
    setSelectedZoneId(null);
    setNotification({
      id: Date.now().toString(),
      type: 'success',
      title: 'Hosted zone deleted',
      message: 'The hosted zone and all associated DNS records have been permanently removed.',
    });
    fetchZones();
  };

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Route 53', href: '/hosted-zones' },
          { label: 'Hosted zones' },
        ]}
      />

      <Notification
        notification={notification}
        onDismiss={() => setNotification(null)}
      />

      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--aws-text-primary)' }}>
              Hosted zones
            </h1>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--aws-text-secondary)',
              }}
            >
              ({total})
            </span>
          </div>
          <p
            style={{
              fontSize: 13,
              color: 'var(--aws-text-secondary)',
              marginTop: 4,
              maxWidth: 720,
            }}
          >
            A hosted zone is a container for records, and records contain information about how
            you want to route traffic for a specific domain, such as example.com and its subdomains.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="aws-btn aws-btn-primary"
            id="btn-create-zone"
          >
            <Plus size={15} />
            <span>Create hosted zone</span>
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="aws-card">
        {/* Table Action Bar */}
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--aws-border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          {/* Search and Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 280 }}>
            <div style={{ position: 'relative', width: 320 }}>
              <Search
                size={14}
                style={{
                  position: 'absolute',
                  left: 10,
                  top: 9,
                  color: 'var(--aws-text-muted)',
                }}
              />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search hosted zones by name or ID"
                className="aws-input"
                style={{ paddingLeft: 30, height: 32 }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Filter size={14} color="var(--aws-text-muted)" />
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
                className="aws-select"
                style={{ height: 32, width: 'auto', padding: '4px 8px' }}
              >
                <option value="All">All types</option>
                <option value="Public">Public</option>
                <option value="Private">Private</option>
              </select>
            </div>

            <button
              onClick={fetchZones}
              className="aws-btn aws-btn-secondary"
              title="Refresh"
              style={{ padding: '6px 8px', height: 32 }}
            >
              <RefreshCw size={13} />
            </button>
          </div>

          {/* Row Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => {
                if (selectedZoneId) {
                  router.push(`/hosted-zones/${selectedZoneId}`);
                }
              }}
              disabled={!selectedZoneId}
              className="aws-btn aws-btn-secondary aws-btn-sm"
              title="Go to DNS Records"
            >
              <ExternalLink size={13} />
              <span>View records</span>
            </button>

            <button
              onClick={() => setEditModalOpen(true)}
              disabled={!selectedZoneId}
              className="aws-btn aws-btn-secondary aws-btn-sm"
            >
              <Edit size={13} />
              <span>Edit</span>
            </button>

            <button
              onClick={() => setDeleteModalOpen(true)}
              disabled={!selectedZoneId}
              className="aws-btn aws-btn-danger aws-btn-sm"
            >
              <Trash2 size={13} />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="aws-table-container">
          <table className="aws-table">
            <thead>
              <tr>
                <th style={{ width: 40, textAlign: 'center' }}>
                  <span style={{ fontSize: 11 }}>#</span>
                </th>
                <th>Hosted zone name</th>
                <th>Type</th>
                <th>Records</th>
                <th>Description</th>
                <th>Status</th>
                <th>Hosted zone ID</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px 0', color: 'var(--aws-text-muted)' }}>
                    Loading hosted zones...
                  </td>
                </tr>
              ) : zones.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '48px 0' }}>
                    <div style={{ fontWeight: 600, color: 'var(--aws-text-primary)', marginBottom: 4 }}>
                      No hosted zones found
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--aws-text-secondary)', marginBottom: 16 }}>
                      {search
                        ? 'Try modifying your search criteria or filter.'
                        : 'You do not have any hosted zones. Create a hosted zone to start routing traffic.'}
                    </div>
                    <button
                      onClick={() => setCreateModalOpen(true)}
                      className="aws-btn aws-btn-primary"
                    >
                      <Plus size={14} />
                      <span>Create hosted zone</span>
                    </button>
                  </td>
                </tr>
              ) : (
                zones.map((zone) => {
                  const isSelected = selectedZoneId === zone.id;
                  return (
                    <tr
                      key={zone.id}
                      className={isSelected ? 'selected' : ''}
                      onClick={() => handleSelectZone(zone.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                        <input
                          type="radio"
                          name="selectedZone"
                          checked={isSelected}
                          onChange={() => handleSelectZone(zone.id)}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>
                      <td>
                        <Link
                          href={`/hosted-zones/${zone.id}`}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            color: 'var(--aws-link)',
                            fontWeight: 600,
                            textDecoration: 'none',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                        >
                          {zone.name}
                        </Link>
                      </td>
                      <td>
                        <Badge variant={zone.type === 'Public' ? 'public' : 'private'}>
                          {zone.type}
                        </Badge>
                      </td>
                      <td>
                        <strong>{zone.record_count}</strong>
                      </td>
                      <td style={{ color: 'var(--aws-text-secondary)', maxWidth: 260 }}>
                        {zone.description || '-'}
                        {zone.vpc_id && (
                          <div style={{ fontSize: 11, color: 'var(--aws-text-muted)', marginTop: 2 }}>
                            VPC: {zone.vpc_id} ({zone.vpc_region})
                          </div>
                        )}
                      </td>
                      <td>
                        <Badge variant="active">{zone.status}</Badge>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--aws-text-secondary)' }}>
                        {zone.id}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          limit={limit}
          onPageChange={(newPage) => setPage(newPage)}
          onLimitChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
        />
      </div>

      {/* Modals */}
      <CreateZoneModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={handleZoneCreated}
      />

      <EditZoneModal
        zone={selectedZone}
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onUpdated={handleZoneUpdated}
      />

      <DeleteZoneModal
        zone={selectedZone}
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onDeleted={handleZoneDeleted}
      />
    </div>
  );
}
