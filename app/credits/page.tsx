"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, CreditCard, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";

type PackId = "small" | "popular" | "mega";

type ProfileCreditsRow = {
  credits: number | null;
};

const CREDIT_PACKS: Array<{
  id: PackId;
  credits: number;
  price: string;
  badge?: string;
  title: string;
  description: string;
}> = [
  {
    id: "small",
    credits: 3,
    price: "£4.99",
    title: "Starter pack",
    description: "A light top-up for trying more photos."
  },
  {
    id: "popular",
    credits: 10,
    price: "£12.99",
    badge: "Most popular",
    title: "Popular pack",
    description: "Best for trying different photos, people, and styles."
  },
  {
    id: "mega",
    credits: 25,
    price: "£24.99",
    title: "Mega pack",
    description: "Best value for lots of plushie generations."
  }
];

export default function CreditsPage() {
  const router = useRouter();
  const [loadingPack, setLoadingPack] = useState<PackId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [loadingCredits, setLoadingCredits] = useState(true);

  const totalGenerationsAvailable = useMemo(() => {
    return credits ?? 0;
  }, [credits]);

  useEffect(() => {
    let isMounted = true;

    async function loadCredits() {
      setLoadingCredits(true);

      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!session?.user?.id) {
        if (isMounted) {
          setCredits(null);
          setLoadingCredits(false);
        }
        return;
      }

      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("credits")
        .eq("id", session.user.id)
        .maybeSingle();

      if (!isMounted) return;

      if (profileError) {
        setError(profileError.message);
        setCredits(null);
      } else {
        setCredits((data as ProfileCreditsRow | null)?.credits ?? 0);
      }

      setLoadingCredits(false);
    }

    loadCredits();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleBuyCredits(packId: PackId) {
    setLoadingPack(packId);
    setError(null);

    try {
      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        router.push("/auth?next=%2Fcredits");
        return;
      }

      const response = await fetch("/api/checkout/credits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ packId })
      });

      const data = (await response.json()) as { ok?: boolean; url?: string; error?: string; code?: string };

      if (!response.ok || !data.url) {
        if (data.code === "AUTH_REQUIRED") {
          router.push("/auth?next=%2Fcredits");
          return;
        }

        throw new Error(data.error || "Could not start credit checkout.");
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start credit checkout.");
      setLoadingPack(null);
    }
  }

  return (
    <main className="min-h-screen px-4 py-5 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="flex items-center justify-between gap-4">
          <Link href="/account" className="text-sm font-semibold text-[var(--gold-strong)] transition hover:opacity-80">
            ← Back to account
          </Link>

          <Link
            href="/#generator"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-[rgba(173,118,63,0.2)] bg-white/70 px-4 text-sm font-semibold text-[var(--text)] transition hover:bg-white/85"
          >
            Back to generator
          </Link>
        </div>

        <section className="glass-card rounded-[34px] p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--gold-strong)]">
                Buy credits
              </p>
              <h1 className="mt-2 text-[2rem] font-semibold tracking-[-0.04em] text-[var(--text)] sm:text-[2.5rem]">
                Keep creating more plushies
              </h1>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)] sm:text-base">
                Credits are best when you want to try more photos, more people, or more plushie styles without buying a single unlock each time.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[360px]">
              <div className="rounded-[26px] border border-[rgba(173,118,63,0.16)] bg-[linear-gradient(180deg,rgba(255,251,247,0.95),rgba(250,235,213,0.92))] px-5 py-4 text-left shadow-[0_18px_50px_rgba(173,118,63,0.08)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--gold-strong)]">
                  Current credits
                </p>
                <p className="mt-2 text-[2.6rem] font-semibold leading-none tracking-[-0.05em] text-[var(--text)]">
                  {loadingCredits ? "…" : credits ?? 0}
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  Visible before checkout so you always know your balance.
                </p>
              </div>

              <div className="rounded-[26px] border border-[rgba(173,118,63,0.16)] bg-white/72 px-5 py-4 text-left">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--gold-strong)]">
                  How credits work
                </p>
                <p className="mt-2 text-[1.6rem] font-semibold leading-none tracking-[-0.05em] text-[var(--text)]">
                  1 image = 1 credit
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  Your current balance covers {loadingCredits ? "…" : totalGenerationsAvailable} more plushie generation{totalGenerationsAvailable === 1 ? "" : "s"}.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 xl:grid-cols-3">
            {CREDIT_PACKS.map((pack) => {
              const isLoading = loadingPack === pack.id;

              return (
                <div
                  key={pack.id}
                  className={`relative rounded-[30px] border p-5 ${
                    pack.badge
                      ? "border-[rgba(173,118,63,0.3)] bg-[linear-gradient(180deg,rgba(255,250,245,0.95),rgba(251,239,222,0.9))]"
                      : "border-[rgba(173,118,63,0.16)] bg-white/72"
                  }`}
                >
                  {pack.badge ? (
                    <div className="absolute right-4 top-4 rounded-full bg-[var(--text)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
                      {pack.badge}
                    </div>
                  ) : null}

                  <div className="mb-3 inline-flex rounded-full bg-[rgba(183,125,63,0.12)] p-3 text-[var(--gold-strong)]">
                    <Sparkles size={18} />
                  </div>

                  <p className="text-sm font-semibold text-[var(--text)]">{pack.title}</p>
                  <h2 className="mt-2 text-[2.1rem] font-semibold tracking-[-0.04em] text-[var(--text)]">
                    {pack.price}
                  </h2>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-[var(--gold-strong)]">{pack.credits} credits</p>
                    <span className="rounded-full bg-[rgba(183,125,63,0.12)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--gold-strong)]">
                      {pack.credits} images
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{pack.description}</p>

                  <div className="mt-4 space-y-3">
                    {[
                      `${pack.credits} extra plushie generations`,
                      "Fast secure Stripe checkout",
                      "Credits are added to your account automatically"
                    ].map((item) => (
                      <div
                        key={item}
                        className="flex items-start gap-3 rounded-[20px] border border-[rgba(173,118,63,0.14)] bg-white/78 px-4 py-3 text-sm font-medium text-[var(--text)]"
                      >
                        <Check size={16} className="mt-0.5 shrink-0 text-[var(--gold-strong)]" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleBuyCredits(pack.id)}
                    disabled={Boolean(loadingPack)}
                    className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--text)] px-5 text-sm font-semibold text-white transition hover:opacity-95 disabled:opacity-60"
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={18} /> : <CreditCard size={18} />}
                    {isLoading ? "Redirecting…" : `Buy ${pack.credits} credits`}
                  </button>
                </div>
              );
            })}
          </div>

          {error ? (
            <p className="mt-4 text-center text-sm font-medium text-[#a14321]">{error}</p>
          ) : null}

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="rounded-[26px] border border-[rgba(173,118,63,0.16)] bg-[rgba(255,248,241,0.72)] p-4 sm:p-5">
              <p className="text-sm font-semibold text-[var(--text)]">When to buy credits vs unlock one image</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Buy a single unlock when you only want to keep one finished plushie. Buy credits when you want to generate more plushies across different photos.
              </p>
            </div>

            <div className="rounded-[26px] border border-[rgba(173,118,63,0.16)] bg-white/72 p-4 sm:p-5">
              <p className="text-sm font-semibold text-[var(--text)]">Best next step</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                If you are trying multiple selfies, pets, or family photos, credits will usually feel better than repeating one-off payments.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href="/#generator"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[var(--text)] px-4 text-sm font-semibold text-white transition hover:opacity-95"
                >
                  Use credits in generator
                  <ArrowRight size={16} />
                </Link>

                <Link
                  href="/account"
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-[rgba(173,118,63,0.2)] bg-white/80 px-4 text-sm font-semibold text-[var(--text)] transition hover:bg-white"
                >
                  View account
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
