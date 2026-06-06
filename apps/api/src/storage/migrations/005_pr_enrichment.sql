-- Migration 005: Enrich pull_requests with detail fields from individual PR endpoint
-- These columns are not available from the PR listing endpoint

ALTER TABLE pull_requests ADD COLUMN IF NOT EXISTS body text;
ALTER TABLE pull_requests ADD COLUMN IF NOT EXISTS commits_count integer;
ALTER TABLE pull_requests ADD COLUMN IF NOT EXISTS comments_count integer;
ALTER TABLE pull_requests ADD COLUMN IF NOT EXISTS review_comments_count integer;
ALTER TABLE pull_requests ADD COLUMN IF NOT EXISTS merge_commit_sha text;
ALTER TABLE pull_requests ADD COLUMN IF NOT EXISTS labels jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE pull_requests ADD COLUMN IF NOT EXISTS base_branch text;
ALTER TABLE pull_requests ADD COLUMN IF NOT EXISTS head_branch text;
