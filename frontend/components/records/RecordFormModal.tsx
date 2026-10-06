'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';
import { HostedZone, DNSRecord, DNSRecordType } from '@/types';

interface RecordFormModalProps {
  zone: HostedZone;
  recordToEdit?: DNSRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (record: DNSRecord) => void;
}

const RECORD_TYPES: DNSRecordType[] = [
  'A',
  'AAAA',
  'CNAME',
  'TXT',
  'MX',
  'NS',
  'PTR',
  'SRV',
  'CAA',
];

export function RecordFormModal({
  zone,
  recordToEdit,
  isOpen,
  onClose,
  onSaved,
}: RecordFormModalProps) {
  const isEditing = !!recordToEdit;

  const [name, setName] = useState('');
  const [type, setType] = useState<DNSRecordType>('A');
  const [ttl, setTtl] = useState(300);
  const [routingPolicy, setRoutingPolicy] = useState('Simple');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Type-specific form fields
  const [ipValue, setIpValue] = useState('');
  const [cnameTarget, setCnameTarget] = useState('');
  const [txtValue, setTxtValue] = useState('');
  const [mxPriority, setMxPriority] = useState(10);
  const [mxServer, setMxServer] = useState('');
  const [srvPriority, setSrvPriority] = useState(10);
  const [srvWeight, setSrvWeight] = useState(5);
  const [srvPort, setSrvPort] = useState(443);
  const [srvTarget, setSrvTarget] = useState('');
  const [caaFlags, setCaaFlags] = useState(0);
  const [caaTag, setCaaTag] = useState('issue');
  const [caaValue, setCaaValue] = useState('"amazon.com"');
  const [genericValue, setGenericValue] = useState('');

  // Extract subdomain relative to zone name
  const extractSubdomain = (fullName: string, zoneName: string) => {
    const cleanFull = fullName.replace(/\.$/, '');
    const cleanZone = zoneName.replace(/\.$/, '');
    if (cleanFull === cleanZone) return '';
    if (cleanFull.endsWith(`.${cleanZone}`)) {
      return cleanFull.substring(0, cleanFull.length - cleanZone.length - 1);
    }
    return cleanFull;
  };

  useEffect(() => {
    if (recordToEdit) {
      setName(extractSubdomain(recordToEdit.name, zone.name));
      setType(recordToEdit.type);
      setTtl(recordToEdit.ttl);
      setRoutingPolicy(recordToEdit.routing_policy || 'Simple');

      // Populate type specific fields
      if (recordToEdit.type === 'A' || recordToEdit.type === 'AAAA') {
        setIpValue(recordToEdit.value);
      } else if (recordToEdit.type === 'CNAME') {
        setCnameTarget(recordToEdit.value);
      } else if (recordToEdit.type === 'TXT') {
        setTxtValue(recordToEdit.value);
      } else if (recordToEdit.type === 'MX') {
        setMxPriority(recordToEdit.priority || 10);
        setMxServer(recordToEdit.value);
      } else if (recordToEdit.type === 'SRV') {
        setSrvPriority(recordToEdit.priority || 10);
        setSrvWeight(recordToEdit.weight || 5);
        setSrvPort(recordToEdit.port || 443);
        setSrvTarget(recordToEdit.value);
      } else if (recordToEdit.type === 'CAA') {
        // e.g. '0 issue "amazon.com"'
        const parts = recordToEdit.value.split(' ');
        if (parts.length >= 3) {
          setCaaFlags(parseInt(parts[0], 10) || 0);
          setCaaTag(parts[1]);
          setCaaValue(parts.slice(2).join(' '));
        } else {
          setCaaValue(recordToEdit.value);
        }
      } else {
        setGenericValue(recordToEdit.value);
      }
    } else {
      setName('');
      setType('A');
      setTtl(300);
      setRoutingPolicy('Simple');
      setIpValue('');
      setCnameTarget('');
      setTxtValue('');
      setMxPriority(10);
      setMxServer('');
      setSrvPriority(10);
      setSrvWeight(5);
      setSrvPort(443);
      setSrvTarget('');
      setCaaFlags(0);
      setCaaTag('issue');
      setCaaValue('"amazon.com"');
      setGenericValue('');
    }
    setError(null);
  }, [recordToEdit, zone, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Calculate final value and auxiliary fields based on type
    let finalValue = '';
    let priority: number | null = null;
    let weight: number | null = null;
    let port: number | null = null;

    if (type === 'A' || type === 'AAAA') {
      finalValue = ipValue.trim();
    } else if (type === 'CNAME') {
      finalValue = cnameTarget.trim();
    } else if (type === 'TXT') {
      let t = txtValue.trim();
      if (!t.startsWith('"') && !t.endsWith('"')) {
        t = `"${t}"`;
      }
      finalValue = t;
    } else if (type === 'MX') {
      finalValue = mxServer.trim();
      priority = mxPriority;
    } else if (type === 'SRV') {
      finalValue = srvTarget.trim();
      priority = srvPriority;
      weight = srvWeight;
      port = srvPort;
    } else if (type === 'CAA') {
      finalValue = `${caaFlags} ${caaTag} ${caaValue.trim()}`;
    } else {
      finalValue = genericValue.trim();
    }

    if (!finalValue) {
      setError(`Record value for ${type} cannot be empty.`);
      setLoading(false);
      return;
    }

    const payload = {
      name: name.trim() || zone.name,
      type,
      ttl: Number(ttl),
      value: finalValue,
      routing_policy: routingPolicy,
      priority,
      weight,
      port,
    };

    try {
      let res: DNSRecord;
      if (isEditing && recordToEdit) {
        res = await api.updateRecord(recordToEdit.id, payload);
      } else {
        res = await api.createRecord(zone.id, payload);
      }
      onSaved(res);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save record.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit record: ${recordToEdit?.name}` : 'Create record'}
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
            onClick={handleSubmit}
            className="aws-btn aws-btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : isEditing ? 'Save changes' : 'Create records'}
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

        {/* Record Name */}
        <div style={{ marginBottom: 18 }}>
          <label className="aws-label">Record name</label>
          <span className="aws-label-desc">
            The subdomain or leave empty for zone apex ({zone.name}).
          </span>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. www, api, mail, or empty"
              className="aws-input"
              style={{
                flex: 1,
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
              }}
            />
            <div
              style={{
                backgroundColor: 'var(--aws-table-header-bg)',
                border: '1px solid var(--aws-border-input)',
                borderLeft: 'none',
                padding: '6px 12px',
                fontSize: 13,
                color: 'var(--aws-text-secondary)',
                fontWeight: 600,
                borderTopRightRadius: 2,
                borderBottomRightRadius: 2,
                whiteSpace: 'nowrap',
              }}
            >
              .{zone.name}
            </div>
          </div>
        </div>

        {/* Record Type and TTL */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 16,
            marginBottom: 18,
          }}
        >
          <div>
            <label className="aws-label">Record type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as DNSRecordType)}
              className="aws-select"
            >
              {RECORD_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t} -{' '}
                  {t === 'A'
                    ? 'Routes traffic to an IPv4 address'
                    : t === 'AAAA'
                    ? 'Routes traffic to an IPv6 address'
                    : t === 'CNAME'
                    ? 'Routes traffic to another domain name'
                    : t === 'TXT'
                    ? 'Holds machine-readable data / SPF'
                    : t === 'MX'
                    ? 'Routes mail to mail servers'
                    : t === 'SRV'
                    ? 'Locates specialized services'
                    : t === 'CAA'
                    ? 'Specifies certificate authorities'
                    : t === 'NS'
                    ? 'Name servers for a zone'
                    : 'Reverse DNS lookup pointer'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="aws-label">TTL (Seconds)</label>
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                type="number"
                value={ttl}
                onChange={(e) => setTtl(Number(e.target.value))}
                min={1}
                className="aws-input"
                required
              />
              <select
                value={ttl}
                onChange={(e) => setTtl(Number(e.target.value))}
                className="aws-select"
                style={{ width: 'auto' }}
              >
                <option value={60}>60 (1m)</option>
                <option value={300}>300 (5m)</option>
                <option value={900}>900 (15m)</option>
                <option value={3600}>3600 (1h)</option>
                <option value={86400}>86400 (1d)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dynamic Fields tailored by Record Type */}
        <div
          style={{
            padding: 16,
            backgroundColor: 'var(--aws-table-header-bg)',
            border: '1px solid var(--aws-border-light)',
            borderRadius: 2,
            marginBottom: 18,
          }}
        >
          {type === 'A' && (
            <div>
              <label className="aws-label">IPv4 Value(s)</label>
              <span className="aws-label-desc">
                Enter one or more IPv4 addresses (separated by newlines), e.g. 192.0.2.1
              </span>
              <textarea
                value={ipValue}
                onChange={(e) => setIpValue(e.target.value)}
                placeholder="192.0.2.1&#10;198.51.100.1"
                rows={3}
                className="aws-textarea"
                required
              />
            </div>
          )}

          {type === 'AAAA' && (
            <div>
              <label className="aws-label">IPv6 Value(s)</label>
              <span className="aws-label-desc">
                Enter one or more IPv6 addresses, e.g. 2001:0db8:85a3:0000:0000:8a2e:0370:7334
              </span>
              <textarea
                value={ipValue}
                onChange={(e) => setIpValue(e.target.value)}
                placeholder="2001:0db8:85a3:0000:0000:8a2e:0370:7334"
                rows={3}
                className="aws-textarea"
                required
              />
            </div>
          )}

          {type === 'CNAME' && (
            <div>
              <label className="aws-label">Target domain</label>
              <span className="aws-label-desc">
                Canonical name target (e.g. lb-1234.us-east-1.elb.amazonaws.com or example.com)
              </span>
              <input
                type="text"
                value={cnameTarget}
                onChange={(e) => setCnameTarget(e.target.value)}
                placeholder="target.example.com"
                className="aws-input"
                required
              />
            </div>
          )}

          {type === 'TXT' && (
            <div>
              <label className="aws-label">TXT Value</label>
              <span className="aws-label-desc">
                Enter text enclosed in quotation marks, e.g. "v=spf1 include:_spf.google.com ~all"
              </span>
              <textarea
                value={txtValue}
                onChange={(e) => setTxtValue(e.target.value)}
                placeholder='"v=spf1 include:_spf.google.com ~all"'
                rows={3}
                className="aws-textarea"
                required
              />
            </div>
          )}

          {type === 'MX' && (
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 12 }}>
              <div>
                <label className="aws-label">Priority</label>
                <input
                  type="number"
                  value={mxPriority}
                  onChange={(e) => setMxPriority(Number(e.target.value))}
                  className="aws-input"
                  min={0}
                  required
                />
              </div>
              <div>
                <label className="aws-label">Mail Server Host</label>
                <input
                  type="text"
                  value={mxServer}
                  onChange={(e) => setMxServer(e.target.value)}
                  placeholder="mail.example.com"
                  className="aws-input"
                  required
                />
              </div>
            </div>
          )}

          {type === 'SRV' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <div>
                  <label className="aws-label">Priority</label>
                  <input
                    type="number"
                    value={srvPriority}
                    onChange={(e) => setSrvPriority(Number(e.target.value))}
                    className="aws-input"
                    min={0}
                  />
                </div>
                <div>
                  <label className="aws-label">Weight</label>
                  <input
                    type="number"
                    value={srvWeight}
                    onChange={(e) => setSrvWeight(Number(e.target.value))}
                    className="aws-input"
                    min={0}
                  />
                </div>
                <div>
                  <label className="aws-label">Port</label>
                  <input
                    type="number"
                    value={srvPort}
                    onChange={(e) => setSrvPort(Number(e.target.value))}
                    className="aws-input"
                    min={1}
                    max={65535}
                  />
                </div>
              </div>
              <div>
                <label className="aws-label">Target Service</label>
                <input
                  type="text"
                  value={srvTarget}
                  onChange={(e) => setSrvTarget(e.target.value)}
                  placeholder="sipserver.example.com"
                  className="aws-input"
                  required
                />
              </div>
            </div>
          )}

          {type === 'CAA' && (
            <div style={{ display: 'grid', gridTemplateColumns: '80px 120px 1fr', gap: 10 }}>
              <div>
                <label className="aws-label">Flags</label>
                <input
                  type="number"
                  value={caaFlags}
                  onChange={(e) => setCaaFlags(Number(e.target.value))}
                  className="aws-input"
                  min={0}
                  max={255}
                />
              </div>
              <div>
                <label className="aws-label">Tag</label>
                <select
                  value={caaTag}
                  onChange={(e) => setCaaTag(e.target.value)}
                  className="aws-select"
                >
                  <option value="issue">issue</option>
                  <option value="issuewild">issuewild</option>
                  <option value="iodef">iodef</option>
                </select>
              </div>
              <div>
                <label className="aws-label">Value</label>
                <input
                  type="text"
                  value={caaValue}
                  onChange={(e) => setCaaValue(e.target.value)}
                  placeholder='"amazon.com"'
                  className="aws-input"
                  required
                />
              </div>
            </div>
          )}

          {(type === 'NS' || type === 'PTR') && (
            <div>
              <label className="aws-label">{type} Value</label>
              <textarea
                value={genericValue}
                onChange={(e) => setGenericValue(e.target.value)}
                placeholder={type === 'NS' ? 'ns-1.awsdns.com.' : 'ptr.example.com.'}
                rows={3}
                className="aws-textarea"
                required
              />
            </div>
          )}
        </div>

        {/* Routing Policy */}
        <div>
          <label className="aws-label">Routing policy</label>
          <span className="aws-label-desc">
            Choose how Route 53 routes queries for this record.
          </span>
          <select
            value={routingPolicy}
            onChange={(e) => setRoutingPolicy(e.target.value)}
            className="aws-select"
          >
            <option value="Simple">Simple routing</option>
            <option value="Weighted">Weighted routing</option>
            <option value="Latency">Latency routing</option>
            <option value="Failover">Failover routing</option>
            <option value="Geolocation">Geolocation routing</option>
          </select>
        </div>
      </form>
    </Modal>
  );
}
