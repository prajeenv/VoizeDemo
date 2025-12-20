import { useState } from 'react';
import type { WorkflowType } from '../../../shared/types';

export interface SearchFilterOptions {
  searchText: string;
  workflowType: WorkflowType | 'all';
  dateRange: 'all' | 'today' | 'week' | 'month';
  nurseName: string;
}

interface SearchFilterProps {
  onFilterChange: (filters: SearchFilterOptions) => void;
}

export default function SearchFilter({ onFilterChange }: SearchFilterProps) {
  const [filters, setFilters] = useState<SearchFilterOptions>({
    searchText: '',
    workflowType: 'all',
    dateRange: 'all',
    nurseName: '',
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (updates: Partial<SearchFilterOptions>) => {
    const newFilters = { ...filters, ...updates };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const defaultFilters: SearchFilterOptions = {
      searchText: '',
      workflowType: 'all',
      dateRange: 'all',
      nurseName: '',
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const hasActiveFilters =
    filters.searchText !== '' ||
    filters.workflowType !== 'all' ||
    filters.dateRange !== 'all' ||
    filters.nurseName !== '';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
      {/* Search Bar */}
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search entries (patient, transcript, notes...)"
              value={filters.searchText}
              onChange={(e) => handleFilterChange({ searchText: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isExpanded
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
              Filters
              {hasActiveFilters && (
                <span className="inline-flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full">
                  !
                </span>
              )}
            </div>
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-200 pt-4">
          <div className="grid grid-cols-3 gap-4">
            {/* Workflow Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Workflow Type
              </label>
              <select
                value={filters.workflowType}
                onChange={(e) =>
                  handleFilterChange({
                    workflowType: e.target.value as WorkflowType | 'all',
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="vital-signs">Vital Signs</option>
                <option value="medication-administration">Medication Administration</option>
                <option value="patient-assessment">Patient Assessment</option>
                <option value="wound-care">Wound Care</option>
                <option value="shift-handoff">Shift Handoff</option>
                <option value="admission">Admission</option>
                <option value="discharge">Discharge</option>
                <option value="general-note">General Note</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) =>
                  handleFilterChange({
                    dateRange: e.target.value as SearchFilterOptions['dateRange'],
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>

            {/* Nurse Name Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nurse Name
              </label>
              <input
                type="text"
                placeholder="Filter by nurse..."
                value={filters.nurseName}
                onChange={(e) => handleFilterChange({ nurseName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
