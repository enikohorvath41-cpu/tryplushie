"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, CreditCard, Loader2, Sparkles, Wand2 } from "lucide-react";

type CheckoutStatusResponse = {
  ok?: boolean;
  error?: string;
  purchaseType?: "paid_generation" | "single_unlock" | "credits" | string;
  paymentStatus?: string | null;
  resultId?: string | null;
  ready?: boolean;
  creditsAdded?: number | null;
  creditsBalance?: number | null;
};

const GENERATION_PROGRESS_LINES = [
  "Performing plushie generation",
  "Applying plushie style",
  "Finalising your result"
];

const GENERATION_TIPS = [
  "Stay on this page while we finish creating your plushie.",
  "Most plushies finish quickly, but it can take a little longer at busy times.",
  "Once ready, we’ll take you straight to your finished result."
];

const CREDITS_REDIRECT_DELAY_MS = 1500;

function CheckoutSuccessInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const redirectRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [resultId, setResultId] = useState<string | null>(null);
  const [purchaseType, setPurchaseType] = useState<string | null>(null);
  const [creditsAdded, setCreditsAdded] = useState<number | null>(null);
  const [creditsBalance, setCreditsBalance] = useState<number | null>(null);
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
    let creditsRedirectTimeout: ReturnType<typeof setTimeout> | null = null;

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

        const nextPurchaseType = data.purchaseType ?? null;
        const nextReady = Boolean(data.ready);
        const nextResultId = data.resultId ?? null;

        setPurchaseType(nextPurchaseType);
        setCreditsAdded(typeof data.creditsAdded === "number" ? data.creditsAdded : null);
        setCreditsBalance(typeof data.creditsBalance === "number" ? data.creditsBalance : null);
        setReady(nextReady);
        setResultId(nextResultId);
        setLoading(false);
        setError(null);

        if (nextPurchaseType === "paid_generation" && nextReady && nextResultId && !redirectRef.current) {
          redirectRef.current = true;
          router.replace(`/result/${nextResultId}`);
          return;
        }

        if (nextPurchaseType === "single_unlock" && nextReady && nextResultId && !redirectRef.current) {
          redirectRef.current = true;
          router.replace(`/result/${nextResultId}`);
          return;
        }

        if (nextPurchaseType === "credits" && nextReady && !redirectRef.current) {
          redirectRef.current = true;
          creditsRedirectTimeout = setTimeout(() => {
            router.replace("/#generator");
          }, CREDITS_REDIRECT_DELAY_MS);
          return;
        }

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
      if (creditsRedirectTimeout) clearTimeout(creditsRedirectTimeout);
    };
  }, [router, sessionId]);

  useEffect(() => {
    if (ready || purchaseType === "credits") return;

    const interval = setInterval(() => {
      setProgressIndex((current) => (current + 1) % GENERATION_PROGRESS_LINES.length);
    }, 1700);

    return () => clearInterval(interval);
  }, [purchaseType, ready]);

  const currentProgressLine = useMemo(
    () => GENERATION_PROGRESS_LINES[progressIndex],
    [progressIndex]
  );

  const isCreditsFlow = purchaseType === "credits";
  const isSingleUnlockFlow = purchaseType === "single_unlock";
  const isGenerationFlow =
    purchaseType === "paid_generation" || (!purchaseType && !isCreditsFlow && !isSingleUnlockFlow);

  const title = useMemo(() => {
    if (error) return "We couldn’t confirm your checkout just yet.";
    if (isCreditsFlow) return ready ? "Credits added to your account." : "Payment received. Adding your credits.";
    if (ready && isSingleUnlockFlow) return "Your plushie has been unlocked.";
    if (ready && isGenerationFlow) return "Your plushie is ready.";
    return "Payment received. We’re generating your plushie.";
  }, [error, isCreditsFlow, isGenerationFlow, isSingleUnlockFlow, ready]);

  const description = useMemo(() => {
    if (error) return error;
    if (isCreditsFlow) {
      if (ready) {
        if (typeof creditsBalance === "number") {
          return `Your credits are now on your account. Current balance: ${creditsBalance}. Taking you back to the generator now.`;
        }
        return "Your credits have been added and are ready to use. Taking you back to the generator now.";
      }

      return "Your payment was successful. We’re adding your credits to your account now.";
    }

    if (ready && isSingleUnlockFlow) {
      return "Your plushie unlock is complete and ready to view.";
    }

    if (ready && isGenerationFlow) {
      return "Your plushie has been created and is ready to open.";
    }

    return "Your payment was successful. Give us a moment to finish creating your plushie — we’ll take you to it as soon as it’s ready.";
  }, [creditsBalance, error, isCreditsFlow, isGenerationFlow, isSingleUnlockFlow, ready]);

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

      const nextPurchaseType = data.purchaseType ?? null;
      const nextReady = Boolean(data.ready);
      const nextResultId = data.resultId ?? null;

      setPurchaseType(nextPurchaseType);
      setReady(nextReady);
      setResultId(nextResultId);
      setCreditsAdded(typeof data.creditsAdded === "number" ? data.creditsAdded : null);
      setCreditsBalance(typeof data.creditsBalance === "number" ? data.creditsBalance : null);

      if (nextPurchaseType === "paid_generation" && nextReady && nextResultId) {
        router.replace(`/result/${nextResultId}`);
        return;
      }

      if (nextPurchaseType === "single_unlock" && nextReady && nextResultId) {
        router.replace(`/result/${nextResultId}`);
        return;
      }

      if (nextPurchaseType === "credits" && nextReady) {
        router.replace("/#generator");
        return;
      }
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
            {error ? (
              <CreditCard size={24} />
            ) : ready ? (
              <CheckCircle2 size={24} />
            ) : (
              <Loader2 className="animate-spin" size={24} />
            )}
          </div>

          <h1 className="text-[2.4rem] font-semibold leading-[1.02] tracking-[-0.045em] text-[var(--text)] sm:text-[3.2rem]">
            {title}
          </h1>

          <p className="mt-4 max-w-3xl text-[15px] leading-8 text-[var(--muted)] sm:text-base">
            {description}
          </p>

          {isCreditsFlow ? (
            <div className="mt-6 rounded-[28px] border border-[rgba(173,118,63,0.14)] bg-[rgba(255,255,255,0.72)] p-5">
              <div className="flex items-center gap-3 text-[var(--text)]">
                <CreditCard className="text-[var(--gold-strong)]" size={18} />
                <p className="text-sm font-semibold sm:text-base">
                  {ready ? "Credits are ready to use" : "Adding credits to your account"}
                </p>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[22px] border border-[rgba(173,118,63,0.14)] bg-[rgba(255,248,241,0.76)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--gold-strong)]">
                    Credits added
                  </p>
                  <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[var(--text)]">
                    {typeof creditsAdded === "number" ? creditsAdded : "—"}
                  </p>
                </div>

                <div className="rounded-[22px] border border-[rgba(173,118,63,0.14)] bg-[rgba(255,248,241,0.76)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--gold-strong)]">
                    Current balance
                  </p>
                  <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[var(--text)]">
                    {typeof creditsBalance === "number" ? creditsBalance : "—"}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-[22px] border border-[rgba(173,118,63,0.14)] bg-white/80 p-4">
                <p className="text-sm font-semibold text-[var(--text)]">How to use them</p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  Go back to the generator, upload a photo, then choose <span className="font-semibold text-[var(--text)]">Use 1 credit now</span>.
                </p>
              </div>
            </div>
          ) : !ready ? (
            <div className="mt-6 rounded-[28px] border border-[rgba(173,118,63,0.14)] bg-[rgba(255,255,255,0.72)] p-5">
              <div className="flex items-center gap-3 text-[var(--text)]">
                <Loader2 className="animate-spin text-[var(--gold-strong)]" size={18} />
                <p className="text-sm font-semibold sm:text-base">{currentProgressLine}</p>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-[rgba(173,118,63,0.12)]">
                <div className="h-full w-1/2 animate-pulse rounded-full bg-[var(--text)]" />
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {GENERATION_TIPS.map((tip) => (
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

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {isCreditsFlow ? (
              <Link
                href="/account"
                className="tp-brown-button inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--text)] px-5 text-sm font-semibold transition hover:opacity-95"
              >
                View account credits
              </Link>
            ) : ready && resultId ? (
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
              {isCreditsFlow ? (
                <span className="inline-flex items-center gap-2">
                  <Wand2 size={16} />
                  Use credits in generator
                </span>
              ) : (
                "Make another plushie"
              )}
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
            We’re checking your payment and preparing your plushie status now.
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
