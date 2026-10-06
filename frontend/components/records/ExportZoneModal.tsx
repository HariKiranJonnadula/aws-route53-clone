'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';
import { HostedZone, ZoneExportResponse } from '@/types';
import { Copy, Download, Check } from 'lucide-react';

interface ExportZoneModalProps {
  zone: HostedZone;
  isOpen: boolean;
  onClose: () => void;
}

export function ExportZoneModal({ zone, isOpen, onClose }: ExportZoneModalProps) {
  const [format, setFormat] = useState<'bind' | 'json'>('bind');
  const [exportData, setExportData] = useState<ZoneExportResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api
        .exportZone(zone.id)
        .then((res) => setExportData(res))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, zone.id]);

  const contentText =
    format === 'bind'
      ? exportData?.bind_format || ''
      : exportData
      ? JSON.stringify(exportData, null, 2)
      : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(contentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = `${zone.name}.${format === 'bind' ? 'zone' : 'json'}`;
    const blob = new Blob([contentText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Export Hosted Zone: ${zone.name}`}
      maxWidth="720px"
      footer={
        <>
          <button onClick={onClose} className="aws-btn aws-btn-secondary">
            Close
          </button>
          <button onClick={handleCopy} className="aws-btn aws-btn-secondary">
            {copied ? <Check size={14} color="#037f0c" /> : <Copy size={14} />}
            <span>{copied ? 'Copied!' : 'Copy to clipboard'}</span>
          </button>
          <button onClick={handleDownload} className="aws-btn aws-btn-primary">
            <Download size={14} />
            <span>Download file</span>
          </button>
        </>
      }
    >
      <div style={{ marginBottom: 14, display: 'flex', gap: 12 }}>
        <button
          onClick={() => setFormat('bind')}
          className={`aws-btn ${format === 'bind' ? 'aws-btn-primary' : 'aws-btn-secondary'}`}
          style={{ padding: '4px 12px' }}
        >
          BIND Zone Format (RFC 1035)
        </button>
        <button
          onClick={() => setFormat('json')}
          className={`aws-btn ${format === 'json' ? 'aws-btn-primary' : 'aws-btn-secondary'}`}
          style={{ padding: '4px 12px' }}
        >
          JSON Format
        </button>
      </div>

      {loading ? (
        <div style={{ padding: 30, textAlign: 'center', color: 'var(--aws-text-muted)' }}>
          Exporting records...
        </div>
      ) : (
        <textarea
          readOnly
          value={contentText}
          rows={12}
          className="aws-textarea"
          style={{
            fontFamily: 'monospace',
            fontSize: 12,
            whiteSpace: 'pre',
            backgroundColor: 'var(--aws-table-header-bg)',
          }}
        />
      )}
    </Modal>
  );
}
