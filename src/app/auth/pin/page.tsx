"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function PinForm() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });

      if (response.ok) {
        const redirect = searchParams.get("redirect") || "/teaching";
        router.push(redirect);
      } else {
        setError("Invalid PIN. Please try again.");
        setPin("");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="pin"
          className="block text-sm font-medium text-[#a1a1a1] mb-2"
        >
          PIN Code
        </label>
        <input
          id="pin"
          type="password"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="w-full px-4 py-3 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg focus:ring-2 focus:ring-teal-500/50 focus:outline-none text-lg text-[#f5f5f5] text-center tracking-widest placeholder-[#666]"
          placeholder="----"
          maxLength={4}
          autoFocus
          disabled={loading}
        />
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || pin.length === 0}
        className="w-full bg-teal-500 hover:bg-teal-600 text-gray-950 py-3 rounded-lg font-semibold disabled:bg-[#2a2a2a] disabled:text-[#666] disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Verifying..." : "Unlock"}
      </button>
    </form>
  );
}

export default function PinAuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0c0c0c]">
      <div className="bg-[#161616] border border-[#2a2a2a] p-8 rounded-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#f5f5f5] mb-2">
            Teaching System
          </h1>
          <p className="text-[#a1a1a1]">Enter your PIN to continue</p>
        </div>

        <Suspense fallback={
          <div className="text-center py-8 text-[#a1a1a1]">Loading...</div>
        }>
          <PinForm />
        </Suspense>

        <div className="mt-6 text-center">
          <p className="text-xs text-[#666]">
            Bricks Builder Teaching System MVP
          </p>
        </div>
      </div>
    </div>
  );
}
