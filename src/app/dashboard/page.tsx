"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Code2,
  Layers,
  ArrowUpRight,
  Activity,
} from "lucide-react";

interface DashboardStats {
  totalLessons: number;
  publishedLessons: number;
  totalScenarios: number;
  totalBuildSessions: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Bricks CC Teaching System overview
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Lessons"
            value={stats ? String(stats.totalLessons) : "--"}
            icon={<BookOpen className="w-6 h-6" />}
            href="/teaching"
          />
          <StatCard
            title="Published"
            value={stats ? String(stats.publishedLessons) : "--"}
            icon={<BookOpen className="w-6 h-6" />}
            href="/teaching"
          />
          <StatCard
            title="Scenarios"
            value={stats ? String(stats.totalScenarios) : "--"}
            icon={<Layers className="w-6 h-6" />}
            href="/teaching"
          />
          <StatCard
            title="Build Sessions"
            value={stats ? String(stats.totalBuildSessions) : "--"}
            icon={<Code2 className="w-6 h-6" />}
            href="/build"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <QuickActionCard
            title="Teaching System"
            description="Create lessons and scenarios to train the AI agent"
            href="/teaching"
            icon={<BookOpen className="w-8 h-8 text-purple-600" />}
          />
          <QuickActionCard
            title="Build System"
            description="Generate Bricks code with the AI-powered structure agent"
            href="/build"
            icon={<Code2 className="w-8 h-8 text-purple-600" />}
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  href,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="bg-white rounded-lg border border-gray-200 p-6 hover:border-purple-300 hover:shadow-md transition-all group"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
          {icon}
        </div>
        <ArrowUpRight className="w-5 h-5 text-gray-300 group-hover:text-purple-600 transition-colors" />
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <span className="text-sm text-gray-500">{title}</span>
    </Link>
  );
}

function QuickActionCard({
  title,
  description,
  href,
  icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="bg-white rounded-lg border border-gray-200 p-8 hover:border-purple-300 hover:shadow-md transition-all group"
    >
      <div className="flex items-start gap-4">
        <div className="p-3 bg-purple-50 rounded-xl">{icon}</div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
        <ArrowUpRight className="w-5 h-5 text-gray-300 group-hover:text-purple-600 transition-colors mt-1" />
      </div>
    </Link>
  );
}
