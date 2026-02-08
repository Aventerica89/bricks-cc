import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Settings,
  Layout,
} from "lucide-react";
import { ConnectionStatus } from "@/components/dashboard/ConnectionStatus";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex md:flex-col">
        <div className="p-6 border-b border-gray-200">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <Layout className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900">WP Manager</span>
          </Link>
        </div>

        <nav className="p-4 space-y-1 flex-1">
          <NavLink href="/dashboard" icon={<LayoutDashboard className="w-5 h-5" />}>
            Dashboard
          </NavLink>
          <NavLink href="/dashboard/clients" icon={<Users className="w-5 h-5" />}>
            Clients
          </NavLink>
          <NavLink
            href="/dashboard/settings"
            icon={<Settings className="w-5 h-5" />}
          >
            Settings
          </NavLink>
        </nav>

        {/* Bottom section */}
        <div className="mt-auto">
          <div className="border-t border-gray-200">
            <ConnectionStatus />
          </div>
          <div className="p-4 border-t border-gray-200">
            <div className="bg-purple-50 rounded-lg p-4">
              <h4 className="font-medium text-purple-900 mb-1">Need help?</h4>
              <p className="text-sm text-purple-700 mb-3">
                Check our documentation
              </p>
              <Link
                href="/docs"
                className="text-sm text-purple-600 hover:text-purple-700"
              >
                View docs &rarr;
              </Link>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

function NavLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}
