import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clientSites, bricksPages } from "@/db/schema";
import { createBricksClient } from "@/lib/bricks";
import { validateBricksEditRequest } from "@/utils/validators";
import { eq, and } from "drizzle-orm";
import type { BricksEditResponse } from "@/types/bricks";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const validation = validateBricksEditRequest(body);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { siteId, pageId, edits } = validation.data;

    // Get site configuration
    const site = await db.query.clientSites.findFirst({
      where: eq(clientSites.id, siteId),
    });

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    if (!site.url) {
      return NextResponse.json(
        { error: "Site URL not configured" },
        { status: 400 }
      );
    }

    // Check if client has edit permissions
    const pageCache = await db.query.bricksPages.findFirst({
      where: (bp) =>
        and(eq(bp.siteId, siteId), eq(bp.pageId, pageId)),
    });

    if (pageCache && !pageCache.editableByClient) {
      return NextResponse.json(
        { error: "Client does not have edit permissions for this page" },
        { status: 403 }
      );
    }

    const bricksClient = createBricksClient(site.url);

    // Apply edits
    const result = await bricksClient.applyEdits({
      siteId,
      pageId,
      edits,
    });

    // Update cache if successful
    if (result.success && pageCache) {
      await db
        .update(bricksPages)
        .set({
          structure: result.updatedElements as unknown as Record<string, unknown>,
          lastFetch: new Date(),
        })
        .where(eq(bricksPages.id, pageCache.id));
    }

    const response: BricksEditResponse = {
      success: result.success,
      updatedElements: result.updatedElements,
      error: result.error,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Bricks edit error:", error);
    return NextResponse.json(
      {
        success: false,
        updatedElements: [],
        error: "Failed to apply edits",
      } as BricksEditResponse,
      { status: 500 }
    );
  }
}
