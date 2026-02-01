import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clients } from "@/db/schema";

/**
 * Health check endpoint for monitoring and uptime checks
 * GET /api/health
 */
export async function GET() {
  const startTime = Date.now();

  try {
    // Check database connectivity
    const dbHealthy = await checkDatabase();

    // Get application info
    const health = {
      status: dbHealthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      version: process.env.npm_package_version || "1.0.0",
      uptime: process.uptime(),
      checks: {
        database: {
          status: dbHealthy ? "ok" : "error",
          responseTime: Date.now() - startTime,
        },
      },
    };

    // Return 200 if healthy, 503 if degraded
    const status = dbHealthy ? 200 : 503;

    return NextResponse.json(health, { status });
  } catch (error) {
    // System error - return 503
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
        error: "Health check failed",
      },
      { status: 503 }
    );
  }
}

/**
 * Check database connectivity
 * Returns true if database is reachable
 */
async function checkDatabase(): Promise<boolean> {
  try {
    // Simple query to test database connection
    await db.query.clients.findMany({ limit: 1 });
    return true;
  } catch (error) {
    console.error("Database health check failed:", error);
    return false;
  }
}
