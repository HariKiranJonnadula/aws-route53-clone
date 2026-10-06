'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';
import { HostedZone } from '@/types';
import { Upload } from 'lucide-react';

interface ImportBindModalProps {
  zone: HostedZone;
  isOpen: boolean;
  onClose: () => void;
  onImported: (count: number) => void;
}

export function ImportBindModal({
  zone,
  isOpen,
  onClose,
  onImported,
}: ImportBindModalProps) {
  const [bindContent, setBindContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBindContent((event.target?.result as string) || '');
      };
      reader.readAsText(file);
    }
  };

  const handleImport = async () => {
    if (!bindContent.trim()) {
      setError('Please provide BIND zone file content or select a file.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await api.importBind(zone.id, bindContent);
      if (res.errors.length > 0 && res.created_count === 0) {
        setError(`Failed to import: ${res.errors.join('; ')}`);
      } else {
        onImported(res.created_count);
        setBindContent('');
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || 'Import failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Import BIND zone file: ${zone.name}`}
      maxWidth="680px"
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
            onClick={handleImport}
            className="aws-btn aws-btn-primary"
            disabled={loading}
          >
            {loading ? 'Importing...' : 'Import records'}
          </button>
        </>
      }
    >
      {error && (
        <div className="aws-alert aws-alert-error" style={{ marginBottom: 16 }}>
          <div>{error}</div>
        </div>
      )}

      <div style={{ marginBottom: 14 }}>
        <label className="aws-label">Upload BIND zone file (.zone or .txt)</label>
        <input
          type="file"
          accept=".zone,.txt"
          onChange={handleFileUpload}
          style={{ fontSize: 13, marginTop: 4 }}
        />
      </div>

      <div style={{ marginBottom: 14 }}>
        <label className="aws-label">Or paste BIND zone content</label>
        <span className="aws-label-desc">
          Paste standard RFC 1035 format records (e.g. <code>www 300 IN A 192.0.2.1</code>)
        </span>
        <textarea
          value={bindContent}
          onChange={(e) => setBindContent(e.target.value)}
          rows={9}
          placeholder="; Example BIND Records&#10;www  300  IN  A      192.0.2.1&#10;mail 300  IN  CNAME  example.com."
          className="aws-textarea"
          style={{ fontFamily: 'monospace', fontSize: 12 }}
        />
      </div>
    </Modal>
  );
}
