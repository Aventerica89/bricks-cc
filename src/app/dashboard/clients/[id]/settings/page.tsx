"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Shield,
  Save,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import type { Client } from "@/types/client";

interface ClientFormData {
  name: string;
  email: string;
  company: string;
  avatarUrl: string;
}

export default function ClientSettingsPage() {
  const { id: clientId } = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [form, setForm] = useState<ClientFormData>({
    name: "",
    email: "",
    company: "",
    avatarUrl: "",
  });
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadClient = useCallback(async () => {
    try {
      const res = await fetch(`/api/clients?clientId=${clientId}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to load client");
      const data = await res.json();
      const c: Client = data.client;
      setClient(c);
      setForm({
        name: c.name,
        email: c.email,
        company: c.company ?? "",
        avatarUrl: c.avatarUrl ?? "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load client");
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    loadClient();
  }, [loadClient]);

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      setError("Name and email are required");
      return;
    }

    setSaving(true);
    setSaveStatus("idle");
    setError(null);

    try {
      const res = await fetch("/api/clients", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          name: form.name.trim(),
          email: form.email.trim(),
          company: form.company.trim() || null,
          avatarUrl: form.avatarUrl.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      const data = await res.json();
      setClient(data.client);
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    setDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/clients?clientId=${clientId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to deactivate client");

      router.push("/dashboard/clients");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to deactivate client"
      );
      setDeleting(false);
      setDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-4 bg-[#1e1e1e] rounded w-32" />
            <div className="h-8 bg-[#1e1e1e] rounded w-48" />
            <div className="h-64 bg-[#1e1e1e] rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-8">
        <div className="max-w-3xl mx-auto text-center py-12">
          <p className="text-red-400">{error || "Client not found"}</p>
          <Link
            href="/dashboard/clients"
            className="mt-4 text-teal-500 hover:text-teal-400 inline-block"
          >
            Back to Clients
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto">
        <Link
          href={`/dashboard/clients/${clientId}`}
          className="inline-flex items-center gap-2 text-[#a1a1a1] hover:text-[#f5f5f5] mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {client.name}
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#f5f5f5]">Client Settings</h1>
          <p className="text-[#a1a1a1]">{client.name}</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-8">
          {/* Profile Section */}
          <SettingsSection
            title="Profile"
            description="Update client contact information"
            icon={<User className="w-5 h-5" />}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#a1a1a1] mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#f5f5f5] focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#a1a1a1] mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#f5f5f5] focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#a1a1a1] mb-1">
                  Company
                </label>
                <input
                  type="text"
                  value={form.company}
                  onChange={(e) =>
                    setForm({ ...form, company: e.target.value })
                  }
                  className="w-full bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#f5f5f5] focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#a1a1a1] mb-1">
                  Avatar URL
                </label>
                <input
                  type="url"
                  value={form.avatarUrl}
                  onChange={(e) =>
                    setForm({ ...form, avatarUrl: e.target.value })
                  }
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#f5f5f5] placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                />
              </div>

              {/* Save Button */}
              <div className="flex items-center justify-end gap-3 pt-2">
                {saveStatus === "success" && (
                  <div className="flex items-center gap-1.5 text-green-400 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Saved
                  </div>
                )}
                {saveStatus === "error" && (
                  <div className="flex items-center gap-1.5 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    Failed
                  </div>
                )}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-teal-500 hover:bg-teal-600 disabled:bg-[#2a2a2a] disabled:text-[#666] text-gray-950 rounded-lg transition-colors font-medium"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Changes
                </button>
              </div>
            </div>
          </SettingsSection>

          {/* Danger Zone */}
          <SettingsSection
            title="Danger Zone"
            description="Irreversible actions"
            icon={<Shield className="w-5 h-5" />}
            danger
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#f5f5f5]">
                  Deactivate Client
                </p>
                <p className="text-sm text-[#a1a1a1]">
                  Hides this client from the active list. Data is preserved.
                </p>
              </div>
              {deleteConfirm ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-red-400">Are you sure?</span>
                  <button
                    onClick={handleDeactivate}
                    disabled={deleting}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 disabled:bg-[#2a2a2a] text-white rounded-lg transition-colors"
                  >
                    {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Yes, Deactivate
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(false)}
                    className="px-3 py-1.5 text-sm text-[#a1a1a1] border border-[#2a2a2a] rounded-lg hover:bg-[#252525]"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setDeleteConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Deactivate
                </button>
              )}
            </div>
          </SettingsSection>
        </div>
      </div>
    </div>
  );
}

function SettingsSection({
  title,
  description,
  icon,
  children,
  danger = false,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <div
      className={`bg-[#161616] rounded-xl border ${
        danger ? "border-red-500/20" : "border-[#2a2a2a]"
      }`}
    >
      <div
        className={`px-6 py-4 border-b ${
          danger ? "border-red-500/20" : "border-[#2a2a2a]"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={danger ? "text-red-400" : "text-teal-500"}>
            {icon}
          </div>
          <div>
            <h2 className="font-semibold text-[#f5f5f5]">{title}</h2>
            <p className="text-sm text-[#a1a1a1]">{description}</p>
          </div>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}
