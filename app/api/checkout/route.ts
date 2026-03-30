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

async function getGeneratedResultIdFromSessionId(sessionId: string) {
  const { data, error } = await supabaseServer
    .from("generations")
    .select("id")
    .eq("checkout_session_id", sessionId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.id ?? null;
}

async function getCreditCheckoutState(sessionId: string, userId: string) {
  const { data: payment, error: paymentError } = await supabaseServer
    .from("payments")
    .select("id, credits_added")
    .eq("stripe_session_id", sessionId)
    .eq("payment_type", "credits")
    .maybeSingle();

  if (paymentError) {
    throw new Error(paymentError.message);
  }

  if (!payment?.id) {
    return {
      ready: false,
      creditsAdded: null,
      creditsBalance: null
    };
  }

  const { data: profile, error: profileError } = await supabaseServer
    .from("profiles")
    .select("credits")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    throw new Error(profileError.message);
  }

  return {
    ready: true,
    creditsAdded: typeof payment.credits_added === "number" ? payment.credits_added : null,
    creditsBalance: typeof profile?.credits === "number" ? profile.credits : null
  };
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json({ ok: false, error: "Missing session_id." }, { status: 400 });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const purchaseType =
      typeof session.metadata?.purchaseType === "string" ? session.metadata.purchaseType : "single_unlock";

    if (session.payment_status !== "paid") {
      return NextResponse.json({
        ok: true,
        ready: false,
        purchaseType,
        paymentStatus: session.payment_status ?? null,
        resultId: null,
        creditsAdded: null,
        creditsBalance: null
      });
    }

    if (purchaseType === "paid_generation") {
      const resultId = await getGeneratedResultIdFromSessionId(session.id);

      return NextResponse.json({
        ok: true,
        ready: Boolean(resultId),
        purchaseType,
        paymentStatus: session.payment_status ?? null,
        resultId,
        creditsAdded: null,
        creditsBalance: null
      });
    }

    if (purchaseType === "single_unlock") {
      const resultId = typeof session.metadata?.resultId === "string" ? session.metadata.resultId : null;

      return NextResponse.json({
        ok: true,
        ready: Boolean(resultId),
        purchaseType,
        paymentStatus: session.payment_status ?? null,
        resultId,
        creditsAdded: null,
        creditsBalance: null
      });
    }

    if (purchaseType === "credits") {
      const userId = typeof session.metadata?.userId === "string" ? session.metadata.userId : null;

      if (!userId) {
        return NextResponse.json({
          ok: true,
          ready: false,
          purchaseType,
          paymentStatus: session.payment_status ?? null,
          resultId: null,
          creditsAdded: null,
          creditsBalance: null
        });
      }

      const creditState = await getCreditCheckoutState(session.id, userId);

      return NextResponse.json({
        ok: true,
        ready: creditState.ready,
        purchaseType,
        paymentStatus: session.payment_status ?? null,
        resultId: null,
        creditsAdded: creditState.creditsAdded,
        creditsBalance: creditState.creditsBalance
      });
    }

    return NextResponse.json({
      ok: true,
      ready: true,
      purchaseType,
      paymentStatus: session.payment_status ?? null,
      resultId: null,
      creditsAdded: null,
      creditsBalance: null
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Could not check checkout status."
      },
      { status: 500 }
    );
  }
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
