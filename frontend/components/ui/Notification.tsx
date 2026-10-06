import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { FlashNotification } from '@/types';

interface NotificationProps {
  notification: FlashNotification | null;
  onDismiss?: () => void;
}

export function Notification({ notification, onDismiss }: NotificationProps) {
  if (!notification) return null;

  const isSuccess = notification.type === 'success';
  const isError = notification.type === 'error';
  const isInfo = notification.type === 'info' || notification.type === 'warning';

  const alertClass = isSuccess
    ? 'aws-alert aws-alert-success'
    : isError
    ? 'aws-alert aws-alert-error'
    : 'aws-alert aws-alert-info';

  const Icon = isSuccess ? CheckCircle2 : isError ? AlertCircle : Info;
  const iconColor = isSuccess ? '#037f0c' : isError ? '#d13212' : '#0972d3';

  return (
    <div className={alertClass} role="alert" style={{ position: 'relative' }}>
      <Icon size={18} style={{ color: iconColor, flexShrink: 0, marginTop: 2 }} />
      <div style={{ flex: 1 }}>
        {notification.title && (
          <div style={{ fontWeight: 700, marginBottom: 2 }}>{notification.title}</div>
        )}
        <div>{notification.message}</div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'inherit',
            opacity: 0.7,
            padding: 2,
          }}
          title="Dismiss"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
