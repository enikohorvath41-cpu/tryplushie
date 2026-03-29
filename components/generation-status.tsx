"use client";

import { useEffect, useMemo, useState } from "react";
import { Gift, ImageIcon, Sparkles, Wand2 } from "lucide-react";

const loadingLines = [
  "Turning your photo into a plushie…",
  "Softening features and shaping the plush look…",
  "Adding stitched details and cozy fabric texture…",
  "Balancing colors for a cute collectible finish…",
  "Finalising your plushie preview…"
];

const tipLines = [
  "Tip: clear close-up photos usually give the cutest results.",
  "Tip: pets, couples, and portraits work especially well.",
  "Tip: simple backgrounds help the plushie stand out.",
  "Tip: this would make a fun gift or profile picture."
];

export function GenerationStatus() {
  const [progress, setProgress] = useState(18);
  const [messageIndex, setMessageIndex] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const progressTimer = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 88) return current;
        const increment = current < 40 ? 8 : current < 65 ? 5 : 3;
        return Math.min(current + increment, 88);
      });
    }, 1400);

    const messageTimer = window.setInterval(() => {
      setMessageIndex((current) => (current + 1) % loadingLines.length);
    }, 2200);

    const tipTimer = window.setInterval(() => {
      setTipIndex((current) => (current + 1) % tipLines.length);
    }, 3200);

    return () => {
      window.clearInterval(progressTimer);
      window.clearInterval(messageTimer);
      window.clearInterval(tipTimer);
    };
  }, []);

  const progressLabel = useMemo(() => `${progress}%`, [progress]);

  return (
    <div className="glass-card overflow-hidden rounded-[32px] p-5 sm:p-6">
      <div className="rounded-[28px] border border-[rgba(173,118,63,0.12)] bg-[linear-gradient(180deg,rgba(255,252,248,0.95),rgba(250,236,214,0.92))] p-5 sm:p-6">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] border border-[rgba(173,118,63,0.12)] bg-white/75 shadow-[0_18px_40px_rgba(173,118,63,0.10)] sm:h-24 sm:w-24">
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-full bg-[rgba(183,125,63,0.15)]" />
            <div className="relative rounded-full bg-[var(--text)] p-4 text-white sm:p-5">
              <Sparkles size={26} />
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--gold-strong)] sm:text-xs">
            Generating plushie preview
          </p>

          <h3 className="mt-3 text-[1.9rem] font-semibold tracking-[-0.04em] text-[var(--text)] sm:text-[2.35rem]">
            Turning your photo into a cute plushie
          </h3>

          <p className="mx-auto mt-4 max-w-xl text-base leading-8 text-[var(--muted)] sm:text-lg">
            {loadingLines[messageIndex]}
          </p>
        </div>

        <div className="mt-7">
          <div className="mb-3 flex items-center justify-between gap-3 text-sm font-medium text-[var(--muted)]">
            <span>Typical total time 1–2 minutes</span>
            <span className="text-[var(--gold-strong)]">{progressLabel}</span>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-white/70">
            <div
              className="h-full rounded-full bg-[var(--gold)] transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="mt-3 text-center text-sm text-[var(--muted)]">
            Safe to keep this tab open while your plushie is being made.
          </p>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          {[
            { icon: <ImageIcon size={18} />, label: "Plushifying your image" },
            { icon: <Wand2 size={18} />, label: "Adding soft stitched details" },
            { icon: <Gift size={18} />, label: "This would make a great gift" }
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-[22px] border border-[rgba(173,118,63,0.14)] bg-white/72 px-4 py-4 text-left"
            >
              <div className="mb-2 text-[var(--gold-strong)]">{item.icon}</div>
              <p className="text-sm font-medium text-[var(--text)]">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-7 rounded-[24px] border border-[rgba(173,118,63,0.14)] bg-white/72 p-4 sm:p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--gold-strong)] sm:text-xs">
            Tip
          </p>
          <p className="mt-3 text-lg leading-8 text-[var(--text)] sm:text-[1.35rem]">
            {tipLines[tipIndex]}
          </p>
        </div>
      </div>
    </div>
  );
}
