import Link from "next/link";
import { Check, CreditCard, Heart, ImageIcon, Sparkles, UserRound } from "lucide-react";
import { UploadCard } from "@/components/upload-card";

const examples = [
  {
    title: "Selfie to plushie",
    note: "Cute profile pic energy",
    tag: "People"
  },
  {
    title: "Pet to plushie",
    note: "Perfect for animal lovers",
    tag: "Pets"
  }
];

export default function HomePage() {
  return (
    <main className="pb-20">
      <section className="px-4 pb-8 pt-5 sm:px-6 sm:pt-6">
        <div className="mx-auto max-w-5xl">
          <div className="glass-card soft-grid overflow-hidden rounded-[34px] border border-[rgba(173,118,63,0.16)] px-4 pb-6 pt-5 sm:px-6 sm:pb-8 sm:pt-6">
            <div className="mb-4 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--gold-strong)] sm:text-xs">
              <span className="rounded-full bg-white/85 px-3 py-2">Mobile-first plushie generator</span>
              <span className="rounded-full bg-white/65 px-3 py-2">Free upload · pay or use credits when ready</span>
            </div>

            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-balance text-[2.25rem] font-semibold leading-[1.02] tracking-[-0.045em] text-[var(--text)] sm:text-[3.4rem]">
                Turn your photo into a cute plushie
              </h1>

              <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-7 text-[var(--muted)] sm:text-base">
                Upload a selfie, pet, baby or couple photo, choose your favourite style, then create it with 1 credit or a one-off payment when you are ready.
              </p>

              <p className="mt-4 text-sm font-medium text-[var(--muted)]">
                Free upload and style selection · No real generation cost before payment
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
                { icon: <Check size={16} />, label: "1 image = 1 credit" }
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

            <div className="mx-auto mt-5 grid max-w-3xl gap-3 sm:grid-cols-3">
              {[
                "Upload your photo free",
                "Pick your plushie style free",
                "Use 1 credit or pay once to create"
              ].map((line) => (
                <div
                  key={line}
                  className="rounded-[22px] border border-[rgba(173,118,63,0.14)] bg-[rgba(255,248,241,0.8)] px-4 py-3 text-sm font-semibold text-[var(--text)]"
                >
                  {line}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-10 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--gold-strong)]">
                Example results
              </p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                Use your own licensed, original, or permission-cleared photos for real generations.
              </p>
            </div>

            <Link
              href="/credits"
              className="hidden min-h-11 items-center justify-center rounded-full border border-[rgba(173,118,63,0.16)] bg-white/80 px-4 text-sm font-semibold text-[var(--text)] transition hover:bg-white md:inline-flex"
            >
              Get credits
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {examples.map((example, index) => (
              <div key={example.title} className="glass-card rounded-[28px] p-4 sm:p-5">
                <div className="relative mb-4 aspect-[4/4.1] overflow-hidden rounded-[22px] bg-[linear-gradient(180deg,#fff8f1,#f7e0c3)] p-4">
                  <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--gold-strong)]">
                    Example 0{index + 1}
                  </div>

                  <div className="absolute right-4 top-4 rounded-full bg-[rgba(37,21,5,0.78)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white">
                    {example.tag}
                  </div>

                  <div className="flex h-full items-end rounded-[18px] border border-[rgba(173,118,63,0.14)] bg-white/35 p-4">
                    <div className="max-w-[220px]">
                      <div className="mb-3 inline-flex rounded-full bg-[rgba(183,125,63,0.12)] p-2.5 text-[var(--gold-strong)]">
                        <Sparkles size={16} />
                      </div>
                      <p className="text-sm font-semibold text-[var(--text)]">Preview concept</p>
                      <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                        Your uploaded photo becomes a soft, cuddly plushie-style result.
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-sm font-semibold text-[var(--text)]">{example.title}</p>
                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{example.note}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-[28px] border border-[rgba(173,118,63,0.14)] bg-[rgba(255,248,241,0.72)] p-5">
            <p className="text-sm font-semibold text-[var(--text)]">Best fit for credits</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Credits are best when you want to try multiple selfies, pets, family photos, or styles without repeating one-off payments.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
