'use client';

import React, { useEffect, useState, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { Notification } from '@/components/ui/Notification';
import { RecordFormModal } from '@/components/records/RecordFormModal';
import { DeleteRecordModal } from '@/components/records/DeleteRecordModal';
import { BulkDeleteModal } from '@/components/records/BulkDeleteModal';
import { ExportZoneModal } from '@/components/records/ExportZoneModal';
import { ImportBindModal } from '@/components/records/ImportBindModal';
import { api } from '@/lib/api';
import { HostedZone, DNSRecord, FlashNotification } from '@/types';
import {
  Search,
  Plus,
  Trash2,
  Edit,
  Download,
  Upload,
  RefreshCw,
  Filter,
  ArrowLeft,
} from 'lucide-react';

export default function HostedZoneDetailPage({
  params,
}: {
  params: Promise<{ zoneId: string }>;
}) {
  const resolvedParams = use(params);
  const zoneId = resolvedParams.zoneId;
  const router = useRouter();

  const [zone, setZone] = useState<HostedZone | null>(null);
  const [records, setRecords] = useState<DNSRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  // Selection
  const [selectedRecordIds, setSelectedRecordIds] = useState<string[]>([]);

  // Modals
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<DNSRecord | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<DNSRecord | null>(null);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);

  // Notifications
  const [notification, setNotification] = useState<FlashNotification | null>(null);

  // Fetch zone details
  const fetchZone = useCallback(async () => {
    try {
      const z = await api.getHostedZone(zoneId);
      setZone(z);
    } catch (err: any) {
      setNotification({
        id: Date.now().toString(),
        type: 'error',
        message: err?.message || 'Failed to load hosted zone details.',
      });
    }
  }, [zoneId]);

  // Fetch records
  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.listRecords(zoneId, {
        search,
        type: typeFilter,
        page,
        limit,
      });
      setRecords(res.items);
      setTotal(res.total);
      setTotalPages(res.total_pages);
    } catch (err: any) {
      setNotification({
        id: Date.now().toString(),
        type: 'error',
        message: err?.message || 'Failed to fetch DNS records.',
      });
    } finally {
      setLoading(false);
    }
  }, [zoneId, search, typeFilter, page, limit]);

  useEffect(() => {
    fetchZone();
  }, [fetchZone]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Selection handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRecordIds(records.map((r) => r.id));
    } else {
      setSelectedRecordIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedRecordIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectedRecords = records.filter((r) => selectedRecordIds.includes(r.id));
  const singleSelectedRecord = selectedRecords.length === 1 ? selectedRecords[0] : null;

  const handleRecordSaved = (rec: DNSRecord) => {
    setNotification({
      id: Date.now().toString(),
      type: 'success',
      title: 'Record updated',
      message: `Record ${rec.name} (${rec.type}) saved successfully.`,
    });
    fetchRecords();
    fetchZone();
  };

  const handleRecordDeleted = () => {
    setSelectedRecordIds([]);
    setNotification({
      id: Date.now().toString(),
      type: 'success',
      title: 'Record deleted',
      message: 'The record was successfully deleted from this hosted zone.',
    });
    fetchRecords();
    fetchZone();
  };

  const handleBulkDeleted = (count: number) => {
    setSelectedRecordIds([]);
    setNotification({
      id: Date.now().toString(),
      type: 'success',
      title: 'Bulk deletion complete',
      message: `Successfully deleted ${count} record(s).`,
    });
    fetchRecords();
    fetchZone();
  };

  const handleImportCompleted = (count: number) => {
    setNotification({
      id: Date.now().toString(),
      type: 'success',
      title: 'BIND Import Complete',
      message: `Imported ${count} record(s) into ${zone?.name}.`,
    });
    fetchRecords();
    fetchZone();
  };

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Route 53', href: '/hosted-zones' },
          { label: 'Hosted zones', href: '/hosted-zones' },
          { label: zone?.name || zoneId },
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => router.push('/hosted-zones')}
            className="aws-btn aws-btn-secondary aws-btn-sm"
            title="Back to Hosted zones"
          >
            <ArrowLeft size={14} />
          </button>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--aws-text-primary)' }}>
              {zone?.name || 'Hosted zone details'}
            </h1>
            <div
              style={{
                fontSize: 12,
                color: 'var(--aws-text-secondary)',
                marginTop: 2,
                display: 'flex',
                gap: 16,
              }}
            >
              <span>Hosted zone ID: <strong>{zone?.id}</strong></span>
              <span>Type: <strong>{zone?.type}</strong></span>
              <span>Status: <strong style={{ color: '#1e8e3e' }}>{zone?.status}</strong></span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {zone && (
            <>
              <button
                onClick={() => setExportModalOpen(true)}
                className="aws-btn aws-btn-secondary"
                title="Export Zone file as BIND / JSON"
              >
                <Download size={14} />
                <span>Export zone</span>
              </button>

              <button
                onClick={() => setImportModalOpen(true)}
                className="aws-btn aws-btn-secondary"
                title="Import records from BIND zone file"
              >
                <Upload size={14} />
                <span>Import records</span>
              </button>
            </>
          )}

          <button
            onClick={() => {
              setRecordToEdit(null);
              setFormModalOpen(true);
            }}
            className="aws-btn aws-btn-primary"
            id="btn-create-record"
          >
            <Plus size={15} />
            <span>Create record</span>
          </button>
        </div>
      </div>

      {/* Records Table Card */}
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
            <div style={{ position: 'relative', width: 300 }}>
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
                placeholder="Search by record name or value"
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
                <option value="A">A</option>
                <option value="AAAA">AAAA</option>
                <option value="CNAME">CNAME</option>
                <option value="TXT">TXT</option>
                <option value="MX">MX</option>
                <option value="NS">NS</option>
                <option value="PTR">PTR</option>
                <option value="SRV">SRV</option>
                <option value="CAA">CAA</option>
                <option value="SOA">SOA</option>
              </select>
            </div>

            <button
              onClick={fetchRecords}
              className="aws-btn aws-btn-secondary"
              title="Refresh records"
              style={{ padding: '6px 8px', height: 32 }}
            >
              <RefreshCw size={13} />
            </button>
          </div>

          {/* Action Buttons for selected records */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => {
                if (singleSelectedRecord) {
                  setRecordToEdit(singleSelectedRecord);
                  setFormModalOpen(true);
                }
              }}
              disabled={!singleSelectedRecord}
              className="aws-btn aws-btn-secondary aws-btn-sm"
            >
              <Edit size={13} />
              <span>Edit record</span>
            </button>

            {selectedRecords.length > 1 ? (
              <button
                onClick={() => setBulkDeleteModalOpen(true)}
                className="aws-btn aws-btn-danger aws-btn-sm"
              >
                <Trash2 size={13} />
                <span>Delete ({selectedRecords.length})</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  if (singleSelectedRecord) {
                    setRecordToDelete(singleSelectedRecord);
                    setDeleteModalOpen(true);
                  }
                }}
                disabled={!singleSelectedRecord}
                className="aws-btn aws-btn-danger aws-btn-sm"
              >
                <Trash2 size={13} />
                <span>Delete record</span>
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="aws-table-container">
          <table className="aws-table">
            <thead>
              <tr>
                <th style={{ width: 40, textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={
                      records.length > 0 &&
                      records.every((r) => selectedRecordIds.includes(r.id))
                    }
                    style={{ cursor: 'pointer' }}
                  />
                </th>
                <th>Record name</th>
                <th>Type</th>
                <th>TTL (Seconds)</th>
                <th>Routing policy</th>
                <th>Value / Route traffic to</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '36px 0', color: 'var(--aws-text-muted)' }}>
                    Loading records...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '48px 0' }}>
                    <div style={{ fontWeight: 600, color: 'var(--aws-text-primary)', marginBottom: 4 }}>
                      No records found
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--aws-text-secondary)', marginBottom: 16 }}>
                      {search || typeFilter !== 'All'
                        ? 'Try modifying your search or filter parameters.'
                        : 'Create records to route internet traffic for your domain.'}
                    </div>
                    <button
                      onClick={() => {
                        setRecordToEdit(null);
                        setFormModalOpen(true);
                      }}
                      className="aws-btn aws-btn-primary"
                    >
                      <Plus size={14} />
                      <span>Create record</span>
                    </button>
                  </td>
                </tr>
              ) : (
                records.map((rec) => {
                  const isSelected = selectedRecordIds.includes(rec.id);
                  return (
                    <tr
                      key={rec.id}
                      className={isSelected ? 'selected' : ''}
                      onClick={() => handleSelectOne(rec.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectOne(rec.id)}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {rec.name}
                      </td>
                      <td>
                        <Badge variant="type">{rec.type}</Badge>
                      </td>
                      <td>{rec.ttl}</td>
                      <td>{rec.routing_policy || 'Simple'}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: 12, whiteSpace: 'pre-line', maxWidth: 400 }}>
                        {rec.value}
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

      {/* Record Form Modal (Create or Edit) */}
      {zone && (
        <RecordFormModal
          zone={zone}
          recordToEdit={recordToEdit}
          isOpen={formModalOpen}
          onClose={() => {
            setFormModalOpen(false);
            setRecordToEdit(null);
          }}
          onSaved={handleRecordSaved}
        />
      )}

      {/* Delete Single Modal */}
      <DeleteRecordModal
        record={recordToDelete}
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setRecordToDelete(null);
        }}
        onDeleted={handleRecordDeleted}
      />

      {/* Bulk Delete Modal */}
      <BulkDeleteModal
        zoneId={zoneId}
        records={selectedRecords}
        isOpen={bulkDeleteModalOpen}
        onClose={() => setBulkDeleteModalOpen(false)}
        onDeleted={handleBulkDeleted}
      />

      {/* Export Zone Modal */}
      {zone && (
        <ExportZoneModal
          zone={zone}
          isOpen={exportModalOpen}
          onClose={() => setExportModalOpen(false)}
        />
      )}

      {/* Import BIND Modal */}
      {zone && (
        <ImportBindModal
          zone={zone}
          isOpen={importModalOpen}
          onClose={() => setImportModalOpen(false)}
          onImported={handleImportCompleted}
        />
      )}
    </div>
  );
}
