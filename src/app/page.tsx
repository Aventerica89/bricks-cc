import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Code2,
  Layers,
  Sparkles,
  Zap,
  Shield,
  Brain,
  Boxes,
  FileCode,
  Workflow,
  Users,
  MessageSquare,
  Globe,
  ClipboardCheck,
  LayoutDashboard,
  Lock,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-60 -left-40 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute bottom-20 right-1/3 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse delay-2000" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2 text-sm text-purple-300">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered WordPress Management</span>
            </div>
          </div>

          {/* Hero Content */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent leading-tight">
              Manage Bricks Sites
              <br />
              with Claude AI
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-8 leading-relaxed">
              A complete WordPress management platform that combines client
              management, AI-powered page editing, Basecamp integration, and an
              agent training system for Bricks Builder
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard"
                className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-2xl shadow-purple-500/50 transition-all hover:scale-105"
              >
                Open Dashboard
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/teaching"
                className="inline-flex items-center justify-center gap-2 bg-slate-800/50 hover:bg-slate-700/50 backdrop-blur-sm border border-slate-600 hover:border-slate-500 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all"
              >
                Teaching System
              </Link>
            </div>
          </div>

          {/* Dashboard Preview Mockup */}
          <div className="max-w-5xl mx-auto">
            <div className="bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
              <div className="bg-slate-800/90 border-b border-slate-700 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="ml-4 text-slate-400 text-sm font-mono">
                  bricks-cc.jbcloud.app/dashboard
                </div>
              </div>
              {/* Mockup Content */}
              <div className="p-8 grid md:grid-cols-3 gap-6">
                <MockupStat label="Client Sites" value="12" />
                <MockupStat label="Active Sessions" value="3" />
                <MockupStat label="Lessons Trained" value="24" />
              </div>
              <div className="px-8 pb-8 grid md:grid-cols-2 gap-6">
                <div className="bg-slate-950/50 border border-slate-700 rounded-lg p-4">
                  <div className="text-xs font-semibold text-purple-400 mb-3 flex items-center gap-2">
                    <MessageSquare className="w-3 h-3" />
                    AI Chat
                  </div>
                  <div className="space-y-2 text-sm text-slate-400">
                    <div className="bg-slate-800/50 rounded-lg px-3 py-2">
                      Add a hero section with ACSS grid
                    </div>
                    <div className="bg-purple-900/30 border border-purple-500/20 rounded-lg px-3 py-2 text-purple-300">
                      Done. Added section with .grid--3 layout...
                    </div>
                  </div>
                </div>
                <div className="bg-slate-950/50 border border-slate-700 rounded-lg p-4">
                  <div className="text-xs font-semibold text-green-400 mb-3 flex items-center gap-2">
                    <Globe className="w-3 h-3" />
                    Basecamp Sync
                  </div>
                  <div className="space-y-2 text-sm text-slate-400">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      Connected (OAuth)
                    </div>
                    <div className="flex items-center gap-2">
                      <ClipboardCheck className="w-3 h-3" />
                      Feedback auto-synced to todos
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="relative py-24 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              From client management to AI-powered editing to project tracking
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<MessageSquare className="w-8 h-8" />}
              title="AI Chat Editing"
              description="Chat with Claude to edit Bricks pages. Describe changes in plain English and watch them happen."
              gradient="from-purple-500 to-pink-500"
            />
            <FeatureCard
              icon={<Users className="w-8 h-8" />}
              title="Client Management"
              description="Manage clients, sites, and encrypted API keys. Per-site Bricks access with role-based permissions."
              gradient="from-pink-500 to-orange-500"
            />
            <FeatureCard
              icon={<Globe className="w-8 h-8" />}
              title="Basecamp Integration"
              description="OAuth-connected Basecamp sync. Client feedback auto-creates todos. Real-time webhook updates."
              gradient="from-orange-500 to-yellow-500"
            />
            <FeatureCard
              icon={<ClipboardCheck className="w-8 h-8" />}
              title="Feedback Pipeline"
              description="Collect client feedback with type tagging, CSRF protection, and automatic Basecamp sync."
              gradient="from-purple-500 to-blue-500"
            />
            <FeatureCard
              icon={<Brain className="w-8 h-8" />}
              title="Agent Training"
              description="Teach AI agents with lessons and scenarios. Multi-agent system for structure, CSS, and review."
              gradient="from-blue-500 to-cyan-500"
            />
            <FeatureCard
              icon={<Workflow className="w-8 h-8" />}
              title="Build System"
              description="Multi-phase build sessions with agent orchestration, approval gates, and output comparison."
              gradient="from-cyan-500 to-purple-500"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              From setup to AI-assisted site management in four steps
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <StepCard
              number="01"
              title="Add Clients"
              description="Create client profiles, add their WordPress sites, and store Bricks API keys securely"
              icon={<Users className="w-8 h-8" />}
            />
            <StepCard
              number="02"
              title="Connect Services"
              description="Link Basecamp via OAuth for project management and enable Claude AI for chat editing"
              icon={<Globe className="w-8 h-8" />}
            />
            <StepCard
              number="03"
              title="Chat to Edit"
              description="Describe page changes in natural language. Claude reads the page structure and applies edits"
              icon={<MessageSquare className="w-8 h-8" />}
            />
            <StepCard
              number="04"
              title="Train Agents"
              description="Build lessons and scenarios that teach agents your ACSS patterns and coding standards"
              icon={<Brain className="w-8 h-8" />}
            />
          </div>

          {/* Visual Flow */}
          <div className="mt-16 flex items-center justify-center gap-4">
            <div className="flex-1 h-1 bg-gradient-to-r from-transparent via-purple-500 to-purple-500" />
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <div className="w-3 h-3 rounded-full bg-pink-500" />
              <div className="w-3 h-3 rounded-full bg-orange-500" />
            </div>
            <div className="flex-1 h-1 bg-gradient-to-r from-orange-500 via-pink-500 to-transparent" />
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="relative py-24 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Built for the Bricks Ecosystem
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Deep integration with the tools you already use
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <TechCard name="Bricks Builder" icon={<Boxes className="w-12 h-12" />} />
            <TechCard name="Automatic CSS" icon={<Code2 className="w-12 h-12" />} />
            <TechCard name="Frames" icon={<Layers className="w-12 h-12" />} />
            <TechCard name="Basecamp" icon={<Globe className="w-12 h-12" />} />
            <TechCard name="WordPress" icon={<FileCode className="w-12 h-12" />} />
            <TechCard name="Claude AI" icon={<Sparkles className="w-12 h-12" />} />
          </div>

          {/* Capabilities Grid */}
          <div className="mt-16 grid md:grid-cols-3 gap-8">
            <CapabilityCard
              icon={<Boxes className="w-6 h-6" />}
              title="Bricks Page Editing"
              items={[
                "Fetch and view page element structure",
                "Edit elements via AI chat commands",
                "Cached page structures (30-min TTL)",
                "Per-page client edit permissions",
              ]}
            />
            <CapabilityCard
              icon={<Globe className="w-6 h-6" />}
              title="Basecamp Project Sync"
              items={[
                "OAuth token exchange and storage",
                "View projects and create todos",
                "Feedback auto-syncs to Basecamp",
                "Real-time webhook processing",
              ]}
            />
            <CapabilityCard
              icon={<Shield className="w-6 h-6" />}
              title="Security"
              items={[
                "AES-256-GCM encrypted secrets",
                "PIN-based admin auth",
                "CSRF protection on all forms",
                "Rate limiting on submissions",
              ]}
            />
          </div>
        </div>
      </section>

      {/* Teaching System Highlight */}
      <section className="relative py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2 text-sm text-purple-300 mb-6">
                <BookOpen className="w-4 h-4" />
                <span>Teaching System</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Train AI Agents
                <br />
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Your Way
                </span>
              </h2>
              <p className="text-lg text-slate-300 mb-8">
                Build a growing library of lessons and scenarios that teach
                Claude your exact Bricks Builder patterns, ACSS conventions,
                and coding standards.
              </p>
              <ul className="space-y-4">
                <TeachingFeature text="Lessons with before/after code examples" />
                <TeachingFeature text="Multi-agent system: structure, CSS, review, reference" />
                <TeachingFeature text="Confidence scoring with few-shot learning" />
                <TeachingFeature text="4-phase build workflow with approval gates" />
              </ul>
              <div className="mt-8">
                <Link
                  href="/teaching"
                  className="group inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-semibold transition-colors"
                >
                  Explore Teaching System
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Code Window */}
            <div className="bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
              <div className="bg-slate-800/90 border-b border-slate-700 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="ml-4 text-slate-400 text-sm font-mono">
                  lesson-example.tsx
                </div>
              </div>
              <div className="p-6 grid grid-cols-2 gap-6">
                <div>
                  <div className="text-xs font-semibold text-red-400 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    BEFORE
                  </div>
                  <div className="bg-slate-950/50 border border-red-500/20 rounded-lg p-4 font-mono text-sm text-slate-300">
                    <div className="text-red-400">// No ACSS</div>
                    <div>&lt;div class=&quot;box&quot;&gt;</div>
                    <div className="ml-4 text-slate-500">
                      &lt;h2&gt;Title&lt;/h2&gt;
                    </div>
                    <div>&lt;/div&gt;</div>
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-green-400 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400" />
                    AFTER
                  </div>
                  <div className="bg-slate-950/50 border border-green-500/20 rounded-lg p-4 font-mono text-sm text-slate-300">
                    <div className="text-green-400">// ACSS + Semantic</div>
                    <div>&lt;section class=&quot;section&quot;&gt;</div>
                    <div className="ml-4">
                      &lt;h2 class=&quot;h2&quot;&gt;Title&lt;/h2&gt;
                    </div>
                    <div>&lt;/section&gt;</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Your WordPress Sites,
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Managed by AI
            </span>
          </h2>
          <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto">
            Client management, AI chat editing, Basecamp sync, feedback
            pipelines, and agent training — all in one platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-10 py-5 rounded-xl text-xl font-semibold shadow-2xl shadow-purple-500/50 transition-all hover:scale-105"
            >
              Open Dashboard
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/teaching"
              className="inline-flex items-center justify-center gap-2 bg-slate-800/50 hover:bg-slate-700/50 backdrop-blur-sm border border-slate-600 hover:border-slate-500 text-white px-10 py-5 rounded-xl text-xl font-semibold transition-all"
            >
              Teaching System
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-purple-600 rounded-md flex items-center justify-center">
                <LayoutDashboard className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-slate-300">WP Manager</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <Link href="/dashboard" className="hover:text-slate-300 transition-colors">
                Dashboard
              </Link>
              <Link href="/teaching" className="hover:text-slate-300 transition-colors">
                Teaching
              </Link>
              <Link href="/build" className="hover:text-slate-300 transition-colors">
                Build
              </Link>
              <Link href="/dashboard/settings" className="hover:text-slate-300 transition-colors">
                Settings
              </Link>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Lock className="w-3 h-3" />
              <span>Encrypted &amp; Secure</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  gradient,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <div className="group relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 hover:border-slate-600 transition-all hover:scale-105">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity`}
      />
      <div className="relative">
        <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${gradient} mb-4`}>
          <div className="text-white">{icon}</div>
        </div>
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-slate-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function TechCard({ name, icon }: { name: string; icon: React.ReactNode }) {
  return (
    <div className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-purple-500/50 transition-all hover:scale-105 flex flex-col items-center justify-center text-center gap-3">
      <div className="text-purple-400 group-hover:text-purple-300 transition-colors">
        {icon}
      </div>
      <div className="text-sm font-semibold text-slate-300 group-hover:text-white transition-colors">
        {name}
      </div>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
  icon,
}: {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="relative group">
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 hover:border-purple-500/50 transition-all h-full">
        <div className="text-6xl font-bold text-slate-800 mb-4">{number}</div>
        <div className="text-purple-400 mb-4">{icon}</div>
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-slate-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function MockupStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-950/50 border border-slate-700 rounded-lg p-4 text-center">
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-slate-400">{label}</div>
    </div>
  );
}

function CapabilityCard({
  icon,
  title,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
}) {
  return (
    <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="text-purple-400">{icon}</div>
        <h3 className="font-semibold text-white">{title}</h3>
      </div>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-slate-400">
            <Zap className="w-3 h-3 text-purple-400 mt-1 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function TeachingFeature({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-3 text-slate-300">
      <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
        <Sparkles className="w-3 h-3 text-purple-400" />
      </div>
      {text}
    </li>
  );
}
