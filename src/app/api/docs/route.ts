/**
 * Documentation Fetcher API
 *
 * Endpoints for fetching and searching external documentation
 * (Bricks Builder, ACSS, Frames)
 */

import { NextRequest, NextResponse } from "next/server";
import {
  fetchDocs,
  searchDocs,
  clearDocsCache,
  getCacheStats,
  DOC_SOURCES,
} from "@/lib/plugins/docs-fetcher";

/**
 * GET /api/docs - Fetch or search documentation
 *
 * Query params:
 * - source: Documentation source ID (bricks, acss, frames)
 * - path: Optional path within the documentation
 * - query: Optional search query to filter content
 * - search: If present, search across all sources
 *
 * @example
 * GET /api/docs?source=acss&path=/variables
 * GET /api/docs?search=true&query=grid
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get("source");
    const path = searchParams.get("path");
    const query = searchParams.get("query");
    const search = searchParams.get("search");

    // Search mode - search across all sources
    if (search === "true") {
      if (!query) {
        return NextResponse.json(
          {
            success: false,
            error: "Query parameter required for search",
          },
          { status: 400 }
        );
      }

      const results = await searchDocs(query);

      return NextResponse.json({
        success: true,
        mode: "search",
        query,
        results,
      });
    }

    // Fetch mode - fetch from specific source
    if (!source) {
      // Return available sources if no source specified
      return NextResponse.json({
        success: true,
        sources: Object.values(DOC_SOURCES).map((src) => ({
          id: src.id,
          name: src.name,
          baseUrl: src.baseUrl,
          type: src.type,
        })),
      });
    }

    const result = await fetchDocs({
      source,
      path: path || undefined,
      query: query || undefined,
      useCache: true,
    });

    return NextResponse.json({
      success: true,
      mode: "fetch",
      result,
    });
  } catch (error) {
    console.error("Error in docs API:", error);

    // Return generic error to client (don't leak internal details)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch documentation",
        message: "An error occurred while processing your request.",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/docs - Clear documentation cache
 *
 * Requires authentication to prevent DoS attacks.
 *
 * Usage:
 *   DELETE /api/docs
 *   Headers: { "x-admin-token": "your-admin-token" }
 *
 * Setup:
 *   Set DOCS_ADMIN_TOKEN environment variable
 */
export async function DELETE(request: NextRequest) {
  // Verify admin token
  const adminToken = process.env.DOCS_ADMIN_TOKEN;

  if (!adminToken) {
    return NextResponse.json(
      {
        success: false,
        error: "Cache clearing is disabled",
      },
      { status: 403 }
    );
  }

  const providedToken = request.headers.get("x-admin-token");

  if (!providedToken || providedToken !== adminToken) {
    return NextResponse.json(
      {
        success: false,
        error: "Unauthorized",
      },
      { status: 401 }
    );
  }

  try {
    clearDocsCache();

    return NextResponse.json({
      success: true,
      message: "Documentation cache cleared",
    });
  } catch (error) {
    console.error("Error clearing docs cache:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to clear cache",
      },
      { status: 500 }
    );
  }
}

/**
 * HEAD /api/docs - Get cache statistics
 */
export async function HEAD() {
  try {
    const stats = getCacheStats();

    return new NextResponse(null, {
      status: 200,
      headers: {
        "X-Cache-Size": stats.size.toString(),
      },
    });
  } catch (error) {
    console.error("Error getting cache stats:", error);
    return new NextResponse(null, { status: 500 });
  }
}
