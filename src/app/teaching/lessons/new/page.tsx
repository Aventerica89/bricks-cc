"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

export default function NewLessonPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "container-grids" as const,
    status: "draft" as const,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/teaching/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const { lesson } = await response.json();
        router.push(`/teaching/lessons/${lesson.id}`);
      } else {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        alert(`Failed to create lesson: ${errorData.error || "Unknown error"}\n${errorData.details ? JSON.stringify(errorData.details) : ""}`);
      }
    } catch (error) {
      console.error("Error creating lesson:", error);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0c0c]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/teaching"
            className="inline-flex items-center gap-2 text-teal-500 hover:text-teal-400 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Teaching System
          </Link>
          <h1 className="text-3xl font-bold text-[#f5f5f5]">Create New Lesson</h1>
          <p className="mt-2 text-[#a1a1a1]">
            Define a new teaching scenario for Claude to learn from
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-[#161616] rounded-lg border border-[#2a2a2a] p-8">
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-[#a1a1a1] mb-2"
              >
                Lesson Title *
              </label>
              <input
                id="title"
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-2 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg text-[#f5f5f5] placeholder-[#666] focus:ring-2 focus:ring-teal-500/50 focus:outline-none"
                placeholder="e.g., Basic Container Grid Setup"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-[#a1a1a1] mb-2"
              >
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-2 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg text-[#f5f5f5] placeholder-[#666] focus:ring-2 focus:ring-teal-500/50 focus:outline-none resize-none"
                placeholder="Describe what this lesson teaches..."
              />
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-[#a1a1a1] mb-2"
              >
                Category *
              </label>
              <select
                id="category"
                required
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value as typeof formData.category,
                  })
                }
                className="w-full px-4 py-2 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg text-[#f5f5f5] focus:ring-2 focus:ring-teal-500/50 focus:outline-none"
              >
                <option value="container-grids">Container Grids</option>
                <option value="media-queries">Media Queries</option>
                <option value="plugin-resources">Plugin Resources</option>
                <option value="acss-docs">ACSS Docs</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-[#a1a1a1] mb-2"
              >
                Status *
              </label>
              <select
                id="status"
                required
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as typeof formData.status,
                  })
                }
                className="w-full px-4 py-2 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg text-[#f5f5f5] focus:ring-2 focus:ring-teal-500/50 focus:outline-none"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-gray-950 px-6 py-3 rounded-lg font-semibold disabled:bg-[#2a2a2a] disabled:text-[#666] transition-colors"
            >
              <Save className="w-5 h-5" />
              {loading ? "Creating..." : "Create Lesson"}
            </button>
            <Link
              href="/teaching"
              className="px-6 py-3 border border-[#2a2a2a] rounded-lg font-semibold text-[#a1a1a1] hover:bg-[#1e1e1e] transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
