import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { debounce } from 'lodash';
import SkeletonLoader from './SkeletonLoader';

interface Candidate {
  id: number;
  name: string;
  email: string;
  tags: string;
  created_at: string;
  enabled: boolean;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const CandidateManagementPanel: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter and sort state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [search, setSearch] = useState('');

  const fetchCandidates = useCallback(async (p: number, l: number, sb: string, so: string, s: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: p.toString(),
        limit: l.toString(),
        sortBy: sb,
        sortOrder: so,
        search: s,
      });
      const res = await axios.get<{ data: Candidate[]; pagination: Pagination }>(`/api/candidates?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCandidates(res.data.data);
      setPagination(res.data.pagination);
      setError(null);
    } catch (err) {
      setError('Failed to fetch candidates.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedFetch = useCallback(debounce(fetchCandidates, 500), [fetchCandidates]);

  useEffect(() => {
    debouncedFetch(page, limit, sortBy, sortOrder, search);
    return () => {
      debouncedFetch.cancel();
    };
  }, [page, limit, sortBy, sortOrder, search, debouncedFetch]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(column);
      setSortOrder('ASC');
    }
    setPage(1); // Reset to first page on sort
  };

  const renderSortArrow = (column: string) => {
    if (sortBy !== column) return null;
    return sortOrder === 'ASC' ? ' ▲' : ' ▼';
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Manage Candidates</h2>
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          className="p-2 border rounded w-1/3"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <div>
          <label htmlFor="limit-select" className="mr-2">Per Page:</label>
          <select
            id="limit-select"
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="p-2 border rounded"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>

      {loading && <SkeletonLoader rows={limit} cols={5} />}
      {error && <p className="text-red-500">{error}</p>}
      
      {!loading && !error && (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 text-left cursor-pointer" onClick={() => handleSort('name')}>Name{renderSortArrow('name')}</th>
                  <th className="py-2 px-4 text-left cursor-pointer" onClick={() => handleSort('email')}>Email{renderSortArrow('email')}</th>
                  <th className="py-2 px-4 text-left">Tags</th>
                  <th className="py-2 px-4 text-left cursor-pointer" onClick={() => handleSort('created_at')}>Date Added{renderSortArrow('created_at')}</th>
                  <th className="py-2 px-4 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map(c => (
                  <tr key={c.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4">{c.name}</td>
                    <td className="py-2 px-4">{c.email}</td>
                    <td className="py-2 px-4">{c.tags}</td>
                    <td className="py-2 px-4">{new Date(c.created_at).toLocaleDateString()}</td>
                    <td className="py-2 px-4">{c.enabled ? 'Active' : 'Disabled'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination && pagination.total > 0 && (
            <div className="flex justify-between items-center mt-4">
              <span>
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, pagination.total)} of {pagination.total} results
              </span>
              <div>
                <button
                  onClick={() => setPage(p => p - 1)}
                  disabled={page === 1}
                  className="p-2 border rounded mr-2 disabled:opacity-50"
                >
                  Previous
                </button>
                <span>Page {page} of {pagination.totalPages}</span>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page === pagination.totalPages}
                  className="p-2 border rounded ml-2 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CandidateManagementPanel;