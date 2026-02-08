import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clientSites } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { generateId } from "@/utils/formatting";
import { safeEncrypt } from "@/lib/crypto";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  const { id: clientId } = await context.params;

  try {
    const sites = await db.query.clientSites.findMany({
      where: and(
        eq(clientSites.clientId, clientId),
        eq(clientSites.isActive, true)
      ),
    });

    const masked = sites.map((site) => ({
      ...site,
      bricksApiKey: undefined,
      hasApiKey: !!site.bricksApiKey,
      apiKeyHint: site.bricksApiKey
        ? `****${site.bricksApiKey.slice(-4)}`
        : null,
    }));

    return NextResponse.json({ sites: masked });
  } catch (error) {
    console.error("Sites GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch sites" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  const { id: clientId } = await context.params;

  try {
    const body = await request.json();
    const { name, url, wordpressApiUrl, bricksApiKey, basecampProjectId } =
      body;

    if (!name || !url) {
      return NextResponse.json(
        { error: "name and url are required" },
        { status: 400 }
      );
    }

    const siteId = generateId();

    await db.insert(clientSites).values({
      id: siteId,
      clientId,
      name,
      url,
      wordpressApiUrl: wordpressApiUrl || null,
      bricksApiKey: bricksApiKey ? safeEncrypt(bricksApiKey) : null,
      basecampProjectId: basecampProjectId
        ? parseInt(basecampProjectId, 10)
        : null,
      isActive: true,
    });

    const created = await db.query.clientSites.findFirst({
      where: eq(clientSites.id, siteId),
    });

    return NextResponse.json(
      {
        site: {
          ...created,
          bricksApiKey: undefined,
          hasApiKey: !!created?.bricksApiKey,
          apiKeyHint: created?.bricksApiKey
            ? `****${created.bricksApiKey.slice(-4)}`
            : null,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Sites POST error:", error);
    return NextResponse.json(
      { error: "Failed to create site" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  const { id: clientId } = await context.params;

  try {
    const body = await request.json();
    const { siteId, name, url, wordpressApiUrl, bricksApiKey, basecampProjectId } =
      body;

    if (!siteId) {
      return NextResponse.json(
        { error: "siteId is required" },
        { status: 400 }
      );
    }

    const existing = await db.query.clientSites.findFirst({
      where: and(
        eq(clientSites.id, siteId),
        eq(clientSites.clientId, clientId)
      ),
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Site not found" },
        { status: 404 }
      );
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (name !== undefined) updates.name = name;
    if (url !== undefined) updates.url = url;
    if (wordpressApiUrl !== undefined)
      updates.wordpressApiUrl = wordpressApiUrl || null;
    if (bricksApiKey !== undefined)
      updates.bricksApiKey = bricksApiKey ? safeEncrypt(bricksApiKey) : null;
    if (basecampProjectId !== undefined)
      updates.basecampProjectId = basecampProjectId
        ? parseInt(basecampProjectId, 10)
        : null;

    await db
      .update(clientSites)
      .set(updates)
      .where(eq(clientSites.id, siteId));

    const updated = await db.query.clientSites.findFirst({
      where: eq(clientSites.id, siteId),
    });

    return NextResponse.json({
      site: {
        ...updated,
        bricksApiKey: undefined,
        hasApiKey: !!updated?.bricksApiKey,
        apiKeyHint: updated?.bricksApiKey
          ? `****${updated.bricksApiKey.slice(-4)}`
          : null,
      },
    });
  } catch (error) {
    console.error("Sites PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update site" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  const { id: clientId } = await context.params;

  try {
    const body = await request.json();
    const { siteId } = body;

    if (!siteId) {
      return NextResponse.json(
        { error: "siteId is required" },
        { status: 400 }
      );
    }

    const existing = await db.query.clientSites.findFirst({
      where: and(
        eq(clientSites.id, siteId),
        eq(clientSites.clientId, clientId)
      ),
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Site not found" },
        { status: 404 }
      );
    }

    await db
      .update(clientSites)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(clientSites.id, siteId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Sites DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete site" },
      { status: 500 }
    );
  }
}
