"use client";

import { Sparkles } from "lucide-react";

export function StickyUnlockBar({
  onClick,
  loading = false
}: {
  onClick: () => void;
  loading?: boolean;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[rgba(173,118,63,0.16)] bg-[rgba(255,250,246,0.92)] px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-3 backdrop-blur-xl md:hidden">
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="flex min-h-16 w-full items-center justify-between rounded-full bg-[var(--text)] px-5 text-left text-white shadow-[0_20px_50px_rgba(37,21,5,0.25)] transition active:scale-[0.98] disabled:opacity-60"
      >
        <span>
          <span className="block text-[11px] uppercase tracking-[0.22em] text-white/70">
            Unlock your plushie
          </span>
          <span className="block text-base font-semibold">
            HD download · £2.99
          </span>
          <span className="block text-xs text-white/60">
            One-time payment · No account needed
          </span>
        </span>

        <span className="flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold">
          <Sparkles size={16} />
          {loading ? "Loading…" : "Unlock now"}
        </span>
      </button>
    </div>
  );
}
