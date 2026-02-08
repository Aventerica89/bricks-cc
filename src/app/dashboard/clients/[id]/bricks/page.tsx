import Link from "next/link";
import { ArrowLeft, Layout, Globe, AlertCircle } from "lucide-react";

interface BricksPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function BricksPage({ params }: BricksPageProps) {
  const { id: clientId } = await params;

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Back link */}
        <Link
          href={`/dashboard/clients/${clientId}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Client
        </Link>

        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <Layout className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Bricks Page Management
              </h1>
              <p className="text-gray-500">
                Manage page editing permissions for this client
              </p>
            </div>
          </div>
        </div>

        {/* Configuration needed message */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-800 mb-1">
                Configuration Required
              </h3>
              <p className="text-yellow-700">
                To enable Bricks page management, you need to configure at least
                one site for this client with Bricks API credentials.
              </p>
              <Link
                href={`/dashboard/clients/${clientId}/sites/new`}
                className="text-yellow-800 hover:underline mt-2 inline-block font-medium"
              >
                Add a site &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Pages list placeholder */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Managed Pages
            </h2>
          </div>
          <div className="text-center py-12 text-gray-500">
            <Globe className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No pages configured yet.</p>
            <p className="text-sm mt-1">
              Add a site to start managing Bricks pages.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
