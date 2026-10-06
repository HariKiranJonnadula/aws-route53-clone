'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';
import { DNSRecord } from '@/types';
import { AlertTriangle } from 'lucide-react';

interface DeleteRecordModalProps {
  record: DNSRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleted: (recordId: string) => void;
}

export function DeleteRecordModal({
  record,
  isOpen,
  onClose,
  onDeleted,
}: DeleteRecordModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!record) return null;

  const isApexNsOrSoa =
    (record.type === 'SOA' || record.type === 'NS') &&
    record.name.split('.').length <= 2;

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.deleteRecord(record.id);
      onDeleted(record.id);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete record.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete record"
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
            {loading ? 'Deleting...' : 'Delete record'}
          </button>
        </>
      }
    >
      {error && (
        <div className="aws-alert aws-alert-error" style={{ marginBottom: 16 }}>
          <div>{error}</div>
        </div>
      )}

      {isApexNsOrSoa && (
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
            <strong>Caution:</strong> Deleting an NS or SOA record at the apex of a hosted zone may disrupt DNS resolution for the entire domain.
          </div>
        </div>
      )}

      <p style={{ fontSize: 13, marginBottom: 14 }}>
        Are you sure you want to delete the record <strong>{record.name}</strong> of type{' '}
        <strong>{record.type}</strong>?
      </p>

      <div
        style={{
          padding: 12,
          backgroundColor: 'var(--aws-table-header-bg)',
          border: '1px solid var(--aws-border-light)',
          borderRadius: 2,
          fontSize: 12,
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
        }}
      >
        <div>Name: {record.name}</div>
        <div>Type: {record.type}</div>
        <div>TTL: {record.ttl}s</div>
        <div>Value: {record.value}</div>
      </div>
    </Modal>
  );
}
