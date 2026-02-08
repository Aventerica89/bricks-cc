import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { platformSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { safeEncrypt, safeDecrypt } from "@/lib/crypto";

const SETTINGS_ID = "default";

function maskSecret(value: string | null): {
  connected: boolean;
  last4: string | null;
} {
  if (!value) return { connected: false, last4: null };
  try {
    const decrypted = safeDecrypt(value);
    return {
      connected: true,
      last4: decrypted.slice(-4),
    };
  } catch {
    return { connected: false, last4: null };
  }
}

export async function GET() {
  try {
    const rows = await db
      .select()
      .from(platformSettings)
      .where(eq(platformSettings.id, SETTINGS_ID))
      .limit(1);

    const settings = rows[0] ?? null;

    if (!settings) {
      return NextResponse.json({
        basecampAccountId: null,
        basecampConnected: false,
        basecampLast4: null,
        bricksApiKey: { connected: false, last4: null },
        bricksSiteUrl: null,
        claudeEnabled: true,
      });
    }

    const tokenInfo = maskSecret(settings.basecampOauthToken);
    const bricksInfo = maskSecret(settings.bricksApiKey);

    return NextResponse.json({
      basecampAccountId: settings.basecampAccountId,
      basecampConnected: tokenInfo.connected,
      basecampLast4: tokenInfo.last4,
      bricksApiKey: bricksInfo,
      bricksSiteUrl: settings.bricksSiteUrl,
      claudeEnabled: settings.claudeEnabled ?? true,
    });
  } catch (error) {
    console.error("Failed to load settings:", error);
    return NextResponse.json(
      { error: "Failed to load settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const updates: Record<string, unknown> = {
      id: SETTINGS_ID,
      updatedAt: new Date(),
    };

    if (body.basecampAccountId !== undefined) {
      updates.basecampAccountId = body.basecampAccountId || null;
    }

    if (body.bricksApiKey !== undefined) {
      updates.bricksApiKey = body.bricksApiKey
        ? safeEncrypt(body.bricksApiKey)
        : null;
    }

    if (body.bricksSiteUrl !== undefined) {
      updates.bricksSiteUrl = body.bricksSiteUrl || null;
    }

    if (body.claudeEnabled !== undefined) {
      updates.claudeEnabled = body.claudeEnabled;
    }

    // Upsert: try update first, insert if no rows affected
    const existing = await db
      .select({ id: platformSettings.id })
      .from(platformSettings)
      .where(eq(platformSettings.id, SETTINGS_ID))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(platformSettings)
        .set(updates)
        .where(eq(platformSettings.id, SETTINGS_ID));
    } else {
      await db.insert(platformSettings).values({
        ...updates,
        claudeEnabled: updates.claudeEnabled ?? true,
      } as typeof platformSettings.$inferInsert);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save settings:", error);
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    );
  }
}
