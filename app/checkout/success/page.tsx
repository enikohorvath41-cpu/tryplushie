"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";

type CheckoutStatusResponse = {
  ok?: boolean;
  error?: string;
  purchaseType?: "paid_generation" | "single_unlock" | "credits" | string;
  paymentStatus?: string | null;
  resultId?: string | null;
  ready?: boolean;
};

const PROGRESS_LINES = [
  "Performing plushie generation",
  "Applying plushie style",
  "Finalising your result"
];

const TIPS = [
  "Stay on this page while we finish creating your plushie.",
  "Most plushies finish quickly, but it can take a little longer at busy times.",
  "Once ready, we’ll take you straight to your finished result."
];

function CheckoutSuccessInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [resultId, setResultId] = useState<string | null>(null);
  const [purchaseType, setPurchaseType] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progressIndex, setProgressIndex] = useState(0);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      setError("Missing checkout session.");
      return;
    }

    const safeSessionId = sessionId;
    let isMounted = true;
    let pollTimeout: ReturnType<typeof setTimeout> | null = null;

    async function checkStatus() {
      try {
        const response = await fetch(`/api/checkout?session_id=${encodeURIComponent(safeSessionId)}`, {
          cache: "no-store"
        });

        const data = (await response.json()) as CheckoutStatusResponse;

        if (!isMounted) return;

        if (!response.ok || !data.ok) {
          throw new Error(data.error || "Could not check your payment status.");
        }

        setPurchaseType(data.purchaseType ?? null);

        if (data.ready && data.resultId) {
          setReady(true);
          setResultId(data.resultId);
          setLoading(false);
          router.replace(`/result/${data.resultId}`);
          return;
        }

        setLoading(false);
        setReady(false);
        setResultId(data.resultId ?? null);

        pollTimeout = setTimeout(checkStatus, 2500);
      } catch (err) {
        if (!isMounted) return;
        setLoading(false);
        setError(err instanceof Error ? err.message : "Could not check your payment status.");
      }
    }

    checkStatus();

    return () => {
      isMounted = false;
      if (pollTimeout) clearTimeout(pollTimeout);
    };
  }, [router, sessionId]);

  useEffect(() => {
    if (ready) return;

    const interval = setInterval(() => {
      setProgressIndex((current) => (current + 1) % PROGRESS_LINES.length);
    }, 1700);

    return () => clearInterval(interval);
  }, [ready]);

  const currentProgressLine = useMemo(() => PROGRESS_LINES[progressIndex], [progressIndex]);

  async function refreshStatus() {
    if (!sessionId) return;

    const safeSessionId = sessionId;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/checkout?session_id=${encodeURIComponent(safeSessionId)}`, {
        cache: "no-store"
      });

      const data = (await response.json()) as CheckoutStatusResponse;

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Could not refresh your payment status.");
      }

      setPurchaseType(data.purchaseType ?? null);

      if (data.ready && data.resultId) {
        setReady(true);
        setResultId(data.resultId);
        router.replace(`/result/${data.resultId}`);
        return;
      }

      setReady(false);
      setResultId(data.resultId ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not refresh your payment status.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="glass-card rounded-[34px] p-6 sm:p-8">
          <div className="mb-4 inline-flex rounded-full bg-[rgba(183,125,63,0.12)] p-3 text-[var(--gold-strong)]">
            {ready ? <CheckCircle2 size={24} /> : <Loader2 className="animate-spin" size={24} />}
          </div>

          <h1 className="text-[2.4rem] font-semibold leading-[1.02] tracking-[-0.045em] text-[var(--text)] sm:text-[3.2rem]">
            {ready
              ? purchaseType === "paid_generation"
                ? "Your plushie is ready."
                : "Payment complete."
              : "Payment received. We&apos;re generating your plushie."}
          </h1>

          <p className="mt-4 max-w-3xl text-[15px] leading-8 text-[var(--muted)] sm:text-base">
            {ready
              ? purchaseType === "paid_generation"
                ? "Your plushie has been created and is ready to open."
                : "Your plushie has been unlocked and is ready to view."
              : "Your payment was successful. Give us a moment to finish creating your plushie — we&apos;ll take you to it as soon as it&apos;s ready."}
          </p>

          {!ready ? (
            <div className="mt-6 rounded-[28px] border border-[rgba(173,118,63,0.14)] bg-[rgba(255,255,255,0.72)] p-5">
              <div className="flex items-center gap-3 text-[var(--text)]">
                <Loader2 className="animate-spin text-[var(--gold-strong)]" size={18} />
                <p className="text-sm font-semibold sm:text-base">{currentProgressLine}</p>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-[rgba(173,118,63,0.12)]">
                <div className="tp-brown-button h-full w-1/2 animate-pulse rounded-full bg-[var(--text)]" />
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {TIPS.map((tip) => (
                  <div
                    key={tip}
                    className="rounded-[22px] border border-[rgba(173,118,63,0.14)] bg-[rgba(255,248,241,0.76)] p-4"
                  >
                    <div className="mb-3 inline-flex rounded-full bg-[rgba(183,125,63,0.12)] p-2.5 text-[var(--gold-strong)]">
                      <Sparkles size={16} />
                    </div>
                    <p className="text-sm leading-6 text-[var(--text)]">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {error ? <p className="mt-4 text-sm font-medium text-[#a14321]">{error}</p> : null}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {ready && resultId ? (
              <Link
                href={`/result/${resultId}`}
                className="tp-brown-button inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--text)] px-5 text-sm font-semibold transition hover:opacity-95"
              >
                View your plushie
              </Link>
            ) : (
              <button
                type="button"
                onClick={refreshStatus}
                disabled={loading || !sessionId}
                className="tp-brown-button inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--text)] px-5 text-sm font-semibold transition hover:opacity-95 disabled:opacity-60"
              >
                {loading ? "Checking status…" : "Refresh status"}
              </button>
            )}

            <Link
              href="/#generator"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[rgba(173,118,63,0.2)] bg-white/70 px-5 text-sm font-semibold text-[var(--text)] transition hover:bg-white/85"
            >
              Make another plushie
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function CheckoutSuccessFallback() {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="glass-card rounded-[34px] p-6 sm:p-8">
          <div className="mb-4 inline-flex rounded-full bg-[rgba(183,125,63,0.12)] p-3 text-[var(--gold-strong)]">
            <Loader2 className="animate-spin" size={24} />
          </div>
          <h1 className="text-[2.4rem] font-semibold leading-[1.02] tracking-[-0.045em] text-[var(--text)] sm:text-[3.2rem]">
            Loading your checkout…
          </h1>
          <p className="mt-4 max-w-3xl text-[15px] leading-8 text-[var(--muted)] sm:text-base">
            We&apos;re checking your payment and preparing your plushie status now.
          </p>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<CheckoutSuccessFallback />}>
      <CheckoutSuccessInner />
    </Suspense>
  );
}
