/**
 * apiClient.ts
 * ─────────────────────────────────────────────────────────
 * All HTTP calls to the Klypse backend go through this module.
 * The base URL is read from NEXT_PUBLIC_API_URL at build time /
 * runtime, so the same bundle works for local dev and production.
 *
 * Usage:
 *   import { api } from '@/lib/apiClient';
 *   const projects = await api.projects.list();
 */

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? 'http://localhost:4000';

// ─── Core fetch wrapper ───────────────────────────────────

interface FetchOptions extends RequestInit {
  /** Extra query-string params to append. */
  params?: Record<string, string | number | undefined>;
}

async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { params, ...init } = options;

  let url = `${BASE_URL}${path}`;
  if (params) {
    const qs = new URLSearchParams(
      Object.entries(params)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)]),
    ).toString();
    if (qs) url += `?${qs}`;
  }

  const res = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
    ...init,
  });

  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = { error: { message: res.statusText } };
    }
    const message =
      (body as any)?.error?.message ?? `API error ${res.status}`;
    throw new ApiError(message, res.status, (body as any)?.error?.code);
  }

  // 204 No Content — return undefined
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  statusCode: number;
  code?: string;

  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

// ─── Resource namespaces ──────────────────────────────────

// — Health —

export const health = {
  check: () => apiFetch<{ status: string; timestamp: string; uptime: number }>('/health'),
};

// — Projects —

export interface Project {
  id: string;
  userId: string;
  title: string;
  status: string;
  sourceType: string;
  sourceUrl?: string;
  sourceFileName?: string;
  sourceDurationSeconds?: number;
  clipCount: number;
  exportCount: number;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  jobs?: ProcessingJob[];
}

export interface CreateProjectInput {
  title: string;
  sourceType: 'upload' | 'youtube' | 'twitch' | 'kick';
  sourceUrl?: string;
  sourceFileName?: string;
}

export const projects = {
  list: () => apiFetch<{ projects: Project[]; total: number }>('/api/projects'),

  get: (id: string) => apiFetch<Project>(`/api/projects/${id}`),

  create: (body: CreateProjectInput) =>
    apiFetch<Project>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  update: (id: string, body: Partial<CreateProjectInput & { status: string }>) =>
    apiFetch<Project>(`/api/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  delete: (id: string) =>
    apiFetch<void>(`/api/projects/${id}`, { method: 'DELETE' }),
};

// — Clips —

export interface Clip {
  id: string;
  projectId: string;
  userId: string;
  status: string;
  title: string;
  hookText?: string;
  startTime: number;
  endTime: number;
  durationSeconds: number;
  scores: Record<string, number>;
  thumbnailUrl?: string;
  previewUrl?: string;
  rank: number;
  createdAt: string;
  updatedAt: string;
}

export const clips = {
  list: (projectId?: string) =>
    apiFetch<{ clips: Clip[]; total: number }>('/api/clips', {
      params: projectId ? { projectId } : undefined,
    }),

  get: (id: string) => apiFetch<Clip>(`/api/clips/${id}`),

  setStatus: (id: string, status: 'approved' | 'rejected' | 'candidate') =>
    apiFetch<Clip>(`/api/clips/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  delete: (id: string) =>
    apiFetch<void>(`/api/clips/${id}`, { method: 'DELETE' }),
};

// — Exports —

export interface ExportJob {
  exportId: string;
  status: string;
  clipId: string;
}

export interface ProcessingJob {
  id: string;
  projectId: string;
  userId: string;
  type: string;
  status: string;
  progress: number;
  error?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export const exports_ = {
  create: (clipId: string, aspectRatio: '9:16' | '1:1' | '16:9' = '9:16') =>
    apiFetch<ExportJob>('/api/exports', {
      method: 'POST',
      body: JSON.stringify({ clipId, aspectRatio }),
    }),

  /** Poll until status is 'completed' or 'failed'. */
  getStatus: (jobId: string) =>
    apiFetch<ProcessingJob>(`/api/exports/${jobId}`),
};

// — Users —

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: string;
  createdAt: string;
  profile?: {
    displayName: string;
    bio?: string;
    onboardingCompleted: boolean;
  } | null;
}

export const users = {
  me: () => apiFetch<User>('/api/users/me'),

  updateMe: (body: { name?: string; avatarUrl?: string; displayName?: string; bio?: string }) =>
    apiFetch<User>('/api/users/me', {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
};

// ─── Convenience default export ───────────────────────────

export const api = {
  health,
  projects,
  clips,
  exports: exports_,
  users,
};

export default api;