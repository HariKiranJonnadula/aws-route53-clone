'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';
import { HostedZone } from '@/types';

interface CreateZoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (zone: HostedZone) => void;
}

export function CreateZoneModal({
  isOpen,
  onClose,
  onCreated,
}: CreateZoneModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'Public' | 'Private'>('Public');
  const [description, setDescription] = useState('');
  const [vpcId, setVpcId] = useState('');
  const [vpcRegion, setVpcRegion] = useState('us-east-1');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Domain name is required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const zone = await api.createHostedZone({
        name: name.trim(),
        type,
        description: description.trim(),
        vpc_id: type === 'Private' ? vpcId.trim() : undefined,
        vpc_region: type === 'Private' ? vpcRegion : undefined,
      });
      onCreated(zone);
      setName('');
      setDescription('');
      setType('Public');
      setVpcId('');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to create hosted zone.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create hosted zone"
      maxWidth="640px"
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
            {loading ? 'Creating...' : 'Create hosted zone'}
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

        <div style={{ marginBottom: 18 }}>
          <label className="aws-label">Domain name</label>
          <span className="aws-label-desc">
            Enter the domain name that you want to route traffic for (e.g. example.com).
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="example.com"
            className="aws-input"
            required
          />
        </div>

        <div style={{ marginBottom: 18 }}>
          <label className="aws-label">Description - optional</label>
          <span className="aws-label-desc">
            Any comments about this hosted zone.
          </span>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Production domain for web application"
            className="aws-input"
          />
        </div>

        <div style={{ marginBottom: 18 }}>
          <label className="aws-label">Type</label>
          <span className="aws-label-desc">
            The type of hosted zone that you want to create.
          </span>
          <div style={{ display: 'flex', gap: 16, marginTop: 6 }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              <input
                type="radio"
                name="zoneType"
                checked={type === 'Public'}
                onChange={() => setType('Public')}
              />
              <span>Public hosted zone</span>
            </label>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              <input
                type="radio"
                name="zoneType"
                checked={type === 'Private'}
                onChange={() => setType('Private')}
              />
              <span>Private hosted zone for Amazon VPC</span>
            </label>
          </div>
        </div>

        {type === 'Private' && (
          <div
            style={{
              padding: 14,
              backgroundColor: 'var(--aws-body-bg)',
              border: '1px solid var(--aws-border-light)',
              borderRadius: 2,
              marginBottom: 16,
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 13 }}>
              VPC Configuration
            </div>
            <div style={{ marginBottom: 12 }}>
              <label className="aws-label">VPC ID</label>
              <input
                type="text"
                value={vpcId}
                onChange={(e) => setVpcId(e.target.value)}
                placeholder="vpc-0a1b2c3d4e5f67890"
                className="aws-input"
              />
            </div>
            <div>
              <label className="aws-label">Region</label>
              <select
                value={vpcRegion}
                onChange={(e) => setVpcRegion(e.target.value)}
                className="aws-select"
              >
                <option value="us-east-1">US East (N. Virginia) us-east-1</option>
                <option value="us-west-2">US West (Oregon) us-west-2</option>
                <option value="eu-west-1">Europe (Ireland) eu-west-1</option>
                <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
              </select>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}
