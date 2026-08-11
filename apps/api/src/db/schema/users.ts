import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  pgEnum,
  jsonb,
  boolean,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ---- Enums ----
export const userRoleEnum = pgEnum('user_role', ['creator', 'admin', 'super_admin']);
export const linkedPlatformEnum = pgEnum('linked_platform', [
  'twitch',
  'kick',
  'twitter',
  'youtube',
]);
export const creatorNicheEnum = pgEnum('creator_niche', [
  'gaming',
  'streaming',
  'podcast',
  'commentary',
  'education',
  'interview',
  'reaction',
  'music',
  'vlog',
  'other',
]);

// ---- Users ----
export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    email: varchar('email', { length: 320 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    avatarUrl: text('avatar_url'),
    role: userRoleEnum('role').notNull().default('creator'),
    googleId: varchar('google_id', { length: 255 }).unique(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: index('users_email_idx').on(table.email),
    googleIdIdx: index('users_google_id_idx').on(table.googleId),
  }),
);

// ---- Sessions ----
export const sessions = pgTable(
  'sessions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    token: varchar('token', { length: 512 }).notNull().unique(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tokenIdx: index('sessions_token_idx').on(table.token),
    userIdx: index('sessions_user_id_idx').on(table.userId),
  }),
);

// ---- Linked Accounts ----
export const linkedAccounts = pgTable(
  'linked_accounts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    platform: linkedPlatformEnum('platform').notNull(),
    platformUserId: varchar('platform_user_id', { length: 255 }).notNull(),
    platformUsername: varchar('platform_username', { length: 255 }).notNull(),
    accessToken: text('access_token').notNull(), // encrypted
    refreshToken: text('refresh_token'), // encrypted
    tokenExpiresAt: timestamp('token_expires_at', { withTimezone: true }),
    scopes: jsonb('scopes').$type<string[]>().default([]),
    linkedAt: timestamp('linked_at', { withTimezone: true }).defaultNow().notNull(),
    lastRefreshedAt: timestamp('last_refreshed_at', { withTimezone: true }),
  },
  (table) => ({
    userPlatformIdx: index('linked_accounts_user_platform_idx').on(
      table.userId,
      table.platform,
    ),
  }),
);

// ---- Creator Profiles ----
export const creatorProfiles = pgTable('creator_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  displayName: varchar('display_name', { length: 255 }).notNull(),
  bio: text('bio'),
  niches: jsonb('niches').$type<string[]>().default([]),
  languages: jsonb('languages').$type<string[]>().default(['en']),
  captionPreset: varchar('caption_preset', { length: 64 }).default('bold-center'),
  onboardingCompleted: boolean('onboarding_completed').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ---- Relations ----
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(creatorProfiles, {
    fields: [users.id],
    references: [creatorProfiles.userId],
  }),
  sessions: many(sessions),
  linkedAccounts: many(linkedAccounts),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const linkedAccountsRelations = relations(linkedAccounts, ({ one }) => ({
  user: one(users, {
    fields: [linkedAccounts.userId],
    references: [users.id],
  }),
}));

export const creatorProfilesRelations = relations(creatorProfiles, ({ one }) => ({
  user: one(users, {
    fields: [creatorProfiles.userId],
    references: [users.id],
  }),
}));
