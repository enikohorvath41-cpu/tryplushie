import { NextResponse } from "next/server";
import { absoluteUrl } from "@/lib/utils";
import { getStripe } from "@/lib/stripe";
import { supabaseServer } from "@/lib/supabase-server";
import { getResult, attachCheckoutSession } from "@/lib/store";
import type { PlushieStyle } from "@/types";

export const runtime = "nodejs";

type CheckoutBody = {
  resultId?: string;
  style?: PlushieStyle;
  storagePath?: string;
  publicUrl?: string;
  fileName?: string;
  mimeType?: string;
};

function getBearerToken(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.slice(7).trim();
}

function isPlushieStyle(value: string): value is PlushieStyle {
  return ["classic", "crochet", "luxury"].includes(value);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CheckoutBody;
    const stripe = getStripe();

    if (body.resultId) {
      const result = await getResult(body.resultId);

      if (!result) {
        return NextResponse.json({ error: "Result not found." }, { status: 404 });
      }

      if (result.isPaid) {
        return NextResponse.json({ error: "This plushie has already been unlocked." }, { status: 400 });
      }

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        success_url: `${absoluteUrl("/checkout/success")}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: absoluteUrl(`/result/${body.resultId}`),
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
          resultId: body.resultId,
          purchaseType: "single_unlock"
        }
      });

      await attachCheckoutSession(body.resultId, session.id);

      return NextResponse.json({ url: session.url });
    }

    const accessToken = getBearerToken(request);

    if (!accessToken) {
      return NextResponse.json({ error: "Please sign in before checkout.", code: "AUTH_REQUIRED" }, { status: 401 });
    }

    const {
      data: { user },
      error: authError
    } = await supabaseServer.auth.getUser(accessToken);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Your session has expired. Please sign in again.", code: "AUTH_REQUIRED" },
        { status: 401 }
      );
    }

    if (!body.style || !isPlushieStyle(body.style)) {
      return NextResponse.json({ error: "Missing or invalid plushie style." }, { status: 400 });
    }

    if (!body.storagePath || !body.publicUrl) {
      return NextResponse.json({ error: "Missing uploaded image reference." }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${absoluteUrl("/checkout/success")}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: absoluteUrl("/#generator"),
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "gbp",
            unit_amount: 299,
            product_data: {
              name: "TryPlushie Generation",
              description: `Create one ${body.style} plushie from your uploaded photo`
            }
          }
        }
      ],
      metadata: {
        purchaseType: "paid_generation",
        userId: user.id,
        style: body.style,
        storagePath: body.storagePath,
        publicUrl: body.publicUrl,
        fileName: body.fileName || "upload.jpg",
        mimeType: body.mimeType || "image/jpeg"
      }
    });

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
