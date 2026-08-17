CREATE TYPE "public"."creator_niche" AS ENUM('gaming', 'streaming', 'podcast', 'commentary', 'education', 'interview', 'reaction', 'music', 'vlog', 'other');--> statement-breakpoint
CREATE TYPE "public"."linked_platform" AS ENUM('twitch', 'kick', 'twitter', 'youtube');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('creator', 'admin', 'super_admin');--> statement-breakpoint
CREATE TYPE "public"."job_status" AS ENUM('queued', 'running', 'completed', 'failed', 'cancelled', 'retrying');--> statement-breakpoint
CREATE TYPE "public"."job_type" AS ENUM('ingest', 'normalize', 'transcribe', 'analyze', 'score', 'reframe', 'caption', 'render_preview', 'export', 'cleanup');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('created', 'uploading', 'ingesting', 'processing', 'completed', 'failed', 'expired');--> statement-breakpoint
CREATE TYPE "public"."source_type" AS ENUM('upload', 'youtube', 'twitch', 'kick');--> statement-breakpoint
CREATE TYPE "public"."aspect_ratio" AS ENUM('9:16', '1:1', '16:9');--> statement-breakpoint
CREATE TYPE "public"."clip_status" AS ENUM('candidate', 'approved', 'rejected', 'exported', 'expired');--> statement-breakpoint
CREATE TYPE "public"."reframe_method" AS ENUM('face_tracking', 'saliency', 'speaker', 'static', 'manual');--> statement-breakpoint
CREATE TYPE "public"."export_platform" AS ENUM('tiktok', 'reels', 'shorts', 'twitter', 'general');--> statement-breakpoint
CREATE TYPE "public"."export_status" AS ENUM('queued', 'rendering', 'completed', 'failed', 'expired');--> statement-breakpoint
CREATE TABLE "creator_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"display_name" varchar(255) NOT NULL,
	"bio" text,
	"niches" jsonb DEFAULT '[]'::jsonb,
	"languages" jsonb DEFAULT '["en"]'::jsonb,
	"caption_preset" varchar(64) DEFAULT 'bold-center',
	"onboarding_completed" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "creator_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "linked_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"platform" "linked_platform" NOT NULL,
	"platform_user_id" varchar(255) NOT NULL,
	"platform_username" varchar(255) NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text,
	"token_expires_at" timestamp with time zone,
	"scopes" jsonb DEFAULT '[]'::jsonb,
	"linked_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_refreshed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" varchar(512) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(320) NOT NULL,
	"name" varchar(255) NOT NULL,
	"avatar_url" text,
	"role" "user_role" DEFAULT 'creator' NOT NULL,
	"google_id" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_google_id_unique" UNIQUE("google_id")
);
--> statement-breakpoint
CREATE TABLE "processing_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "job_type" NOT NULL,
	"status" "job_status" DEFAULT 'queued' NOT NULL,
	"progress" integer DEFAULT 0,
	"error" text,
	"retry_count" integer DEFAULT 0,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" varchar(500) NOT NULL,
	"status" "project_status" DEFAULT 'created' NOT NULL,
	"source_type" "source_type" NOT NULL,
	"source_url" text,
	"source_file_name" varchar(500),
	"source_duration_seconds" integer,
	"source_metadata" jsonb,
	"clip_count" integer DEFAULT 0,
	"export_count" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "transcript_segments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"transcript_id" uuid NOT NULL,
	"start_time" real NOT NULL,
	"end_time" real NOT NULL,
	"text" text NOT NULL,
	"speaker" varchar(100),
	"confidence" real DEFAULT 0 NOT NULL,
	"language" varchar(10) DEFAULT 'en' NOT NULL,
	"words" jsonb DEFAULT '[]'::jsonb
);
--> statement-breakpoint
CREATE TABLE "transcripts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"language" varchar(10) DEFAULT 'en' NOT NULL,
	"full_text" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "transcripts_project_id_unique" UNIQUE("project_id")
);
--> statement-breakpoint
CREATE TABLE "caption_tracks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clip_id" uuid NOT NULL,
	"language" varchar(10) DEFAULT 'en' NOT NULL,
	"style" jsonb NOT NULL,
	"segments" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clip_candidates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"status" "clip_status" DEFAULT 'candidate' NOT NULL,
	"title" varchar(500) NOT NULL,
	"hook_text" text,
	"start_time" real NOT NULL,
	"end_time" real NOT NULL,
	"duration_seconds" real NOT NULL,
	"scores" jsonb NOT NULL,
	"thumbnail_url" text,
	"preview_url" text,
	"rank" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reframing_tracks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clip_id" uuid NOT NULL,
	"aspect_ratio" "aspect_ratio" DEFAULT '9:16' NOT NULL,
	"keyframes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"confidence" real DEFAULT 0 NOT NULL,
	"method" "reframe_method" DEFAULT 'static' NOT NULL,
	"fallback_used" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clip_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"status" "export_status" DEFAULT 'queued' NOT NULL,
	"platform" "export_platform" DEFAULT 'general' NOT NULL,
	"aspect_ratio" varchar(10) DEFAULT '9:16' NOT NULL,
	"resolution" varchar(20) DEFAULT '1080x1920' NOT NULL,
	"fps" integer DEFAULT 30 NOT NULL,
	"file_size" integer,
	"file_url" text,
	"watermarked" boolean DEFAULT true,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"expires_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "creator_profiles" ADD CONSTRAINT "creator_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "linked_accounts" ADD CONSTRAINT "linked_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "processing_jobs" ADD CONSTRAINT "processing_jobs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "processing_jobs" ADD CONSTRAINT "processing_jobs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transcript_segments" ADD CONSTRAINT "transcript_segments_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transcript_segments" ADD CONSTRAINT "transcript_segments_transcript_id_transcripts_id_fk" FOREIGN KEY ("transcript_id") REFERENCES "public"."transcripts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transcripts" ADD CONSTRAINT "transcripts_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "caption_tracks" ADD CONSTRAINT "caption_tracks_clip_id_clip_candidates_id_fk" FOREIGN KEY ("clip_id") REFERENCES "public"."clip_candidates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clip_candidates" ADD CONSTRAINT "clip_candidates_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clip_candidates" ADD CONSTRAINT "clip_candidates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reframing_tracks" ADD CONSTRAINT "reframing_tracks_clip_id_clip_candidates_id_fk" FOREIGN KEY ("clip_id") REFERENCES "public"."clip_candidates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exports" ADD CONSTRAINT "exports_clip_id_clip_candidates_id_fk" FOREIGN KEY ("clip_id") REFERENCES "public"."clip_candidates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exports" ADD CONSTRAINT "exports_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exports" ADD CONSTRAINT "exports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "linked_accounts_user_platform_idx" ON "linked_accounts" USING btree ("user_id","platform");--> statement-breakpoint
CREATE INDEX "sessions_token_idx" ON "sessions" USING btree ("token");--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_google_id_idx" ON "users" USING btree ("google_id");--> statement-breakpoint
CREATE INDEX "jobs_project_id_idx" ON "processing_jobs" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "jobs_user_id_idx" ON "processing_jobs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "jobs_status_idx" ON "processing_jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "jobs_type_status_idx" ON "processing_jobs" USING btree ("type","status");--> statement-breakpoint
CREATE INDEX "projects_user_id_idx" ON "projects" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "projects_status_idx" ON "projects" USING btree ("status");--> statement-breakpoint
CREATE INDEX "projects_expires_at_idx" ON "projects" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "segments_project_id_idx" ON "transcript_segments" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "segments_time_idx" ON "transcript_segments" USING btree ("start_time","end_time");--> statement-breakpoint
CREATE INDEX "clips_project_id_idx" ON "clip_candidates" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "clips_user_id_idx" ON "clip_candidates" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "clips_status_idx" ON "clip_candidates" USING btree ("status");--> statement-breakpoint
CREATE INDEX "clips_rank_idx" ON "clip_candidates" USING btree ("project_id","rank");--> statement-breakpoint
CREATE INDEX "exports_user_id_idx" ON "exports" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "exports_clip_id_idx" ON "exports" USING btree ("clip_id");--> statement-breakpoint
CREATE INDEX "exports_status_idx" ON "exports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "exports_expires_at_idx" ON "exports" USING btree ("expires_at");