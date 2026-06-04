/**
 * useSyncJobs Hook - Sync jobs fetching with pagination
 * @module hooks/useSyncJobs
 */

import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import type { IntegrationLogItem } from '../types/api';

interface UseSyncJobsResult {
  jobs: IntegrationLogItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
  setPage: (page: number) => void;
  refetch: () => void;
}

export function useSyncJobs(initialPage = 1, pageSize = 20): UseSyncJobsResult {
  const [jobs, setJobs] = useState<IntegrationLogItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.get<{ logs: IntegrationLogItem[] }>(
        `/integrations/github/logs?page=${page}&pageSize=${pageSize}`
      );
      setJobs(result.logs);
      setTotalCount(result.logs.length < pageSize ? (page - 1) * pageSize + result.logs.length : page * pageSize + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sync jobs');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return {
    jobs,
    totalCount,
    page,
    pageSize,
    loading,
    error,
    setPage,
    refetch: fetch,
  };
}
