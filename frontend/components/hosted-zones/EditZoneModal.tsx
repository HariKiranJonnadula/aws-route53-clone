'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';
import { HostedZone } from '@/types';

interface EditZoneModalProps {
  zone: HostedZone | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: (zone: HostedZone) => void;
}

export function EditZoneModal({
  zone,
  isOpen,
  onClose,
  onUpdated,
}: EditZoneModalProps) {
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Active');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (zone) {
      setDescription(zone.description || '');
      setStatus(zone.status || 'Active');
    }
  }, [zone]);

  if (!zone) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const updated = await api.updateHostedZone(zone.id, {
        description: description.trim(),
        status,
      });
      onUpdated(updated);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to update hosted zone.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit hosted zone - ${zone.name}`}
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
            onClick={handleSubmit}
            className="aws-btn aws-btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save changes'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="aws-alert aws-alert-error" style={{ marginBottom: 16 }}>
            <div>{error}</div>
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label className="aws-label">Hosted zone ID</label>
          <input
            type="text"
            value={zone.id}
            disabled
            className="aws-input"
            style={{ backgroundColor: 'var(--aws-body-bg)', opacity: 0.7 }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label className="aws-label">Domain name</label>
          <input
            type="text"
            value={zone.name}
            disabled
            className="aws-input"
            style={{ backgroundColor: 'var(--aws-body-bg)', opacity: 0.7 }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label className="aws-label">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="aws-input"
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label className="aws-label">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="aws-select"
          >
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </form>
    </Modal>
  );
}
