import Link from "next/link";
import { Check, CreditCard, Heart, ImageIcon, UserRound } from "lucide-react";
import { UploadCard } from "@/components/upload-card";

const examples = [
  { title: "Selfie to plushie", note: "Cute profile pic energy" },
  { title: "Pet to plushie", note: "Perfect for animal lovers" }
];

export default function HomePage() {
  return (
    <main className="pb-20">
      <section className="px-4 pb-8 pt-5 sm:px-6 sm:pt-6">
        <div className="mx-auto max-w-5xl">
          <div className="glass-card soft-grid overflow-hidden rounded-[34px] border border-[rgba(173,118,63,0.16)] px-4 pb-6 pt-5 sm:px-6 sm:pb-8 sm:pt-6">
            <div className="mb-4 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--gold-strong)] sm:text-xs">
              <span className="rounded-full bg-white/85 px-3 py-2">Mobile-first plushie generator</span>
              <span className="rounded-full bg-white/65 px-3 py-2">Preview free · unlock HD later</span>
            </div>

            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-balance text-[2.25rem] font-semibold leading-[1.02] tracking-[-0.045em] text-[var(--text)] sm:text-[3.4rem]">
                Turn your photo into a cute plushie
              </h1>

              <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-7 text-[var(--muted)] sm:text-base">
                Upload a selfie, pet, baby or couple photo. Preview it first, then unlock the HD version only if you love it.
              </p>

              <p className="mt-4 text-sm font-medium text-[var(--muted)]">
                Sign in for your free preview · Pay only if you love it
              </p>
            </div>

            <div className="mx-auto mt-5 flex max-w-3xl flex-wrap justify-center gap-3">
              <Link
                href="/account"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[rgba(173,118,63,0.16)] bg-white/80 px-4 text-sm font-semibold text-[var(--text)] transition hover:bg-white"
              >
                <UserRound size={16} className="text-[var(--gold-strong)]" />
                My plushies
              </Link>
              <Link
                href="/credits"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[rgba(173,118,63,0.16)] bg-white/80 px-4 text-sm font-semibold text-[var(--text)] transition hover:bg-white"
              >
                <CreditCard size={16} className="text-[var(--gold-strong)]" />
                Buy credits
              </Link>
            </div>

            <div className="mx-auto mt-6 max-w-3xl">
              <UploadCard />
            </div>

            <div className="mx-auto mt-6 grid max-w-3xl gap-3 sm:grid-cols-3">
              {[
                { icon: <Heart size={16} />, label: "Giftable outcome" },
                { icon: <ImageIcon size={16} />, label: "Fun visual share" },
                { icon: <Check size={16} />, label: "Free preview per account" }
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[20px] border border-[rgba(173,118,63,0.14)] bg-white/72 px-4 py-3 text-left"
                >
                  <div className="mb-2 text-[var(--gold-strong)]">{item.icon}</div>
                  <p className="text-sm font-medium text-[var(--text)]">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-10 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-4">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--gold-strong)]">
              Example results
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {examples.map((example, index) => (
              <div key={example.title} className="glass-card rounded-[28px] p-4 sm:p-5">
                <div className="relative mb-4 aspect-[4/4.1] overflow-hidden rounded-[22px] bg-[linear-gradient(180deg,#fff8f1,#f7e0c3)] p-4">
                  <div className="flex h-full items-end justify-between rounded-[18px] border border-[rgba(173,118,63,0.14)] bg-white/35 p-4">
                    <div className="rounded-full bg-white/90 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--gold-strong)]">
                      Example 0{index + 1}
                    </div>
                    <div className="rounded-full bg-[rgba(37,21,5,0.78)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white">
                      plushified
                    </div>
                  </div>
                </div>

                <p className="text-sm font-semibold text-[var(--text)]">{example.title}</p>
                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{example.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
