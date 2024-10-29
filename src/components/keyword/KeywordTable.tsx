import React, { useState } from 'react';
import { calculateKeywordMetrics } from '../../utils/keywordMetrics';
import { ArrowUpDown } from 'lucide-react';

interface KeywordTableProps {
  keywords: Array<{
    keyword: string;
    volume: number;
    difficulty: number;
    intent?: string;
    kgr?: number | null;
    kgrRating?: 'great' | 'might work' | 'bad' | 'not applicable';
    analysis?: {
      keyword_analysis?: {
        content_classification?: {
          type?: string;
        };
        search_intent?: {
          type?: string;
        };
        marketing_funnel_position?: {
          stage?: string;
        };
        overall_priority?: {
          score?: number;
        };
      };
    };
  }>;
  selectedKeywords: Set<string>;
  onToggleKeyword: (keyword: string) => void;
  onToggleAll: (selected: boolean) => void;
  contextData: {
    conversionRate: number;
    averageOrderValue: number;
  };
}

type SortField = 'keyword' | 'volume' | 'difficulty' | 'kgr' | 'traffic' | 'conversions' | 'revenue' | 'priority' | 'intent' | 'funnel' | 'type';
type SortDirection = 'asc' | 'desc';

const getKDColor = (difficulty: number): string => {
  if (difficulty <= 14) return 'bg-emerald-100 text-emerald-800';
  if (difficulty <= 29) return 'bg-green-100 text-green-800';
  if (difficulty <= 49) return 'bg-yellow-100 text-yellow-800';
  if (difficulty <= 69) return 'bg-orange-100 text-orange-800';
  if (difficulty <= 84) return 'bg-red-100 text-red-800';
  return 'bg-rose-100 text-rose-800';
};

const getKGRColor = (rating?: 'great' | 'might work' | 'bad' | 'not applicable'): string => {
  switch (rating) {
    case 'great':
      return 'bg-green-100 text-green-800';
    case 'might work':
      return 'bg-yellow-100 text-yellow-800';
    case 'bad':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatKGR = (kgr: number | null | undefined, rating?: 'great' | 'might work' | 'bad' | 'not applicable'): string => {
  if (kgr === null || kgr === undefined) return 'N/A';
  return `${kgr.toFixed(2)} (${rating || 'N/A'})`;
};

export function KeywordTable({ 
  keywords,
  selectedKeywords,
  onToggleKeyword,
  onToggleAll,
  contextData
}: KeywordTableProps) {
  const [sortField, setSortField] = useState<SortField>('volume');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedKeywords = [...keywords].sort((a, b) => {
    const direction = sortDirection === 'asc' ? 1 : -1;
    const metricsA = calculateKeywordMetrics(a, contextData);
    const metricsB = calculateKeywordMetrics(b, contextData);

    switch (sortField) {
      case 'keyword':
        return direction * a.keyword.localeCompare(b.keyword);
      case 'volume':
        return direction * (a.volume - b.volume);
      case 'difficulty':
        return direction * (a.difficulty - b.difficulty);
      case 'kgr':
        return direction * ((a.kgr || 0) - (b.kgr || 0));
      case 'traffic':
        return direction * (metricsA.potentialTraffic - metricsB.potentialTraffic);
      case 'conversions':
        return direction * (metricsA.potentialConversions - metricsB.potentialConversions);
      case 'revenue':
        return direction * (metricsA.potentialRevenue - metricsB.potentialRevenue);
      case 'priority':
        return direction * ((a.analysis?.keyword_analysis?.overall_priority?.score || 0) - 
                          (b.analysis?.keyword_analysis?.overall_priority?.score || 0));
      case 'intent':
        return direction * ((a.analysis?.keyword_analysis?.search_intent?.type || '').localeCompare(
                           b.analysis?.keyword_analysis?.search_intent?.type || ''));
      case 'funnel':
        return direction * ((a.analysis?.keyword_analysis?.marketing_funnel_position?.stage || '').localeCompare(
                           b.analysis?.keyword_analysis?.marketing_funnel_position?.stage || ''));
      case 'type':
        return direction * ((a.analysis?.keyword_analysis?.content_classification?.type || '').localeCompare(
                           b.analysis?.keyword_analysis?.content_classification?.type || ''));
      default:
        return 0;
    }
  });

  const allSelected = keywords.length > 0 && keywords.every(kw => selectedKeywords.has(kw.keyword));

  const SortableHeader = ({ field, label }: { field: SortField; label: string }) => (
    <th 
      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        <ArrowUpDown className={`h-4 w-4 ${sortField === field ? 'text-primary' : 'text-gray-400'}`} />
      </div>
    </th>
  );

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => onToggleAll(e.target.checked)}
                className="h-4 w-4 text-[#11190c] focus:ring-[#11190c] border-gray-300 rounded cursor-pointer"
              />
            </th>
            <SortableHeader field="keyword" label="Keyword" />
            <SortableHeader field="volume" label="Volume" />
            <SortableHeader field="difficulty" label="KD" />
            <SortableHeader field="kgr" label="KGR" />
            <SortableHeader field="type" label="Content Type" />
            <SortableHeader field="intent" label="Search Intent" />
            <SortableHeader field="funnel" label="Funnel Stage" />
            <SortableHeader field="priority" label="Priority" />
            <SortableHeader field="traffic" label="Pot. Traffic" />
            <SortableHeader field="conversions" label="Pot. Conv." />
            <SortableHeader field="revenue" label="Pot. Revenue" />
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedKeywords.map((kw) => {
            const isSelected = selectedKeywords.has(kw.keyword);
            const metrics = calculateKeywordMetrics(kw, contextData);
            
            return (
              <tr key={kw.keyword} className={`hover:bg-gray-50 ${isSelected ? 'bg-[#e6ff00]/10' : ''}`}>
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleKeyword(kw.keyword)}
                    className="h-4 w-4 text-[#11190c] focus:ring-[#11190c] border-gray-300 rounded cursor-pointer"
                  />
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-900 font-medium">{kw.keyword}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-500">{kw.volume.toLocaleString()}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${getKDColor(kw.difficulty)}`}>
                    {kw.difficulty}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${getKGRColor(kw.kgrRating)}`}>
                    {formatKGR(kw.kgr, kw.kgrRating)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-500">
                    {kw.analysis?.keyword_analysis?.content_classification?.type || '-'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-500">
                    {kw.analysis?.keyword_analysis?.search_intent?.type || '-'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-500">
                    {kw.analysis?.keyword_analysis?.marketing_funnel_position?.stage || '-'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-500">
                    {kw.analysis?.keyword_analysis?.overall_priority?.score?.toFixed(1) || '-'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-500">
                    {metrics.potentialTraffic.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-500">
                    {metrics.potentialConversions.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-500">
                    €{metrics.potentialRevenue.toLocaleString()}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}