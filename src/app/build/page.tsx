"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Play, Code2, Sparkles, BookOpen, History } from "lucide-react";

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
      alert("An error occurred. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                <Code2 className="w-10 h-10 text-purple-600" />
                Build System
              </h1>
              <p className="mt-2 text-gray-600">
                Generate Bricks code with AI-powered structure agent
              </p>
            </div>
            <button
              onClick={() => setShowNewSession(!showNewSession)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
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
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Create Build Session
            </h2>

            <div className="space-y-6">
              {/* Lesson / Scenario selectors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-purple-50 rounded-lg border border-purple-100">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <BookOpen className="w-4 h-4 inline mr-1" />
                    Lesson (optional)
                  </label>
                  <select
                    value={selectedLessonId}
                    onChange={(e) => setSelectedLessonId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scenario (optional)
                  </label>
                  <select
                    value={selectedScenarioId}
                    onChange={(e) => setSelectedScenarioId(e.target.value)}
                    disabled={!selectedLessonId}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white disabled:opacity-50"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Hero section with heading and CTA button"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ACSS JS Dump (optional JSON)
                </label>
                <textarea
                  rows={6}
                  value={formData.acssJsDump}
                  onChange={(e) =>
                    setFormData({ ...formData, acssJsDump: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                  placeholder='{"element": "div", "classes": ["container"]}'
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                  placeholder=".container { max-width: 1200px; }"
                />
              </div>

              <button
                onClick={handleCreateAndExecute}
                disabled={loading || !formData.description}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-600 disabled:opacity-50 transition-all shadow-lg"
              >
                <Play className="w-5 h-5" />
                {loading ? "Executing..." : "Create & Execute"}
              </button>
            </div>
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Structure Agent Output
                </h2>
                {result.agentOutput.metadata.aiGenerated && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    AI Generated
                  </span>
                )}
                {!result.agentOutput.metadata.aiGenerated && (
                  <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                    Template Fallback
                  </span>
                )}
              </div>

              {/* Confidence */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Confidence Score
                  </span>
                  <span className="text-lg font-bold text-purple-600">
                    {(result.agentOutput.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-pink-500 h-3 rounded-full transition-all"
                    style={{
                      width: `${result.agentOutput.confidence * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Reasoning */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Reasoning
                </h3>
                <ul className="space-y-1">
                  {result.agentOutput.reasoning.map(
                    (reason: string, i: number) => (
                      <li key={i} className="text-sm text-gray-600">
                        - {reason}
                      </li>
                    )
                  )}
                </ul>
              </div>

              {/* Warnings */}
              {result.agentOutput.warnings.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-orange-700 mb-2">
                    Warnings
                  </h3>
                  <ul className="space-y-1">
                    {result.agentOutput.warnings.map(
                      (warning: string, i: number) => (
                        <li key={i} className="text-sm text-orange-600">
                          ! {warning}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}

              {/* Metadata */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">Elements</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {result.agentOutput.metadata.elementsGenerated}
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">References</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {result.agentOutput.metadata.usedReferenceScenarios.length}
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">Execution</div>
                  <div className="text-2xl font-bold text-green-600">
                    {result.agentOutput.metadata.executionTime}ms
                  </div>
                </div>
              </div>

              {/* Side-by-side comparison when expected output exists */}
              {selectedScenario?.expectedOutput ? (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Comparison: Expected vs Generated
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-1 uppercase">
                        Expected Output
                      </div>
                      <pre className="bg-gray-900 text-blue-400 p-4 rounded-lg overflow-x-auto text-sm font-mono max-h-96 overflow-y-auto">
                        {JSON.stringify(
                          selectedScenario.expectedOutput,
                          null,
                          2
                        )}
                      </pre>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-1 uppercase">
                        Generated Output
                      </div>
                      <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono max-h-96 overflow-y-auto">
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
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Generated Bricks Structure
                  </h3>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono max-h-96 overflow-y-auto">
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
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <History className="w-6 h-6 text-gray-600" />
                <h2 className="text-xl font-bold text-gray-900">
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

                  return (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg"
                    >
                      <div>
                        <span className="text-sm font-medium text-gray-900">
                          {session.id.slice(0, 20)}...
                        </span>
                        <span
                          className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                            session.status === "review"
                              ? "bg-blue-100 text-blue-700"
                              : session.status === "approved"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {session.status}
                        </span>
                        {aiGenerated !== undefined && (
                          <span
                            className={`ml-1 text-xs px-2 py-0.5 rounded-full ${
                              aiGenerated
                                ? "bg-green-100 text-green-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {aiGenerated ? "AI" : "Template"}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        {confidence !== undefined && (
                          <span className="text-sm text-purple-600 font-medium">
                            {(confidence * 100).toFixed(0)}%
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          {new Date(session.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!showNewSession && !result && recentSessions.length === 0 && (
          <div className="bg-white rounded-lg p-12 text-center shadow-sm">
            <Code2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No build sessions yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create a new build session to start generating Bricks code
            </p>
            <button
              onClick={() => setShowNewSession(true)}
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-all"
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
