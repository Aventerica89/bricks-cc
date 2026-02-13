"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MessageSquare,
  Loader2,
  Globe,
  ChevronDown,
} from "lucide-react";
import ChatInterface from "@/components/ChatInterface";

interface MaskedSite {
  id: string;
  name: string;
  url: string;
  hasApiKey: boolean;
}

export default function ChatPage() {
  const params = useParams<{ id: string }>();
  const clientId = params.id;

  const [sites, setSites] = useState<MaskedSite[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const res = await fetch(`/api/clients/${clientId}/sites`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to fetch sites");
        const data = await res.json();
        const fetchedSites: MaskedSite[] = data.sites;
        setSites(fetchedSites);

        if (fetchedSites.length === 1) {
          setSelectedSiteId(fetchedSites[0].id);
        }
      } catch (err) {
        console.error("Failed to load sites:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSites();
  }, [clientId]);

  const selectedSite = sites.find((s) => s.id === selectedSiteId);

  return (
    <div className="p-8 h-screen flex flex-col">
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
        <Link
          href={`/dashboard/clients/${clientId}`}
          className="inline-flex items-center gap-2 text-[#a1a1a1] hover:text-[#f5f5f5] mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Client
        </Link>

        <div className="bg-[#161616] rounded-xl border border-[#2a2a2a] p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-teal-500/10 rounded-lg">
                <MessageSquare className="w-6 h-6 text-teal-500" />
              </div>
              <div>
                <h1
                  className="text-xl font-bold text-[#f5f5f5]"
                >
                  Chat History
                </h1>
                <p className="text-[#a1a1a1]">
                  {selectedSite ? selectedSite.name : `Client ID: ${clientId}`}
                </p>
              </div>
            </div>

            {sites.length > 1 && (
              <div className="relative">
                <select
                  value={selectedSiteId || ""}
                  onChange={(e) => setSelectedSiteId(e.target.value || null)}
                  className="appearance-none bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg px-3 py-2 pr-8 text-sm text-[#f5f5f5] focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50"
                >
                  <option value="">Select a site...</option>
                  {sites.map((site) => (
                    <option key={site.id} value={site.id}>
                      {site.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#666] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center text-[#a1a1a1]">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Loading sites...
          </div>
        ) : sites.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-[#666]">
              <Globe className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="font-medium text-[#a1a1a1]">No sites configured</p>
              <p className="text-sm mt-1">
                Add a site to start chatting.
              </p>
              <Link
                href={`/dashboard/clients/${clientId}`}
                className="text-teal-500 hover:text-teal-400 mt-3 inline-block text-sm"
              >
                Go to client settings
              </Link>
            </div>
          </div>
        ) : !selectedSiteId ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-[#666]">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="font-medium text-[#a1a1a1]">Select a site to begin</p>
              <p className="text-sm mt-1">
                Choose a site from the dropdown above.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 bg-[#161616] rounded-xl border border-[#2a2a2a] overflow-hidden">
            <ChatInterface
              key={selectedSiteId}
              clientId={clientId}
              siteId={selectedSiteId}
            />
          </div>
        )}
      </div>
    </div>
  );
}
