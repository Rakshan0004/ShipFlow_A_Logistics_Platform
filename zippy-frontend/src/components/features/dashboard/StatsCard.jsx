import React from 'react';
import Card from '../../ui/Card/Card';
import './DashboardFeatures.css';

export default function StatsCard({ title, value, icon, trend, color = 'blue', loading }) {
  return (
    <Card className={`stats-card stats-card-${color}`}>
      <div className="stats-card-header">
        <span className="stats-card-title">{title}</span>
        <span className="stats-card-icon">{icon}</span>
      </div>
      <div className="stats-card-body">
        {loading ? (
          <div className="stats-skeleton shimmer" />
        ) : (
          <h3 className="stats-card-value">{value}</h3>
        )}
      </div>
      {trend && (
        <div className="stats-card-footer">
          <span className={`trend-indicator ${trend.positive ? 'positive' : 'negative'}`}>
            {trend.positive ? '▲' : '▼'} {trend.text}
          </span>
          <span className="trend-sub">vs last period</span>
        </div>
      )}
    </Card>
  );
}
