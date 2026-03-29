import { NextResponse } from "next/server";
import { absoluteUrl } from "@/lib/utils";
import { getStripe } from "@/lib/stripe";
import { supabaseServer } from "@/lib/supabase-server";

export const runtime = "nodejs";

type CreditPackId = "small" | "popular" | "mega";

const CREDIT_PACKS: Record<
  CreditPackId,
  {
    credits: number;
    unitAmount: number;
    name: string;
    description: string;
  }
> = {
  small: {
    credits: 3,
    unitAmount: 499,
    name: "TryPlushie Credits Pack",
    description: "3 credits for extra plushie generations"
  },
  popular: {
    credits: 10,
    unitAmount: 1299,
    name: "TryPlushie Popular Credits Pack",
    description: "10 credits for extra plushie generations"
  },
  mega: {
    credits: 25,
    unitAmount: 2499,
    name: "TryPlushie Mega Credits Pack",
    description: "25 credits for extra plushie generations"
  }
};

function getBearerToken(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.slice(7).trim();
}

function isCreditPackId(value: string): value is CreditPackId {
  return value === "small" || value === "popular" || value === "mega";
}

export async function POST(request: Request) {
  try {
    const accessToken = getBearerToken(request);

    if (!accessToken) {
      return NextResponse.json(
        { ok: false, error: "Please sign in before buying credits.", code: "AUTH_REQUIRED" },
        { status: 401 }
      );
    }

    const {
      data: { user },
      error: authError
    } = await supabaseServer.auth.getUser(accessToken);

    if (authError || !user) {
      return NextResponse.json(
        { ok: false, error: "Your session has expired. Please sign in again.", code: "AUTH_REQUIRED" },
        { status: 401 }
      );
    }

    const body = (await request.json()) as { packId?: string };
    const packId = body.packId;

    if (!packId || !isCreditPackId(packId)) {
      return NextResponse.json(
        { ok: false, error: "Invalid credit pack selected." },
        { status: 400 }
      );
    }

    const pack = CREDIT_PACKS[packId];
    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${absoluteUrl("/checkout/success")}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: absoluteUrl("/#generator"),
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "gbp",
            unit_amount: pack.unitAmount,
            product_data: {
              name: pack.name,
              description: pack.description
            }
          }
        }
      ],
      metadata: {
        purchaseType: "credits",
        userId: user.id,
        creditsToAdd: String(pack.credits),
        creditPackId: packId
      }
    });

    return NextResponse.json({
      ok: true,
      url: session.url
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Could not start credit checkout."
      },
      { status: 500 }
    );
  }
}
