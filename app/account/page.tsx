"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, ImageIcon, Loader2, Lock, Plus, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";

type ProfileRow = {
  id: string;
  email: string | null;
  credits: number | null;
  free_generations_used: number | null;
};

type GenerationRow = {
  id: string;
  style: string | null;
  preview_image_url: string | null;
  is_unlocked: boolean | null;
  created_at: string | null;
};

function formatDate(value: string | null) {
  if (!value) return "Recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(date);
}

export default function AccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [generations, setGenerations] = useState<GenerationRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const freePreviewUsed = useMemo(() => (profile?.free_generations_used ?? 0) >= 1, [profile]);
  const credits = profile?.credits ?? 0;

  useEffect(() => {
    let isMounted = true;

    async function loadAccount() {
      setLoading(true);
      setError(null);

      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/auth?next=%2Faccount");
        return;
      }

      const [profileResponse, generationsResponse] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, email, credits, free_generations_used")
          .eq("id", session.user.id)
          .single(),
        supabase
          .from("generations")
          .select("id, style, preview_image_url, is_unlocked, created_at")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })
      ]);

      if (!isMounted) return;

      if (profileResponse.error) {
        setError(profileResponse.error.message);
      } else {
        setProfile(profileResponse.data as ProfileRow);
      }

      if (generationsResponse.error) {
        setError(generationsResponse.error.message);
      } else {
        setGenerations((generationsResponse.data ?? []) as GenerationRow[]);
      }

      setLoading(false);
    }

    loadAccount();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return (
    <main className="min-h-screen px-4 py-5 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="flex items-center justify-between gap-4">
          <Link href="/#generator" className="text-sm font-semibold text-[var(--gold-strong)] transition hover:opacity-80">
            ← Back to TryPlushie
          </Link>

          <Link
            href="/credits"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--text)] px-4 text-sm font-semibold text-white transition hover:opacity-95"
          >
            Buy credits
          </Link>
        </div>

        <section className="glass-card rounded-[34px] p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--gold-strong)]">
                Your account
              </p>
              <h1 className="mt-2 text-[2rem] font-semibold tracking-[-0.04em] text-[var(--text)] sm:text-[2.4rem]">
                Your plushies and credits
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-base">
                Keep track of your generations, check your credits, and jump back into creating more plushies.
              </p>
            </div>

            <div className="rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-[var(--gold-strong)]">
              {profile?.email ?? "TryPlushie account"}
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-[28px] border border-[rgba(173,118,63,0.16)] bg-white/72 p-4">
              <div className="mb-3 inline-flex rounded-full bg-[rgba(183,125,63,0.12)] p-3 text-[var(--gold-strong)]">
                <CreditCard size={18} />
              </div>
              <p className="text-sm font-semibold text-[var(--text)]">Credits</p>
              <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[var(--text)]">{credits}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Use credits for extra plushie generations after your free preview has been used.
              </p>
            </div>

            <div className="rounded-[28px] border border-[rgba(173,118,63,0.16)] bg-white/72 p-4">
              <div className="mb-3 inline-flex rounded-full bg-[rgba(183,125,63,0.12)] p-3 text-[var(--gold-strong)]">
                <Sparkles size={18} />
              </div>
              <p className="text-sm font-semibold text-[var(--text)]">Free preview</p>
              <p className="mt-2 text-lg font-semibold text-[var(--text)]">
                {freePreviewUsed ? "Used" : "Still available"}
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                {freePreviewUsed
                  ? "Your free generation has been used. Credits or single unlocks can take you further."
                  : "Your account still has its first free plushie generation available."}
              </p>
            </div>

            <div className="rounded-[28px] border border-[rgba(173,118,63,0.16)] bg-white/72 p-4">
              <div className="mb-3 inline-flex rounded-full bg-[rgba(183,125,63,0.12)] p-3 text-[var(--gold-strong)]">
                <ImageIcon size={18} />
              </div>
              <p className="text-sm font-semibold text-[var(--text)]">Your plushies</p>
              <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[var(--text)]">{generations.length}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                All your latest generations in one place, ready to reopen whenever you want.
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/credits"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--text)] px-5 text-sm font-semibold text-white transition hover:opacity-95"
            >
              Buy credits
            </Link>
            <Link
              href="/#generator"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[rgba(173,118,63,0.2)] bg-white/70 px-5 text-sm font-semibold text-[var(--text)] transition hover:bg-white/85"
            >
              Generate another plushie
            </Link>
          </div>
        </section>

        <section className="glass-card rounded-[34px] p-5 sm:p-6">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--gold-strong)]">
                Recent generations
              </p>
              <h2 className="mt-2 text-[1.7rem] font-semibold tracking-[-0.04em] text-[var(--text)] sm:text-[2rem]">
                Your previous plushies
              </h2>
            </div>

            <Link
              href="/#generator"
              className="hidden min-h-11 items-center justify-center rounded-full border border-[rgba(173,118,63,0.2)] bg-white/70 px-4 text-sm font-semibold text-[var(--text)] transition hover:bg-white/85 sm:inline-flex"
            >
              <Plus size={16} className="mr-2" />
              New plushie
            </Link>
          </div>

          {loading ? (
            <div className="flex min-h-[220px] items-center justify-center">
              <div className="flex items-center gap-3 text-[var(--text)]">
                <Loader2 className="animate-spin" size={20} />
                <span className="text-sm font-semibold">Loading your account…</span>
              </div>
            </div>
          ) : error ? (
            <div className="rounded-[24px] border border-[rgba(161,67,33,0.18)] bg-[rgba(255,244,240,0.8)] p-4 text-sm font-medium text-[#a14321]">
              {error}
            </div>
          ) : generations.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {generations.map((item) => (
                <Link
                  key={item.id}
                  href={`/result/${item.id}`}
                  className="group overflow-hidden rounded-[28px] border border-[rgba(173,118,63,0.14)] bg-white/72 transition hover:-translate-y-0.5 hover:bg-white/82"
                >
                  <div className="relative aspect-square overflow-hidden bg-[linear-gradient(180deg,#fff8f1,#f5dcc0)]">
                    {item.preview_image_url ? (
                      <img
                        src={item.preview_image_url}
                        alt="Saved plushie preview"
                        className={`h-full w-full object-cover transition group-hover:scale-[1.02] ${
                          item.is_unlocked ? "" : "blur-[1.6px] brightness-[0.98]"
                        }`}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[var(--gold-strong)]">
                        <ImageIcon size={28} />
                      </div>
                    )}

                    <div className="absolute left-4 top-4 rounded-full bg-white/88 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--gold-strong)]">
                      {item.style || "Classic"}
                    </div>

                    <div
                      className={`absolute right-4 top-4 rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                        item.is_unlocked
                          ? "bg-[rgba(37,21,5,0.84)] text-white"
                          : "bg-white/88 text-[var(--gold-strong)]"
                      }`}
                    >
                      {item.is_unlocked ? "Unlocked" : "Preview"}
                    </div>

                    {!item.is_unlocked ? (
                      <div className="pointer-events-none absolute inset-x-4 bottom-4 rounded-full bg-[rgba(37,21,5,0.68)] px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-white backdrop-blur-sm">
                        <Lock size={12} className="mr-2 inline-block" />
                        HD locked
                      </div>
                    ) : null}
                  </div>

                  <div className="p-4">
                    <p className="text-sm font-semibold text-[var(--text)]">
                      {item.is_unlocked ? "Unlocked plushie" : "Preview ready"}
                    </p>
                    <p className="mt-1 text-sm text-[var(--muted)]">{formatDate(item.created_at)}</p>
                    <div className="mt-3 inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--text)] px-4 text-sm font-semibold text-white transition group-hover:opacity-95">
                      Open result
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-[28px] border border-dashed border-[rgba(173,118,63,0.24)] bg-[rgba(255,248,241,0.62)] p-6 text-center">
              <p className="text-base font-semibold text-[var(--text)]">No plushies yet</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Your generated plushies will appear here once you create your first preview.
              </p>
              <Link
                href="/#generator"
                className="mt-4 inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--text)] px-5 text-sm font-semibold text-white transition hover:opacity-95"
              >
                Create your first plushie
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
