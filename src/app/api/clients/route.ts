import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clients, clientSites, clientFeedback, chatMessages } from "@/db/schema";
import { eq, desc, count } from "drizzle-orm";
import { generateId } from "@/utils/formatting";
import { isValidEmail } from "@/utils/validators";
import type { Client, ClientSite, ClientWithSites } from "@/types/client";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("clientId");

  try {
    if (clientId) {
      // Get specific client with sites
      const client = await db.query.clients.findFirst({
        where: eq(clients.id, clientId),
      });

      if (!client) {
        return NextResponse.json(
          { error: "Client not found" },
          { status: 404 }
        );
      }

      const sites = await db.query.clientSites.findMany({
        where: eq(clientSites.clientId, clientId),
      });

      // Get stats
      const messageCount = await db
        .select({ count: count() })
        .from(chatMessages)
        .where(eq(chatMessages.clientId, clientId));

      const feedbackCount = await db
        .select({ count: count() })
        .from(clientFeedback)
        .where(eq(clientFeedback.clientId, clientId));

      return NextResponse.json({
        client: {
          ...client,
          sites,
        } as ClientWithSites,
        stats: {
          totalMessages: messageCount[0]?.count || 0,
          totalFeedback: feedbackCount[0]?.count || 0,
        },
      });
    }

    // Get all clients
    const allClients = await db.query.clients.findMany({
      orderBy: [desc(clients.createdAt)],
    });

    // Get sites for each client
    const clientsWithSites: ClientWithSites[] = await Promise.all(
      allClients.map(async (client) => {
        const sites = await db.query.clientSites.findMany({
          where: eq(clientSites.clientId, client.id),
        });
        return { ...client, sites };
      })
    );

    return NextResponse.json({ clients: clientsWithSites });
  } catch (error) {
    console.error("Clients API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, company, avatarUrl } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "name and email are required" },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check if client already exists
    const existing = await db.query.clients.findFirst({
      where: eq(clients.email, email),
    });

    if (existing) {
      return NextResponse.json(
        { error: "Client with this email already exists" },
        { status: 409 }
      );
    }

    const clientId = generateId();

    await db.insert(clients).values({
      id: clientId,
      name,
      email,
      company,
      avatarUrl,
      isActive: true,
    });

    const newClient = await db.query.clients.findFirst({
      where: eq(clients.id, clientId),
    });

    return NextResponse.json({ client: newClient }, { status: 201 });
  } catch (error) {
    console.error("Create client error:", error);
    return NextResponse.json(
      { error: "Failed to create client" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, ...updates } = body;

    if (!clientId) {
      return NextResponse.json(
        { error: "clientId is required" },
        { status: 400 }
      );
    }

    // Validate email if being updated
    if (updates.email && !isValidEmail(updates.email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    await db
      .update(clients)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(clients.id, clientId));

    const updatedClient = await db.query.clients.findFirst({
      where: eq(clients.id, clientId),
    });

    return NextResponse.json({ client: updatedClient });
  } catch (error) {
    console.error("Update client error:", error);
    return NextResponse.json(
      { error: "Failed to update client" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("clientId");

  if (!clientId) {
    return NextResponse.json(
      { error: "clientId is required" },
      { status: 400 }
    );
  }

  try {
    // Soft delete - just mark as inactive
    await db
      .update(clients)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(clients.id, clientId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete client error:", error);
    return NextResponse.json(
      { error: "Failed to delete client" },
      { status: 500 }
    );
  }
}
