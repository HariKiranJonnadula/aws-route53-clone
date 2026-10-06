'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';
import { HostedZone } from '@/types';
import { AlertTriangle } from 'lucide-react';

interface DeleteZoneModalProps {
  zone: HostedZone | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleted: (zoneId: string) => void;
}

export function DeleteZoneModal({
  zone,
  isOpen,
  onClose,
  onDeleted,
}: DeleteZoneModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!zone) return null;

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.deleteHostedZone(zone.id);
      onDeleted(zone.id);
      setConfirmText('');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete hosted zone.');
    } finally {
      setLoading(false);
    }
  };

  const isConfirmed = confirmText.trim().toLowerCase() === 'delete';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete hosted zone"
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
            disabled={loading || !isConfirmed}
          >
            {loading ? 'Deleting...' : 'Delete'}
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
          <strong>Warning:</strong> Deleting hosted zone <strong>{zone.name}</strong> will
          permanently delete all associated DNS records. Traffic for this domain will no longer be routed.
        </div>
      </div>

      <div style={{ marginBottom: 16, fontSize: 13 }}>
        To confirm deletion, type <strong>delete</strong> in the field below:
      </div>

      <input
        type="text"
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
        placeholder="delete"
        className="aws-input"
        autoFocus
      />
    </Modal>
  );
}
