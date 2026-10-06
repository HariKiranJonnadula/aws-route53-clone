import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="aws-breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            {index > 0 && <ChevronRight size={12} color="var(--aws-text-muted)" />}
            {isLast || !item.href ? (
              <span
                style={{
                  color: isLast ? 'var(--aws-text-primary)' : 'var(--aws-text-secondary)',
                  fontWeight: isLast ? 600 : 400,
                }}
              >
                {item.label}
              </span>
            ) : (
              <Link href={item.href}>{item.label}</Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
