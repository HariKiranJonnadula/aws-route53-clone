'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { KeyRound, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('demo@route53.local');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err?.message || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setEmail('demo@route53.local');
    setPassword('demo123');
    setSubmitting(true);
    setError(null);
    try {
      await login('demo@route53.local', 'demo123');
    } catch (err: any) {
      setError(err?.message || 'Sign in error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0f141c',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Header */}
      <header
        style={{
          height: 52,
          backgroundColor: '#16191f',
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          borderBottom: '1px solid #232f3e',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              backgroundColor: '#ec7211',
              color: '#ffffff',
              borderRadius: 2,
              padding: '2px 6px',
              fontSize: 14,
              fontWeight: 900,
            }}
          >
            AWS
          </span>
          <span style={{ color: '#ffffff', fontSize: 16, fontWeight: 700 }}>
            Amazon Web Services
          </span>
        </div>
      </header>

      {/* Main Container */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 420,
            backgroundColor: '#ffffff',
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
            padding: 36,
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: '#16191f',
                marginBottom: 6,
              }}
            >
              Sign in to Route 53 Console
            </h1>
            <p style={{ fontSize: 13, color: '#545b64' }}>
              AWS Management Console Demo Session
            </p>
          </div>

          {error && (
            <div
              style={{
                backgroundColor: '#fdf3f2',
                borderLeft: '4px solid #d13212',
                padding: '10px 14px',
                marginBottom: 20,
                fontSize: 13,
                color: '#16191f',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <AlertCircle size={16} color="#d13212" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label className="aws-label" style={{ color: '#16191f' }}>
                Root or IAM Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  style={{
                    position: 'absolute',
                    left: 10,
                    top: 10,
                    color: '#545b64',
                  }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="aws-input"
                  required
                  style={{
                    paddingLeft: 34,
                    borderColor: '#7d848b',
                    color: '#16191f',
                    backgroundColor: '#ffffff',
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label className="aws-label" style={{ color: '#16191f' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <KeyRound
                  size={16}
                  style={{
                    position: 'absolute',
                    left: 10,
                    top: 10,
                    color: '#545b64',
                  }}
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="aws-input"
                  required
                  style={{
                    paddingLeft: 34,
                    borderColor: '#7d848b',
                    color: '#16191f',
                    backgroundColor: '#ffffff',
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="aws-btn aws-btn-primary"
              style={{
                width: '100%',
                padding: '10px 0',
                fontSize: 14,
                marginBottom: 16,
              }}
            >
              {submitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Quick Demo Credentials Box */}
          <div
            style={{
              marginTop: 12,
              padding: 14,
              backgroundColor: '#f2f8fd',
              border: '1px solid #bce1fe',
              borderRadius: 2,
              fontSize: 12,
              color: '#16191f',
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 4, color: '#0972d3' }}>
              Quick Demo Access
            </div>
            <div>Email: <code>demo@route53.local</code></div>
            <div>Password: <code>demo123</code></div>
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              style={{
                marginTop: 8,
                background: 'none',
                border: 'none',
                color: '#0972d3',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: 0,
              }}
            >
              <span>1-Click Auto Fill & Sign In</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer
        style={{
          padding: 16,
          textAlign: 'center',
          fontSize: 11,
          color: '#879596',
          borderTop: '1px solid #232f3e',
        }}
      >
        © 2026, Amazon Web Services, Inc. or its affiliates. All rights reserved.
      </footer>
    </div>
  );
}
