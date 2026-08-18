/**
 * useJobPoller.ts
 * ─────────────────────────────────────────────────────────
 * React hook that polls GET /api/exports/:jobId every N ms
 * until the job reaches a terminal state (completed | failed).
 *
 * Usage:
 *   const { job, done, error } = useJobPoller(jobId);
 */
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { api, ProcessingJob } from './apiClient';

const TERMINAL = new Set(['completed', 'failed', 'cancelled']);
const DEFAULT_INTERVAL_MS = 2_500;

interface UseJobPollerResult {
  job: ProcessingJob | null;
  done: boolean;
  error: string | null;
}

export function useJobPoller(
  jobId: string | null | undefined,
  intervalMs = DEFAULT_INTERVAL_MS,
): UseJobPollerResult {
  const [job, setJob] = useState<ProcessingJob | null>(null);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const poll = useCallback(async () => {
    if (!jobId) return;
    try {
      const result = await api.exports.getStatus(jobId);
      setJob(result);
      if (TERMINAL.has(result.status)) {
        setDone(true);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown polling error';
      setError(msg);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [jobId]);

  useEffect(() => {
    if (!jobId || done) return;

    poll(); // immediate first fetch
    timerRef.current = setInterval(poll, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [jobId, done, poll, intervalMs]);

  return { job, done, error };
}