import Link from "next/link";
import { ArrowLeft, MessageSquarePlus } from "lucide-react";
import FeedbackForm from "@/components/FeedbackForm";

interface FeedbackPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function FeedbackPage({ params }: FeedbackPageProps) {
  const { id: clientId } = await params;
  const siteId = "demo-site";

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back link */}
        <Link
          href={`/dashboard/clients/${clientId}`}
          className="inline-flex items-center gap-2 text-[#a1a1a1] hover:text-[#f5f5f5] mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Client
        </Link>

        {/* Header */}
        <div className="bg-[#161616] rounded-xl border border-[#2a2a2a] p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-teal-500/10 rounded-lg">
              <MessageSquarePlus className="w-6 h-6 text-teal-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#f5f5f5]">
                Client Feedback
              </h1>
              <p className="text-[#a1a1a1]">
                View and manage feedback submissions
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Submit New Feedback */}
          <div>
            <h2 className="text-lg font-semibold text-[#f5f5f5] mb-4">
              Submit New Feedback
            </h2>
            <FeedbackForm clientId={clientId} siteId={siteId} />
          </div>

          {/* Feedback History */}
          <div>
            <h2 className="text-lg font-semibold text-[#f5f5f5] mb-4">
              Feedback History
            </h2>
            <div className="bg-[#161616] rounded-xl border border-[#2a2a2a]">
              <FeedbackHistoryPlaceholder />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeedbackHistoryPlaceholder() {
  return (
    <div className="text-center py-12 text-[#666]">
      <MessageSquarePlus className="w-12 h-12 mx-auto mb-4 opacity-20" />
      <p>No feedback submitted yet.</p>
    </div>
  );
}
