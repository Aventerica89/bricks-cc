"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PlusCircle, BookOpen, Grid3x3, Monitor, Package, FileText } from "lucide-react";

type Lesson = {
  id: string;
  title: string;
  description: string | null;
  category: "container-grids" | "media-queries" | "plugin-resources" | "acss-docs";
  status: "draft" | "published" | "archived";
  orderIndex: number;
  createdAt: Date;
};

const categoryConfig = {
  "container-grids": {
    label: "Container Grids",
    icon: Grid3x3,
    color: "bg-purple-500",
  },
  "media-queries": {
    label: "Media Queries",
    icon: Monitor,
    color: "bg-blue-500",
  },
  "plugin-resources": {
    label: "Plugin Resources",
    icon: Package,
    color: "bg-green-500",
  },
  "acss-docs": {
    label: "ACSS Docs",
    icon: FileText,
    color: "bg-orange-500",
  },
};

export default function TeachingPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchLessons();
  }, [selectedCategory]);

  const fetchLessons = async () => {
    setLoading(true);
    try {
      const url = selectedCategory
        ? `/api/teaching/lessons?category=${selectedCategory}`
        : "/api/teaching/lessons";
      const response = await fetch(url);
      const data = await response.json();
      setLessons(data.lessons || []);
    } catch (error) {
      console.error("Error fetching lessons:", error);
    } finally {
      setLoading(false);
    }
  };

  const publishedLessons = lessons.filter((l) => l.status === "published");
  const draftLessons = lessons.filter((l) => l.status === "draft");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                <BookOpen className="w-10 h-10 text-purple-600" />
                Teaching System
              </h1>
              <p className="mt-2 text-gray-600">
                Build a comprehensive library of lessons to train Claude for perfect Bricks output
              </p>
            </div>
            <Link
              href="/teaching/lessons/new"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
            >
              <PlusCircle className="w-5 h-5" />
              Create Lesson
            </Link>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-3 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
              selectedCategory === null
                ? "bg-purple-600 text-white shadow-md"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            All Categories
          </button>
          {Object.entries(categoryConfig).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                  selectedCategory === key
                    ? `${config.color} text-white shadow-md`
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {config.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-sm text-gray-600">Published Lessons</div>
            <div className="text-3xl font-bold text-purple-600 mt-1">
              {publishedLessons.length}
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-sm text-gray-600">Draft Lessons</div>
            <div className="text-3xl font-bold text-orange-600 mt-1">
              {draftLessons.length}
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-sm text-gray-600">Total Lessons</div>
            <div className="text-3xl font-bold text-blue-600 mt-1">
              {lessons.length}
            </div>
          </div>
        </div>
      </div>

      {/* Lesson List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">Loading lessons...</p>
          </div>
        ) : lessons.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center shadow-sm">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No lessons yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first lesson to start teaching Claude
            </p>
            <Link
              href="/teaching/lessons/new"
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-all"
            >
              <PlusCircle className="w-5 h-5" />
              Create First Lesson
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.map((lesson) => {
              const config = categoryConfig[lesson.category];
              const Icon = config.icon;
              return (
                <Link
                  key={lesson.id}
                  href={`/teaching/lessons/${lesson.id}`}
                  className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-all border border-gray-200 hover:border-purple-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`${config.color} p-3 rounded-lg text-white`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        lesson.status === "published"
                          ? "bg-green-100 text-green-700"
                          : lesson.status === "draft"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {lesson.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {lesson.title}
                  </h3>
                  {lesson.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {lesson.description}
                    </p>
                  )}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <span className="text-xs text-gray-500">
                      {config.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
