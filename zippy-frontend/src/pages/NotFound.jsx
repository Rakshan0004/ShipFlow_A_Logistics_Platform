import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card/Card';
import Button from '../components/ui/Button/Button';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Card style={{ maxWidth: '500px', textAlign: 'center', padding: '3rem 2rem' }}>
        <div style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--primary-500)', lineHeight: 1 }}>
          404
        </div>
        <h2 style={{ fontSize: '1.4rem', margin: '1rem 0 0.5rem', color: 'var(--neutral-950)' }}>
          Page Not Found
        </h2>
        <p style={{ color: 'var(--neutral-600)', marginBottom: '2rem', fontSize: '0.92rem' }}>
          The logistics route or page you are trying to access does not exist or has been moved.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Button variant="outline" onClick={() => navigate(-1)}>
            ← Go Back
          </Button>
          <Button variant="primary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
}
