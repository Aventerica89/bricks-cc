"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Layout,
  Globe,
  Loader2,
  AlertCircle,
  ChevronDown,
  RefreshCw,
  FileText,
} from "lucide-react";

interface MaskedSite {
  id: string;
  name: string;
  url: string;
  hasApiKey: boolean;
}

interface BricksPage {
  id: number;
  title: { rendered: string };
  status: string;
  link: string;
}

export default function BricksPage() {
  const params = useParams<{ id: string }>();
  const clientId = params.id;

  const [sites, setSites] = useState<MaskedSite[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [pages, setPages] = useState<BricksPage[]>([]);
  const [loadingSites, setLoadingSites] = useState(true);
  const [loadingPages, setLoadingPages] = useState(false);
  const [pagesError, setPagesError] = useState<string | null>(null);

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

        const sitesWithKey = fetchedSites.filter((s) => s.hasApiKey);
        if (sitesWithKey.length === 1) {
          setSelectedSiteId(sitesWithKey[0].id);
        } else if (fetchedSites.length === 1 && fetchedSites[0].hasApiKey) {
          setSelectedSiteId(fetchedSites[0].id);
        }
      } catch (err) {
        console.error("Failed to load sites:", err);
      } finally {
        setLoadingSites(false);
      }
    };
    fetchSites();
  }, [clientId]);

  useEffect(() => {
    if (!selectedSiteId) {
      setPages([]);
      return;
    }

    const selectedSite = sites.find((s) => s.id === selectedSiteId);
    if (!selectedSite?.hasApiKey) {
      setPages([]);
      return;
    }

    fetchPages(selectedSiteId);
  }, [selectedSiteId, sites]);

  const fetchPages = async (siteId: string) => {
    setLoadingPages(true);
    setPagesError(null);

    try {
      const res = await fetch(`/api/bricks?siteId=${siteId}`);
      if (!res.ok) throw new Error("Failed to fetch pages");
      const data = await res.json();
      setPages(data.pages || []);
    } catch (err) {
      setPagesError("Failed to load Bricks pages");
      console.error(err);
    } finally {
      setLoadingPages(false);
    }
  };

  const selectedSite = sites.find((s) => s.id === selectedSiteId);
  const sitesWithKey = sites.filter((s) => s.hasApiKey);

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
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
                <Layout className="w-6 h-6 text-teal-500" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#f5f5f5]">
                  Bricks Page Management
                </h1>
                <p className="text-[#a1a1a1]">
                  Manage page editing permissions for this client
                </p>
              </div>
            </div>

            {sitesWithKey.length > 1 && (
              <div className="relative">
                <select
                  value={selectedSiteId || ""}
                  onChange={(e) => setSelectedSiteId(e.target.value || null)}
                  className="appearance-none bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg px-3 py-2 pr-8 text-sm text-[#f5f5f5] focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                >
                  <option value="">Select a site...</option>
                  {sitesWithKey.map((site) => (
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

        {loadingSites ? (
          <div className="bg-[#161616] rounded-xl border border-[#2a2a2a] p-12 text-center text-[#a1a1a1]">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            Loading sites...
          </div>
        ) : sites.length === 0 ? (
          <div className="bg-[#161616] rounded-xl border border-[#2a2a2a] p-12 text-center text-[#666]">
            <Globe className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="font-medium text-[#a1a1a1]">No sites configured</p>
            <p className="text-sm mt-1">
              Add a site first to manage Bricks pages.
            </p>
            <Link
              href={`/dashboard/clients/${clientId}`}
              className="text-teal-500 hover:text-teal-400 mt-3 inline-block text-sm"
            >
              Go to client settings
            </Link>
          </div>
        ) : sitesWithKey.length === 0 ? (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-400 mb-1">
                  No Bricks API Key Configured
                </h3>
                <p className="text-yellow-200/70">
                  None of your sites have a Bricks API key set. Add an API key
                  in site settings to enable page management.
                </p>
                <Link
                  href={`/dashboard/clients/${clientId}`}
                  className="text-yellow-400 hover:underline mt-2 inline-block font-medium"
                >
                  Configure site settings
                </Link>
              </div>
            </div>
          </div>
        ) : selectedSite && !selectedSite.hasApiKey ? (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-400 mb-1">
                  API Key Missing
                </h3>
                <p className="text-yellow-200/70">
                  This site does not have a Bricks API key configured.
                </p>
              </div>
            </div>
          </div>
        ) : !selectedSiteId ? (
          <div className="bg-[#161616] rounded-xl border border-[#2a2a2a] p-12 text-center text-[#666]">
            <Layout className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="font-medium text-[#a1a1a1]">Select a site</p>
            <p className="text-sm mt-1">
              Choose a site from the dropdown above.
            </p>
          </div>
        ) : (
          <div className="bg-[#161616] rounded-xl border border-[#2a2a2a]">
            <div className="p-6 border-b border-[#2a2a2a] flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#f5f5f5]">
                Managed Pages
                {selectedSite && (
                  <span className="text-sm font-normal text-[#a1a1a1] ml-2">
                    {selectedSite.name}
                  </span>
                )}
              </h2>
              <button
                onClick={() => fetchPages(selectedSiteId)}
                disabled={loadingPages}
                className="flex items-center gap-2 text-sm text-[#a1a1a1] hover:text-[#f5f5f5] px-3 py-1.5 border border-[#2a2a2a] rounded-lg hover:bg-[#252525] transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loadingPages ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>

            {loadingPages ? (
              <div className="p-12 text-center text-[#a1a1a1]">
                <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                Loading pages...
              </div>
            ) : pagesError ? (
              <div className="p-6 text-center text-red-400">
                <AlertCircle className="w-6 h-6 mx-auto mb-2" />
                <p className="text-sm">{pagesError}</p>
                <button
                  onClick={() => fetchPages(selectedSiteId)}
                  className="text-teal-500 hover:text-teal-400 text-sm mt-2"
                >
                  Try again
                </button>
              </div>
            ) : pages.length === 0 ? (
              <div className="text-center py-12 text-[#666]">
                <Globe className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No pages found.</p>
                <p className="text-sm mt-1">
                  Pages will appear here once fetched from the site.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#2a2a2a]">
                {pages.map((page) => (
                  <div
                    key={page.id}
                    className="flex items-center justify-between p-4 hover:bg-[#1e1e1e] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-[#666]" />
                      <div>
                        <p className="font-medium text-[#f5f5f5] text-sm">
                          {page.title?.rendered || `Page #${page.id}`}
                        </p>
                        <p className="text-xs text-[#666]">
                          ID: {page.id} &middot; {page.status}
                        </p>
                      </div>
                    </div>
                    {page.link && (
                      <a
                        href={page.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-teal-500 hover:text-teal-400"
                      >
                        View
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
