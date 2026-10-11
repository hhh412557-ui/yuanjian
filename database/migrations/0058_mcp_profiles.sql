-- Shared topic profiles issued by the web onboarding flow or the MCP onboarding tools.
-- The raw bearer token is never stored; only a SHA-256 digest is retained.
CREATE TABLE mcp_profiles (
  id             text PRIMARY KEY,
  token_hash     text NOT NULL UNIQUE,
  token_prefix   text NOT NULL,
  label          text NOT NULL,
  themes         text[] NOT NULL,
  survey         jsonb NOT NULL DEFAULT '{}'::jsonb,
  source         text NOT NULL CHECK (source IN ('web', 'mcp')),
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  last_used_at   timestamptz
);
