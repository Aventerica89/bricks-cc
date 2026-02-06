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
    // Log detailed error server-side
    console.error("Error generating changelog:", error);

    // Return generic error to client (security: don't leak implementation details)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate changelog",
        message: "An error occurred while processing your request. Please try again.",
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
    // Log detailed error server-side
    console.error("Error saving changelog:", error);

    // Return generic error to client (security: don't leak implementation details)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to save changelog",
        message: "An error occurred while saving the changelog. Please try again.",
      },
      { status: 500 }
    );
  }
}
