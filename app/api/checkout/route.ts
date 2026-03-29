import { NextResponse } from "next/server";
import { absoluteUrl } from "@/lib/utils";
import { getResult, attachCheckoutSession } from "@/lib/store";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { resultId?: string };
    const resultId = body.resultId;

    if (!resultId) {
      return NextResponse.json({ error: "Missing resultId." }, { status: 400 });
    }

    const result = await getResult(resultId);

    if (!result) {
      return NextResponse.json({ error: "Result not found." }, { status: 404 });
    }

    if (result.isPaid) {
      return NextResponse.json({ error: "This plushie has already been unlocked." }, { status: 400 });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${absoluteUrl("/checkout/success")}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: absoluteUrl(`/result/${resultId}`),
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "gbp",
            unit_amount: 299,
            product_data: {
              name: "TryPlushie HD Unlock",
              description: "Unlock the clean HD plushie image download"
            }
          }
        }
      ],
      metadata: {
        resultId,
        purchaseType: "single_unlock"
      }
    });

    await attachCheckoutSession(resultId, session.id);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Could not start checkout."
      },
      { status: 500 }
    );
  }
}
