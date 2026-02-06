import { NextRequest, NextResponse } from "next/server";
import {
  generateChangelog,
  getCommitsSince,
  groupCommits,
  generateChangelogMarkdown,
} from "@/lib/plugins/changelog-generator";

/**
 * GET /api/changelog
 * Fetch recent changelog entries
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const since = searchParams.get("since") || "1 week ago";

    // Get commits and generate changelog
    const commits = await getCommitsSince(since);
    const groups = groupCommits(commits);
    const markdown = generateChangelogMarkdown(groups);

    return NextResponse.json({
      success: true,
      changelog: markdown,
      commitCount: commits.length,
      groups: {
        features: groups.features.length,
        fixes: groups.fixes.length,
        enhancements: groups.enhancements.length,
        security: groups.security.length,
        breaking: groups.breaking.length,
      },
    });
  } catch (error) {
    console.error("Error generating changelog:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate changelog",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/changelog
 * Generate and save changelog to file
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const since = body.since || "1 week ago";

    // Generate and save changelog
    const result = await generateChangelog(since);

    return NextResponse.json({
      success: true,
      message: "Changelog generated successfully",
      filePath: result.filePath,
      content: result.content,
    });
  } catch (error) {
    console.error("Error saving changelog:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to save changelog",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
