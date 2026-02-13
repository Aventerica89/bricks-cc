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
    <div className="min-h-screen bg-[#0c0c0c]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-grid">
        <div className="absolute inset-0 bg-gradient-to-b from-teal-500/5 via-transparent to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 rounded-full px-4 py-2 text-sm text-teal-400">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered WordPress Management</span>
            </div>
          </div>

          {/* Hero Content */}
          <div className="text-center mb-16">
            <h1
              className="text-5xl md:text-7xl font-bold mb-6 text-[#f5f5f5] leading-tight"
            >
              Manage Bricks Sites
              <br />
              <span className="text-teal-500">with Claude AI</span>
            </h1>
            <p className="text-xl md:text-2xl text-[#a1a1a1] max-w-3xl mx-auto mb-8 leading-relaxed">
              A complete WordPress management platform that combines client
              management, AI-powered page editing, Basecamp integration, and an
              agent training system for Bricks Builder
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard"
                className="group inline-flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-gray-950 px-8 py-4 rounded-xl text-lg font-semibold shadow-2xl shadow-teal-500/20 transition-all hover:scale-105"
              >
                Open Dashboard
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/teaching"
                className="inline-flex items-center justify-center gap-2 bg-[#1e1e1e] hover:bg-[#252525] border border-[#2a2a2a] hover:border-[#3a3a3a] text-[#f5f5f5] px-8 py-4 rounded-xl text-lg font-semibold transition-all"
              >
                Teaching System
              </Link>
            </div>
          </div>

          {/* Dashboard Preview Mockup */}
          <div className="max-w-5xl mx-auto">
            <div className="bg-[#161616] border border-[#2a2a2a] rounded-2xl shadow-2xl overflow-hidden">
              <div className="bg-[#1e1e1e] border-b border-[#2a2a2a] px-4 py-3 flex items-center gap-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="ml-4 text-[#666] text-sm font-mono">
                  dispatch.jbcloud.app/dashboard
                </div>
              </div>
              {/* Mockup Content */}
              <div className="p-8 grid md:grid-cols-3 gap-6">
                <MockupStat label="Client Sites" value="12" />
                <MockupStat label="Active Sessions" value="3" />
                <MockupStat label="Lessons Trained" value="24" />
              </div>
              <div className="px-8 pb-8 grid md:grid-cols-2 gap-6">
                <div className="bg-[#0c0c0c] border border-[#2a2a2a] rounded-lg p-4">
                  <div className="text-xs font-semibold text-teal-500 mb-3 flex items-center gap-2">
                    <MessageSquare className="w-3 h-3" />
                    AI Chat
                  </div>
                  <div className="space-y-2 text-sm text-[#a1a1a1]">
                    <div className="bg-teal-500/10 border border-teal-500/20 rounded-lg px-3 py-2 text-teal-200">
                      Add a hero section with ACSS grid
                    </div>
                    <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg px-3 py-2">
                      Done. Added section with .grid--3 layout...
                    </div>
                  </div>
                </div>
                <div className="bg-[#0c0c0c] border border-[#2a2a2a] rounded-lg p-4">
                  <div className="text-xs font-semibold text-green-400 mb-3 flex items-center gap-2">
                    <Globe className="w-3 h-3" />
                    Basecamp Sync
                  </div>
                  <div className="space-y-2 text-sm text-[#a1a1a1]">
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
      <section className="relative py-24 bg-[#161616]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className="text-4xl md:text-5xl font-bold text-[#f5f5f5] mb-4"
            >
              Everything You Need
            </h2>
            <p className="text-xl text-[#a1a1a1] max-w-2xl mx-auto">
              From client management to AI-powered editing to project tracking
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<MessageSquare className="w-8 h-8" />}
              title="AI Chat Editing"
              description="Chat with Claude to edit Bricks pages. Describe changes in plain English and watch them happen."
            />
            <FeatureCard
              icon={<Users className="w-8 h-8" />}
              title="Client Management"
              description="Manage clients, sites, and encrypted API keys. Per-site Bricks access with role-based permissions."
            />
            <FeatureCard
              icon={<Globe className="w-8 h-8" />}
              title="Basecamp Integration"
              description="OAuth-connected Basecamp sync. Client feedback auto-creates todos. Real-time webhook updates."
            />
            <FeatureCard
              icon={<ClipboardCheck className="w-8 h-8" />}
              title="Feedback Pipeline"
              description="Collect client feedback with type tagging, CSRF protection, and automatic Basecamp sync."
            />
            <FeatureCard
              icon={<Brain className="w-8 h-8" />}
              title="Agent Training"
              description="Teach AI agents with lessons and scenarios. Multi-agent system for structure, CSS, and review."
            />
            <FeatureCard
              icon={<Workflow className="w-8 h-8" />}
              title="Build System"
              description="Multi-phase build sessions with agent orchestration, approval gates, and output comparison."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className="text-4xl md:text-5xl font-bold text-[#f5f5f5] mb-4"
            >
              How It Works
            </h2>
            <p className="text-xl text-[#a1a1a1] max-w-2xl mx-auto">
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
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-teal-500/30 to-teal-500/50" />
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-teal-500" />
              <div className="w-2 h-2 rounded-full bg-teal-400" />
              <div className="w-2 h-2 rounded-full bg-teal-300" />
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-teal-500/50 via-teal-500/30 to-transparent" />
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="relative py-24 bg-[#161616]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className="text-4xl md:text-5xl font-bold text-[#f5f5f5] mb-4"
            >
              Built for the Bricks Ecosystem
            </h2>
            <p className="text-xl text-[#a1a1a1] max-w-2xl mx-auto">
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
              <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 rounded-full px-4 py-2 text-sm text-teal-400 mb-6">
                <BookOpen className="w-4 h-4" />
                <span>Teaching System</span>
              </div>
              <h2
                className="text-4xl md:text-5xl font-bold text-[#f5f5f5] mb-6"
              >
                Train AI Agents
                <br />
                <span className="text-teal-500">Your Way</span>
              </h2>
              <p className="text-lg text-[#a1a1a1] mb-8">
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
                  className="group inline-flex items-center gap-2 text-teal-500 hover:text-teal-400 font-semibold transition-colors"
                >
                  Explore Teaching System
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Code Window */}
            <div className="bg-[#161616] border border-[#2a2a2a] rounded-2xl shadow-2xl overflow-hidden">
              <div className="bg-[#1e1e1e] border-b border-[#2a2a2a] px-4 py-3 flex items-center gap-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="ml-4 text-[#666] text-sm font-mono">
                  lesson-example.tsx
                </div>
              </div>
              <div className="p-6 grid grid-cols-2 gap-6">
                <div>
                  <div className="text-xs font-semibold text-red-400 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    BEFORE
                  </div>
                  <div className="bg-[#0c0c0c] border border-red-500/20 rounded-lg p-4 font-mono text-sm text-[#a1a1a1]">
                    <div className="text-red-400">// No ACSS</div>
                    <div>&lt;div class=&quot;box&quot;&gt;</div>
                    <div className="ml-4 text-[#666]">
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
                  <div className="bg-[#0c0c0c] border border-green-500/20 rounded-lg p-4 font-mono text-sm text-[#a1a1a1]">
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
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-transparent to-[#0c0c0c]" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2
            className="text-4xl md:text-6xl font-bold text-[#f5f5f5] mb-6"
          >
            Your WordPress Sites,
            <br />
            <span className="text-teal-500">Managed by AI</span>
          </h2>
          <p className="text-xl text-[#a1a1a1] mb-12 max-w-2xl mx-auto">
            Client management, AI chat editing, Basecamp sync, feedback
            pipelines, and agent training — all in one platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="group inline-flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-gray-950 px-10 py-5 rounded-xl text-xl font-semibold shadow-2xl shadow-teal-500/20 transition-all hover:scale-105"
            >
              Open Dashboard
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/teaching"
              className="inline-flex items-center justify-center gap-2 bg-[#1e1e1e] hover:bg-[#252525] border border-[#2a2a2a] hover:border-[#3a3a3a] text-[#f5f5f5] px-10 py-5 rounded-xl text-xl font-semibold transition-all"
            >
              Teaching System
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-[#2a2a2a] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-teal-500 rounded-md flex items-center justify-center">
                <LayoutDashboard className="w-4 h-4 text-gray-950" />
              </div>
              <span className="font-semibold text-[#a1a1a1]">WP Dispatch</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-[#666]">
              <Link href="/dashboard" className="hover:text-[#a1a1a1] transition-colors">
                Dashboard
              </Link>
              <Link href="/teaching" className="hover:text-[#a1a1a1] transition-colors">
                Teaching
              </Link>
              <Link href="/build" className="hover:text-[#a1a1a1] transition-colors">
                Build
              </Link>
              <Link href="/dashboard/settings" className="hover:text-[#a1a1a1] transition-colors">
                Settings
              </Link>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#666]">
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
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group relative bg-[#161616] border border-[#2a2a2a] rounded-xl p-8 hover:border-teal-500/30 transition-all hover:glow-teal">
      <div className="relative">
        <div className="inline-flex p-3 rounded-xl bg-teal-500/10 mb-4">
          <div className="text-teal-500">{icon}</div>
        </div>
        <h3
          className="text-xl font-bold text-[#f5f5f5] mb-3"
        >
          {title}
        </h3>
        <p className="text-[#a1a1a1] leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function TechCard({ name, icon }: { name: string; icon: React.ReactNode }) {
  return (
    <div className="group bg-[#161616] border border-[#2a2a2a] rounded-xl p-6 hover:border-teal-500/30 transition-all flex flex-col items-center justify-center text-center gap-3">
      <div className="text-teal-500/60 group-hover:text-teal-500 transition-colors">
        {icon}
      </div>
      <div className="text-sm font-semibold text-[#a1a1a1] group-hover:text-[#f5f5f5] transition-colors">
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
      <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-8 hover:border-teal-500/30 transition-all h-full">
        <div className="text-6xl font-bold text-[#1e1e1e] mb-4">{number}</div>
        <div className="text-teal-500 mb-4">{icon}</div>
        <h3
          className="text-xl font-bold text-[#f5f5f5] mb-3"
        >
          {title}
        </h3>
        <p className="text-[#a1a1a1] leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function MockupStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#0c0c0c] border border-[#2a2a2a] rounded-lg p-4 text-center">
      <div className="text-3xl font-bold text-[#f5f5f5] mb-1">{value}</div>
      <div className="text-sm text-[#a1a1a1]">{label}</div>
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
    <div className="bg-[#161616]/50 border border-[#2a2a2a] rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="text-teal-500">{icon}</div>
        <h3 className="font-semibold text-[#f5f5f5]">{title}</h3>
      </div>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-[#a1a1a1]">
            <Zap className="w-3 h-3 text-teal-500 mt-1 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function TeachingFeature({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-3 text-[#a1a1a1]">
      <div className="w-6 h-6 rounded-full bg-teal-500/10 flex items-center justify-center shrink-0">
        <Sparkles className="w-3 h-3 text-teal-500" />
      </div>
      {text}
    </li>
  );
}
