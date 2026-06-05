/**
 * usePullRequests Hook - Pull request fetching with filters
 * @module hooks/usePullRequests
 */

import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import type { PullRequest } from '../types/api';

interface UsePullRequestsOptions {
  period?: '7d' | '30d';
  state?: 'open' | 'closed' | 'all';
  repository?: string;
}

interface UsePullRequestsResult {
  pullRequests: PullRequest[];
  repositories: string[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function usePullRequests(options: UsePullRequestsOptions = {}): UsePullRequestsResult {
  const { period = '30d', state = 'all', repository } = options;

  const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
  const [repositories, setRepositories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('period', period);
      params.set('state', state);
      if (repository && repository !== 'all') {
        params.set('repository', repository);
      }

      const result = await api.get<{ pullRequests: PullRequest[]; repositories: string[] }>(
        `/dashboard/pull-requests?${params.toString()}`
      );
      setPullRequests(result.pullRequests);
      setRepositories(result.repositories);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pull requests');
    } finally {
      setLoading(false);
    }
  }, [period, state, repository]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { pullRequests, repositories, loading, error, refetch: fetch };
}
