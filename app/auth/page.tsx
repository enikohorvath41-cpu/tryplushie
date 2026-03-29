"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Mail, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";

function AuthPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectTo = useMemo(() => {
    const next = searchParams.get("next");
    if (!next || !next.startsWith("/")) return "/";
    return next;
  }, [searchParams]);

  const intent = searchParams.get("intent");
  const isGenerateIntent = intent === "generate";

  const [email, setEmail] = useState("");
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!isMounted) return;

      if (session) {
        router.replace(redirectTo);
        router.refresh();
        return;
      }

      setCheckingSession(false);
    }

    checkSession();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.replace(redirectTo);
        router.refresh();
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [redirectTo, router]);

  async function handleEmailSignIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoadingEmail(true);
    setError(null);
    setNotice(null);

    try {
      const origin = window.location.origin;

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${origin}/auth?next=${encodeURIComponent(redirectTo)}${isGenerateIntent ? "&intent=generate" : ""}`
        }
      });

      if (error) throw error;

      setNotice("Check your email for your sign-in link.");
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send sign-in email.");
    } finally {
      setLoadingEmail(false);
    }
  }

  async function handleGoogleSignIn() {
    setLoadingGoogle(true);
    setError(null);
    setNotice(null);

    try {
      const origin = window.location.origin;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth?next=${encodeURIComponent(redirectTo)}${isGenerateIntent ? "&intent=generate" : ""}`
        }
      });

      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start Google sign-in.");
      setLoadingGoogle(false);
    }
  }

  async function handleContinueIfSignedIn() {
    const {
      data: { session }
    } = await supabase.auth.getSession();

    if (session) {
      router.replace(redirectTo);
      router.refresh();
    } else {
      setError("You are not signed in yet.");
    }
  }

  if (checkingSession) {
    return (
      <main className="min-h-screen px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-xl">
          <div className="glass-card flex min-h-[320px] items-center justify-center rounded-[34px] p-6">
            <div className="flex items-center gap-3 text-[var(--text)]">
              <Loader2 className="animate-spin" size={20} />
              <span className="text-sm font-semibold">
                {isGenerateIntent ? "Opening your sign-in step…" : "Checking your account…"}
              </span>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-xl">
        <div className="glass-card rounded-[34px] p-5 sm:p-7">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-full bg-[rgba(183,125,63,0.12)] p-3 text-[var(--gold-strong)]">
              <Sparkles size={22} />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--gold-strong)]">
                TryPlushie account
              </p>
              <h1 className="mt-1 text-[2rem] font-semibold tracking-[-0.04em] text-[var(--text)] sm:text-[2.4rem]">
                {isGenerateIntent ? "Sign up or log in to finish generating" : "Sign in to generate your plushie"}
              </h1>
            </div>
          </div>

          <p className="text-sm leading-7 text-[var(--muted)] sm:text-base">
            {isGenerateIntent
              ? "Create your free account to unlock 1 free plushie preview. We’ll bring you back to the generator right after sign-in."
              : "Create a free account to unlock your first preview. After that, you can unlock an image or use credits for more generations."}
          </p>

          <div className="mt-6 rounded-[24px] border border-[rgba(173,118,63,0.14)] bg-white/70 p-4">
            <p className="text-sm font-semibold text-[var(--text)]">What you get</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {["1 free preview", "Google login", "Pay only if you love it"].map((item) => (
                <div
                  key={item}
                  className="rounded-[18px] border border-[rgba(173,118,63,0.14)] bg-[rgba(255,255,255,0.78)] px-3 py-3 text-sm font-medium text-[var(--text)]"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loadingGoogle || loadingEmail}
            className="mt-6 flex min-h-14 w-full items-center justify-center gap-3 rounded-full border border-[rgba(173,118,63,0.18)] bg-white/80 px-5 text-sm font-semibold text-[var(--text)] transition hover:bg-white disabled:opacity-60"
          >
            {loadingGoogle ? <Loader2 className="animate-spin" size={18} /> : null}
            Continue with Google
          </button>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-[rgba(173,118,63,0.14)]" />
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--gold-strong)]">
              or
            </span>
            <div className="h-px flex-1 bg-[rgba(173,118,63,0.14)]" />
          </div>

          <form onSubmit={handleEmailSignIn} className="space-y-3">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[var(--text)]">Email address</span>
              <div className="flex items-center gap-3 rounded-[22px] border border-[rgba(173,118,63,0.16)] bg-white/80 px-4">
                <Mail size={18} className="text-[var(--gold-strong)]" />
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-14 w-full bg-transparent text-[var(--text)] outline-none placeholder:text-[var(--muted)]"
                  required
                />
              </div>
            </label>

            <button
              type="submit"
              disabled={loadingEmail || loadingGoogle}
              className="flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-[var(--text)] px-5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(37,21,5,0.18)] transition hover:opacity-95 disabled:opacity-60"
            >
              {loadingEmail ? <Loader2 className="animate-spin" size={18} /> : null}
              Send magic link
            </button>
          </form>

          {error ? <p className="mt-4 text-center text-sm font-medium text-[#a14321]">{error}</p> : null}
          {notice ? <p className="mt-4 text-center text-sm font-medium text-[var(--gold-strong)]">{notice}</p> : null}

          <button
            type="button"
            onClick={handleContinueIfSignedIn}
            className="mt-5 w-full text-sm font-semibold text-[var(--gold-strong)] transition hover:opacity-80"
          >
            I already signed in — continue
          </button>
        </div>
      </div>
    </main>
  );
}

function AuthPageFallback() {
  return (
    <main className="min-h-screen px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-xl">
        <div className="glass-card flex min-h-[320px] items-center justify-center rounded-[34px] p-6">
          <div className="flex items-center gap-3 text-[var(--text)]">
            <Loader2 className="animate-spin" size={20} />
            <span className="text-sm font-semibold">Loading sign-in…</span>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<AuthPageFallback />}>
      <AuthPageInner />
    </Suspense>
  );
}
