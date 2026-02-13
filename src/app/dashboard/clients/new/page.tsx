"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UserPlus, Loader2 } from "lucide-react";

interface ClientFormData {
  name: string;
  email: string;
  company: string;
  avatarUrl: string;
}

const EMPTY_FORM: ClientFormData = {
  name: "",
  email: "",
  company: "",
  avatarUrl: "",
};

export default function NewClientPage() {
  const router = useRouter();
  const [form, setForm] = useState<ClientFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim() || !form.email.trim()) {
      setError("Name and email are required");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          company: form.company.trim() || undefined,
          avatarUrl: form.avatarUrl.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create client");
      }

      router.push(`/dashboard/clients/${data.client.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create client");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/dashboard/clients"
          className="inline-flex items-center gap-2 text-[#a1a1a1] hover:text-[#f5f5f5] mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Clients
        </Link>

        <div className="bg-[#161616] rounded-xl border border-[#2a2a2a] p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-teal-500/10 rounded-full flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-teal-500" />
            </div>
            <h1 className="text-xl font-semibold text-[#f5f5f5]">
              Add New Client
            </h1>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#a1a1a1] mb-1">
                Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="John Smith"
                required
                className="w-full bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#f5f5f5] placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-teal-500/50"
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
                placeholder="john@example.com"
                required
                className="w-full bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#f5f5f5] placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#a1a1a1] mb-1">
                Company
              </label>
              <input
                type="text"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="Acme Corp"
                className="w-full bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#f5f5f5] placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-teal-500/50"
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

            <div className="flex justify-end gap-3 pt-4 border-t border-[#2a2a2a]">
              <Link
                href="/dashboard/clients"
                className="px-4 py-2 text-sm text-[#a1a1a1] hover:text-[#f5f5f5] border border-[#2a2a2a] rounded-lg"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-teal-500 hover:bg-teal-600 disabled:bg-[#2a2a2a] disabled:text-[#666] text-gray-950 rounded-lg transition-colors font-medium"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Client
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
