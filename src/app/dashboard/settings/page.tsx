"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Settings,
  Key,
  Globe,
  MessageSquare,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Copy,
  Check,
  Link,
  Unlink,
} from "lucide-react";

const BASECAMP_CLIENT_ID = process.env.NEXT_PUBLIC_BASECAMP_CLIENT_ID ?? "";
const REDIRECT_URI = "https://bricks-cc.jbcloud.app/api/basecamp/callback";
const WEBHOOK_URL = "https://bricks-cc.jbcloud.app/api/basecamp/webhooks";

const BASECAMP_AUTH_URL =
  "https://launchpad.37signals.com/authorization/new" +
  `?type=web_server&client_id=${BASECAMP_CLIENT_ID}` +
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;

interface SettingsData {
  basecampAccountId: string | null;
  basecampConnected: boolean;
  basecampLast4: string | null;
  bricksApiKey: { connected: boolean; last4: string | null };
  bricksSiteUrl: string | null;
  claudeEnabled: boolean;
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8">
          <div className="max-w-4xl mx-auto animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-48" />
            <div className="h-48 bg-gray-200 rounded" />
          </div>
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}

function SettingsContent() {
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [showBricksKey, setShowBricksKey] = useState(false);
  const [webhookCopied, setWebhookCopied] = useState(false);

  // Form state
  const [basecampAccountId, setBasecampAccountId] = useState("");
  const [basecampConnected, setBasecampConnected] = useState(false);
  const [basecampLast4, setBasecampLast4] = useState<string | null>(null);
  const [bricksApiKey, setBricksApiKey] = useState("");
  const [bricksKeyConnected, setBricksKeyConnected] = useState(false);
  const [bricksSiteUrl, setBricksSiteUrl] = useState("");
  const [claudeEnabled, setClaudeEnabled] = useState(true);

  // Toast from OAuth redirect
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const connected = searchParams.get("connected");
    const error = searchParams.get("error");

    if (connected === "basecamp") {
      setToast("Basecamp connected successfully!");
      setTimeout(() => setToast(null), 5000);
    } else if (error) {
      const messages: Record<string, string> = {
        missing_code: "Authorization code missing from Basecamp.",
        server_config: "Server configuration error. Check env vars.",
        basecamp_auth_failed: "Basecamp authorization failed. Try again.",
      };
      setToast(messages[error] ?? "An error occurred.");
      setTimeout(() => setToast(null), 5000);
    }
  }, [searchParams]);

  const loadSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/settings");
      if (!res.ok) throw new Error("Failed to load");
      const data: SettingsData = await res.json();

      setBasecampAccountId(data.basecampAccountId ?? "");
      setBasecampConnected(data.basecampConnected);
      setBasecampLast4(data.basecampLast4);
      setBricksKeyConnected(data.bricksApiKey.connected);
      setBricksSiteUrl(data.bricksSiteUrl ?? "");
      setClaudeEnabled(data.claudeEnabled);
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const copyWebhookUrl = useCallback(() => {
    navigator.clipboard.writeText(WEBHOOK_URL);
    setWebhookCopied(true);
    setTimeout(() => setWebhookCopied(false), 2000);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus("idle");

    try {
      const body: Record<string, unknown> = {
        basecampAccountId,
        bricksSiteUrl,
        claudeEnabled,
      };

      // Only send bricksApiKey if user typed a new one
      if (bricksApiKey) {
        body.bricksApiKey = bricksApiKey;
      }

      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Save failed");

      setSaveStatus("success");
      setBricksApiKey(""); // Clear raw input after save
      await loadSettings(); // Reload masked state
    } catch {
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const handleDisconnectBasecamp = async () => {
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ basecampOauthToken: "" }),
      });
      if (res.ok) {
        setBasecampConnected(false);
        setBasecampLast4(null);
      }
    } catch (err) {
      console.error("Failed to disconnect:", err);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-48" />
            <div className="h-48 bg-gray-200 rounded" />
            <div className="h-48 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Toast */}
        {toast && (
          <div
            className={`mb-6 px-4 py-3 rounded-lg text-sm flex items-center gap-2 ${
              searchParams.get("error")
                ? "bg-red-50 text-red-800 border border-red-200"
                : "bg-green-50 text-green-800 border border-green-200"
            }`}
          >
            {searchParams.get("error") ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle className="w-4 h-4 shrink-0" />
            )}
            {toast}
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">
            Configure integrations and platform settings
          </p>
        </div>

        <div className="space-y-8">
          {/* Claude AI Settings */}
          <SettingsSection
            title="Claude AI"
            description="Configure Claude Code CLI integration"
            icon={<MessageSquare className="w-5 h-5" />}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CLI Status
                </label>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm text-gray-600">
                    Claude CLI is available
                  </span>
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={claudeEnabled}
                    onChange={(e) => setClaudeEnabled(e.target.checked)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">
                    Enable Claude AI responses
                  </span>
                </label>
              </div>
            </div>
          </SettingsSection>

          {/* Basecamp Settings */}
          <SettingsSection
            title="Basecamp"
            description="Connect to Basecamp for project management"
            icon={<Globe className="w-5 h-5" />}
          >
            <div className="space-y-4">
              {/* Connection status + OAuth button */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Connection
                </label>
                {basecampConnected ? (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                      <Link className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-700 font-medium">
                        Connected
                      </span>
                      {basecampLast4 && (
                        <span className="text-xs text-green-500">
                          (token ...{basecampLast4})
                        </span>
                      )}
                    </div>
                    <button
                      onClick={handleDisconnectBasecamp}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors"
                    >
                      <Unlink className="w-3.5 h-3.5" />
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <a
                    href={BASECAMP_AUTH_URL}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    Connect Basecamp
                  </a>
                )}
              </div>

              {/* Account ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account ID
                </label>
                <input
                  type="text"
                  value={basecampAccountId}
                  onChange={(e) => setBasecampAccountId(e.target.value)}
                  placeholder="Your Basecamp Account ID"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Webhook URL (read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Webhook URL (for receiving updates)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={WEBHOOK_URL}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 font-mono text-sm"
                  />
                  <button
                    onClick={copyWebhookUrl}
                    className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm transition-colors"
                  >
                    {webhookCopied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    {webhookCopied ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
            </div>
          </SettingsSection>

          {/* Bricks Settings */}
          <SettingsSection
            title="Bricks Builder"
            description="Default settings for Bricks API integration"
            icon={<Key className="w-5 h-5" />}
          >
            <div className="space-y-4">
              {/* Site URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site URL
                </label>
                <input
                  type="url"
                  value={bricksSiteUrl}
                  onChange={(e) => setBricksSiteUrl(e.target.value)}
                  placeholder="https://your-site.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* API Key */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default API Key
                </label>
                {bricksKeyConnected && !bricksApiKey && (
                  <p className="text-xs text-green-600 mb-1">
                    Key stored (encrypted). Enter a new value to replace it.
                  </p>
                )}
                <div className="relative">
                  <input
                    type={showBricksKey ? "text" : "password"}
                    value={bricksApiKey}
                    onChange={(e) => setBricksApiKey(e.target.value)}
                    placeholder={
                      bricksKeyConnected
                        ? "Enter new key to replace..."
                        : "Default Bricks API Key (optional)"
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowBricksKey(!showBricksKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showBricksKey ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Site-specific keys can be configured per client site
                </p>
              </div>
            </div>
          </SettingsSection>

          {/* Save Button */}
          <div className="flex items-center justify-end gap-4">
            {saveStatus === "success" && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Settings saved</span>
              </div>
            )}
            {saveStatus === "error" && (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Failed to save</span>
              </div>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-6 py-2 rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save Settings"}
            </button>
          </div>
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
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="text-purple-600">{icon}</div>
          <div>
            <h2 className="font-semibold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}
