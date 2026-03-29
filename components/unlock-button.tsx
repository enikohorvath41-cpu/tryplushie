"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { StickyUnlockBar } from "@/components/sticky-unlock-bar";

export function UnlockButton({ resultId }: { resultId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resultId })
      });

      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        throw new Error(data.error || "Could not start checkout.");
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start checkout.");
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleCheckout}
        disabled={loading}
        className="hidden min-h-16 w-full items-center justify-between rounded-full bg-[var(--text)] px-6 text-left text-white shadow-[0_20px_50px_rgba(37,21,5,0.25)] transition hover:scale-[1.01] disabled:opacity-60 md:flex"
      >
        <span>
          <span className="block text-[11px] uppercase tracking-[0.22em] text-white/70">
            Unlock your plushie
          </span>
          <span className="block text-base font-semibold">HD download · £2.99</span>
          <span className="block text-xs text-white/60">
            One-time payment · Secure checkout
          </span>
        </span>

        <span className="flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold">
          <Sparkles size={16} />
          {loading ? "Loading…" : "Unlock now"}
        </span>
      </button>

      {error ? <p className="mt-3 text-center text-sm font-medium text-[#a14321]">{error}</p> : null}

      <StickyUnlockBar onClick={handleCheckout} loading={loading} />
    </>
  );
}
