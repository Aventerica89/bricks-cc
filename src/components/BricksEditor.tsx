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
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-400">{error}</p>
        <button
          onClick={loadPageData}
          className="mt-4 text-teal-500 hover:text-teal-400"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!pageState) {
    return (
      <div className="text-center py-12 text-[#666]">
        No page data available
      </div>
    );
  }

  return (
    <div className="bg-[#161616] rounded-lg border border-[#2a2a2a]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a2a]">
        <div className="flex items-center gap-3">
          <Layout className="w-5 h-5 text-teal-500" />
          <div>
            <h2 className="font-semibold text-[#f5f5f5]">
              {pageState.pageTitle}
            </h2>
            <p className="text-sm text-[#666]">
              {pageState.elements.length} elements
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 text-[#a1a1a1] hover:text-[#f5f5f5] px-3 py-2 rounded-lg hover:bg-[#1e1e1e] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          {!readOnly && (
            <button className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-gray-950 px-4 py-2 rounded-lg transition-colors">
              <Eye className="w-4 h-4" />
              Preview
            </button>
          )}
        </div>
      </div>

      <div className="flex">
        {/* Elements Tree */}
        <div className="w-1/3 border-r border-[#2a2a2a] p-4 max-h-[500px] overflow-y-auto">
          <h3 className="text-sm font-medium text-[#a1a1a1] mb-3">
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
            <div className="text-center py-12 text-[#666]">
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
          ? "bg-teal-500/10 text-teal-400"
          : "hover:bg-[#1e1e1e] text-[#a1a1a1]"
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
        <h3 className="font-semibold text-[#f5f5f5]">
          {element.label || element.name}
        </h3>
        {!readOnly && (
          <button className="flex items-center gap-1 text-teal-500 hover:text-teal-400 text-sm">
            <Edit3 className="w-4 h-4" />
            Edit
          </button>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs text-[#666] mb-1">ID</label>
          <code className="text-sm bg-[#1e1e1e] text-[#a1a1a1] px-2 py-1 rounded">
            {element.id}
          </code>
        </div>

        <div>
          <label className="block text-xs text-[#666] mb-1">Type</label>
          <span className="text-sm text-[#f5f5f5]">{element.name}</span>
        </div>

        {element.settings._cssClasses && (
          <div>
            <label className="block text-xs text-[#666] mb-1">
              CSS Classes
            </label>
            <span className="text-sm text-[#f5f5f5]">{element.settings._cssClasses}</span>
          </div>
        )}

        {/* Settings preview */}
        <div>
          <label className="block text-xs text-[#666] mb-1">Settings</label>
          <pre className="text-xs bg-[#1e1e1e] text-[#a1a1a1] p-3 rounded-lg overflow-auto max-h-48">
            {JSON.stringify(element.settings, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
