-- Teaching System Database Setup
-- Run this SQL in your Turso database to create all required tables

-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  order_index INTEGER DEFAULT 0,
  created_by TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

-- Lesson scenarios table
CREATE TABLE IF NOT EXISTS lesson_scenarios (
  id TEXT PRIMARY KEY NOT NULL,
  lesson_id TEXT NOT NULL,
  name TEXT NOT NULL,
  acss_js_dump TEXT,
  screenshot_before_url TEXT,
  screenshot_after_url TEXT,
  correct_container_grid_code TEXT,
  css_handling_rules TEXT,
  validation_rules TEXT,
  expected_output TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

-- Agents table
CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  system_prompt TEXT,
  config TEXT,
  is_active INTEGER DEFAULT 1,
  version INTEGER DEFAULT 1,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

-- Agent instructions table
CREATE TABLE IF NOT EXISTS agent_instructions (
  id TEXT PRIMARY KEY NOT NULL,
  agent_id TEXT NOT NULL,
  instruction_type TEXT NOT NULL,
  content TEXT,
  github_sync_path TEXT,
  last_synced INTEGER,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

-- Build sessions table
CREATE TABLE IF NOT EXISTS build_sessions (
  id TEXT PRIMARY KEY NOT NULL,
  lesson_id TEXT,
  scenario_id TEXT,
  phase TEXT DEFAULT 'javascript',
  status TEXT DEFAULT 'in_progress',
  input_data TEXT,
  agent_outputs TEXT,
  review_notes TEXT,
  final_output TEXT,
  created_by TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

-- Visual comparisons table
CREATE TABLE IF NOT EXISTS visual_comparisons (
  id TEXT PRIMARY KEY NOT NULL,
  build_session_id TEXT NOT NULL,
  comparison_type TEXT NOT NULL,
  before_screenshot_url TEXT,
  after_screenshot_url TEXT,
  difference_map_url TEXT,
  approval_status TEXT DEFAULT 'pending',
  annotations TEXT,
  created_at INTEGER DEFAULT (unixepoch())
);

-- Content assets table
CREATE TABLE IF NOT EXISTS content_assets (
  id TEXT PRIMARY KEY NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  source_url TEXT,
  file_path TEXT,
  metadata TEXT,
  searchable_content TEXT,
  indexed_at INTEGER,
  created_at INTEGER DEFAULT (unixepoch())
);

-- Verify tables were created
SELECT 'Tables created successfully!' as message;
SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;
