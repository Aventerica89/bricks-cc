"use client";

import { useState } from "react";
import {
  MessageSquarePlus,
  Bug,
  Lightbulb,
  MessageCircle,
  Send,
  Loader2,
  CheckCircle,
  X,
} from "lucide-react";
import type { ClientFeedbackRequest } from "@/types/client";

interface FeedbackFormProps {
  clientId: string;
  siteId: string;
  onSuccess?: (feedbackId: string) => void;
  onClose?: () => void;
  embedded?: boolean;
}

type FeedbackType = "bug" | "feature" | "general";

const feedbackTypes: {
  type: FeedbackType;
  label: string;
  icon: React.ReactNode;
  description: string;
}[] = [
  {
    type: "bug",
    label: "Bug Report",
    icon: <Bug className="w-5 h-5" />,
    description: "Something isn&apos;t working correctly",
  },
  {
    type: "feature",
    label: "Feature Request",
    icon: <Lightbulb className="w-5 h-5" />,
    description: "Suggest a new feature or improvement",
  },
  {
    type: "general",
    label: "General Feedback",
    icon: <MessageCircle className="w-5 h-5" />,
    description: "Share your thoughts or questions",
  },
];

export default function FeedbackForm({
  clientId,
  siteId,
  onSuccess,
  onClose,
  embedded = false,
}: FeedbackFormProps) {
  const [feedbackType, setFeedbackType] = useState<FeedbackType>("general");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      setError("Please enter your feedback");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          siteId,
          feedbackType,
          message: message.trim(),
        } as ClientFeedbackRequest),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit feedback");
      }

      const data = await response.json();
      setIsSubmitted(true);

      if (onSuccess) {
        onSuccess(data.feedbackId);
      }

      // Reset form after delay
      setTimeout(() => {
        setMessage("");
        setIsSubmitted(false);
        if (onClose) onClose();
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div
        className={`${embedded ? "" : "bg-[#161616] rounded-xl border border-[#2a2a2a] p-6"}`}
      >
        <div className="text-center py-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[#f5f5f5] mb-2">
            Thank You!
          </h3>
          <p className="text-[#a1a1a1]">
            Your feedback has been submitted successfully.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${embedded ? "" : "bg-[#161616] rounded-xl border border-[#2a2a2a]"}`}
    >
      {/* Header */}
      {!embedded && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a2a]">
          <div className="flex items-center gap-2">
            <MessageSquarePlus className="w-5 h-5 text-teal-500" />
            <h2 className="text-lg font-semibold text-[#f5f5f5]">
              Submit Feedback
            </h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-[#666] hover:text-[#a1a1a1]"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Feedback Type Selection */}
        <div>
          <label className="block text-sm font-medium text-[#a1a1a1] mb-3">
            What type of feedback is this?
          </label>
          <div className="grid grid-cols-3 gap-3">
            {feedbackTypes.map(({ type, label, icon }) => (
              <button
                key={type}
                type="button"
                onClick={() => setFeedbackType(type)}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                  feedbackType === type
                    ? "border-teal-500 bg-teal-500/10 text-teal-400"
                    : "border-[#2a2a2a] hover:border-[#3a3a3a] text-[#a1a1a1]"
                }`}
              >
                {icon}
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Message Input */}
        <div>
          <label
            htmlFor="feedback-message"
            className="block text-sm font-medium text-[#a1a1a1] mb-2"
          >
            Your Feedback
          </label>
          <textarea
            id="feedback-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={
              feedbackType === "bug"
                ? "Please describe the issue you encountered..."
                : feedbackType === "feature"
                  ? "Describe the feature you'd like to see..."
                  : "Share your thoughts..."
            }
            className="w-full h-32 px-4 py-3 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg resize-none text-[#f5f5f5] placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-teal-500/50"
            disabled={isSubmitting}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-400 text-sm flex items-center gap-2">
            <Bug className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !message.trim()}
          className="w-full flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 disabled:bg-[#2a2a2a] disabled:text-[#666] text-gray-950 font-medium py-3 px-4 rounded-lg transition-colors"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Submit Feedback
            </>
          )}
        </button>
      </form>
    </div>
  );
}
