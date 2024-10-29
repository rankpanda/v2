import React from 'react';

interface KDIndicatorProps {
  kd: number;
  showLabel?: boolean;
}

export function KDIndicator({ kd, showLabel = true }: KDIndicatorProps) {
  const getKDColor = (value: number) => {
    if (value <= 14) return 'bg-green-100 text-green-800';
    if (value <= 29) return 'bg-emerald-100 text-emerald-800';
    if (value <= 49) return 'bg-yellow-100 text-yellow-800';
    if (value <= 69) return 'bg-orange-100 text-orange-800';
    if (value <= 84) return 'bg-red-100 text-red-800';
    return 'bg-red-200 text-red-900';
  };

  const getKDLabel = (value: number) => {
    if (value <= 14) return 'Very Easy';
    if (value <= 29) return 'Easy';
    if (value <= 49) return 'Possible';
    if (value <= 69) return 'Difficult';
    if (value <= 84) return 'Hard';
    return 'Very Hard';
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getKDColor(kd)}`}>
      {kd}%
      {showLabel && <span className="ml-1 text-xs opacity-75">({getKDLabel(kd)})</span>}
    </span>
  );
}