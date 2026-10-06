'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Globe, Bell, User as UserIcon, LogOut, Moon, Sun, ChevronDown } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export function TopNav() {
  const { user, logout } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <header
      style={{
        height: 44,
        backgroundColor: 'var(--aws-topbar-bg)',
        color: 'var(--aws-topbar-text)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        borderBottom: '1px solid var(--aws-topbar-border)',
        zIndex: 100,
        position: 'sticky',
        top: 0,
      }}
    >
      {/* Left: AWS Logo & Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <Link
          href="/hosted-zones"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: '#ffffff',
            textDecoration: 'none',
            fontWeight: 800,
            fontSize: 15,
            letterSpacing: 0.5,
          }}
        >
          <span
            style={{
              backgroundColor: '#ec7211',
              color: '#ffffff',
              borderRadius: 2,
              padding: '1px 5px',
              fontSize: 12,
              fontWeight: 900,
            }}
          >
            AWS
          </span>
          <span style={{ color: '#d5dbdb', fontWeight: 500 }}>Route 53</span>
        </Link>

        {/* Global Search Bar (AWS Console style) */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            width: 320,
          }}
        >
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: 10,
              color: '#879596',
            }}
          />
          <input
            type="text"
            placeholder="Search for services, features, docs"
            style={{
              width: '100%',
              backgroundColor: '#16191f',
              border: '1px solid #414750',
              borderRadius: 4,
              color: '#ffffff',
              padding: '4px 10px 4px 30px',
              fontSize: 12,
              outline: 'none',
            }}
          />
          <span
            style={{
              position: 'absolute',
              right: 8,
              fontSize: 10,
              backgroundColor: '#232f3e',
              border: '1px solid #414750',
              color: '#879596',
              borderRadius: 2,
              padding: '1px 4px',
            }}
          >
            Alt+S
          </span>
        </div>
      </div>

      {/* Right: Actions, Region, Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Dark Mode Bonus Toggle */}
        <button
          onClick={toggleDarkMode}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{
            background: 'none',
            border: 'none',
            color: '#aab7b8',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Notifications */}
        <button
          style={{
            background: 'none',
            border: 'none',
            color: '#aab7b8',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
          }}
          title="Notifications"
        >
          <Bell size={16} />
        </button>

        {/* Region Indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            color: '#d5dbdb',
            cursor: 'default',
            padding: '4px 8px',
            borderLeft: '1px solid #353c44',
          }}
        >
          <Globe size={14} color="#879596" />
          <span>Global (Route 53)</span>
        </div>

        {/* User Account Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 600,
              padding: '4px 8px',
              borderRadius: 2,
            }}
          >
            <UserIcon size={14} color="#ec7211" />
            <span>{user?.name || 'AWS Route53 Admin'}</span>
            <ChevronDown size={14} color="#879596" />
          </button>

          {userDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '100%',
                marginTop: 6,
                backgroundColor: 'var(--aws-panel-bg)',
                border: '1px solid var(--aws-panel-border)',
                borderRadius: 2,
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                width: 240,
                zIndex: 200,
                color: 'var(--aws-text-primary)',
              }}
            >
              <div
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--aws-border-light)',
                  fontSize: 12,
                }}
              >
                <div style={{ fontWeight: 700 }}>AWS Account</div>
                <div style={{ color: 'var(--aws-text-secondary)', fontSize: 11, marginTop: 2 }}>
                  Account ID: 1234-5678-9012
                </div>
                <div style={{ color: 'var(--aws-text-secondary)', fontSize: 11 }}>
                  {user?.email || 'demo@route53.local'}
                </div>
              </div>
              <div style={{ padding: '6px 0' }}>
                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    logout();
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 16px',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    color: 'var(--aws-text-primary)',
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--aws-border-light)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <LogOut size={14} color="#d13212" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
