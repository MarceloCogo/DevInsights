/**
 * useDoraMetrics Hook - DORA metrics fetching
 * @module hooks/useDoraMetrics
 */

import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import type { DoraOverview } from '../types/api';

interface UseDoraMetricsResult {
  data: DoraOverview | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useDoraMetrics(): UseDoraMetricsResult {
  const [data, setData] = useState<DoraOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.get<DoraOverview>('/dashboard/dora-overview');
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load DORA metrics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
