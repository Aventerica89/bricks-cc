import Link from "next/link";
import {
  ArrowLeft,
  MessageSquare,
  Layout,
  MessageSquarePlus,
  Settings,
  Globe,
  Mail,
  Building,
} from "lucide-react";

interface ClientPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ClientPage({ params }: ClientPageProps) {
  const { id } = await params;

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
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-bold text-2xl">C</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Client Details
                </h1>
                <p className="text-gray-500">ID: {id}</p>
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
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Client Sites
          </h2>
          <div className="text-center py-8 text-gray-500">
            <Globe className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No sites configured yet.</p>
            <Link
              href={`/dashboard/clients/${id}/sites/new`}
              className="text-purple-600 hover:text-purple-700 mt-2 inline-block"
            >
              Add a site &rarr;
            </Link>
          </div>
        </div>
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
