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
    <div className="min-h-screen bg-[#0c0c0c] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#161616] border-r border-[#2a2a2a] hidden md:flex md:flex-col">
        <div className="p-6 border-b border-[#2a2a2a]">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
              <Layout className="w-5 h-5 text-gray-950" />
            </div>
            <span className="font-bold text-[#f5f5f5]">WP Dispatch</span>
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
          <div className="border-t border-[#2a2a2a]">
            <ConnectionStatus />
          </div>
          <div className="p-4 border-t border-[#2a2a2a]">
            <div className="bg-teal-500/10 border border-teal-500/20 rounded-lg p-4">
              <h4 className="font-medium text-teal-400 mb-1">Need help?</h4>
              <p className="text-sm text-[#a1a1a1] mb-3">
                Check our documentation
              </p>
              <Link
                href="/docs"
                className="text-sm text-teal-500 hover:text-teal-400"
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
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#a1a1a1] hover:bg-[#252525] hover:text-teal-500 transition-colors"
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}
