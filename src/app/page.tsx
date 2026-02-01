import Link from "next/link";
import {
  MessageSquare,
  Layout,
  CheckSquare,
  Settings,
  ArrowRight,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            WP Manager + Claude AI
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Unified client management platform integrating Claude AI, WordPress
            (Bricks Builder), and Basecamp
          </p>
        </header>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <FeatureCard
            icon={<MessageSquare className="w-8 h-8" />}
            title="AI Chat Assistant"
            description="24/7 AI-powered client support with context-aware responses"
          />
          <FeatureCard
            icon={<Layout className="w-8 h-8" />}
            title="Bricks Editing"
            description="Natural language page editing through Bricks Builder API"
          />
          <FeatureCard
            icon={<CheckSquare className="w-8 h-8" />}
            title="Basecamp Sync"
            description="Automatic project updates and todo management"
          />
          <FeatureCard
            icon={<Settings className="w-8 h-8" />}
            title="Multi-Site Management"
            description="Manage all client sites from a single dashboard"
          />
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
          >
            Go to Dashboard
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatCard label="Active Clients" value="--" />
          <StatCard label="Chat Sessions" value="--" />
          <StatCard label="Bricks Edits" value="--" />
          <StatCard label="Basecamp Syncs" value="--" />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-primary-500/50 transition-colors">
      <div className="text-primary-400 mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm">{description}</p>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-slate-400 text-sm">{label}</div>
    </div>
  );
}
