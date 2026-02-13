"use client";

import { useState, useEffect } from "react";
import {
  Globe,
  Plus,
  Pencil,
  Trash2,
  X,
  Key,
  Loader2,
  ExternalLink,
} from "lucide-react";

interface MaskedSite {
  id: string;
  clientId: string;
  name: string;
  url: string;
  wordpressApiUrl: string | null;
  hasApiKey: boolean;
  apiKeyHint: string | null;
  basecampProjectId: number | null;
  isActive: boolean | null;
  createdAt: string | null;
  updatedAt: string | null;
}

interface SiteFormData {
  name: string;
  url: string;
  bricksApiKey: string;
  basecampProjectId: string;
}

const EMPTY_FORM: SiteFormData = {
  name: "",
  url: "",
  bricksApiKey: "",
  basecampProjectId: "",
};

export default function SiteManager({ clientId }: { clientId: string }) {
  const [sites, setSites] = useState<MaskedSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingSiteId, setEditingSiteId] = useState<string | null>(null);
  const [form, setForm] = useState<SiteFormData>(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchSites();
  }, [clientId]);

  const fetchSites = async (showSpinner = true) => {
    try {
      if (showSpinner) setLoading(true);
      const res = await fetch(`/api/clients/${clientId}/sites`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to fetch sites");
      const data = await res.json();
      setSites(data.sites);
    } catch (err) {
      if (showSpinner) setError("Failed to load sites");
      console.error(err);
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.url.trim()) {
      setError("Site name and URL are required");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const isEdit = !!editingSiteId;
      const method = isEdit ? "PUT" : "POST";
      const body = isEdit
        ? { siteId: editingSiteId, ...form }
        : form;

      const res = await fetch(`/api/clients/${clientId}/sites`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save site");
      }

      const data = await res.json();

      // Optimistic update: immediately add/update the site in state
      if (isEdit) {
        setSites((prev) =>
          prev.map((s) => (s.id === editingSiteId ? data.site : s))
        );
      } else {
        setSites((prev) => [...prev, data.site]);
      }

      resetForm();

      // Background re-fetch for consistency (no spinner)
      fetchSites(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (siteId: string) => {
    try {
      const res = await fetch(`/api/clients/${clientId}/sites`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId }),
      });

      if (!res.ok) throw new Error("Failed to delete site");

      // Optimistic removal
      setSites((prev) => prev.filter((s) => s.id !== siteId));
      setDeleteConfirm(null);

      // Background re-fetch for consistency (no spinner)
      fetchSites(false);
    } catch (err) {
      setError("Failed to delete site");
      console.error(err);
    }
  };

  const startEdit = (site: MaskedSite) => {
    setEditingSiteId(site.id);
    setForm({
      name: site.name,
      url: site.url,
      bricksApiKey: "",
      basecampProjectId: site.basecampProjectId?.toString() || "",
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingSiteId(null);
    setForm(EMPTY_FORM);
    setError(null);
  };

  if (loading) {
    return (
      <div className="bg-[#161616] rounded-xl border border-[#2a2a2a] p-6">
        <div className="flex items-center gap-2 text-[#a1a1a1]">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading sites...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#161616] rounded-xl border border-[#2a2a2a] p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[#f5f5f5]">Client Sites</h2>
        {!showForm && (
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-2 text-sm bg-teal-500 hover:bg-teal-600 text-gray-950 px-3 py-1.5 rounded-lg transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Site
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {showForm && (
        <div className="mb-6 p-4 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-[#f5f5f5]">
              {editingSiteId ? "Edit Site" : "Add New Site"}
            </h3>
            <button
              onClick={resetForm}
              className="text-[#666] hover:text-[#a1a1a1]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-[#a1a1a1] mb-1">
                Site Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                placeholder="My Client Site"
                className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#f5f5f5] placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#a1a1a1] mb-1">
                Site URL *
              </label>
              <input
                type="url"
                value={form.url}
                onChange={(e) =>
                  setForm({ ...form, url: e.target.value })
                }
                placeholder="https://example.com"
                className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#f5f5f5] placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              />
            </div>

            {form.url.trim() && (
              <p className="text-xs text-[#666]">
                WP API: {form.url.replace(/\/+$/, "")}/wp-json/wp/v2
              </p>
            )}

            <div>
              <label className="block text-sm font-medium text-[#a1a1a1] mb-1">
                Bricks API Key
                {editingSiteId && (
                  <span className="text-[#666] font-normal ml-1">
                    (leave blank to keep current)
                  </span>
                )}
              </label>
              <input
                type="password"
                value={form.bricksApiKey}
                onChange={(e) =>
                  setForm({ ...form, bricksApiKey: e.target.value })
                }
                placeholder={
                  editingSiteId ? "Enter new key to change" : "Enter API key"
                }
                className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#f5f5f5] placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#a1a1a1] mb-1">
                Basecamp Project ID
              </label>
              <input
                type="text"
                value={form.basecampProjectId}
                onChange={(e) =>
                  setForm({ ...form, basecampProjectId: e.target.value })
                }
                placeholder="12345678"
                className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#f5f5f5] placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={resetForm}
                className="px-4 py-2 text-sm text-[#a1a1a1] hover:text-[#f5f5f5] border border-[#2a2a2a] rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-teal-500 hover:bg-teal-600 disabled:bg-[#2a2a2a] disabled:text-[#666] text-gray-950 rounded-lg transition-colors font-medium"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingSiteId ? "Update Site" : "Add Site"}
              </button>
            </div>
          </div>
        </div>
      )}

      {sites.length === 0 && !showForm ? (
        <div className="text-center py-8 text-[#666]">
          <Globe className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="text-[#a1a1a1]">No sites configured yet.</p>
          <button
            onClick={() => setShowForm(true)}
            className="text-teal-500 hover:text-teal-400 mt-2 inline-block"
          >
            Add your first site
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sites.map((site) => (
            <div
              key={site.id}
              className="flex items-center justify-between p-4 border border-[#2a2a2a] rounded-lg hover:border-[#3a3a3a] transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Globe className="w-5 h-5 text-[#666] flex-shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-[#f5f5f5] truncate">
                      {site.name}
                    </h3>
                    {site.hasApiKey ? (
                      <span className="flex items-center gap-1 text-xs bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full">
                        <Key className="w-3 h-3" />
                        API Key
                      </span>
                    ) : (
                      <span className="text-xs bg-[#1e1e1e] text-[#666] px-2 py-0.5 rounded-full">
                        No API Key
                      </span>
                    )}
                  </div>
                  <a
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#a1a1a1] hover:text-teal-500 flex items-center gap-1"
                  >
                    {site.url}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {deleteConfirm === site.id ? (
                  <>
                    <span className="text-xs text-red-400 mr-1">Delete?</span>
                    <button
                      onClick={() => handleDelete(site.id)}
                      className="text-red-400 hover:text-red-300 text-xs font-medium px-2 py-1 border border-red-500/20 rounded"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="text-[#a1a1a1] hover:text-[#f5f5f5] text-xs px-2 py-1 border border-[#2a2a2a] rounded"
                    >
                      No
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(site)}
                      className="p-1.5 text-[#666] hover:text-teal-500 rounded-lg hover:bg-teal-500/10"
                      title="Edit site"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(site.id)}
                      className="p-1.5 text-[#666] hover:text-red-400 rounded-lg hover:bg-red-500/10"
                      title="Delete site"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
