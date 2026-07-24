import React from 'react';
import Button from '../../ui/Button/Button';

export default function PeriodSelector({ selectedPeriod = '30d', onSelect }) {
  const periods = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' }
  ];

  return (
    <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--neutral-100)', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
      {periods.map(p => (
        <Button
          key={p.value}
          variant={selectedPeriod === p.value ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => onSelect(p.value)}
        >
          {p.label}
        </Button>
      ))}
    </div>
  );
}
