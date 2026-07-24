import React, { useState } from 'react';
import Card from '../../components/ui/Card/Card';
import Button from '../../components/ui/Button/Button';
import Input from '../../components/ui/Input/Input';
import Select from '../../components/ui/Select/Select';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();

  const [apiUrl, setApiUrl] = useState('http://localhost:8080/api');
  const [defaultCourier, setDefaultCourier] = useState('FASTSHIP');
  const [autoRefreshInterval, setAutoRefreshInterval] = useState('30');

  const handleSave = (e) => {
    e.preventDefault();
    showToast('Platform settings saved successfully!', 'success');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <Card title="⚙ Platform Settings & Preferences">
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem', color: 'var(--neutral-900)' }}>Appearance & Theme</h4>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--neutral-100)', borderRadius: 'var(--radius-md)' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Theme Mode</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--neutral-500)' }}>Current mode: {theme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}</div>
              </div>
              <Button type="button" variant="outline" onClick={toggleTheme}>
                Switch Theme
              </Button>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', color: 'var(--neutral-900)' }}>Logistics Engine API Settings</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Input
                label="Backend API Base URL"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="http://localhost:8080/api"
              />

              <Select
                label="Default Preferred Courier"
                value={defaultCourier}
                onChange={setDefaultCourier}
                options={[
                  { value: 'FASTSHIP', label: 'FastShip (Priority SLA)' },
                  { value: 'QUICKEXPRESS', label: 'QuickExpress (Balanced Rate)' },
                  { value: 'RELIABLE', label: 'ReliableCourier (Economy Freight)' }
                ]}
              />

              <Select
                label="Tracking Auto-Refresh Interval"
                value={autoRefreshInterval}
                onChange={setAutoRefreshInterval}
                options={[
                  { value: '15', label: 'Every 15 Seconds' },
                  { value: '30', label: 'Every 30 Seconds (Recommended)' },
                  { value: '60', label: 'Every 60 Seconds' }
                ]}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="primary" type="submit">
              Save Settings
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
