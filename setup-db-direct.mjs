#!/usr/bin/env node

/**
 * Direct Database Setup Script
 *
 * This script creates all teaching system tables directly in your Turso database.
 *
 * Usage:
 *   node setup-db-direct.mjs <database-url> <auth-token>
 *
 * Example:
 *   node setup-db-direct.mjs "libsql://mydb.turso.io" "eyJ..."
 */

import { createClient } from "@libsql/client";

const args = process.argv.slice(2);

if (args.length < 2) {
  console.error("❌ Missing arguments");
  console.error("");
  console.error("Usage: node setup-db-direct.mjs <database-url> <auth-token>");
  console.error("");
  console.error("Get your credentials from:");
  console.error("  Vercel Dashboard → Your Project → Settings → Environment Variables");
  console.error("  or Turso Dashboard → https://turso.tech/app");
  process.exit(1);
}

const [url, authToken] = args;

console.log("=========================================");
console.log("Direct Database Setup");
console.log("=========================================\n");
console.log(`Database: ${url}\n`);

const client = createClient({
  url,
  authToken,
});

const tables = [
  {
    name: "lessons",
    sql: `CREATE TABLE IF NOT EXISTS lessons (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      status TEXT DEFAULT 'draft',
      order_index INTEGER DEFAULT 0,
      created_by TEXT,
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
    )`,
  },
  {
    name: "lesson_scenarios",
    sql: `CREATE TABLE IF NOT EXISTS lesson_scenarios (
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
    )`,
  },
  {
    name: "agents",
    sql: `CREATE TABLE IF NOT EXISTS agents (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      system_prompt TEXT,
      config TEXT,
      is_active INTEGER DEFAULT 1,
      version INTEGER DEFAULT 1,
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
    )`,
  },
  {
    name: "agent_instructions",
    sql: `CREATE TABLE IF NOT EXISTS agent_instructions (
      id TEXT PRIMARY KEY NOT NULL,
      agent_id TEXT NOT NULL,
      instruction_type TEXT NOT NULL,
      content TEXT,
      github_sync_path TEXT,
      last_synced INTEGER,
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
    )`,
  },
  {
    name: "build_sessions",
    sql: `CREATE TABLE IF NOT EXISTS build_sessions (
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
    )`,
  },
  {
    name: "visual_comparisons",
    sql: `CREATE TABLE IF NOT EXISTS visual_comparisons (
      id TEXT PRIMARY KEY NOT NULL,
      build_session_id TEXT NOT NULL,
      comparison_type TEXT NOT NULL,
      before_screenshot_url TEXT,
      after_screenshot_url TEXT,
      difference_map_url TEXT,
      approval_status TEXT DEFAULT 'pending',
      annotations TEXT,
      created_at INTEGER DEFAULT (unixepoch())
    )`,
  },
  {
    name: "content_assets",
    sql: `CREATE TABLE IF NOT EXISTS content_assets (
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
    )`,
  },
];

async function setup() {
  try {
    for (const table of tables) {
      console.log(`Creating table: ${table.name}...`);
      await client.execute(table.sql);
      console.log(`✅ ${table.name}`);
    }

    console.log("\n=========================================");
    console.log("✅ Database setup complete!");
    console.log("=========================================\n");
    console.log("All teaching system tables created:");
    tables.forEach((t) => console.log(`  ✓ ${t.name}`));
    console.log("\nYou can now create lessons in your app!");
    console.log("Visit: https://bricks-cc.vercel.app/teaching\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Database setup failed:");
    console.error(error.message);
    console.error("\nTroubleshooting:");
    console.error("  1. Check that your database URL is correct");
    console.error("  2. Check that your auth token is valid");
    console.error("  3. Make sure you have write permissions");
    process.exit(1);
  }
}

setup();
