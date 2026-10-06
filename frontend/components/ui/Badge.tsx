import React from 'react';

interface BadgeProps {
  variant?: 'active' | 'public' | 'private' | 'type' | 'default';
  children: React.ReactNode;
}

export function Badge({ variant = 'default', children }: BadgeProps) {
  let className = 'aws-badge';
  if (variant === 'active') className += ' aws-badge-active';
  else if (variant === 'public') className += ' aws-badge-public';
  else if (variant === 'private') className += ' aws-badge-private';
  else if (variant === 'type') className += ' aws-badge-type';

  return <span className={className}>{children}</span>;
}
