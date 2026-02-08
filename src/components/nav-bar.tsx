"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Code2,
  Settings,
  HelpCircle,
} from "lucide-react";
import InstructionsModal from "./instructions-modal";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/teaching", label: "Teaching", icon: BookOpen },
  { href: "/build", label: "Build", icon: Code2 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
] as const;

export default function NavBar() {
  const pathname = usePathname();
  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <Link
              href="/"
              className="text-lg font-bold text-gray-900 hover:text-purple-600 transition-colors"
            >
              Bricks CC
            </Link>

            <div className="flex items-center gap-1">
              {navItems.map(({ href, label, icon: Icon }) => {
                const isActive =
                  pathname === href || pathname.startsWith(`${href}/`);

                return (
                  <Link
                    key={href}
                    href={href}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-purple-100 text-purple-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                );
              })}

              <button
                onClick={() => setShowHelp(true)}
                className="ml-2 p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                title="How to use Bricks CC"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <InstructionsModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />
    </>
  );
}
