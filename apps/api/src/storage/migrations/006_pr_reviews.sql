-- Migration 006: PR reviews, review comments, and requested reviewers

CREATE TABLE IF NOT EXISTS pull_request_reviews (
  id bigserial PRIMARY KEY,
  organization_id bigint NOT NULL REFERENCES organizations(id),
  pull_request_id bigint NOT NULL REFERENCES pull_requests(id),
  github_review_id bigint NOT NULL,
  reviewer_login text,
  state text,
  submitted_at timestamptz,
  commit_id text,
  html_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, github_review_id)
);

CREATE TABLE IF NOT EXISTS pull_request_review_comments (
  id bigserial PRIMARY KEY,
  organization_id bigint NOT NULL REFERENCES organizations(id),
  pull_request_id bigint NOT NULL REFERENCES pull_requests(id),
  github_comment_id bigint NOT NULL,
  reviewer_login text,
  path text,
  line integer,
  side text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  html_url text,
  UNIQUE (organization_id, github_comment_id)
);

CREATE TABLE IF NOT EXISTS pull_request_requested_reviewers (
  id bigserial PRIMARY KEY,
  organization_id bigint NOT NULL REFERENCES organizations(id),
  pull_request_id bigint NOT NULL REFERENCES pull_requests(id),
  reviewer_login text NOT NULL,
  reviewer_type text NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (pull_request_id, reviewer_login, reviewer_type)
);

CREATE INDEX IF NOT EXISTS pr_reviews_pr_id_idx ON pull_request_reviews (pull_request_id);
CREATE INDEX IF NOT EXISTS pr_reviews_org_submitted_idx ON pull_request_reviews (organization_id, submitted_at DESC);
CREATE INDEX IF NOT EXISTS pr_review_comments_pr_id_idx ON pull_request_review_comments (pull_request_id);
CREATE INDEX IF NOT EXISTS pr_requested_reviewers_pr_id_idx ON pull_request_requested_reviewers (pull_request_id);
