"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CreditCard, ImageIcon, Loader2, LogOut, Plus, Sparkles } from "lucide-react";
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
  const [signingOut, setSigningOut] = useState(false);
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

  async function handleSignOut() {
    setSigningOut(true);
    setError(null);

    try {
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        throw signOutError;
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign out right now.");
      setSigningOut(false);
    }
  }

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

            <div className="flex flex-col items-stretch gap-3 sm:items-end">
              <div className="rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-[var(--gold-strong)]">
                {profile?.email ?? "TryPlushie account"}
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[rgba(173,118,63,0.2)] bg-white/70 px-4 text-sm font-semibold text-[var(--text)] transition hover:bg-white/85 disabled:opacity-60"
              >
                {signingOut ? <Loader2 className="animate-spin" size={16} /> : <LogOut size={16} />}
                {signingOut ? "Signing out…" : "Log out"}
              </button>
            </div>
          </div>

          <div className="mt-5 rounded-[30px] border border-[rgba(173,118,63,0.16)] bg-[linear-gradient(180deg,rgba(255,251,247,0.95),rgba(250,235,213,0.92))] p-5 shadow-[0_18px_50px_rgba(173,118,63,0.08)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--gold-strong)]">
                  Available credits
                </p>
                <div className="mt-2 flex items-end gap-3">
                  <p className="text-[3rem] font-semibold leading-none tracking-[-0.06em] text-[var(--text)] sm:text-[4rem]">
                    {credits}
                  </p>
                  <p className="pb-2 text-sm font-medium text-[var(--muted)]">
                    ready to use
                  </p>
                </div>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                  Credits let you create extra plushies after your free preview has been used.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:min-w-[240px]">
                <Link
                  href="/credits"
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--text)] px-5 text-sm font-semibold text-white transition hover:opacity-95"
                >
                  Buy more credits
                </Link>
                <Link
                  href="/#generator"
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-[rgba(173,118,63,0.2)] bg-white/80 px-5 text-sm font-semibold text-[var(--text)] transition hover:bg-white"
                >
                  Use credits now
                </Link>
              </div>
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
                Visible here any time so you always know how many generations you have left.
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
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.preview_image_url}
                        alt={`${item.style ?? "Plushie"} result`}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm font-semibold text-[var(--gold-strong)]">
                        Plushie preview
                      </div>
                    )}

                    <div className="absolute left-3 top-3 rounded-full bg-white/86 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--gold-strong)]">
                      {item.is_unlocked ? "Unlocked" : "Preview"}
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold capitalize text-[var(--text)]">
                          {item.style ?? "Classic"} plushie
                        </p>
                        <p className="mt-1 text-sm text-[var(--muted)]">{formatDate(item.created_at)}</p>
                      </div>

                      <span className="rounded-full border border-[rgba(173,118,63,0.16)] bg-[rgba(255,248,241,0.85)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--gold-strong)]">
                        Open
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-[28px] border border-[rgba(173,118,63,0.14)] bg-[rgba(255,255,255,0.72)] p-6 text-center">
              <p className="text-lg font-semibold text-[var(--text)]">No plushies yet</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Your finished plushies will appear here after you create them.
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
