import Link from "next/link";
import { Suspense } from "react";
import { CheckCircle2 } from "lucide-react";
import { getStripe } from "@/lib/stripe";
import { markPaidByCheckoutSessionId } from "@/lib/store";

async function SuccessContent({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const params = await searchParams;
  const sessionId = params.session_id;

  let resultId: string | null = null;

  if (sessionId) {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    resultId = typeof session.metadata?.resultId === "string" ? session.metadata.resultId : null;

    if (session.payment_status === "paid") {
      await markPaidByCheckoutSessionId(session.id);
    }
  }

  return (
    <div className="glass-card rounded-[34px] p-6 sm:p-8">
      <div className="mb-4 inline-flex rounded-full bg-[rgba(183,125,63,0.12)] p-3 text-[var(--gold-strong)]">
        <CheckCircle2 size={24} />
      </div>

      <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[var(--text)]">
        Payment complete.
      </h1>

      <p className="mt-3 text-sm leading-7 text-[var(--muted)] sm:text-base">
        Your plushie should now be unlocked. Go back to your result page to download the full HD image.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {resultId ? (
          <Link
            href={`/result/${resultId}`}
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--text)] px-5 text-sm font-semibold text-white transition hover:opacity-95"
          >
            View unlocked plushie
          </Link>
        ) : (
          <Link
            href="/"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--text)] px-5 text-sm font-semibold text-white transition hover:opacity-95"
          >
            Back to TryPlushie
          </Link>
        )}

        <Link
          href="/#generator"
          className="inline-flex min-h-12 items-center justify-center rounded-full border border-[rgba(173,118,63,0.2)] bg-white/70 px-5 text-sm font-semibold text-[var(--text)] transition hover:bg-white/85"
        >
          Make another plushie
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage(props: { searchParams: Promise<{ session_id?: string }> }) {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <Suspense>
          <SuccessContent {...props} />
        </Suspense>
      </div>
    </main>
  );
}
