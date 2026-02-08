"use client";

import { useState, useEffect } from "react";
import { Globe, MessageSquare } from "lucide-react";

interface StatusData {
  basecampConnected: boolean;
  claudeEnabled: boolean;
}

export function ConnectionStatus() {
  const [status, setStatus] = useState<StatusData | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setStatus({
            basecampConnected: data.basecampConnected,
            claudeEnabled: data.claudeEnabled,
          });
        }
      })
      .catch(() => {});
  }, []);

  if (!status) return null;

  return (
    <div className="px-4 py-3 space-y-2">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
        Services
      </p>
      <StatusPill
        label="Claude AI"
        connected={status.claudeEnabled}
        icon={<MessageSquare className="w-3 h-3" />}
      />
      <StatusPill
        label="Basecamp"
        connected={status.basecampConnected}
        icon={<Globe className="w-3 h-3" />}
      />
    </div>
  );
}

function StatusPill({
  label,
  connected,
  icon,
}: {
  label: string;
  connected: boolean;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
          connected
            ? "bg-green-50 text-green-700"
            : "bg-gray-100 text-gray-500"
        }`}
      >
        <div
          className={`w-1.5 h-1.5 rounded-full ${
            connected ? "bg-green-500" : "bg-gray-400"
          }`}
        />
        {icon}
        {label}
      </div>
    </div>
  );
}
