"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2, Plus, Edit2 } from "lucide-react";

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
  createdAt: string;
}

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
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "container-grids",
    status: "draft",
  });

  useEffect(() => {
    fetchLesson();
    fetchScenarios();
  }, [id]);

  const fetchLesson = async () => {
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
    } finally {
      setLoading(false);
    }
  };

  const fetchScenarios = async () => {
    try {
      const response = await fetch(`/api/teaching/scenarios?lessonId=${id}`);
      if (response.ok) {
        const data = await response.json();
        setScenarios(data.scenarios || []);
      }
    } catch (error) {
      console.error("Error fetching scenarios:", error);
    }
  };

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
      } else {
        const error = await response.json();
        alert(`Failed to save: ${error.error}`);
      }
    } catch (error) {
      console.error("Error saving lesson:", error);
      alert("An error occurred while saving");
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
        alert(`Failed to archive: ${error.error}`);
      }
    } catch (error) {
      console.error("Error archiving lesson:", error);
      alert("An error occurred");
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      "container-grids": "Container Grids",
      "media-queries": "Media Queries",
      "plugin-resources": "Plugin Resources",
      "acss-docs": "ACSS Docs",
    };
    return labels[category] || category;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "archived":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Lesson not found</h2>
          <Link href="/teaching" className="text-purple-600 hover:underline mt-4 block">
            Back to Teaching System
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/teaching"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Teaching System
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">{lesson.title}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(lesson.status)}`}>
                  {lesson.status}
                </span>
              </div>
              <p className="mt-2 text-gray-600">
                {getCategoryLabel(lesson.category)}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(!editing)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Edit2 className="w-4 h-4" />
                {editing ? "Cancel" : "Edit"}
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
                Archive
              </button>
            </div>
          </div>
        </div>

        {/* Edit Form or Details */}
        {editing ? (
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-xl font-semibold mb-6">Edit Lesson</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="container-grids">Container Grids</option>
                    <option value="media-queries">Media Queries</option>
                    <option value="plugin-resources">Plugin Resources</option>
                    <option value="acss-docs">ACSS Docs</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <p className="text-gray-600">
              {lesson.description || "No description provided."}
            </p>
            <div className="mt-6 pt-6 border-t border-gray-200 text-sm text-gray-500">
              <p>Created: {new Date(lesson.createdAt).toLocaleDateString()}</p>
              <p>Last updated: {new Date(lesson.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
        )}

        {/* Scenarios Section */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Scenarios</h2>
            <button className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
              <Plus className="w-4 h-4" />
              Add Scenario
            </button>
          </div>

          {scenarios.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No scenarios yet.</p>
              <p className="text-sm mt-2">
                Add scenarios to define specific teaching examples for this lesson.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {scenarios.map((scenario) => (
                <div
                  key={scenario.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 cursor-pointer"
                >
                  <h3 className="font-medium">{scenario.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Created: {new Date(scenario.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
