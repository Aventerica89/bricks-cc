import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bricksPages, clientSites } from "@/db/schema";
import { createBricksClient } from "@/lib/bricks";
import { eq } from "drizzle-orm";
import { generateId } from "@/utils/formatting";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const siteId = searchParams.get("siteId");
  const pageId = searchParams.get("pageId");

  if (!siteId) {
    return NextResponse.json({ error: "siteId is required" }, { status: 400 });
  }

  try {
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

    const bricksClient = createBricksClient(site.url);

    if (pageId) {
      // Get specific page
      const pageData = await bricksClient.getPageState(parseInt(pageId, 10));
      return NextResponse.json({ page: pageData });
    }

    // Get all pages
    const pages = await bricksClient.getPages();
    return NextResponse.json({ pages });
  } catch (error) {
    console.error("Bricks API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Bricks data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { siteId, pageId, action } = body;

    if (!siteId || !pageId) {
      return NextResponse.json(
        { error: "siteId and pageId are required" },
        { status: 400 }
      );
    }

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

    const bricksClient = createBricksClient(site.url);

    switch (action) {
      case "refresh":
        // Refresh cached page data
        const pageData = await bricksClient.getPageState(pageId);

        // Update cache
        const existingCache = await db.query.bricksPages.findFirst({
          where: (bp, { and, eq }) =>
            and(eq(bp.siteId, siteId), eq(bp.pageId, pageId)),
        });

        if (existingCache) {
          await db
            .update(bricksPages)
            .set({
              structure: pageData.elements as unknown as Record<string, unknown>,
              pageTitle: pageData.pageTitle,
              lastFetch: new Date(),
            })
            .where(eq(bricksPages.id, existingCache.id));
        } else {
          await db.insert(bricksPages).values({
            id: generateId(),
            siteId,
            pageId,
            pageTitle: pageData.pageTitle,
            structure: pageData.elements as unknown as Record<string, unknown>,
            lastFetch: new Date(),
          });
        }

        return NextResponse.json({ success: true, page: pageData });

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Bricks API error:", error);
    return NextResponse.json(
      { error: "Failed to process Bricks request" },
      { status: 500 }
    );
  }
}
