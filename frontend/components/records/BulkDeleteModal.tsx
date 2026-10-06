'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';
import { DNSRecord } from '@/types';
import { AlertTriangle } from 'lucide-react';

interface BulkDeleteModalProps {
  zoneId: string;
  records: DNSRecord[];
  isOpen: boolean;
  onClose: () => void;
  onDeleted: (count: number) => void;
}

export function BulkDeleteModal({
  zoneId,
  records,
  isOpen,
  onClose,
  onDeleted,
}: BulkDeleteModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!records.length) return null;

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      const ids = records.map((r) => r.id);
      const res = await api.bulkDeleteRecords(zoneId, ids);
      onDeleted(res.deleted_count);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete records.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Delete ${records.length} records`}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="aws-btn aws-btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="aws-btn aws-btn-danger-solid"
            disabled={loading}
          >
            {loading ? 'Deleting...' : `Delete ${records.length} records`}
          </button>
        </>
      }
    >
      {error && (
        <div className="aws-alert aws-alert-error" style={{ marginBottom: 16 }}>
          <div>{error}</div>
        </div>
      )}

      <div
        style={{
          display: 'flex',
          gap: 12,
          padding: 12,
          backgroundColor: '#fdf3f2',
          border: '1px solid #f8b4b4',
          borderRadius: 2,
          marginBottom: 16,
        }}
      >
        <AlertTriangle size={20} color="#d13212" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: 13, color: '#16191f' }}>
          <strong>Confirm bulk deletion:</strong> You have selected{' '}
          <strong>{records.length}</strong> record(s) to permanently remove from Route 53.
        </div>
      </div>

      <div
        style={{
          maxHeight: 180,
          overflowY: 'auto',
          border: '1px solid var(--aws-border-light)',
          borderRadius: 2,
          fontSize: 12,
          padding: 8,
          backgroundColor: 'var(--aws-table-header-bg)',
        }}
      >
        {records.map((r) => (
          <div
            key={r.id}
            style={{
              padding: '4px 8px',
              borderBottom: '1px solid var(--aws-border-light)',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontWeight: 600 }}>{r.name}</span>
            <span style={{ color: 'var(--aws-text-secondary)', fontFamily: 'monospace' }}>
              [{r.type}]
            </span>
          </div>
        ))}
      </div>
    </Modal>
  );
}
