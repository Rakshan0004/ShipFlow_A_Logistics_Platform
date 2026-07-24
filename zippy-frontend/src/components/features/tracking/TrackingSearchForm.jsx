import React, { useState } from 'react';
import Card from '../../ui/Card/Card';
import Input from '../../ui/Input/Input';
import Button from '../../ui/Button/Button';

export default function TrackingSearchForm({ initialValue = '', onSearch, loading }) {
  const [trackingNumber, setTrackingNumber] = useState(initialValue);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      onSearch(trackingNumber.trim());
    }
  };

  return (
    <Card style={{ padding: '2rem' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '260px' }}>
          <Input
            label="Enter AWB Tracking Number"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="e.g. ZPY-TRACK-1001 or ZPY-ORD-10001"
            required
          />
        </div>
        <Button variant="primary" type="submit" loading={loading} style={{ height: '44px' }}>
          🔍 Track Parcel
        </Button>
      </form>
    </Card>
  );
}
