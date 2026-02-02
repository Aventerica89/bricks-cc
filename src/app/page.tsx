import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Code2,
  Eye,
  GitBranch,
  Layers,
  Sparkles,
  CheckCircle2,
  Zap,
  Shield,
  Brain,
  Boxes,
  FileCode,
  Workflow,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated background gradients */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-60 -left-40 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 right-1/3 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2 text-sm text-purple-300">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Teaching System</span>
            </div>
          </div>

          {/* Hero Content */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent leading-tight">
              Teach Claude to Build
              <br />
              Perfect Bricks Sites
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-8 leading-relaxed">
              A constraint-based teaching system that trains AI agents to
              generate flawless Bricks Builder code through visual examples,
              validation rules, and multi-agent collaboration
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/teaching"
                className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-2xl shadow-purple-500/50 transition-all hover:scale-105"
              >
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 bg-slate-800/50 hover:bg-slate-700/50 backdrop-blur-sm border border-slate-600 hover:border-slate-500 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all"
              >
                View Dashboard
              </Link>
            </div>
          </div>

          {/* Code Window Mockup */}
          <div className="max-w-5xl mx-auto">
            <div className="bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
              {/* Window Header */}
              <div className="bg-slate-800/90 border-b border-slate-700 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="ml-4 text-slate-400 text-sm font-mono">
                  teaching-system.tsx
                </div>
              </div>
              {/* Code Content */}
              <div className="p-8 grid md:grid-cols-2 gap-8">
                <div>
                  <div className="text-xs font-semibold text-red-400 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-400"></span>
                    BEFORE: Inconsistent
                  </div>
                  <div className="bg-slate-950/50 border border-red-500/20 rounded-lg p-4 font-mono text-sm text-slate-300">
                    <div className="text-red-400">// Missing ACSS</div>
                    <div>&lt;div className="box"&gt;</div>
                    <div className="ml-4 text-slate-500">
                      &lt;h2&gt;Title&lt;/h2&gt;
                    </div>
                    <div>&lt;/div&gt;</div>
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-green-400 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400"></span>
                    AFTER: Perfect
                  </div>
                  <div className="bg-slate-950/50 border border-green-500/20 rounded-lg p-4 font-mono text-sm text-slate-300">
                    <div className="text-green-400">// ACSS + Semantic</div>
                    <div>&lt;section className="section"&gt;</div>
                    <div className="ml-4">
                      &lt;h2 className="h2"&gt;Title&lt;/h2&gt;
                    </div>
                    <div>&lt;/section&gt;</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Powerful Teaching Features
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Everything you need to train AI agents to master Bricks Builder
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Eye className="w-8 h-8" />}
              title="Visual Teaching"
              description="Side-by-side before/after comparisons show exactly what perfect Bricks code looks like"
              gradient="from-purple-500 to-pink-500"
            />
            <FeatureCard
              icon={<Brain className="w-8 h-8" />}
              title="Multi-Agent System"
              description="Specialized agents for CSS, structure, review, and reference work together seamlessly"
              gradient="from-pink-500 to-orange-500"
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8" />}
              title="Constraint Validation"
              description="Define strict rules that ensure generated code always meets your standards"
              gradient="from-orange-500 to-yellow-500"
            />
            <FeatureCard
              icon={<BookOpen className="w-8 h-8" />}
              title="Growing Library"
              description="Build a comprehensive lesson library that continuously improves agent performance"
              gradient="from-purple-500 to-blue-500"
            />
            <FeatureCard
              icon={<GitBranch className="w-8 h-8" />}
              title="GitHub Sync"
              description="Version control and team collaboration built right in with automated syncing"
              gradient="from-blue-500 to-cyan-500"
            />
            <FeatureCard
              icon={<Zap className="w-8 h-8" />}
              title="Real-time Testing"
              description="Test lessons instantly and see validation results in real-time"
              gradient="from-cyan-500 to-purple-500"
            />
          </div>
        </div>
      </section>

      {/* Technology Stack Section */}
      <section className="relative py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Built on Modern Tech
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Powered by the best tools in the WordPress and AI ecosystem
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <TechCard name="Bricks Builder" icon={<Boxes className="w-12 h-12" />} />
            <TechCard name="Automatic CSS" icon={<Code2 className="w-12 h-12" />} />
            <TechCard name="Frames" icon={<Layers className="w-12 h-12" />} />
            <TechCard name="GitHub" icon={<GitBranch className="w-12 h-12" />} />
            <TechCard name="WordPress" icon={<FileCode className="w-12 h-12" />} />
            <TechCard name="Claude AI" icon={<Sparkles className="w-12 h-12" />} />
          </div>

          {/* Special callout for Bricks */}
          <div className="mt-12 max-w-3xl mx-auto bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-2xl p-8 text-center">
            <Boxes className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">
              Bricks Builder First
            </h3>
            <p className="text-slate-300">
              Designed specifically for Bricks Builder with deep integration
              for ACSS, Frames, and semantic HTML patterns
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-24 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Four simple steps to train AI agents that generate perfect code
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <StepCard
              number="01"
              title="Create Lessons"
              description="Build lessons with before/after examples showing the transformation from bad to perfect code"
              icon={<BookOpen className="w-8 h-8" />}
            />
            <StepCard
              number="02"
              title="Define Rules"
              description="Set validation constraints that enforce your coding standards and best practices"
              icon={<CheckCircle2 className="w-8 h-8" />}
            />
            <StepCard
              number="03"
              title="Agents Learn"
              description="Multiple specialized agents study your scenarios and learn the patterns"
              icon={<Brain className="w-8 h-8" />}
            />
            <StepCard
              number="04"
              title="Generate Code"
              description="Get perfect, validated Bricks code that follows all your rules and standards"
              icon={<Workflow className="w-8 h-8" />}
            />
          </div>

          {/* Visual Flow */}
          <div className="mt-16 flex items-center justify-center gap-4">
            <div className="flex-1 h-1 bg-gradient-to-r from-transparent via-purple-500 to-purple-500"></div>
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <div className="w-3 h-3 rounded-full bg-pink-500"></div>
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            </div>
            <div className="flex-1 h-1 bg-gradient-to-r from-orange-500 via-pink-500 to-transparent"></div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-32">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Ready to Transform
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI-Powered Development?
            </span>
          </h2>
          <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto">
            Start teaching Claude to build perfect Bricks sites with our
            advanced constraint-based teaching system
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/teaching"
              className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-10 py-5 rounded-xl text-xl font-semibold shadow-2xl shadow-purple-500/50 transition-all hover:scale-105"
            >
              Access Teaching System
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 bg-slate-800/50 hover:bg-slate-700/50 backdrop-blur-sm border border-slate-600 hover:border-slate-500 text-white px-10 py-5 rounded-xl text-xl font-semibold transition-all"
            >
              View Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-slate-500 text-sm">
            <p>
              Bricks Builder Teaching System - Training AI to build better
              websites
            </p>
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
      ></div>
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
