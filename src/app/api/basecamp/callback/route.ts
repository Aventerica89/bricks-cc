import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { platformSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { safeEncrypt } from "@/lib/crypto";

const TOKEN_URL = "https://launchpad.37signals.com/authorization/token";
const SETTINGS_ID = "default";
const REDIRECT_BASE = "https://bricks-cc.jbcloud.app";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(
      `${REDIRECT_BASE}/dashboard/settings?error=missing_code`
    );
  }

  const clientId = process.env.BASECAMP_CLIENT_ID;
  const clientSecret = process.env.BASECAMP_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error("Missing BASECAMP_CLIENT_ID or BASECAMP_CLIENT_SECRET");
    return NextResponse.redirect(
      `${REDIRECT_BASE}/dashboard/settings?error=server_config`
    );
  }

  try {
    // Exchange authorization code for access token
    const tokenResponse = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "web_server",
        client_id: clientId,
        redirect_uri: `${REDIRECT_BASE}/api/basecamp/callback`,
        client_secret: clientSecret,
        code,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Basecamp token exchange failed:", errorText);
      return NextResponse.redirect(
        `${REDIRECT_BASE}/dashboard/settings?error=basecamp_auth_failed`
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      console.error("No access_token in response:", tokenData);
      return NextResponse.redirect(
        `${REDIRECT_BASE}/dashboard/settings?error=basecamp_auth_failed`
      );
    }

    // Encrypt and store the token
    const encryptedToken = safeEncrypt(accessToken);

    const existing = await db
      .select({ id: platformSettings.id })
      .from(platformSettings)
      .where(eq(platformSettings.id, SETTINGS_ID))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(platformSettings)
        .set({
          basecampOauthToken: encryptedToken,
          updatedAt: new Date(),
        })
        .where(eq(platformSettings.id, SETTINGS_ID));
    } else {
      await db.insert(platformSettings).values({
        id: SETTINGS_ID,
        basecampOauthToken: encryptedToken,
        updatedAt: new Date(),
      });
    }

    return NextResponse.redirect(
      `${REDIRECT_BASE}/dashboard/settings?connected=basecamp`
    );
  } catch (error) {
    console.error("Basecamp OAuth callback error:", error);
    return NextResponse.redirect(
      `${REDIRECT_BASE}/dashboard/settings?error=basecamp_auth_failed`
    );
  }
}
