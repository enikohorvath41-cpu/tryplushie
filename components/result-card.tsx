"use client";

import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";

type ResultCardProps = {
  imageUrl: string | null;
  resultId?: string | null;
  remainingCredits?: number | null;
  usedFreeGeneration?: boolean;
};

export function ResultCard({
  imageUrl,
  resultId,
  remainingCredits,
  usedFreeGeneration = false
}: ResultCardProps) {
  const hasCredits = typeof remainingCredits === "number" && remainingCredits > 0;
  const hasNoCredits = typeof remainingCredits === "number" && remainingCredits <= 0;

  return (
    <div className="glass-card overflow-hidden rounded-[30px] p-4">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--gold-strong)]">
            Plushie preview
          </p>
          <h3 className="mt-1 text-[1.9rem] font-semibold tracking-[-0.04em] text-[var(--text)] sm:text-[2.2rem]">
            {imageUrl ? "Your result is ready" : "Your result will appear here"}
          </h3>
        </div>

        <div className="rounded-full border border-[rgba(173,118,63,0.2)] bg-white/70 px-4 py-2 text-sm font-semibold text-[var(--gold-strong)]">
          {imageUrl ? "Preview generated" : "Waiting"}
        </div>
      </div>

      <div className="relative aspect-square overflow-hidden rounded-[28px] bg-[linear-gradient(180deg,#fff8f2,#f6dec0)]">
        {imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt="Generated plushie preview"
              className="h-full w-full scale-[1.02] object-cover blur-[2.2px] brightness-[0.98] saturate-[0.94]"
            />

            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,rgba(255,255,255,0.10)_45%,rgba(0,0,0,0.12)_100%)]" />

            <div className="pointer-events-none absolute inset-0 opacity-85">
              <div className="absolute left-[-18%] top-[22%] w-[140%] rotate-[-15deg] bg-[rgba(255,255,255,0.55)] py-5 shadow-[0_8px_30px_rgba(37,21,5,0.12)] backdrop-blur-md">
                <div className="text-center text-[20px] font-semibold uppercase tracking-[0.34em] text-white drop-shadow-[0_2px_8px_rgba(37,21,5,0.35)] sm:text-[26px]">
                  TRYPLUSHIE · PREVIEW ONLY · TRYPLUSHIE · PREVIEW ONLY
                </div>
              </div>

              <div className="absolute left-[-18%] top-[58%] w-[140%] rotate-[-15deg] bg-[rgba(37,21,5,0.24)] py-4 shadow-[0_8px_30px_rgba(37,21,5,0.12)] backdrop-blur-sm">
                <div className="text-center text-[15px] font-semibold uppercase tracking-[0.34em] text-white/90 sm:text-[18px]">
                  HD LOCKED · TRYPLUSHIE · HD LOCKED · TRYPLUSHIE
                </div>
              </div>
            </div>

            <div className="absolute left-5 top-5 rounded-full bg-white/90 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--gold-strong)]">
              Free preview
            </div>

            <div className="absolute right-5 top-5 rounded-full bg-[rgba(37,21,5,0.78)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white">
              HD locked
            </div>

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[rgba(37,21,5,0.66)] via-[rgba(37,21,5,0.20)] to-transparent p-5 sm:p-6">
              <div className="flex items-center gap-2 text-white">
                <Lock size={16} />
                <p className="text-base font-semibold">
                  Unlock the clean HD version after checkout.
                </p>
              </div>
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/80">
                This preview is intentionally lower quality and watermarked until it is unlocked.
              </p>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
            <div className="rounded-full bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--gold-strong)]">
              Plushie preview
            </div>
            <p className="max-w-[18rem] text-balance text-base font-semibold text-[var(--text)]">
              Your plushie result will appear here after generation.
            </p>
            <p className="max-w-[18rem] text-sm leading-6 text-[var(--muted)]">
              Preview first, then unlock the clean HD image if you love it.
            </p>
          </div>
        )}
      </div>

      {imageUrl ? (
        <div className="mt-4 space-y-3">
          {usedFreeGeneration ? (
            <div className="rounded-[22px] border border-[rgba(173,118,63,0.16)] bg-white/70 p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-[rgba(183,125,63,0.12)] p-2 text-[var(--gold-strong)]">
                  <Sparkles size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--text)]">
                    Your free generation has now been used
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                    You can still unlock this plushie, or buy credits for more generations.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {typeof remainingCredits === "number" ? (
            <div className="rounded-[22px] border border-[rgba(173,118,63,0.16)] bg-[rgba(255,248,241,0.72)] px-4 py-3 text-sm">
              <span className="font-semibold text-[var(--text)]">Credits:</span>{" "}
              <span className="text-[var(--muted)]">
                {hasCredits
                  ? `${remainingCredits} remaining for more plushie generations.`
                  : "No credits remaining right now."}
              </span>
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            {resultId ? (
              <Link
                href={`/result/${resultId}`}
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--text)] px-5 text-sm font-semibold text-white transition hover:opacity-95"
              >
                Unlock this plushie
              </Link>
            ) : null}

            <Link
              href={hasNoCredits ? "/credits" : "/#generator"}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[rgba(173,118,63,0.18)] bg-white/80 px-5 text-sm font-semibold text-[var(--text)] transition hover:bg-white"
            >
              {hasNoCredits ? "Buy credits" : "Generate another"}
            </Link>
          </div>

          {resultId ? (
            <Link
              href={`/result/${resultId}`}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[rgba(173,118,63,0.18)] bg-transparent px-5 text-sm font-semibold text-[var(--gold-strong)] transition hover:bg-white/40"
            >
              View full result page
            </Link>
          ) : null}
        </div>
      ) : resultId ? (
        <Link
          href={`/result/${resultId}`}
          className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--text)] px-5 text-sm font-semibold text-white transition hover:opacity-95"
        >
          View full result page
        </Link>
      ) : null}
    </div>
  );
}
