import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <div className="glass-card rounded-[34px] p-6 sm:p-8">
          <div className="mb-4 inline-flex rounded-full bg-[rgba(183,125,63,0.12)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--gold-strong)]">
            Checkout cancelled
          </div>
          <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[var(--text)]">Your plushie is still waiting.</h1>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)] sm:text-base">
            Keep the cancellation path gentle. Let people return without friction and try again when they are ready.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--text)] px-5 text-sm font-semibold text-white"
          >
            Back to Plushify
          </Link>
        </div>
      </div>
    </main>
  );
}
