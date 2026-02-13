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
      <nav className="bg-[#161616]/80 backdrop-blur-md border-b border-[#2a2a2a] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <Link
              href="/"
              className="text-lg font-bold text-teal-500 hover:text-teal-400 transition-colors"
            >
              WP Dispatch
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
                        ? "bg-teal-500/10 text-teal-500 border border-teal-500/20"
                        : "text-[#a1a1a1] hover:text-[#f5f5f5] hover:bg-[#252525]"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                );
              })}

              <button
                onClick={() => setShowHelp(true)}
                className="ml-2 p-1.5 text-[#666] hover:text-teal-500 hover:bg-teal-500/10 rounded-md transition-colors"
                title="How to use WP Dispatch"
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
