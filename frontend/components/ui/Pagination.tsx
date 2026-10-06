import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (newPage: number) => void;
  onLimitChange?: (newLimit: number) => void;
}

export function Pagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onLimitChange,
}: PaginationProps) {
  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderTop: '1px solid var(--aws-border-light)',
        backgroundColor: 'var(--aws-panel-bg)',
        fontSize: 13,
        color: 'var(--aws-text-secondary)',
        flexWrap: 'wrap',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span>
          Showing <strong>{startItem}</strong> - <strong>{endItem}</strong> of{' '}
          <strong>{total}</strong>
        </span>

        {onLimitChange && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>Per page:</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="aws-select"
              style={{ width: 'auto', padding: '2px 8px', height: 28 }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="aws-btn aws-btn-secondary aws-btn-sm"
          style={{ padding: '4px 8px' }}
          title="Previous page"
        >
          <ChevronLeft size={16} />
        </button>

        <span style={{ margin: '0 6px' }}>
          Page <strong>{page}</strong> of <strong>{Math.max(1, totalPages)}</strong>
        </span>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="aws-btn aws-btn-secondary aws-btn-sm"
          style={{ padding: '4px 8px' }}
          title="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
