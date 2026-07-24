import React from 'react';
import Card from '../ui/Card/Card';
import Button from '../ui/Button/Button';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '3rem 1.5rem', display: 'flex', justifyContent: 'center' }}>
          <Card style={{ maxWidth: '550px', textAlign: 'center', padding: '2.5rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--neutral-950)' }}>
              Something went wrong
            </h2>
            <p style={{ color: 'var(--neutral-600)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              An unexpected error occurred in the application. You can reload the page or return to the dashboard.
            </p>
            {this.state.error?.message && (
              <div style={{ 
                background: 'var(--neutral-100)', 
                padding: '0.75rem', 
                borderRadius: 'var(--radius-md)', 
                fontSize: '0.8rem', 
                fontFamily: 'var(--font-mono)',
                color: 'var(--error)',
                marginBottom: '1.5rem',
                textAlign: 'left',
                overflowX: 'auto'
              }}>
                {this.state.error.message}
              </div>
            )}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Button variant="outline" onClick={this.handleReload}>
                🔄 Reload Page
              </Button>
              <Button variant="primary" onClick={() => window.location.href = '/dashboard'}>
                🏠 Go to Dashboard
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
