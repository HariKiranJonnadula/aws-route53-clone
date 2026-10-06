'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Globe2,
  GitFork,
  Activity,
  Layers,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Hosted zones', href: '/hosted-zones', icon: Globe2 },
  { name: 'Traffic policies', href: '/traffic-policies', icon: GitFork },
  { name: 'Health checks', href: '/health-checks', icon: Activity },
  { name: 'Resolver', href: '/resolver', icon: Layers },
  { name: 'Profiles', href: '/profiles', icon: ShieldCheck },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: 240,
        backgroundColor: 'var(--aws-sidebar-bg)',
        borderRight: '1px solid var(--aws-sidebar-border)',
        minHeight: 'calc(100vh - 44px)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      {/* Title Header */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--aws-sidebar-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: 'var(--aws-text-primary)',
            letterSpacing: -0.2,
          }}
        >
          Route 53
        </span>
      </div>

      {/* Nav List */}
      <nav style={{ padding: '10px 0', flex: 1 }}>
        <div
          style={{
            padding: '4px 20px 8px 20px',
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--aws-text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          DNS Management
        </div>

        {navItems.map((item) => {
          const isActive =
            item.href === '/hosted-zones'
              ? pathname.startsWith('/hosted-zones')
              : pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 20px',
                fontSize: 13,
                fontWeight: isActive ? 700 : 500,
                color: isActive
                  ? 'var(--aws-sidebar-active)'
                  : 'var(--aws-text-primary)',
                backgroundColor: isActive
                  ? 'var(--aws-sidebar-active-bg)'
                  : 'transparent',
                borderLeft: isActive
                  ? '4px solid var(--aws-sidebar-active)'
                  : '4px solid transparent',
                textDecoration: 'none',
                transition: 'background-color 0.1s',
              }}
              onMouseEnter={(e) => {
                if (!isActive)
                  e.currentTarget.style.backgroundColor = 'var(--aws-border-light)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Icon size={16} />
              <span style={{ flex: 1 }}>{item.name}</span>
              {isActive && <ChevronRight size={14} />}
            </Link>
          );
        })}
      </nav>

      {/* AWS Info box at footer */}
      <div
        style={{
          padding: '14px 20px',
          borderTop: '1px solid var(--aws-sidebar-border)',
          fontSize: 11,
          color: 'var(--aws-text-secondary)',
          lineHeight: 1.4,
        }}
      >
        <div style={{ fontWeight: 700, color: 'var(--aws-text-primary)', marginBottom: 2 }}>
          Amazon Route 53
        </div>
        <div>Scalable Domain Name System (DNS) web service</div>
      </div>
    </aside>
  );
}
