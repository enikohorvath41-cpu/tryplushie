import Link from "next/link";
import {
  ArrowRight,
  Check,
  CreditCard,
  Gift,
  Heart,
  ImageIcon,
  Share2,
  Sparkles,
  UserRound
} from "lucide-react";
import { UploadCard } from "@/components/upload-card";

const examples = [
  {
    title: "Family to plushie",
    note: "Recognisable, giftable, and clearly plush — perfect for family keepsakes.",
    tag: "People",
    beforeImage: "/examples/family-before.jpg",
    afterImage: "/examples/family-after.jpg",
    beforeLabel: "Before",
    afterLabel: "Plushie"
  },
  {
    title: "Pet to plushie",
    note: "Keeps the markings and personality while turning the photo into a cuddly plush toy.",
    tag: "Pets",
    beforeImage: "/examples/dog-before.jpg",
    afterImage: "/examples/dog-after.jpg",
    beforeLabel: "Before",
    afterLabel: "Plushie"
  }
];

const trustPills = [
  "Free upload",
  "Free style selection",
  "Super Cute"
];

const useCases = [
  "Family photos",
  "Pet portraits",
  "Couple photos",
  "Baby photos",
  "Profile pictures",
  "Giftable keepsakes"
];

const recentMoments = [
  {
    title: "Family photo → plushie keepsake",
    meta: "Popular for gifts and memory photos",
    badge: "People"
  },
  {
    title: "Dog photo → plushie portrait",
    meta: "Strong markings and personality preserved",
    badge: "Pets"
  },
  {
    title: "Selfie → cute profile plushie",
    meta: "Fun for profile pics and sharing",
    badge: "Selfies"
  }
];

export default function HomePage() {
  return (
    <main className="pb-20">
      <section className="px-4 pb-8 pt-5 sm:px-6 sm:pt-6">
        <div className="mx-auto max-w-6xl">
          <div className="glass-card soft-grid overflow-hidden rounded-[34px] border border-[rgba(173,118,63,0.16)] px-4 pb-6 pt-5 sm:px-6 sm:pb-8 sm:pt-6">
            <div className="mb-4 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--gold-strong)] sm:text-xs">
              <span className="rounded-full bg-white/85 px-3 py-2">Mobile-first plushie generator</span>
              <span className="rounded-full bg-white/65 px-3 py-2">Free upload · pay or use credits when ready</span>
            </div>

            <div className="mx-auto max-w-4xl text-center">
              <h1 className="text-balance text-[2.2rem] font-semibold leading-[0.98] tracking-[-0.05em] text-[var(--text)] sm:text-[3.6rem]">
                Turn your favourite photos into cute plushies
              </h1>

              <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-7 text-[var(--muted)] sm:text-base">
                Upload a selfie, pet, baby or couple photo, choose your favourite style, then create it with 1 credit or a
                one-off payment when you are ready.
              </p>

              <p className="mt-4 text-sm font-medium text-[var(--muted)]">
                Real photo in → plushie out · No real generation cost before payment
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

            <div className="mx-auto mt-5 flex max-w-4xl flex-wrap justify-center gap-2">
              {trustPills.map((item) => (
                <div
                  key={item}
                  className="rounded-full border border-[rgba(173,118,63,0.14)] bg-white/76 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--gold-strong)]"
                >
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-5 lg:grid-cols-[1.06fr_0.94fr] lg:items-start">
              <div className="space-y-5">
                <div className="rounded-[30px] border border-[rgba(173,118,63,0.14)] bg-[linear-gradient(180deg,rgba(255,250,245,0.92),rgba(247,224,195,0.88))] p-4 sm:p-5">
                  <div className="mb-4 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--gold-strong)]">
                        Example results
                      </p>
                      <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--muted)]">
                        See the result first. These examples show the kind of recognisable, giftable plushie TryPlushie is
                        built to create.
                      </p>
                    </div>

                    <Link
                      href="/credits"
                      className="hidden min-h-11 items-center justify-center rounded-full border border-[rgba(173,118,63,0.16)] bg-white/85 px-4 text-sm font-semibold text-[var(--text)] transition hover:bg-white md:inline-flex"
                    >
                      Get credits
                    </Link>
                  </div>

                  <div className="grid gap-4">
                    {examples.map((example, index) => (
                      <div
                        key={example.title}
                        className="rounded-[24px] border border-[rgba(173,118,63,0.14)] bg-white/76 p-4"
                      >
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <div className="rounded-full bg-[rgba(183,125,63,0.12)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--gold-strong)]">
                            Example 0{index + 1}
                          </div>

                          <div className="rounded-full bg-[rgba(37,21,5,0.8)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white">
                            {example.tag}
                          </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="rounded-[18px] border border-[rgba(173,118,63,0.14)] bg-[rgba(255,248,241,0.78)] p-3">
                            <div className="mb-3 w-fit rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--gold-strong)]">
                              {example.beforeLabel}
                            </div>

                            <div className="overflow-hidden rounded-[16px] bg-white/70">
                              <img
                                src={example.beforeImage}
                                alt={`${example.title} before`}
                                className="h-[220px] w-full object-cover"
                              />
                            </div>
                          </div>

                          <div className="rounded-[18px] border border-[rgba(173,118,63,0.14)] bg-[rgba(255,248,241,0.78)] p-3">
                            <div className="mb-3 w-fit rounded-full bg-[rgba(37,21,5,0.82)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white">
                              {example.afterLabel}
                            </div>

                            <div className="overflow-hidden rounded-[16px] bg-white/70">
                              <img
                                src={example.afterImage}
                                alt={`${example.title} after`}
                                className="h-[220px] w-full object-cover"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="mt-4">
                          <p className="text-sm font-semibold text-[var(--text)]">{example.title}</p>
                          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{example.note}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                  <div className="rounded-[28px] border border-[rgba(173,118,63,0.14)] bg-[rgba(255,248,241,0.72)] p-5">
                    <div className="mb-4 inline-flex rounded-full bg-[rgba(183,125,63,0.12)] p-3 text-[var(--gold-strong)]">
                      <Sparkles size={18} />
                    </div>
                    <p className="text-sm font-semibold text-[var(--text)]">Popular plushie moments</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                      Family photos, pets, couple pictures and profile pics are the strongest early use cases for launch.
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {useCases.map((item) => (
                        <div
                          key={item}
                          className="rounded-full border border-[rgba(173,118,63,0.14)] bg-white/78 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--gold-strong)]"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-[rgba(173,118,63,0.14)] bg-white/72 p-5">
                    <div className="mb-4 inline-flex rounded-full bg-[rgba(183,125,63,0.12)] p-3 text-[var(--gold-strong)]">
                      <Gift size={18} />
                    </div>
                    <p className="text-sm font-semibold text-[var(--text)]">Built for gifting and sharing</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                      TryPlushie works especially well for keepsakes, profile pics, presents, pets, and family moments you
                      want to turn into something cute and memorable.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="glass-card rounded-[30px] p-4 sm:p-5">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--gold-strong)]">
                        Create yours
                      </p>
                      <h2 className="mt-2 text-[1.75rem] font-semibold tracking-[-0.04em] text-[var(--text)] sm:text-[2.1rem]">
                        Upload your photo and choose a plushie style
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                        The flow stays simple: upload free, pick a style free, then pay only when you are ready to create.
                      </p>
                    </div>

                    <div className="rounded-full bg-[rgba(37,21,5,0.82)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
                      Live now
                    </div>
                  </div>

                  <UploadCard />
                </div>

                <div className="glass-card rounded-[28px] p-4 sm:p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--gold-strong)]">
                        Recent plushie ideas
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                        A clean momentum section that feels active without showing fake numbers.
                      </p>
                    </div>

                    <div className="rounded-full bg-[rgba(183,125,63,0.12)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--gold-strong)]">
                      V1
                    </div>
                  </div>

                  <div className="space-y-3">
                    {recentMoments.map((item, index) => (
                      <div
                        key={item.title}
                        className="flex flex-col gap-3 rounded-[22px] border border-[rgba(173,118,63,0.14)] bg-white/78 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex items-start gap-3">
                          <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgba(183,125,63,0.12)] text-sm font-semibold text-[var(--gold-strong)]">
                            0{index + 1}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[var(--text)]">{item.title}</p>
                            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{item.meta}</p>
                          </div>
                        </div>

                        <div className="w-fit rounded-full border border-[rgba(173,118,63,0.14)] bg-[rgba(255,248,241,0.82)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--gold-strong)]">
                          {item.badge}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card rounded-[28px] p-4 sm:p-5">
                  <div className="mb-4 inline-flex rounded-full bg-[rgba(183,125,63,0.12)] p-3 text-[var(--gold-strong)]">
                    <Share2 size={18} />
                  </div>

                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--gold-strong)]">
                    Share → free credit
                  </p>
                  <h2 className="mt-2 text-[1.5rem] font-semibold tracking-[-0.04em] text-[var(--text)] sm:text-[1.8rem]">
                    Strong next growth loop after launch
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                    Share your plushie, show the before and after, and earn a free credit. This should be built next as a real
                    viral loop once launch traffic starts coming in.
                  </p>

                  <div className="mt-4 grid gap-3">
                    {[
                      "Before and after posts are naturally shareable",
                      "A free-credit reward creates repeat use",
                      "Perfect feature to build after launch traffic lands"
                    ].map((line) => (
                      <div
                        key={line}
                        className="rounded-[20px] border border-[rgba(173,118,63,0.14)] bg-[rgba(255,248,241,0.78)] px-4 py-3 text-sm font-medium text-[var(--text)]"
                      >
                        {line}
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 rounded-[22px] border border-dashed border-[rgba(173,118,63,0.22)] bg-white/72 px-4 py-4">
                    <p className="text-sm font-semibold text-[var(--text)]">Keep it honest for V1</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                      This page now creates momentum visually, but it avoids fake counters like “50 generated this hour”
                      until that can be backed by real data.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[28px] border border-[rgba(173,118,63,0.14)] bg-[rgba(255,248,241,0.72)] p-5">
                    <div className="mb-4 inline-flex rounded-full bg-[rgba(183,125,63,0.12)] p-3 text-[var(--gold-strong)]">
                      <CreditCard size={18} />
                    </div>
                    <p className="text-sm font-semibold text-[var(--text)]">Best fit for credits</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                      Credits are best when you want to try multiple selfies, pets, family photos, or styles without repeating
                      one-off payments.
                    </p>
                  </div>

                  <div className="rounded-[28px] border border-[rgba(173,118,63,0.14)] bg-white/72 p-5">
                    <div className="mb-4 inline-flex rounded-full bg-[rgba(183,125,63,0.12)] p-3 text-[var(--gold-strong)]">
                      <ArrowRight size={18} />
                    </div>
                    <p className="text-sm font-semibold text-[var(--text)]">Fast path to action</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                      The examples now sit higher on the page so mobile visitors see the output before they decide to upload.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}