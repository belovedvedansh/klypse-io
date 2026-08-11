// ============================================
// Admin Types
// ============================================

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  description: string;
  updatedAt: string;
  updatedBy: string | null;
}

export interface SystemConfig {
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  description: string;
  updatedAt: string;
  updatedBy: string | null;
}

export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorType: 'user' | 'admin' | 'system';
  action: string;
  resource: string;
  resourceId: string;
  details: Record<string, unknown>;
  ipAddress: string | null;
  createdAt: string;
}

export interface ModerationFlag {
  id: string;
  userId: string;
  projectId: string | null;
  clipId: string | null;
  reason: ModerationReason;
  status: 'pending' | 'reviewed' | 'actioned' | 'dismissed';
  notes: string | null;
  reviewedBy: string | null;
  createdAt: string;
  reviewedAt: string | null;
}

export type ModerationReason =
  | 'copyright'
  | 'prohibited_content'
  | 'abuse'
  | 'spam'
  | 'duplicate_account'
  | 'quota_abuse'
  | 'other';

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface QueueHealth {
  name: string;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: boolean;
}

export interface ProviderHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  latencyMs: number | null;
  lastCheckedAt: string;
  errorRate: number;
}

export interface AdminOverview {
  totalUsers: number;
  activeUsers24h: number;
  totalProjects: number;
  activeJobs: number;
  exportsToday: number;
  storageUsedGb: number;
  queueHealth: QueueHealth[];
  providerHealth: ProviderHealth[];
}
