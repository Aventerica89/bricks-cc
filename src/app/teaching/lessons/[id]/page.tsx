"use client";

import { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Trash2,
  Plus,
  Edit2,
  X,
  Grid3x3,
  Monitor,
  Package,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  category: string;
  status: string;
  orderIndex: number;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Scenario {
  id: string;
  lessonId: string;
  name: string;
  acssJsDump: Record<string, unknown> | null;
  expectedOutput: Record<string, unknown> | null;
  correctContainerGridCode: string | null;
  cssHandlingRules: Record<string, unknown> | null;
  validationRules: Record<string, unknown> | null;
  createdAt: string;
}

const categoryConfig: Record<
  string,
  { label: string; icon: typeof Grid3x3; color: string; bgColor: string }
> = {
  "container-grids": {
    label: "Container Grids",
    icon: Grid3x3,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
  },
  "media-queries": {
    label: "Media Queries",
    icon: Monitor,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
  },
  "plugin-resources": {
    label: "Plugin Resources",
    icon: Package,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
  },
  "acss-docs": {
    label: "ACSS Docs",
    icon: FileText,
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
  },
};

export default function LessonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showAddScenario, setShowAddScenario] = useState(false);
  const [newScenarioName, setNewScenarioName] = useState("");
  const [addingScenario, setAddingScenario] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "container-grids",
    status: "draft",
  });

  const showNotification = useCallback(
    (type: "success" | "error", message: string) => {
      setNotification({ type, message });
      setTimeout(() => setNotification(null), 3000);
    },
    []
  );

  const fetchLesson = useCallback(async () => {
    try {
      const response = await fetch(`/api/teaching/lessons/${id}`);
      if (response.ok) {
        const data = await response.json();
        setLesson(data.lesson);
        setFormData({
          title: data.lesson.title,
          description: data.lesson.description || "",
          category: data.lesson.category,
          status: data.lesson.status,
        });
      } else if (response.status === 404) {
        router.push("/teaching");
      }
    } catch (error) {
      console.error("Error fetching lesson:", error);
      showNotification("error", "Failed to load lesson");
    } finally {
      setLoading(false);
    }
  }, [id, router, showNotification]);

  const fetchScenarios = useCallback(async () => {
    try {
      const response = await fetch(`/api/teaching/scenarios?lessonId=${id}`);
      if (response.ok) {
        const data = await response.json();
        setScenarios(data.scenarios || []);
      }
    } catch (error) {
      console.error("Error fetching scenarios:", error);
    }
  }, [id]);

  useEffect(() => {
    fetchLesson();
    fetchScenarios();
  }, [fetchLesson, fetchScenarios]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/teaching/lessons/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setLesson(data.lesson);
        setEditing(false);
        showNotification("success", "Lesson saved successfully");
      } else {
        const error = await response.json();
        showNotification("error", error.error || "Failed to save");
      }
    } catch (error) {
      console.error("Error saving lesson:", error);
      showNotification("error", "An error occurred while saving");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to archive this lesson?")) return;

    try {
      const response = await fetch(`/api/teaching/lessons/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/teaching");
      } else {
        const error = await response.json();
        showNotification("error", error.error || "Failed to archive");
      }
    } catch (error) {
      console.error("Error archiving lesson:", error);
      showNotification("error", "An error occurred");
    }
  };

  const handleAddScenario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScenarioName.trim()) return;

    setAddingScenario(true);
    try {
      const response = await fetch("/api/teaching/scenarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: id,
          name: newScenarioName.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setScenarios((prev) => [...prev, data.scenario]);
        setNewScenarioName("");
        setShowAddScenario(false);
        showNotification("success", "Scenario created successfully");
      } else {
        const error = await response.json();
        showNotification("error", error.error || "Failed to create scenario");
      }
    } catch (error) {
      console.error("Error creating scenario:", error);
      showNotification("error", "An error occurred");
    } finally {
      setAddingScenario(false);
    }
  };

  const getCategoryConfig = (category: string) => {
    return (
      categoryConfig[category] || {
        label: category,
        icon: FileText,
        color: "text-[#a1a1a1]",
        bgColor: "bg-[#1e1e1e]",
      }
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-green-500/10 text-green-400">
            <CheckCircle className="w-3.5 h-3.5" />
            Published
          </span>
        );
      case "draft":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-teal-500/10 text-teal-400">
            <Clock className="w-3.5 h-3.5" />
            Draft
          </span>
        );
      case "archived":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-[#1e1e1e] text-[#666]">
            <AlertCircle className="w-3.5 h-3.5" />
            Archived
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-4 text-[#a1a1a1]">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-[#666] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#f5f5f5] mb-2">
            Lesson not found
          </h2>
          <p className="text-[#a1a1a1] mb-6">
            This lesson may have been deleted or doesn&apos;t exist.
          </p>
          <Link
            href="/teaching"
            className="inline-flex items-center gap-2 text-teal-500 hover:text-teal-400 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Teaching System
          </Link>
        </div>
      </div>
    );
  }

  const config = getCategoryConfig(lesson.category);
  const CategoryIcon = config.icon;

  return (
    <div className="min-h-screen bg-[#0c0c0c]">
      {/* Notification Toast */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/teaching"
            className="inline-flex items-center gap-2 text-[#a1a1a1] hover:text-teal-500 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Teaching System</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={`${config.bgColor} p-3 rounded-xl`}>
                <CategoryIcon className={`w-8 h-8 ${config.color}`} />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-[#f5f5f5]">
                    {lesson.title}
                  </h1>
                  {getStatusBadge(lesson.status)}
                </div>
                <p className="text-[#a1a1a1]">{config.label}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setEditing(!editing)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#a1a1a1] border border-[#2a2a2a] rounded-lg hover:bg-[#1e1e1e] transition-colors"
              >
                {editing ? (
                  <>
                    <X className="w-4 h-4" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </>
                )}
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Archive
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Edit Form or Description */}
            {editing ? (
              <div className="bg-[#161616] rounded-xl border border-[#2a2a2a] p-6">
                <h2 className="text-lg font-semibold text-[#f5f5f5] mb-6">
                  Edit Lesson
                </h2>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-[#a1a1a1] mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full px-4 py-2.5 text-[#f5f5f5] bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg focus:ring-2 focus:ring-teal-500/50 focus:outline-none"
                      placeholder="Enter lesson title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#a1a1a1] mb-2">
                      Description
                    </label>
                    <textarea
                      rows={4}
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      className="w-full px-4 py-2.5 text-[#f5f5f5] bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg focus:ring-2 focus:ring-teal-500/50 focus:outline-none resize-none"
                      placeholder="Describe what this lesson teaches..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#a1a1a1] mb-2">
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                        className="w-full px-4 py-2.5 text-[#f5f5f5] bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg focus:ring-2 focus:ring-teal-500/50 focus:outline-none"
                      >
                        <option value="container-grids">Container Grids</option>
                        <option value="media-queries">Media Queries</option>
                        <option value="plugin-resources">Plugin Resources</option>
                        <option value="acss-docs">ACSS Docs</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#a1a1a1] mb-2">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) =>
                          setFormData({ ...formData, status: e.target.value })
                        }
                        className="w-full px-4 py-2.5 text-[#f5f5f5] bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg focus:ring-2 focus:ring-teal-500/50 focus:outline-none"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-gray-950 px-6 py-2.5 rounded-lg font-medium disabled:bg-[#2a2a2a] disabled:text-[#666] transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#161616] rounded-xl border border-[#2a2a2a] p-6">
                <h2 className="text-lg font-semibold text-[#f5f5f5] mb-4">
                  Description
                </h2>
                <p className="text-[#a1a1a1] leading-relaxed">
                  {lesson.description || "No description provided."}
                </p>
              </div>
            )}

            {/* Scenarios Section */}
            <div className="bg-[#161616] rounded-xl border border-[#2a2a2a] p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-[#f5f5f5]">
                    Scenarios
                  </h2>
                  <p className="text-sm text-[#666] mt-0.5">
                    Define teaching examples for this lesson
                  </p>
                </div>
                <button
                  onClick={() => setShowAddScenario(true)}
                  className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-gray-950 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Scenario
                </button>
              </div>

              {/* Add Scenario Form */}
              {showAddScenario && (
                <form
                  onSubmit={handleAddScenario}
                  className="mb-6 p-4 bg-teal-500/5 border border-teal-500/20 rounded-lg"
                >
                  <label className="block text-sm font-medium text-[#a1a1a1] mb-2">
                    Scenario Name
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newScenarioName}
                      onChange={(e) => setNewScenarioName(e.target.value)}
                      placeholder="e.g., Basic grid with 3 columns"
                      className="flex-1 px-4 py-2 text-[#f5f5f5] bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg focus:ring-2 focus:ring-teal-500/50 focus:outline-none placeholder-[#666]"
                      autoFocus
                    />
                    <button
                      type="submit"
                      disabled={addingScenario || !newScenarioName.trim()}
                      className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-gray-950 px-4 py-2 rounded-lg text-sm font-medium disabled:bg-[#2a2a2a] disabled:text-[#666] transition-colors"
                    >
                      {addingScenario ? "Creating..." : "Create"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddScenario(false);
                        setNewScenarioName("");
                      }}
                      className="px-4 py-2 text-[#a1a1a1] hover:text-[#f5f5f5] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Scenarios List */}
              {scenarios.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="w-16 h-16 bg-[#1e1e1e] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-8 h-8 text-[#666]" />
                  </div>
                  <p className="text-[#a1a1a1] font-medium mb-1">
                    No scenarios yet
                  </p>
                  <p className="text-sm text-[#666]">
                    Add scenarios to define specific teaching examples
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {scenarios.map((scenario) => {
                    const fields = [
                      { key: "acssJsDump", label: "ACSS" },
                      { key: "expectedOutput", label: "Expected" },
                      { key: "correctContainerGridCode", label: "Grid" },
                    ] as const;
                    return (
                      <Link
                        key={scenario.id}
                        href={`/teaching/scenarios/${scenario.id}`}
                        className="block p-4 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg hover:border-teal-500/30 transition-colors group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-[#f5f5f5] group-hover:text-teal-400">
                            {scenario.name}
                          </h3>
                          <span className="text-xs text-[#666]">
                            {new Date(scenario.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex gap-3">
                          {fields.map(({ key, label }) => {
                            const filled = Boolean(scenario[key]);
                            return (
                              <span
                                key={key}
                                className={`inline-flex items-center gap-1 text-xs ${
                                  filled
                                    ? "text-green-400"
                                    : "text-[#666]"
                                }`}
                              >
                                <span
                                  className={`w-2 h-2 rounded-full ${
                                    filled ? "bg-green-500" : "bg-[#2a2a2a]"
                                  }`}
                                />
                                {label}
                              </span>
                            );
                          })}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-[#161616] rounded-xl border border-[#2a2a2a] p-6">
              <h3 className="text-sm font-semibold text-[#f5f5f5] uppercase tracking-wider mb-4">
                Details
              </h3>
              <dl className="space-y-4">
                <div>
                  <dt className="text-xs text-[#666] uppercase tracking-wider">
                    Status
                  </dt>
                  <dd className="mt-1">{getStatusBadge(lesson.status)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-[#666] uppercase tracking-wider">
                    Category
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-[#f5f5f5]">
                    {config.label}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[#666] uppercase tracking-wider">
                    Scenarios
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-[#f5f5f5]">
                    {scenarios.length}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[#666] uppercase tracking-wider">
                    Created
                  </dt>
                  <dd className="mt-1 text-sm text-[#a1a1a1]">
                    {new Date(lesson.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[#666] uppercase tracking-wider">
                    Last Updated
                  </dt>
                  <dd className="mt-1 text-sm text-[#a1a1a1]">
                    {new Date(lesson.updatedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="bg-teal-500/5 rounded-xl border border-teal-500/20 p-6">
              <h3 className="text-sm font-semibold text-teal-400 mb-2">
                Pro Tip
              </h3>
              <p className="text-sm text-[#a1a1a1] leading-relaxed">
                Add multiple scenarios to help Claude understand different
                variations and edge cases for this lesson.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
