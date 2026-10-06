import React from 'react';
import Link from 'next/link';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { LucideIcon, ArrowLeft } from 'lucide-react';

interface ComingSoonPageProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export function ComingSoonPage({
  title,
  description,
  icon: Icon,
}: ComingSoonPageProps) {
  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Route 53', href: '/hosted-zones' },
          { label: title },
        ]}
      />

      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--aws-text-primary)' }}>
          {title}
        </h1>
        <p style={{ fontSize: 13, color: 'var(--aws-text-secondary)', marginTop: 4 }}>
          {description}
        </p>
      </div>

      <div
        className="aws-card"
        style={{
          padding: '60px 20px',
          textAlign: 'center',
          maxWidth: 640,
          margin: '40px auto',
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            backgroundColor: 'var(--aws-info-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            color: 'var(--aws-link)',
          }}
        >
          <Icon size={28} />
        </div>

        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: 'var(--aws-text-primary)' }}>
          Feature Coming Soon
        </h2>

        <p
          style={{
            fontSize: 13,
            color: 'var(--aws-text-secondary)',
            maxWidth: 440,
            margin: '0 auto 24px auto',
            lineHeight: 1.5,
          }}
        >
          The <strong>{title}</strong> service is currently under development in this AWS Route 53 clone.
          Please visit <strong>Hosted zones</strong> to manage your DNS records and domain routing configurations.
        </p>

        <Link href="/hosted-zones" className="aws-btn aws-btn-primary">
          <ArrowLeft size={14} />
          <span>Return to Hosted zones</span>
        </Link>
      </div>
    </div>
  );
}
