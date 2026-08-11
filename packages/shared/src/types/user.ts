// ============================================
// User Types
// ============================================

export type UserRole = 'creator' | 'admin' | 'super_admin';

export type AuthProvider = 'google';

export type LinkedPlatform = 'twitch' | 'kick' | 'twitter' | 'youtube';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  userId: string;
  expiresAt: string;
  createdAt: string;
}

export interface LinkedAccount {
  id: string;
  userId: string;
  platform: LinkedPlatform;
  platformUserId: string;
  platformUsername: string;
  accessToken: string; // encrypted at rest
  refreshToken: string | null; // encrypted at rest
  tokenExpiresAt: string | null;
  scopes: string[];
  linkedAt: string;
  lastRefreshedAt: string | null;
}

export interface CreatorProfile {
  id: string;
  userId: string;
  displayName: string;
  bio: string | null;
  niche: CreatorNiche[];
  languages: string[];
  captionPreset: string;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CreatorNiche =
  | 'gaming'
  | 'streaming'
  | 'podcast'
  | 'commentary'
  | 'education'
  | 'interview'
  | 'reaction'
  | 'music'
  | 'vlog'
  | 'other';
