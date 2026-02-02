"use client";

import { useState } from "react";
import Link from "next/link";
import { PlusCircle, Play, Code2, Sparkles } from "lucide-react";

export default function BuildPage() {
  const [showNewSession, setShowNewSession] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    acssJsDump: "",
    containerGridCode: "",
  });
  const [result, setResult] = useState<any>(null);

  const handleCreateAndExecute = async () => {
    setLoading(true);
    setResult(null);

    try {
      // 1. Create build session
      const createResponse = await fetch("/api/build/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputData: {
            description: formData.description,
            acssJsDump: formData.acssJsDump
              ? JSON.parse(formData.acssJsDump)
              : undefined,
            containerGridCode: formData.containerGridCode,
          },
        }),
      });

      if (!createResponse.ok) {
        throw new Error("Failed to create session");
      }

      const { session } = await createResponse.json();

      // 2. Execute structure agent
      const executeResponse = await fetch(
        `/api/build/sessions/${session.id}/execute`,
        {
          method: "POST",
        }
      );

      if (!executeResponse.ok) {
        throw new Error("Failed to execute agent");
      }

      const executeResult = await executeResponse.json();
      setResult(executeResult);
      setShowNewSession(false);
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
            {/* Agent Output */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Structure Agent Output
                </h2>
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
                  ></div>
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
                        • {reason}
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
                          ⚠ {warning}
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

              {/* Generated Structure */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Generated Bricks Structure
                </h3>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                  {JSON.stringify(result.agentOutput.structure, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!showNewSession && !result && (
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
