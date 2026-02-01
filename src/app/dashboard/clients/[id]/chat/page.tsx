import Link from "next/link";
import { ArrowLeft, MessageSquare, Clock, User } from "lucide-react";
import ChatInterface from "@/components/ChatInterface";

interface ChatPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { id: clientId } = await params;
  // For demo, using a placeholder site ID
  const siteId = "demo-site";

  return (
    <div className="p-8 h-screen flex flex-col">
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
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
            <div className="p-3 bg-primary-50 rounded-lg">
              <MessageSquare className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Chat History</h1>
              <p className="text-gray-500">Client ID: {clientId}</p>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden">
          <ChatInterface clientId={clientId} siteId={siteId} />
        </div>
      </div>
    </div>
  );
}
