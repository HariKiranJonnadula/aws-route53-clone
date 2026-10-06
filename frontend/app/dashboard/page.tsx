'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { api } from '@/lib/api';
import { HostedZone } from '@/types';
import { Globe2, Activity, GitFork, ArrowRight, Plus } from 'lucide-react';

export default function DashboardPage() {
  const [zones, setZones] = useState<HostedZone[]>([]);
  const [totalZones, setTotalZones] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .listHostedZones({ limit: 5 })
      .then((res) => {
        setZones(res.items);
        setTotalZones(res.total);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Route 53', href: '/dashboard' },
          { label: 'Dashboard' },
        ]}
      />

      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--aws-text-primary)' }}>
          Route 53 Dashboard
        </h1>
        <p style={{ fontSize: 13, color: 'var(--aws-text-secondary)', marginTop: 4 }}>
          Scalable DNS and domain name registration overview for your AWS environment.
        </p>
      </div>

      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div className="aws-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: 'var(--aws-text-secondary)', fontWeight: 600 }}>
              Hosted zones
            </span>
            <Globe2 size={20} color="#0972d3" />
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, margin: '10px 0 6px 0' }}>
            {totalZones}
          </div>
          <Link
            href="/hosted-zones"
            style={{
              fontSize: 12,
              color: 'var(--aws-link)',
              textDecoration: 'none',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span>View all hosted zones</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        <div className="aws-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: 'var(--aws-text-secondary)', fontWeight: 600 }}>
              Health checks
            </span>
            <Activity size={20} color="#1e8e3e" />
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, margin: '10px 0 6px 0' }}>
            0
          </div>
          <Link
            href="/health-checks"
            style={{
              fontSize: 12,
              color: 'var(--aws-link)',
              textDecoration: 'none',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span>Configure health checks</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        <div className="aws-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: 'var(--aws-text-secondary)', fontWeight: 600 }}>
              Traffic policies
            </span>
            <GitFork size={20} color="#ec7211" />
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, margin: '10px 0 6px 0' }}>
            0
          </div>
          <Link
            href="/traffic-policies"
            style={{
              fontSize: 12,
              color: 'var(--aws-link)',
              textDecoration: 'none',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span>Manage traffic policies</span>
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* Recent Hosted Zones Card */}
      <div className="aws-card" style={{ marginBottom: 24 }}>
        <div className="aws-card-header">
          <div className="aws-card-title">Recent Hosted Zones</div>
          <Link href="/hosted-zones" className="aws-btn aws-btn-primary aws-btn-sm">
            <Plus size={13} />
            <span>Go to Hosted zones</span>
          </Link>
        </div>
        <div className="aws-table-container">
          <table className="aws-table">
            <thead>
              <tr>
                <th>Hosted zone name</th>
                <th>Type</th>
                <th>Records</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: 20 }}>
                    Loading...
                  </td>
                </tr>
              ) : zones.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: 24, color: 'var(--aws-text-secondary)' }}>
                    No hosted zones configured.
                  </td>
                </tr>
              ) : (
                zones.map((z) => (
                  <tr key={z.id}>
                    <td>
                      <Link
                        href={`/hosted-zones/${z.id}`}
                        style={{ color: 'var(--aws-link)', fontWeight: 600, textDecoration: 'none' }}
                      >
                        {z.name}
                      </Link>
                    </td>
                    <td>{z.type}</td>
                    <td>{z.record_count}</td>
                    <td style={{ color: '#1e8e3e', fontWeight: 600 }}>{z.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
