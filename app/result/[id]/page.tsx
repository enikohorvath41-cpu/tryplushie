import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, CreditCard, Download, Gift, Lock, ShieldCheck, Sparkles } from "lucide-react";
import { getResult } from "@/lib/store";
import { UnlockButton } from "@/components/unlock-button";

export default async function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getResult(id);

  if (!result) {
    notFound();
  }

  const imageSrc = result.isPaid ? result.hdDataUrl : result.previewDataUrl;
  const isUnlocked = result.isPaid;

  return (
    <main className="min-h-screen px-4 pb-28 pt-5 sm:px-6 sm:pb-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 flex items-center justify-between gap-4">
          <Link href="/" className="text-sm font-semibold text-[var(--gold-strong)] transition hover:opacity-80">
            ← Back to TryPlushie
          </Link>

          <div className="rounded-full bg-white/80 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--gold-strong)] sm:text-xs">
            {isUnlocked ? "Unlocked" : "Preview ready"}
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="glass-card overflow-hidden rounded-[34px] p-4 sm:p-5">
            <div className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(180deg,#fff8f1,#f5dcc0)]">
              <img
                src={imageSrc}
                alt="Generated plushie"
                className={`aspect-square w-full object-cover ${isUnlocked ? "" : "scale-[1.01]"}`}
              />

              {!isUnlocked ? (
                <>
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_18%,rgba(255,255,255,0.12)_46%,rgba(0,0,0,0.12)_100%)]" />
                  <div className="pointer-events-none absolute inset-x-4 top-1/2 -translate-y-1/2 rotate-[-14deg] rounded-full border border-white/45 bg-black/25 px-4 py-3 text-center text-sm font-semibold uppercase tracking-[0.32em] text-white backdrop-blur-sm sm:inset-x-10 sm:px-6 sm:text-base">
                    Preview only
                  </div>
                  <div className="pointer-events-none absolute bottom-4 left-4 rounded-full bg-white/88 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--gold-strong)] shadow-sm">
                    HD download locked
                  </div>
                </>
              ) : (
                <div className="pointer-events-none absolute bottom-4 left-4 rounded-full bg-[rgba(37,21,5,0.84)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white shadow-sm">
                  Full quality unlocked
                </div>
              )}
            </div>
          </div>

          <div className="space-y-5">
            <div className="glass-card rounded-[34px] p-5 sm:p-6">
              <div className="mb-4 inline-flex rounded-full bg-[rgba(183,125,63,0.12)] p-3 text-[var(--gold-strong)]">
                {isUnlocked ? <CheckCircle2 size={22} /> : <Lock size={22} />}
              </div>

              <h1 className="text-[2rem] font-semibold tracking-[-0.04em] text-[var(--text)] sm:text-4xl">
                {isUnlocked ? "Your plushie is ready to keep." : "Your plushie preview is ready."}
              </h1>

              <p className="mt-3 text-sm leading-7 text-[var(--muted)] sm:text-base">
                {isUnlocked
                  ? "Your full-quality plushie is unlocked and ready to download. Save it, share it, or use it as a cute profile picture."
                  : "You have already done the fun part. Unlock the clean HD version to keep this plushie without the preview lock and watermark."}
              </p>

              {!isUnlocked ? (
                <div className="mt-5 space-y-4">
                  <div className="rounded-[26px] border border-[rgba(173,118,63,0.16)] bg-white/72 p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--gold-strong)]">
                          One-time unlock
                        </p>
                        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[var(--text)]">
                          £2.99
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                          Pay once to unlock this exact plushie in clean HD.
                        </p>
                      </div>

                      <div className="rounded-full bg-[rgba(183,125,63,0.12)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--gold-strong)]">
                        Best for one image
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3">
                      {[
                        "Full HD image download",
                        "No watermark or preview lock",
                        "Fast mobile-friendly checkout"
                      ].map((line) => (
                        <div
                          key={line}
                          className="rounded-[20px] border border-[rgba(173,118,63,0.14)] bg-[rgba(255,255,255,0.78)] px-4 py-3 text-sm font-medium text-[var(--text)]"
                        >
                          {line}
                        </div>
                      ))}
                    </div>

                    <div className="mt-5">
                      <UnlockButton resultId={result.id} />
                    </div>

                    <p className="mt-3 text-center text-xs leading-5 text-[var(--muted)]">
                      Preview first. Pay only if you love it.
                    </p>
                  </div>

                  <div className="rounded-[26px] border border-[rgba(173,118,63,0.16)] bg-[rgba(255,248,241,0.72)] p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--gold-strong)]">
                          Want more plushies?
                        </p>
                        <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[var(--text)]">
                          Credits work better for repeat generations
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                          If you want to try more photos or make more plushies later, credits are the better fit than unlocking one image at a time.
                        </p>
                      </div>

                      <div className="rounded-full bg-white/80 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--gold-strong)]">
                        For repeat use
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3">
                      {[
                        "1 image = 1 credit",
                        "Great for trying more photos",
                        "Better for multiple generations"
                      ].map((line) => (
                        <div
                          key={line}
                          className="rounded-[20px] border border-[rgba(173,118,63,0.14)] bg-white/80 px-4 py-3 text-sm font-medium text-[var(--text)]"
                        >
                          {line}
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <Link
                        href="/credits"
                        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--text)] px-5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(37,21,5,0.18)] transition hover:opacity-95"
                      >
                        <CreditCard size={18} />
                        Buy credits
                      </Link>

                      <Link
                        href="/#generator"
                        className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[rgba(173,118,63,0.2)] bg-white/80 px-5 text-sm font-semibold text-[var(--text)] transition hover:bg-white"
                      >
                        Back to generator
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-5 space-y-4">
                  <div className="rounded-[26px] border border-[rgba(173,118,63,0.16)] bg-[rgba(255,248,241,0.72)] p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--gold-strong)]">
                          Unlocked successfully
                        </p>
                        <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[var(--text)]">
                          Your HD plushie is ready
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                          This result is already unlocked, so you can download it now or head back and create another plushie.
                        </p>
                      </div>

                      <div className="rounded-full bg-[rgba(183,125,63,0.12)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--gold-strong)]">
                        Ready to save
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3">
                      {[
                        "Full HD image download",
                        "No watermark or preview lock",
                        "Works great for sharing or profile pics"
                      ].map((line) => (
                        <div
                          key={line}
                          className="rounded-[20px] border border-[rgba(173,118,63,0.14)] bg-white/80 px-4 py-3 text-sm font-medium text-[var(--text)]"
                        >
                          {line}
                        </div>
                      ))}
                    </div>
                  </div>

                  <a
                    href={result.hdDataUrl}
                    download={`tryplushie-${result.id}.png`}
                    className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-[var(--text)] px-5 text-sm font-semibold shadow-[0_18px_40px_rgba(37,21,5,0.18)] transition hover:opacity-95"
                    style={{ color: "#ffffff" }}
                  >
                    <Download size={18} color="#ffffff" />
                    <span style={{ color: "#ffffff" }}>Download HD image</span>
                  </a>
                </div>
              )}

              <Link
                href="/#generator"
                className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[rgba(173,118,63,0.2)] bg-white/70 px-5 text-sm font-semibold text-[var(--text)] transition hover:bg-white/85"
              >
                Generate another plushie
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {[
                {
                  icon: <Gift size={18} />,
                  title: "Great for gifting",
                  text: "A cute personalised result people instantly understand."
                },
                {
                  icon: <ShieldCheck size={18} />,
                  title: "Account-based access",
                  text: "Your previews, credits, and unlock flow stay tied to your account."
                },
                {
                  icon: <Sparkles size={18} />,
                  title: "Cute shareable result",
                  text: "Perfect for profile pics, messages, and social posts."
                }
              ].map((item) => (
                <div key={item.title} className="glass-card rounded-[28px] p-4">
                  <div className="mb-3 inline-flex rounded-full bg-[rgba(183,125,63,0.12)] p-2.5 text-[var(--gold-strong)]">
                    {item.icon}
                  </div>
                  <p className="text-sm font-semibold text-[var(--text)]">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
