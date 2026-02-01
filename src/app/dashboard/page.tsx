import Link from "next/link";
import {
  Users,
  MessageSquare,
  Layout,
  CheckSquare,
  ArrowUpRight,
  TrendingUp,
  Activity,
} from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Welcome to WP Manager + Claude AI Integration
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Active Clients"
            value="--"
            change="+12%"
            icon={<Users className="w-6 h-6" />}
            href="/dashboard/clients"
          />
          <StatCard
            title="Chat Sessions"
            value="--"
            change="+24%"
            icon={<MessageSquare className="w-6 h-6" />}
            href="/dashboard/clients"
          />
          <StatCard
            title="Bricks Edits"
            value="--"
            change="+8%"
            icon={<Layout className="w-6 h-6" />}
            href="/dashboard/clients"
          />
          <StatCard
            title="Open Feedback"
            value="--"
            change="-5%"
            icon={<CheckSquare className="w-6 h-6" />}
            href="/dashboard/clients"
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Activity
              </h2>
              <Link
                href="/dashboard/activity"
                className="text-primary-600 hover:text-primary-700 text-sm"
              >
                View all
              </Link>
            </div>
            <div className="space-y-4">
              <ActivityPlaceholder />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <QuickActionButton
                href="/dashboard/clients"
                icon={<Users className="w-5 h-5" />}
                label="Manage Clients"
              />
              <QuickActionButton
                href="/dashboard/settings"
                icon={<Activity className="w-5 h-5" />}
                label="Configure Integrations"
              />
              <QuickActionButton
                href="/dashboard/settings"
                icon={<TrendingUp className="w-5 h-5" />}
                label="View Analytics"
              />
            </div>
          </div>
        </div>

        {/* Integration Status */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Integration Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <IntegrationStatus
              name="Claude AI"
              status="connected"
              description="AI assistant ready"
            />
            <IntegrationStatus
              name="Basecamp"
              status="not_configured"
              description="Configure in settings"
            />
            <IntegrationStatus
              name="Bricks Builder"
              status="not_configured"
              description="Add site credentials"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  change,
  icon,
  href,
}: {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  href: string;
}) {
  const isPositive = change.startsWith("+");

  return (
    <Link
      href={href}
      className="bg-white rounded-lg border border-gray-200 p-6 hover:border-primary-300 hover:shadow-md transition-all group"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
          {icon}
        </div>
        <ArrowUpRight className="w-5 h-5 text-gray-300 group-hover:text-primary-600 transition-colors" />
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{title}</span>
        <span
          className={`text-xs font-medium ${
            isPositive ? "text-green-600" : "text-red-600"
          }`}
        >
          {change}
        </span>
      </div>
    </Link>
  );
}

function QuickActionButton({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
    >
      <div className="text-primary-600">{icon}</div>
      <span className="text-gray-700">{label}</span>
    </Link>
  );
}

function IntegrationStatus({
  name,
  status,
  description,
}: {
  name: string;
  status: "connected" | "disconnected" | "not_configured";
  description: string;
}) {
  const statusConfig = {
    connected: {
      color: "bg-green-100 text-green-700",
      dot: "bg-green-500",
      label: "Connected",
    },
    disconnected: {
      color: "bg-red-100 text-red-700",
      dot: "bg-red-500",
      label: "Disconnected",
    },
    not_configured: {
      color: "bg-gray-100 text-gray-600",
      dot: "bg-gray-400",
      label: "Not Configured",
    },
  };

  const config = statusConfig[status];

  return (
    <div className="p-4 border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-gray-900">{name}</span>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${config.dot}`} />
          <span className={`text-xs px-2 py-1 rounded-full ${config.color}`}>
            {config.label}
          </span>
        </div>
      </div>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
}

function ActivityPlaceholder() {
  return (
    <div className="text-center py-8 text-gray-500">
      <Activity className="w-12 h-12 mx-auto mb-4 opacity-20" />
      <p>Activity will appear here once you start using the platform.</p>
    </div>
  );
}
