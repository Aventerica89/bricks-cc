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
  wordpressApiUrl: string;
  bricksApiKey: string;
  basecampProjectId: string;
}

const EMPTY_FORM: SiteFormData = {
  name: "",
  url: "",
  wordpressApiUrl: "",
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

  const fetchSites = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/clients/${clientId}/sites`);
      if (!res.ok) throw new Error("Failed to fetch sites");
      const data = await res.json();
      setSites(data.sites);
    } catch (err) {
      setError("Failed to load sites");
      console.error(err);
    } finally {
      setLoading(false);
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

      resetForm();
      await fetchSites();
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

      setDeleteConfirm(null);
      await fetchSites();
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
      wordpressApiUrl: site.wordpressApiUrl || "",
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
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading sites...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Client Sites</h2>
        {!showForm && (
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-2 text-sm bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Site
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {showForm && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">
              {editingSiteId ? "Edit Site" : "Add New Site"}
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Site Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                placeholder="My Client Site"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Site URL *
              </label>
              <input
                type="url"
                value={form.url}
                onChange={(e) =>
                  setForm({ ...form, url: e.target.value })
                }
                placeholder="https://example.com"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                WordPress API URL
              </label>
              <input
                type="url"
                value={form.wordpressApiUrl}
                onChange={(e) =>
                  setForm({ ...form, wordpressApiUrl: e.target.value })
                }
                placeholder="https://example.com/wp-json/wp/v2"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bricks API Key
                {editingSiteId && (
                  <span className="text-gray-400 font-normal ml-1">
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Basecamp Project ID
              </label>
              <input
                type="text"
                value={form.basecampProjectId}
                onChange={(e) =>
                  setForm({ ...form, basecampProjectId: e.target.value })
                }
                placeholder="12345678"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={resetForm}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white rounded-lg transition-colors"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingSiteId ? "Update Site" : "Add Site"}
              </button>
            </div>
          </div>
        </div>
      )}

      {sites.length === 0 && !showForm ? (
        <div className="text-center py-8 text-gray-500">
          <Globe className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>No sites configured yet.</p>
          <button
            onClick={() => setShowForm(true)}
            className="text-purple-600 hover:text-purple-700 mt-2 inline-block"
          >
            Add your first site
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sites.map((site) => (
            <div
              key={site.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Globe className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900 truncate">
                      {site.name}
                    </h3>
                    {site.hasApiKey ? (
                      <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        <Key className="w-3 h-3" />
                        API Key
                      </span>
                    ) : (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        No API Key
                      </span>
                    )}
                  </div>
                  <a
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-500 hover:text-purple-600 flex items-center gap-1"
                  >
                    {site.url}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {deleteConfirm === site.id ? (
                  <>
                    <span className="text-xs text-red-600 mr-1">Delete?</span>
                    <button
                      onClick={() => handleDelete(site.id)}
                      className="text-red-600 hover:text-red-700 text-xs font-medium px-2 py-1 border border-red-200 rounded"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="text-gray-500 hover:text-gray-700 text-xs px-2 py-1 border border-gray-200 rounded"
                    >
                      No
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(site)}
                      className="p-1.5 text-gray-400 hover:text-purple-600 rounded-lg hover:bg-gray-50"
                      title="Edit site"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(site.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-50"
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
