"use client";

import { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Trash2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface Scenario {
  id: string;
  lessonId: string;
  name: string;
  acssJsDump: Record<string, unknown> | null;
  screenshotBeforeUrl: string | null;
  screenshotAfterUrl: string | null;
  correctContainerGridCode: string | null;
  cssHandlingRules: Record<string, unknown> | null;
  validationRules: Record<string, unknown> | null;
  expectedOutput: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export default function ScenarioDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Form state — JSON fields stored as strings for editing
  const [form, setForm] = useState({
    name: "",
    acssJsDump: "",
    correctContainerGridCode: "",
    expectedOutput: "",
    cssHandlingRules: "",
    validationRules: "",
    screenshotBeforeUrl: "",
    screenshotAfterUrl: "",
  });

  const [jsonErrors, setJsonErrors] = useState<Record<string, string>>({});

  const showNotification = useCallback(
    (type: "success" | "error", message: string) => {
      setNotification({ type, message });
      setTimeout(() => setNotification(null), 3000);
    },
    []
  );

  useEffect(() => {
    fetch(`/api/teaching/scenarios/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then(({ scenario: s }) => {
        setScenario(s);
        setForm({
          name: s.name || "",
          acssJsDump: s.acssJsDump
            ? JSON.stringify(s.acssJsDump, null, 2)
            : "",
          correctContainerGridCode: s.correctContainerGridCode || "",
          expectedOutput: s.expectedOutput
            ? JSON.stringify(s.expectedOutput, null, 2)
            : "",
          cssHandlingRules: s.cssHandlingRules
            ? JSON.stringify(s.cssHandlingRules, null, 2)
            : "",
          validationRules: s.validationRules
            ? JSON.stringify(s.validationRules, null, 2)
            : "",
          screenshotBeforeUrl: s.screenshotBeforeUrl || "",
          screenshotAfterUrl: s.screenshotAfterUrl || "",
        });
      })
      .catch(() => router.push("/teaching"))
      .finally(() => setLoading(false));
  }, [id, router]);

  const validateJson = (value: string, field: string): boolean => {
    if (!value.trim()) {
      setJsonErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
      return true;
    }
    try {
      JSON.parse(value);
      setJsonErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
      return true;
    } catch {
      setJsonErrors((prev) => ({
        ...prev,
        [field]: "Invalid JSON",
      }));
      return false;
    }
  };

  const handleSave = async () => {
    // Validate all JSON fields
    const jsonFields = [
      "acssJsDump",
      "expectedOutput",
      "cssHandlingRules",
      "validationRules",
    ] as const;

    let hasErrors = false;
    for (const field of jsonFields) {
      if (!validateJson(form[field], field)) {
        hasErrors = true;
      }
    }

    if (hasErrors) {
      showNotification("error", "Fix JSON errors before saving");
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: form.name,
        correctContainerGridCode:
          form.correctContainerGridCode || null,
        screenshotBeforeUrl: form.screenshotBeforeUrl || null,
        screenshotAfterUrl: form.screenshotAfterUrl || null,
        acssJsDump: form.acssJsDump.trim()
          ? JSON.parse(form.acssJsDump)
          : null,
        expectedOutput: form.expectedOutput.trim()
          ? JSON.parse(form.expectedOutput)
          : null,
        cssHandlingRules: form.cssHandlingRules.trim()
          ? JSON.parse(form.cssHandlingRules)
          : null,
        validationRules: form.validationRules.trim()
          ? JSON.parse(form.validationRules)
          : null,
      };

      const response = await fetch(`/api/teaching/scenarios/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setScenario(data.scenario);
        showNotification("success", "Scenario saved");
      } else {
        const error = await response.json();
        showNotification("error", error.error || "Failed to save");
      }
    } catch (error) {
      console.error("Save error:", error);
      showNotification("error", "An error occurred while saving");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this scenario? This cannot be undone.")) return;

    try {
      const response = await fetch(`/api/teaching/scenarios/${id}`, {
        method: "DELETE",
      });

      if (response.ok && scenario) {
        router.push(`/teaching/lessons/${scenario.lessonId}`);
      } else {
        showNotification("error", "Failed to delete scenario");
      }
    } catch {
      showNotification("error", "An error occurred");
    }
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500" />
      </div>
    );
  }

  if (!scenario) return null;

  return (
    <div className="min-h-screen bg-[#0c0c0c]">
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-16 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
            notification.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="bg-[#161616] border-b border-[#2a2a2a]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href={`/teaching/lessons/${scenario.lessonId}`}
            className="inline-flex items-center gap-2 text-teal-500 hover:text-teal-400 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Lesson</span>
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#f5f5f5]">
                Edit Scenario
              </h1>
              <p className="text-sm text-[#666] mt-1">
                Fill in training data for this scenario
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim()}
                className="inline-flex items-center gap-2 bg-teal-500 text-gray-950 px-5 py-2 rounded-lg text-sm font-medium hover:bg-teal-600 disabled:opacity-50 transition-colors"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Name */}
          <FormSection title="Scenario Name">
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              className="w-full px-4 py-2.5 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg text-[#f5f5f5] placeholder-[#666] focus:ring-2 focus:ring-teal-500/50 focus:outline-none"
              placeholder="e.g., Hero section with 3-column grid"
            />
          </FormSection>

          {/* ACSS JS Dump */}
          <FormSection
            title="ACSS JS Dump"
            description="Paste the JSON output from the ACSS JavaScript inspector"
            error={jsonErrors.acssJsDump}
          >
            <textarea
              rows={10}
              value={form.acssJsDump}
              onChange={(e) => updateField("acssJsDump", e.target.value)}
              onBlur={() => validateJson(form.acssJsDump, "acssJsDump")}
              className={`w-full px-4 py-2.5 bg-[#1e1e1e] border rounded-lg text-[#f5f5f5] placeholder-[#666] focus:ring-2 focus:ring-teal-500/50 focus:outline-none font-mono text-sm ${
                jsonErrors.acssJsDump
                  ? "border-red-500/50"
                  : "border-[#2a2a2a]"
              }`}
              placeholder='{"variables": {...}, "breakpoints": {...}}'
            />
          </FormSection>

          {/* Container Grid Code */}
          <FormSection
            title="Container Grid Code"
            description="CSS for the container/grid structure"
          >
            <textarea
              rows={6}
              value={form.correctContainerGridCode}
              onChange={(e) =>
                updateField("correctContainerGridCode", e.target.value)
              }
              className="w-full px-4 py-2.5 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg text-[#f5f5f5] placeholder-[#666] focus:ring-2 focus:ring-teal-500/50 focus:outline-none font-mono text-sm"
              placeholder={`.container {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: var(--space-l);\n}`}
            />
          </FormSection>

          {/* Expected Output */}
          <FormSection
            title="Expected Output"
            description="The correct Bricks JSON structure this scenario should produce"
            error={jsonErrors.expectedOutput}
          >
            <textarea
              rows={12}
              value={form.expectedOutput}
              onChange={(e) =>
                updateField("expectedOutput", e.target.value)
              }
              onBlur={() =>
                validateJson(form.expectedOutput, "expectedOutput")
              }
              className={`w-full px-4 py-2.5 bg-[#1e1e1e] border rounded-lg text-[#f5f5f5] placeholder-[#666] focus:ring-2 focus:ring-teal-500/50 focus:outline-none font-mono text-sm ${
                jsonErrors.expectedOutput
                  ? "border-red-500/50"
                  : "border-[#2a2a2a]"
              }`}
              placeholder='{"id": "abc", "name": "container", "settings": {...}, "children": [...]}'
            />
          </FormSection>

          {/* CSS Handling Rules */}
          <FormSection
            title="CSS Handling Rules"
            description="JSON rules for how CSS should be processed"
            error={jsonErrors.cssHandlingRules}
          >
            <textarea
              rows={6}
              value={form.cssHandlingRules}
              onChange={(e) =>
                updateField("cssHandlingRules", e.target.value)
              }
              onBlur={() =>
                validateJson(form.cssHandlingRules, "cssHandlingRules")
              }
              className={`w-full px-4 py-2.5 bg-[#1e1e1e] border rounded-lg text-[#f5f5f5] placeholder-[#666] focus:ring-2 focus:ring-teal-500/50 focus:outline-none font-mono text-sm ${
                jsonErrors.cssHandlingRules
                  ? "border-red-500/50"
                  : "border-[#2a2a2a]"
              }`}
              placeholder='{"useAcssClasses": true, "inlineStyles": false}'
            />
          </FormSection>

          {/* Validation Rules */}
          <FormSection
            title="Validation Rules"
            description="JSON rules to validate the generated output"
            error={jsonErrors.validationRules}
          >
            <textarea
              rows={6}
              value={form.validationRules}
              onChange={(e) =>
                updateField("validationRules", e.target.value)
              }
              onBlur={() =>
                validateJson(form.validationRules, "validationRules")
              }
              className={`w-full px-4 py-2.5 bg-[#1e1e1e] border rounded-lg text-[#f5f5f5] placeholder-[#666] focus:ring-2 focus:ring-teal-500/50 focus:outline-none font-mono text-sm ${
                jsonErrors.validationRules
                  ? "border-red-500/50"
                  : "border-[#2a2a2a]"
              }`}
              placeholder='{"requiredElements": ["container", "section"], "maxDepth": 5}'
            />
          </FormSection>

          {/* Screenshot URLs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormSection title="Screenshot Before URL">
              <input
                type="text"
                value={form.screenshotBeforeUrl}
                onChange={(e) =>
                  updateField("screenshotBeforeUrl", e.target.value)
                }
                className="w-full px-4 py-2.5 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg text-[#f5f5f5] placeholder-[#666] focus:ring-2 focus:ring-teal-500/50 focus:outline-none text-sm"
                placeholder="https://..."
              />
            </FormSection>
            <FormSection title="Screenshot After URL">
              <input
                type="text"
                value={form.screenshotAfterUrl}
                onChange={(e) =>
                  updateField("screenshotAfterUrl", e.target.value)
                }
                className="w-full px-4 py-2.5 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg text-[#f5f5f5] placeholder-[#666] focus:ring-2 focus:ring-teal-500/50 focus:outline-none text-sm"
                placeholder="https://..."
              />
            </FormSection>
          </div>
        </div>

        {/* Bottom save bar */}
        <div className="mt-8 pt-6 border-t border-[#2a2a2a] flex justify-end gap-3">
          <Link
            href={`/teaching/lessons/${scenario.lessonId}`}
            className="px-5 py-2.5 text-sm font-medium text-[#a1a1a1] border border-[#2a2a2a] rounded-lg hover:bg-[#1e1e1e] transition-colors"
          >
            Cancel
          </Link>
          <button
            onClick={handleSave}
            disabled={saving || !form.name.trim()}
            className="inline-flex items-center gap-2 bg-teal-500 text-gray-950 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-teal-600 disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Scenario"}
          </button>
        </div>
      </div>
    </div>
  );
}

function FormSection({
  title,
  description,
  error,
  children,
}: {
  title: string;
  description?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#161616] rounded-xl border border-[#2a2a2a] p-6">
      <div className="mb-3">
        <label className="block text-sm font-semibold text-[#f5f5f5]">
          {title}
        </label>
        {description && (
          <p className="text-xs text-[#666] mt-0.5">{description}</p>
        )}
      </div>
      {children}
      {error && (
        <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}
