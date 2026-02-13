"use client";

import { useEffect, useRef } from "react";
import {
  X,
  BookOpen,
  Code2,
  LayoutDashboard,
  ChevronRight,
  Lightbulb,
  Package,
  FileText,
} from "lucide-react";

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InstructionsModal({
  isOpen,
  onClose,
}: InstructionsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative bg-[#161616] border border-[#2a2a2a] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto instructions-modal"
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#161616] border-b border-[#2a2a2a] px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
          <h2
            className="text-xl font-bold text-[#f5f5f5]"
          >
            How to Use WP Dispatch
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-[#666] hover:text-[#f5f5f5] hover:bg-[#252525] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-8">
          {/* Overview */}
          <div>
            <p className="text-[#a1a1a1] leading-relaxed">
              WP Dispatch is an AI-powered system for managing WordPress sites with Bricks
              Builder components. It works in two phases: <strong className="text-[#f5f5f5]">teach</strong>{" "}
              the AI with examples, then <strong className="text-[#f5f5f5]">build</strong> components using
              what it learned.
            </p>
          </div>

          {/* Teaching Section */}
          <Section
            icon={BookOpen}
            title="Teaching System"
            color="primary"
          >
            <p className="text-[#a1a1a1] mb-3">
              Train the AI by creating lessons with scenarios (example
              input/output pairs).
            </p>
            <StepList
              steps={[
                "Go to Teaching and click Create Lesson",
                "Choose a category (Container Grids or Media Queries)",
                "Add scenarios to your lesson — each scenario is a training example",
                "Fill in the scenario details: ACSS dump, grid code, and expected Bricks JSON output",
                "Publish the lesson when your scenarios are complete",
              ]}
            />
            <Tip>
              The more scenarios you add with complete data, the better the AI
              performs. Include the expected Bricks JSON output for each scenario
              so the AI can learn the correct patterns.
            </Tip>
          </Section>

          {/* Build Section */}
          <Section
            icon={Code2}
            title="Build System"
            color="primary"
          >
            <p className="text-[#a1a1a1] mb-3">
              Generate Bricks components using the trained AI agent.
            </p>
            <StepList
              steps={[
                "Go to Build and click New Build Session",
                "Optionally select a lesson and scenario to auto-fill inputs and provide reference examples",
                "Enter a description of the component you want to generate",
                "Paste your ACSS JS dump and container grid code if available",
                "Click Create & Execute to run the structure agent",
              ]}
            />
            <Tip>
              Selecting a lesson gives the AI few-shot examples from your
              scenarios. The more relevant the lesson, the better the output.
              Check the confidence score and reasoning to understand the
              quality of the result.
            </Tip>
          </Section>

          {/* Resources Section */}
          <Section
            icon={Package}
            title="Plugin Resources & ACSS Docs"
            color="green"
          >
            <p className="text-[#a1a1a1] mb-3">
              These categories are for reference material, not training data.
            </p>
            <div className="space-y-2">
              <div className="flex items-start gap-3 text-sm text-[#a1a1a1]">
                <Package className="w-4 h-4 mt-0.5 text-green-400 shrink-0" />
                <span>
                  <strong className="text-[#f5f5f5]">Plugin Resources</strong> — Upload plugin files and
                  assets for reference during development.
                </span>
              </div>
              <div className="flex items-start gap-3 text-sm text-[#a1a1a1]">
                <FileText className="w-4 h-4 mt-0.5 text-teal-500 shrink-0" />
                <span>
                  <strong className="text-[#f5f5f5]">ACSS Docs</strong> — Links to Automatic CSS
                  documentation for variable and utility class reference.
                </span>
              </div>
            </div>
          </Section>

          {/* Dashboard Section */}
          <Section
            icon={LayoutDashboard}
            title="Dashboard"
            color="primary"
          >
            <p className="text-[#a1a1a1]">
              The dashboard shows an overview of your lessons, scenarios, and
              build sessions. Use it to track progress and quickly navigate to
              recent work.
            </p>
          </Section>

          {/* Workflow Summary */}
          <div className="bg-[#1e1e1e] rounded-xl p-5 border border-[#2a2a2a]">
            <h3 className="text-sm font-semibold text-[#f5f5f5] uppercase tracking-wide mb-3">
              Typical Workflow
            </h3>
            <div className="flex items-center gap-2 text-sm text-[#a1a1a1] flex-wrap">
              <WorkflowStep label="Create Lesson" />
              <ChevronRight className="w-4 h-4 text-[#666] shrink-0" />
              <WorkflowStep label="Add Scenarios" />
              <ChevronRight className="w-4 h-4 text-[#666] shrink-0" />
              <WorkflowStep label="Fill Training Data" />
              <ChevronRight className="w-4 h-4 text-[#666] shrink-0" />
              <WorkflowStep label="Run Build" />
              <ChevronRight className="w-4 h-4 text-[#666] shrink-0" />
              <WorkflowStep label="Review Output" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  color,
  children,
}: {
  icon: React.ElementType;
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  const colorMap: Record<string, string> = {
    primary: "bg-teal-500/10 text-teal-500",
    green: "bg-green-500/10 text-green-400",
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-semibold text-[#f5f5f5]">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function StepList({ steps }: { steps: string[] }) {
  return (
    <ol className="space-y-2 mb-3">
      {steps.map((step, i) => (
        <li key={i} className="flex items-start gap-3 text-sm text-[#a1a1a1]">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#252525] text-teal-500 text-xs font-medium shrink-0 mt-0.5">
            {i + 1}
          </span>
          {step}
        </li>
      ))}
    </ol>
  );
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 bg-teal-500/10 border border-teal-500/20 rounded-lg p-3">
      <Lightbulb className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
      <p className="text-sm text-teal-200">{children}</p>
    </div>
  );
}

function WorkflowStep({ label }: { label: string }) {
  return (
    <span className="px-3 py-1 bg-[#252525] border border-[#2a2a2a] rounded-full text-[#a1a1a1] font-medium">
      {label}
    </span>
  );
}
