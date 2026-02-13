"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  PlusCircle,
  Play,
  Code2,
  Sparkles,
  BookOpen,
  History,
  Copy,
  Download,
  Check,
  RotateCcw,
  AlertCircle,
  X,
} from "lucide-react";

type Lesson = {
  id: string;
  title: string;
  category: string;
  status: string;
};

type Scenario = {
  id: string;
  name: string;
  acssJsDump: Record<string, unknown> | null;
  correctContainerGridCode: string | null;
  expectedOutput: Record<string, unknown> | null;
};

type BuildSession = {
  id: string;
  lessonId: string | null;
  scenarioId: string | null;
  status: string;
  inputData: { description?: string } | null;
  agentOutputs: Record<string, unknown> | null;
  createdAt: string;
};

export default function BuildPage() {
  const [showNewSession, setShowNewSession] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    acssJsDump: "",
    containerGridCode: "",
  });
  const [result, setResult] = useState<any>(null);

  // Lesson/Scenario integration
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [selectedScenarioId, setSelectedScenarioId] = useState("");
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(
    null
  );

  // Session history
  const [recentSessions, setRecentSessions] = useState<BuildSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const copyJson = useCallback((json: Record<string, unknown>) => {
    navigator.clipboard.writeText(JSON.stringify(json, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const downloadJson = useCallback(
    (json: Record<string, unknown>, filename: string) => {
      const blob = new Blob([JSON.stringify(json, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    },
    []
  );

  const handleStartNew = useCallback(() => {
    setResult(null);
    setActiveSessionId(null);
    setFormData({ description: "", acssJsDump: "", containerGridCode: "" });
    setSelectedLessonId("");
    setSelectedScenarioId("");
    setSelectedScenario(null);
    setShowNewSession(true);
  }, []);

  const handleOpenSession = useCallback((session: BuildSession) => {
    const outputs = session.agentOutputs as {
      structure?: Record<string, unknown>;
    } | null;

    if (!outputs?.structure) return;

    setResult({ session, agentOutput: outputs.structure });
    setActiveSessionId(session.id);
    setShowNewSession(false);
  }, []);

  // Load lessons on mount
  useEffect(() => {
    fetch("/api/teaching/lessons")
      .then((r) => r.json())
      .then((data) => setLessons(data.lessons || []))
      .catch(console.error);

    fetch("/api/build/sessions")
      .then((r) => r.json())
      .then((data) => setRecentSessions((data.sessions || []).slice(0, 10)))
      .catch(console.error);
  }, []);

  // Load scenarios when lesson changes
  useEffect(() => {
    if (!selectedLessonId) {
      setScenarios([]);
      setSelectedScenarioId("");
      setSelectedScenario(null);
      return;
    }

    fetch(`/api/teaching/scenarios?lessonId=${selectedLessonId}`)
      .then((r) => r.json())
      .then((data) => {
        setScenarios(data.scenarios || []);
        setSelectedScenarioId("");
        setSelectedScenario(null);
      })
      .catch(console.error);
  }, [selectedLessonId]);

  // Auto-fill form when scenario changes
  useEffect(() => {
    if (!selectedScenarioId) {
      setSelectedScenario(null);
      return;
    }

    const scenario = scenarios.find((s) => s.id === selectedScenarioId);
    if (!scenario) return;

    setSelectedScenario(scenario);
    setFormData({
      description: formData.description,
      acssJsDump: scenario.acssJsDump
        ? JSON.stringify(scenario.acssJsDump, null, 2)
        : "",
      containerGridCode: scenario.correctContainerGridCode || "",
    });
  }, [selectedScenarioId, scenarios]);

  const handleCreateAndExecute = async () => {
    setLoading(true);
    setResult(null);
    setErrorMessage(null);

    try {
      let parsedAcss: Record<string, unknown> | undefined;
      if (formData.acssJsDump.trim()) {
        parsedAcss = JSON.parse(formData.acssJsDump);
      }

      const createResponse = await fetch("/api/build/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: selectedLessonId || null,
          scenarioId: selectedScenarioId || null,
          inputData: {
            description: formData.description,
            acssJsDump: parsedAcss,
            containerGridCode: formData.containerGridCode || undefined,
          },
        }),
      });

      if (!createResponse.ok) throw new Error("Failed to create session");

      const { session } = await createResponse.json();

      const executeResponse = await fetch(
        `/api/build/sessions/${session.id}/execute`,
        { method: "POST" }
      );

      if (!executeResponse.ok) throw new Error("Failed to execute agent");

      const executeResult = await executeResponse.json();
      setResult(executeResult);
      setActiveSessionId(session.id);
      setShowNewSession(false);

      // Refresh session history
      fetch("/api/build/sessions")
        .then((r) => r.json())
        .then((data) =>
          setRecentSessions((data.sessions || []).slice(0, 10))
        )
        .catch(console.error);
    } catch (error) {
      console.error("Error:", error);
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  // Cmd+Enter shortcut to execute build
  const executeRef = useRef(handleCreateAndExecute);
  executeRef.current = handleCreateAndExecute;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        if (showNewSession && formData.description && !loading) {
          e.preventDefault();
          executeRef.current();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showNewSession, formData.description, loading]);

  return (
    <div className="min-h-screen bg-[#0c0c0c]">
      {/* Header */}
      <div className="bg-[#161616] border-b border-[#2a2a2a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-[#f5f5f5] flex items-center gap-3">
                <Code2 className="w-10 h-10 text-teal-500" />
                Build System
              </h1>
              <p className="mt-2 text-[#a1a1a1]">
                Generate Bricks code with AI-powered structure agent
              </p>
            </div>
            <button
              onClick={() => setShowNewSession(!showNewSession)}
              className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-gray-950 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <PlusCircle className="w-5 h-5" />
              New Build Session
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* New Session Form */}
        {showNewSession && (
          <div className="bg-[#161616] rounded-lg border border-[#2a2a2a] p-8 mb-8">
            <h2 className="text-2xl font-bold text-[#f5f5f5] mb-6">
              Create Build Session
            </h2>

            <div className="space-y-6">
              {/* Lesson / Scenario selectors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-teal-500/5 rounded-lg border border-teal-500/20">
                <div>
                  <label className="block text-sm font-medium text-[#a1a1a1] mb-2">
                    <BookOpen className="w-4 h-4 inline mr-1" />
                    Lesson (optional)
                  </label>
                  <select
                    value={selectedLessonId}
                    onChange={(e) => setSelectedLessonId(e.target.value)}
                    className="w-full px-4 py-2 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg text-[#f5f5f5] focus:ring-2 focus:ring-teal-500/50 focus:outline-none"
                  >
                    <option value="">No lesson selected</option>
                    {lessons.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.title} ({l.category})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#a1a1a1] mb-2">
                    Scenario (optional)
                  </label>
                  <select
                    value={selectedScenarioId}
                    onChange={(e) => setSelectedScenarioId(e.target.value)}
                    disabled={!selectedLessonId}
                    className="w-full px-4 py-2 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg text-[#f5f5f5] focus:ring-2 focus:ring-teal-500/50 focus:outline-none disabled:opacity-50"
                  >
                    <option value="">No scenario selected</option>
                    {scenarios.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#a1a1a1] mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg text-[#f5f5f5] placeholder-[#666] focus:ring-2 focus:ring-teal-500/50 focus:outline-none"
                  placeholder="e.g., Hero section with heading and CTA button"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#a1a1a1] mb-2">
                  ACSS JS Dump (optional JSON)
                </label>
                <textarea
                  rows={6}
                  value={formData.acssJsDump}
                  onChange={(e) =>
                    setFormData({ ...formData, acssJsDump: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg text-[#f5f5f5] placeholder-[#666] focus:ring-2 focus:ring-teal-500/50 focus:outline-none font-mono text-sm"
                  placeholder='{"element": "div", "classes": ["container"]}'
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#a1a1a1] mb-2">
                  Container Grid Code (optional)
                </label>
                <textarea
                  rows={4}
                  value={formData.containerGridCode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      containerGridCode: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg text-[#f5f5f5] placeholder-[#666] focus:ring-2 focus:ring-teal-500/50 focus:outline-none font-mono text-sm"
                  placeholder=".container { max-width: 1200px; }"
                />
              </div>

              <button
                onClick={handleCreateAndExecute}
                disabled={loading || !formData.description}
                className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-gray-950 px-6 py-3 rounded-lg font-semibold disabled:opacity-50 transition-colors"
              >
                <Play className="w-5 h-5" />
                {loading ? "Executing..." : "Create & Execute"}
                {!loading && (
                  <kbd className="hidden sm:inline-block ml-2 px-1.5 py-0.5 text-xs bg-gray-950/20 rounded">
                    Cmd+Enter
                  </kbd>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Error Banner */}
        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-8 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-400">
                Build failed
              </p>
              <p className="text-sm text-red-400/80 mt-0.5">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-400/60 hover:text-red-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="space-y-6">
            <div className="bg-[#161616] rounded-lg border border-[#2a2a2a] p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-teal-500" />
                  <h2 className="text-2xl font-bold text-[#f5f5f5]">
                    Structure Agent Output
                  </h2>
                  {result.agentOutput.metadata.aiGenerated ? (
                    <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-xs font-medium rounded-full">
                      AI Generated
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-orange-500/10 text-orange-400 text-xs font-medium rounded-full">
                      Template Fallback
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyJson(result.agentOutput.structure)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#a1a1a1] border border-[#2a2a2a] rounded-lg hover:bg-[#1e1e1e] transition-colors"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    {copied ? "Copied" : "Copy JSON"}
                  </button>
                  <button
                    onClick={() =>
                      downloadJson(
                        result.agentOutput.structure,
                        "bricks-structure.json"
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#a1a1a1] border border-[#2a2a2a] rounded-lg hover:bg-[#1e1e1e] transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  {activeSessionId && (
                    <button
                      onClick={() => {
                        setResult(null);
                        setActiveSessionId(null);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#a1a1a1] border border-[#2a2a2a] rounded-lg hover:bg-[#1e1e1e] transition-colors"
                    >
                      <History className="w-4 h-4" />
                      All Sessions
                    </button>
                  )}
                  <button
                    onClick={handleStartNew}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-teal-400 border border-teal-500/30 rounded-lg hover:bg-teal-500/10 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    New Session
                  </button>
                </div>
              </div>

              {/* Confidence */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[#a1a1a1]">
                    Confidence Score
                  </span>
                  <span className="text-lg font-bold text-teal-500">
                    {(result.agentOutput.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-[#1e1e1e] rounded-full h-3">
                  <div
                    className="bg-teal-500 h-3 rounded-full transition-all"
                    style={{
                      width: `${result.agentOutput.confidence * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Reasoning */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-[#a1a1a1] mb-2">
                  Reasoning
                </h3>
                <ul className="space-y-1">
                  {result.agentOutput.reasoning.map(
                    (reason: string, i: number) => (
                      <li key={i} className="text-sm text-[#a1a1a1]">
                        - {reason}
                      </li>
                    )
                  )}
                </ul>
              </div>

              {/* Warnings */}
              {result.agentOutput.warnings.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-orange-400 mb-2">
                    Warnings
                  </h3>
                  <ul className="space-y-1">
                    {result.agentOutput.warnings.map(
                      (warning: string, i: number) => (
                        <li key={i} className="text-sm text-orange-400/80">
                          ! {warning}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}

              {/* Metadata */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-teal-500/10 rounded-lg p-4">
                  <div className="text-sm text-[#a1a1a1]">Elements</div>
                  <div className="text-2xl font-bold text-teal-500">
                    {result.agentOutput.metadata.elementsGenerated}
                  </div>
                </div>
                <div className="bg-blue-500/10 rounded-lg p-4">
                  <div className="text-sm text-[#a1a1a1]">References</div>
                  <div className="text-2xl font-bold text-blue-400">
                    {result.agentOutput.metadata.usedReferenceScenarios.length}
                  </div>
                </div>
                <div className="bg-green-500/10 rounded-lg p-4">
                  <div className="text-sm text-[#a1a1a1]">Execution</div>
                  <div className="text-2xl font-bold text-green-400">
                    {result.agentOutput.metadata.executionTime}ms
                  </div>
                </div>
              </div>

              {/* Side-by-side comparison when expected output exists */}
              {selectedScenario?.expectedOutput ? (
                <div>
                  <h3 className="text-sm font-medium text-[#a1a1a1] mb-3">
                    Comparison: Expected vs Generated
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs font-medium text-[#666] mb-1 uppercase">
                        Expected Output
                      </div>
                      <pre className="bg-[#1e1e1e] text-blue-400 p-4 rounded-lg overflow-x-auto text-sm font-mono max-h-96 overflow-y-auto">
                        {JSON.stringify(
                          selectedScenario.expectedOutput,
                          null,
                          2
                        )}
                      </pre>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-[#666] mb-1 uppercase">
                        Generated Output
                      </div>
                      <pre className="bg-[#1e1e1e] text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono max-h-96 overflow-y-auto">
                        {JSON.stringify(
                          result.agentOutput.structure,
                          null,
                          2
                        )}
                      </pre>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-sm font-medium text-[#a1a1a1] mb-2">
                    Generated Bricks Structure
                  </h3>
                  <pre className="bg-[#1e1e1e] text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono max-h-96 overflow-y-auto">
                    {JSON.stringify(result.agentOutput.structure, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Sessions */}
        {recentSessions.length > 0 && !showNewSession && !result && (
          <div className="space-y-6">
            <div className="bg-[#161616] rounded-lg border border-[#2a2a2a] p-8">
              <div className="flex items-center gap-3 mb-6">
                <History className="w-6 h-6 text-[#a1a1a1]" />
                <h2 className="text-xl font-bold text-[#f5f5f5]">
                  Recent Sessions
                </h2>
              </div>
              <div className="space-y-3">
                {recentSessions.map((session) => {
                  const structureOutput = session.agentOutputs as {
                    structure?: {
                      confidence?: number;
                      metadata?: { aiGenerated?: boolean };
                    };
                  } | null;
                  const confidence =
                    structureOutput?.structure?.confidence;
                  const aiGenerated =
                    structureOutput?.structure?.metadata?.aiGenerated;
                  const description =
                    (session.inputData as { description?: string } | null)
                      ?.description || "Untitled session";

                  const hasOutput = !!structureOutput?.structure;

                  return (
                    <button
                      key={session.id}
                      onClick={() => handleOpenSession(session)}
                      disabled={!hasOutput}
                      className={`w-full text-left flex items-center justify-between p-4 border rounded-lg transition-colors ${
                        hasOutput
                          ? "bg-[#1e1e1e] border-[#2a2a2a] hover:border-teal-500/30 cursor-pointer"
                          : "bg-[#1e1e1e] border-[#2a2a2a] opacity-60 cursor-default"
                      }`}
                    >
                      <div className="min-w-0 flex-1 mr-4">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-medium text-[#f5f5f5] truncate">
                            {description}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              session.status === "review"
                                ? "bg-blue-500/10 text-blue-400"
                                : session.status === "approved"
                                  ? "bg-green-500/10 text-green-400"
                                  : "bg-[#252525] text-[#666]"
                            }`}
                          >
                            {session.status}
                          </span>
                          {aiGenerated !== undefined && (
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                aiGenerated
                                  ? "bg-green-500/10 text-green-400"
                                  : "bg-orange-500/10 text-orange-400"
                              }`}
                            >
                              {aiGenerated ? "AI" : "Template"}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        {confidence !== undefined && (
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-[#252525] rounded-full h-1.5">
                              <div
                                className="bg-teal-500 h-1.5 rounded-full"
                                style={{
                                  width: `${confidence * 100}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm text-teal-500 font-medium w-10 text-right">
                              {(confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                        )}
                        <span className="text-xs text-[#666]">
                          {new Date(session.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!showNewSession && !result && recentSessions.length === 0 && (
          <div className="bg-[#161616] rounded-lg p-12 text-center border border-[#2a2a2a]">
            <Code2 className="w-16 h-16 text-[#666] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#f5f5f5] mb-2">
              No build sessions yet
            </h3>
            <p className="text-[#a1a1a1] mb-6">
              Create a new build session to start generating Bricks code
            </p>
            <button
              onClick={() => setShowNewSession(true)}
              className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-gray-950 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <PlusCircle className="w-5 h-5" />
              Create First Session
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
