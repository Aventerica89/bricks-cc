"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Code2,
  Layers,
  ArrowUpRight,
  Activity,
  Sparkles,
} from "lucide-react";

interface DashboardStats {
  totalLessons: number;
  publishedLessons: number;
  totalScenarios: number;
  totalBuildSessions: number;
}

interface RecentSession {
  id: string;
  status: string;
  inputData: { description?: string } | null;
  agentOutputs: {
    structure?: {
      confidence?: number;
      metadata?: { aiGenerated?: boolean };
    };
  } | null;
  createdAt: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error);

    fetch("/api/build/sessions")
      .then((r) => r.json())
      .then((data) => setRecentSessions((data.sessions || []).slice(0, 5)))
      .catch(console.error);
  }, []);

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1
            className="text-2xl font-bold text-[#f5f5f5]"
          >
            Dashboard
          </h1>
          <p className="text-[#a1a1a1]">
            Client sites, sessions, and activity overview
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <QuickActionCard
            title="Teaching System"
            description="Create lessons and scenarios to train the AI agent"
            href="/teaching"
            icon={<BookOpen className="w-8 h-8 text-teal-500" />}
          />
          <QuickActionCard
            title="Build System"
            description="Generate Bricks code with the AI-powered structure agent"
            href="/build"
            icon={<Code2 className="w-8 h-8 text-teal-500" />}
          />
        </div>

        {/* Recent Activity */}
        {recentSessions.length > 0 && (
          <div className="bg-[#161616] rounded-xl border border-[#2a2a2a] p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#a1a1a1]" />
                <h2 className="text-lg font-semibold text-[#f5f5f5]">
                  Recent Build Activity
                </h2>
              </div>
              <Link
                href="/build"
                className="text-sm text-teal-500 hover:text-teal-400 font-medium"
              >
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {recentSessions.map((session) => {
                const description =
                  (session.inputData as { description?: string } | null)
                    ?.description || "Untitled session";
                const confidence =
                  session.agentOutputs?.structure?.confidence;
                const aiGenerated =
                  session.agentOutputs?.structure?.metadata?.aiGenerated;

                return (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 bg-[#1e1e1e] rounded-lg"
                  >
                    <div className="min-w-0 flex-1 mr-4">
                      <span className="text-sm font-medium text-[#f5f5f5] truncate block">
                        {description}
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {aiGenerated !== undefined && (
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded ${
                              aiGenerated
                                ? "bg-green-500/10 text-green-400"
                                : "bg-teal-500/10 text-teal-400"
                            }`}
                          >
                            {aiGenerated ? "AI" : "Template"}
                          </span>
                        )}
                        <span className="text-xs text-[#666]">
                          {new Date(session.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {confidence !== undefined && (
                      <div className="flex items-center gap-2">
                        <div className="w-12 bg-[#2a2a2a] rounded-full h-1.5">
                          <div
                            className="bg-teal-500 h-1.5 rounded-full"
                            style={{ width: `${confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-teal-500 w-8 text-right">
                          {(confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
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
      className="bg-[#161616] rounded-xl border border-[#2a2a2a] p-6 hover:border-teal-500/30 hover:glow-teal transition-all group"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-teal-500/10 rounded-lg text-teal-500">
          {icon}
        </div>
        <ArrowUpRight className="w-5 h-5 text-[#666] group-hover:text-teal-500 transition-colors" />
      </div>
      <div className="text-2xl font-bold text-[#f5f5f5] mb-1">{value}</div>
      <span className="text-sm text-[#a1a1a1]">{title}</span>
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
      className="bg-[#161616] rounded-xl border border-[#2a2a2a] p-8 hover:border-teal-500/30 hover:glow-teal transition-all group"
    >
      <div className="flex items-start gap-4">
        <div className="p-3 bg-teal-500/10 rounded-xl">{icon}</div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-[#f5f5f5] group-hover:text-teal-500 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-[#a1a1a1] mt-1">{description}</p>
        </div>
        <ArrowUpRight className="w-5 h-5 text-[#666] group-hover:text-teal-500 transition-colors mt-1" />
      </div>
    </Link>
  );
}
