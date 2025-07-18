import React from 'react';

export interface DashboardFilterValues {
  dateFrom?: string;
  dateTo?: string;
  stage?: string;
  location?: string;
  tag?: string;
}

interface DashboardFiltersProps {
  values: DashboardFilterValues;
  onChange: (values: DashboardFilterValues) => void;
  stages: string[];
  locations: string[];
  tags: string[];
}

const DashboardFilters: React.FC<DashboardFiltersProps> = ({ values, onChange, stages, locations, tags }) => {
  return (
    <div className="flex flex-wrap gap-4 mb-4 items-end">
      <div>
        <label className="block text-sm font-medium mb-1">Date From</label>
        <input type="date" value={values.dateFrom || ''} onChange={e => onChange({ ...values, dateFrom: e.target.value })} className="border rounded px-2 py-1" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Date To</label>
        <input type="date" value={values.dateTo || ''} onChange={e => onChange({ ...values, dateTo: e.target.value })} className="border rounded px-2 py-1" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Stage</label>
        <select value={values.stage || ''} onChange={e => onChange({ ...values, stage: e.target.value })} className="border rounded px-2 py-1">
          <option value="">All</option>
          {stages.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Location</label>
        <select value={values.location || ''} onChange={e => onChange({ ...values, location: e.target.value })} className="border rounded px-2 py-1">
          <option value="">All</option>
          {locations.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Tag</label>
        <select value={values.tag || ''} onChange={e => onChange({ ...values, tag: e.target.value })} className="border rounded px-2 py-1">
          <option value="">All</option>
          {tags.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <button type="button" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" onClick={() => onChange(values)}>
        Apply Filters
      </button>
    </div>
  );
};

export default DashboardFilters;
