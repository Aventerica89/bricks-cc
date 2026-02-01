"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, AlertCircle, Check, RefreshCw } from "lucide-react";
import { formatRelativeTime } from "@/utils/formatting";
import type { ChatMessage, ChatAction } from "@/types/chat";

interface ChatInterfaceProps {
  clientId: string;
  siteId: string;
  onActionExecuted?: (action: ChatAction) => void;
}

export default function ChatInterface({
  clientId,
  siteId,
  onActionExecuted,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load chat history on mount
  useEffect(() => {
    loadHistory();
  }, [clientId, siteId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadHistory = async () => {
    try {
      const response = await fetch(
        `/api/chat?clientId=${clientId}&siteId=${siteId}&limit=20`
      );
      if (response.ok) {
        const data = await response.json();
        const formattedMessages: ChatMessage[] = data.messages.flatMap(
          (msg: { id: string; userMessage: string; claudeResponse?: string; createdAt: string }) => [
            {
              id: `${msg.id}-user`,
              role: "user" as const,
              content: msg.userMessage,
              timestamp: new Date(msg.createdAt),
            },
            ...(msg.claudeResponse
              ? [
                  {
                    id: `${msg.id}-assistant`,
                    role: "assistant" as const,
                    content: msg.claudeResponse,
                    timestamp: new Date(msg.createdAt),
                  },
                ]
              : []),
          ]
        );
        setMessages(formattedMessages);
      }
    } catch (err) {
      console.error("Failed to load chat history:", err);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          siteId,
          message: userMessage.content,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
        metadata: {
          tokensUsed: data.metadata?.tokensUsed,
          executionTime: data.metadata?.executionTime,
          actions: data.actions,
        },
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Notify about executed actions
      if (data.actions?.length > 0 && onActionExecuted) {
        data.actions.forEach((action: ChatAction) => onActionExecuted(action));
      }
    } catch (err) {
      setError("Failed to send message. Please try again.");
      console.error("Chat error:", err);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isLoading && (
          <div className="text-center text-gray-500 py-8">
            <p className="text-sm">
              Hi! I&apos;m your AI assistant. How can I help you today?
            </p>
            <p className="text-xs mt-2">
              You can ask about your project, request page edits, or submit
              feedback.
            </p>
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-gray-500">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full loading-dot" />
              <div className="w-2 h-2 bg-gray-400 rounded-full loading-dot" />
              <div className="w-2 h-2 bg-gray-400 rounded-full loading-dot" />
            </div>
            <span className="text-sm">Thinking...</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-red-500 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
            <button
              onClick={sendMessage}
              className="text-primary-600 hover:underline"
            >
              Retry
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white rounded-lg px-4 py-2 transition-colors"
            aria-label="Send message"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} chat-message`}
    >
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
          isUser
            ? "bg-primary-600 text-white"
            : "bg-gray-100 text-gray-800"
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>

        {/* Actions indicator */}
        {message.metadata?.actions && message.metadata.actions.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-200/20">
            {message.metadata.actions.map((action, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1 text-xs opacity-80"
              >
                {action.status === "completed" ? (
                  <Check className="w-3 h-3" />
                ) : action.status === "failed" ? (
                  <AlertCircle className="w-3 h-3" />
                ) : (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                )}
                <span>{formatActionLabel(action)}</span>
              </div>
            ))}
          </div>
        )}

        <p
          className={`text-xs mt-1 ${
            isUser ? "text-primary-200" : "text-gray-400"
          }`}
        >
          {formatRelativeTime(message.timestamp)}
        </p>
      </div>
    </div>
  );
}

function formatActionLabel(action: ChatAction): string {
  switch (action.type) {
    case "bricks_edit":
      return "Page updated";
    case "basecamp_create_todo":
      return "Todo created";
    case "basecamp_update_todo":
      return "Todo updated";
    default:
      return action.type;
  }
}
