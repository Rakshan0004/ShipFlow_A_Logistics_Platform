import React from 'react';
import './Table.css';
import Skeleton from '../Skeleton/Skeleton';
import EmptyState from '../EmptyState/EmptyState';

export function Table({ 
  columns,           // [{ key, label, sortable, render }]
  data,
  onSort,
  sortKey,
  sortOrder,
  loading = false,
  emptyMessage = 'No data available'
}) {
  const handleSort = (columnKey) => {
    if (onSort) {
      onSort(columnKey);
    }
  };

  if (loading) {
    return <TableSkeleton rows={5} columns={columns?.length || 4} />;
  }

  if (!data || data.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key} className={col.sortable ? 'table-sortable' : ''}>
                {col.sortable ? (
                  <button 
                    className="table-sort-btn"
                    onClick={() => handleSort(col.key)}
                    aria-label={`Sort by ${col.label}`}
                  >
                    <span>{col.label}</span>
                    {sortKey === col.key && (
                      <span className={`sort-icon ${sortOrder === 'asc' ? 'sort-asc' : 'sort-desc'}`}>
                        {sortOrder === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </button>
                ) : (
                  col.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx}>
              {columns.map(col => (
                <td key={col.key}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className="table-container">
      <table className="table table-skeleton">
        <thead>
          <tr>
            {Array.from({ length: columns }).map((_, idx) => (
              <th key={idx}>
                <Skeleton width="80%" height="16px" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <tr key={rowIdx}>
              {Array.from({ length: columns }).map((_, colIdx) => (
                <td key={colIdx}>
                  <Skeleton width="90%" height="16px" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
