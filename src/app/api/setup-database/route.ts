import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

/**
 * SECURE ONE-TIME DATABASE SETUP ENDPOINT
 *
 * IMPORTANT: This endpoint requires authentication to prevent unauthorized access.
 *
 * Usage:
 *   POST /api/setup-database
 *   Headers: { "x-setup-token": "your-setup-token" }
 *
 * Setup:
 *   1. Set DB_SETUP_TOKEN environment variable in Vercel
 *   2. Make POST request with matching token in x-setup-token header
 *   3. Remove DB_SETUP_TOKEN from environment variables after setup
 *
 * This endpoint creates the teaching system tables if they don't exist.
 * Safe to run multiple times - it will skip tables that already exist.
 */
export async function POST(request: NextRequest) {
  // Verify setup token
  const setupToken = process.env.DB_SETUP_TOKEN;

  if (!setupToken) {
    return NextResponse.json(
      {
        success: false,
        error: "Database setup is disabled",
        message: "DB_SETUP_TOKEN environment variable is not set. This endpoint is only available during initial setup.",
      },
      { status: 403 }
    );
  }

  const providedToken = request.headers.get("x-setup-token");

  if (!providedToken || providedToken !== setupToken) {
    return NextResponse.json(
      {
        success: false,
        error: "Unauthorized",
        message: "Invalid or missing setup token. Provide the DB_SETUP_TOKEN value in the x-setup-token header.",
      },
      { status: 401 }
    );
  }
  try {
    // Create all teaching system tables
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS agent_instructions (
        id TEXT PRIMARY KEY NOT NULL,
        agent_id TEXT NOT NULL,
        instruction_type TEXT NOT NULL,
        content TEXT,
        github_sync_path TEXT,
        last_synced INTEGER,
        created_at INTEGER DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch())
      )
    `);

    await db.run(sql`
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
      )
    `);

    await db.run(sql`
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
      )
    `);

    await db.run(sql`
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
      )
    `);

    await db.run(sql`
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
      )
    `);

    await db.run(sql`
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
      )
    `);

    await db.run(sql`
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
      )
    `);

    return NextResponse.json({
      success: true,
      message: "✅ Database setup complete! All teaching system tables created.",
      tables: [
        "agent_instructions",
        "agents",
        "build_sessions",
        "content_assets",
        "lesson_scenarios",
        "lessons",
        "visual_comparisons",
      ],
      next_steps: [
        "SECURITY: Remove DB_SETUP_TOKEN from Vercel environment variables to disable this endpoint",
        "Go to /teaching and try creating a lesson",
        "Optionally delete this endpoint file (src/app/api/setup-database/route.ts)",
      ],
    });
  } catch (error) {
    console.error("Database setup error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to set up database",
        details: error instanceof Error ? error.message : String(error),
        help: "Check that TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are set correctly in Vercel environment variables",
      },
      { status: 500 }
    );
  }
}
