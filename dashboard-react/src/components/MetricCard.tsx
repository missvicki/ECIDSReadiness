import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  delta?: string;
  help?: string;
  icon?: string;
  color?: string;
}

export default function MetricCard({ label, value, delta, help, icon, color = 'purple' }: MetricCardProps) {
  const colorClasses = {
    purple: 'border-purple-500 bg-purple-50',
    blue: 'border-blue-500 bg-blue-50',
    green: 'border-green-500 bg-green-50',
    yellow: 'border-yellow-500 bg-yellow-50',
    red: 'border-red-500 bg-red-50',
  };

  return (
    <div className={`metric-card ${colorClasses[color as keyof typeof colorClasses] || colorClasses.purple}`}>
      {icon && <div className="text-2xl mb-2">{icon}</div>}
      <div className="text-sm font-medium text-gray-600 mb-1">{label}</div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
      {delta && (
        <div className="text-sm text-gray-500 mt-1">{delta}</div>
      )}
      {help && (
        <div className="text-xs text-gray-400 mt-2">{help}</div>
      )}
    </div>
  );
}
