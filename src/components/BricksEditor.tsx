"use client";

import { useState, useEffect } from "react";
import {
  Layout,
  RefreshCw,
  Eye,
  Edit3,
  Loader2,
  AlertCircle,
  Check,
  Type,
  Image,
  Square,
  Layers,
} from "lucide-react";
import type { BricksPageState, BricksElement } from "@/types/bricks";

interface BricksEditorProps {
  siteId: string;
  pageId: number;
  readOnly?: boolean;
  onEdit?: (edits: Array<{ elementId: string; property: string; value: unknown }>) => void;
}

export default function BricksEditor({
  siteId,
  pageId,
  readOnly = false,
  onEdit,
}: BricksEditorProps) {
  const [pageState, setPageState] = useState<BricksPageState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedElement, setSelectedElement] = useState<BricksElement | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadPageData();
  }, [siteId, pageId]);

  const loadPageData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/bricks?siteId=${siteId}&pageId=${pageId}`
      );
      if (!response.ok) {
        throw new Error("Failed to load page data");
      }
      const data = await response.json();
      setPageState(data.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load page");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/bricks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteId,
          pageId,
          action: "refresh",
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setPageState(data.page);
      }
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-500">{error}</p>
        <button
          onClick={loadPageData}
          className="mt-4 text-primary-600 hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!pageState) {
    return (
      <div className="text-center py-12 text-gray-500">
        No page data available
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Layout className="w-5 h-5 text-primary-600" />
          <div>
            <h2 className="font-semibold text-gray-800">
              {pageState.pageTitle}
            </h2>
            <p className="text-sm text-gray-500">
              {pageState.elements.length} elements
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          {!readOnly && (
            <button className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors">
              <Eye className="w-4 h-4" />
              Preview
            </button>
          )}
        </div>
      </div>

      <div className="flex">
        {/* Elements Tree */}
        <div className="w-1/3 border-r border-gray-200 p-4 max-h-[500px] overflow-y-auto">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Page Elements
          </h3>
          <div className="space-y-1">
            {pageState.elements.map((element) => (
              <ElementTreeItem
                key={element.id}
                element={element}
                isSelected={selectedElement?.id === element.id}
                onClick={() => setSelectedElement(element)}
              />
            ))}
          </div>
        </div>

        {/* Element Details */}
        <div className="flex-1 p-4">
          {selectedElement ? (
            <ElementDetails
              element={selectedElement}
              readOnly={readOnly}
              onUpdate={(updates) => {
                if (onEdit) {
                  onEdit(
                    Object.entries(updates).map(([property, value]) => ({
                      elementId: selectedElement.id,
                      property,
                      value,
                    }))
                  );
                }
              }}
            />
          ) : (
            <div className="text-center py-12 text-gray-500">
              Select an element to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ElementTreeItem({
  element,
  isSelected,
  onClick,
}: {
  element: BricksElement;
  isSelected: boolean;
  onClick: () => void;
}) {
  const getIcon = (type: string) => {
    if (type.includes("heading") || type.includes("text")) {
      return <Type className="w-4 h-4" />;
    }
    if (type.includes("image")) {
      return <Image className="w-4 h-4" />;
    }
    if (type.includes("container") || type.includes("section")) {
      return <Layers className="w-4 h-4" />;
    }
    return <Square className="w-4 h-4" />;
  };

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
        isSelected
          ? "bg-primary-100 text-primary-700"
          : "hover:bg-gray-100 text-gray-700"
      }`}
    >
      {getIcon(element.name)}
      <span className="truncate">
        {element.label || element.name}
      </span>
    </button>
  );
}

function ElementDetails({
  element,
  readOnly,
  onUpdate,
}: {
  element: BricksElement;
  readOnly: boolean;
  onUpdate: (updates: Record<string, unknown>) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">
          {element.label || element.name}
        </h3>
        {!readOnly && (
          <button className="flex items-center gap-1 text-primary-600 hover:text-primary-700 text-sm">
            <Edit3 className="w-4 h-4" />
            Edit
          </button>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">ID</label>
          <code className="text-sm bg-gray-100 px-2 py-1 rounded">
            {element.id}
          </code>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Type</label>
          <span className="text-sm">{element.name}</span>
        </div>

        {element.settings._cssClasses && (
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              CSS Classes
            </label>
            <span className="text-sm">{element.settings._cssClasses}</span>
          </div>
        )}

        {/* Settings preview */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Settings</label>
          <pre className="text-xs bg-gray-50 p-3 rounded-lg overflow-auto max-h-48">
            {JSON.stringify(element.settings, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
