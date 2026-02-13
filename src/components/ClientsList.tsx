"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Globe,
  MessageSquare,
  ChevronRight,
  Search,
  Plus,
  Loader2,
} from "lucide-react";
import { formatRelativeTime } from "@/utils/formatting";
import type { ClientWithSites } from "@/types/client";

interface ClientsListProps {
  onClientSelect?: (clientId: string) => void;
}

export default function ClientsList({ onClientSelect }: ClientsListProps) {
  const [clients, setClients] = useState<ClientWithSites[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const response = await fetch("/api/clients", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Failed to fetch clients");
      }
      const data = await response.json();
      setClients(data.clients);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load clients");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <p className="text-red-400">{error}</p>
        <button
          onClick={loadClients}
          className="mt-4 text-teal-500 hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-teal-500" />
          <h2 className="text-xl font-semibold text-[#f5f5f5]">Clients</h2>
          <span className="bg-[#1e1e1e] text-[#a1a1a1] text-sm px-2 py-1 rounded-full">
            {clients.length}
          </span>
        </div>
        <Link
          href="/dashboard/clients/new"
          className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-gray-950 px-4 py-2 rounded-lg transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Client
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666]" />
        <input
          type="text"
          placeholder="Search clients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg text-[#f5f5f5] placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50"
        />
      </div>

      {/* Client List */}
      {filteredClients.length === 0 ? (
        <div className="text-center py-12 text-[#666]">
          {searchQuery ? (
            <p>No clients match your search</p>
          ) : (
            <p>No clients yet. Add your first client to get started.</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredClients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onClick={() => onClientSelect?.(client.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ClientCard({
  client,
  onClick,
}: {
  client: ClientWithSites;
  onClick?: () => void;
}) {
  return (
    <Link
      href={`/dashboard/clients/${client.id}`}
      onClick={onClick}
      className="block bg-[#161616] rounded-xl border border-[#2a2a2a] hover:border-teal-500/30 hover:glow-teal transition-all p-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-12 h-12 bg-teal-500/10 rounded-full flex items-center justify-center">
            {client.avatarUrl ? (
              <img
                src={client.avatarUrl}
                alt={client.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <span className="text-teal-500 font-semibold text-lg">
                {client.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          {/* Info */}
          <div>
            <h3 className="font-semibold text-[#f5f5f5]">{client.name}</h3>
            <p className="text-sm text-[#a1a1a1]">{client.email}</p>
            {client.company && (
              <p className="text-sm text-[#666]">{client.company}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Sites count */}
          <div className="flex items-center gap-1 text-[#a1a1a1]">
            <Globe className="w-4 h-4" />
            <span className="text-sm">{client.sites.length} sites</span>
          </div>

          {/* Status */}
          <div
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              client.isActive
                ? "bg-green-500/10 text-green-400"
                : "bg-[#1e1e1e] text-[#666]"
            }`}
          >
            {client.isActive ? "Active" : "Inactive"}
          </div>

          <ChevronRight className="w-5 h-5 text-[#666]" />
        </div>
      </div>

      {/* Sites preview */}
      {client.sites.length > 0 && (
        <div className="mt-3 pt-3 border-t border-[#2a2a2a] flex gap-2 flex-wrap">
          {client.sites.slice(0, 3).map((site) => (
            <span
              key={site.id}
              className="text-xs bg-[#1e1e1e] text-[#a1a1a1] px-2 py-1 rounded"
            >
              {site.name}
            </span>
          ))}
          {client.sites.length > 3 && (
            <span className="text-xs text-[#666]">
              +{client.sites.length - 3} more
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
