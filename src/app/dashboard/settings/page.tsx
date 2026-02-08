"use client";

import { useState, useCallback } from "react";
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
} from "lucide-react";

export default function SettingsPage() {
  const [showBasecampToken, setShowBasecampToken] = useState(false);
  const [showBricksKey, setShowBricksKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [webhookCopied, setWebhookCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );

  const WEBHOOK_URL = "https://bricks-cc.jbcloud.app/api/basecamp/webhooks";

  const copyWebhookUrl = useCallback(() => {
    navigator.clipboard.writeText(WEBHOOK_URL);
    setWebhookCopied(true);
    setTimeout(() => setWebhookCopied(false), 2000);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus("idle");

    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setSaveStatus("success");
    setIsSaving(false);

    setTimeout(() => setSaveStatus("idle"), 3000);
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
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
                    defaultChecked
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account ID
                </label>
                <input
                  type="text"
                  placeholder="Your Basecamp Account ID"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OAuth Token
                </label>
                <div className="relative">
                  <input
                    type={showBasecampToken ? "text" : "password"}
                    placeholder="Your Basecamp OAuth Token"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowBasecampToken(!showBasecampToken)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showBasecampToken ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default API Key
                </label>
                <div className="relative">
                  <input
                    type={showBricksKey ? "text" : "password"}
                    placeholder="Default Bricks API Key (optional)"
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
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">
                    Allow clients to request page edits via chat
                  </span>
                </label>
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
