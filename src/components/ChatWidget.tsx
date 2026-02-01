"use client";

import { useState } from "react";
import { MessageCircle, X, Minimize2, Maximize2 } from "lucide-react";
import ChatInterface from "./ChatInterface";

interface ChatWidgetProps {
  clientId: string;
  siteId: string;
  position?: "bottom-right" | "bottom-left";
  initialOpen?: boolean;
}

export default function ChatWidget({
  clientId,
  siteId,
  position = "bottom-right",
  initialOpen = false,
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [isMinimized, setIsMinimized] = useState(false);

  const positionClasses =
    position === "bottom-right" ? "right-4" : "left-4";

  return (
    <div className={`fixed bottom-4 ${positionClasses} z-50`}>
      {/* Chat Window */}
      {isOpen && (
        <div
          className={`mb-4 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden transition-all duration-300 ${
            isMinimized ? "h-14" : "h-[500px] w-[380px]"
          }`}
        >
          {/* Header */}
          <div className="bg-primary-600 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <span className="font-medium">Chat with AI Assistant</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-primary-700 rounded transition-colors"
                aria-label={isMinimized ? "Maximize" : "Minimize"}
              >
                {isMinimized ? (
                  <Maximize2 className="w-4 h-4" />
                ) : (
                  <Minimize2 className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-primary-700 rounded transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Content */}
          {!isMinimized && (
            <ChatInterface clientId={clientId} siteId={siteId} />
          )}
        </div>
      )}

      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110"
          aria-label="Open chat"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
