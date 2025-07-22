import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { debounce } from 'lodash';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

  const renderSkeletons = () => (
    <Table>
      <TableHeader>
        <TableRow>
          {[...Array(5)].map((_, i) => (
            <TableHead key={i}><Skeleton className="h-5 w-full" /></TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...Array(limit)].map((_, i) => (
          <TableRow key={i}>
            {[...Array(5)].map((_, j) => (
              <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Candidates</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
          <Input
            type="text"
            placeholder="Search by name, email, or tags..."
            className="w-full sm:w-1/3"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Per Page:</span>
            <Select
              value={String(limit)}
              onValueChange={(value) => {
                setLimit(Number(value));
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[80px]">
                <SelectValue placeholder="Limit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading && renderSkeletons()}
        {error && <p className="text-red-500">{error}</p>}
        
        {!loading && !error && (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>Name{renderSortArrow('name')}</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('email')}>Email{renderSortArrow('email')}</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('created_at')}>Date Added{renderSortArrow('created_at')}</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {candidates.map(c => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>{c.email}</TableCell>
                      <TableCell>{c.tags}</TableCell>
                      <TableCell>{new Date(c.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>{c.enabled ? 'Active' : 'Disabled'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {pagination && pagination.total > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4">
                <span className="text-sm text-muted-foreground">
                  Showing {(page - 1) * limit + 1} to {Math.min(page * limit, pagination.total)} of {pagination.total} results
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => p - 1)}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm">Page {page} of {pagination.totalPages}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => p + 1)}
                    disabled={page === pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CandidateManagementPanel;