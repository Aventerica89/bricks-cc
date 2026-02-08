import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  MessageSquare,
  Layout,
  MessageSquarePlus,
  Settings,
} from "lucide-react";
import { db } from "@/lib/db";
import { clients } from "@/db/schema";
import { eq } from "drizzle-orm";
import SiteManager from "@/components/SiteManager";

interface ClientPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function ClientPage({ params }: ClientPageProps) {
  const { id } = await params;

  const client = await db.query.clients.findFirst({
    where: eq(clients.id, id),
  });

  if (!client) {
    notFound();
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Back link */}
        <Link
          href="/dashboard/clients"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Clients
        </Link>

        {/* Client Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center overflow-hidden">
                {client.avatarUrl ? (
                  <img
                    src={client.avatarUrl}
                    alt={client.name}
                    className="w-16 h-16 object-cover"
                  />
                ) : (
                  <span className="text-purple-600 font-bold text-2xl">
                    {client.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {client.name}
                </h1>
                <p className="text-gray-500">{client.email}</p>
                {client.company && (
                  <p className="text-sm text-gray-400">{client.company}</p>
                )}
              </div>
            </div>
            <Link
              href={`/dashboard/clients/${id}/settings`}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <ActionCard
            href={`/dashboard/clients/${id}/chat`}
            icon={<MessageSquare className="w-6 h-6" />}
            title="Chat History"
            description="View all chat sessions with this client"
          />
          <ActionCard
            href={`/dashboard/clients/${id}/bricks`}
            icon={<Layout className="w-6 h-6" />}
            title="Bricks Pages"
            description="Manage Bricks page editing permissions"
          />
          <ActionCard
            href={`/dashboard/clients/${id}/feedback`}
            icon={<MessageSquarePlus className="w-6 h-6" />}
            title="Feedback"
            description="View submitted feedback and Basecamp syncs"
          />
        </div>

        {/* Sites */}
        <SiteManager clientId={id} />
      </div>
    </div>
  );
}

function ActionCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="bg-white rounded-lg border border-gray-200 p-6 hover:border-purple-300 hover:shadow-md transition-all"
    >
      <div className="text-purple-600 mb-4">{icon}</div>
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </Link>
  );
}
