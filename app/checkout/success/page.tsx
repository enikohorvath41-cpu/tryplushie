import Link from "next/link";
import { Suspense } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { getStripe } from "@/lib/stripe";
import { markPaidByCheckoutSessionId } from "@/lib/store";
import { supabaseServer } from "@/lib/supabase-server";

async function getGeneratedResultIdFromSessionId(sessionId: string) {
  const { data } = await supabaseServer
    .from("generations")
    .select("id")
    .eq("checkout_session_id", sessionId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data?.id ?? null;
}

async function SuccessContent({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const params = await searchParams;
  const sessionId = params.session_id;

  let resultId: string | null = null;
  let isPaidGeneration = false;

  if (sessionId) {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const purchaseType = typeof session.metadata?.purchaseType === "string" ? session.metadata.purchaseType : "single_unlock";
    isPaidGeneration = purchaseType === "paid_generation";

    if (purchaseType === "single_unlock") {
      resultId = typeof session.metadata?.resultId === "string" ? session.metadata.resultId : null;

      if (session.payment_status === "paid") {
        await markPaidByCheckoutSessionId(session.id);
      }
    } else if (purchaseType === "paid_generation") {
      resultId = await getGeneratedResultIdFromSessionId(session.id);
    }
  }

  return (
    <div className="glass-card rounded-[34px] p-6 sm:p-8">
      <div className="mb-4 inline-flex rounded-full bg-[rgba(183,125,63,0.12)] p-3 text-[var(--gold-strong)]">
        {resultId ? <CheckCircle2 size={24} /> : <Loader2 className="animate-spin" size={24} />}
      </div>

      <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[var(--text)]">
        {resultId ? "Payment complete." : isPaidGeneration ? "Payment received. We're creating your plushie." : "Payment complete."}
      </h1>

      <p className="mt-3 text-sm leading-7 text-[var(--muted)] sm:text-base">
        {resultId
          ? isPaidGeneration
            ? "Your plushie has been created and is ready to view."
            : "Your plushie should now be unlocked. Go back to your result page to download the full HD image."
          : "Your payment was successful. Give us a moment to finish creating your plushie, then use the refresh button below."}
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {resultId ? (
          <Link
            href={`/result/${resultId}`}
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--text)] px-5 text-sm font-semibold text-white transition hover:opacity-95"
          >
            {isPaidGeneration ? "View your plushie" : "View unlocked plushie"}
          </Link>
        ) : (
          <Link
            href={sessionId ? `/checkout/success?session_id=${encodeURIComponent(sessionId)}` : "/"}
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--text)] px-5 text-sm font-semibold text-white transition hover:opacity-95"
          >
            Refresh status
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
