import crypto from "node:crypto";
import Stripe from "stripe";
import { headers } from "next/headers";
import { getStripe } from "@/lib/stripe";
import { markPaidByCheckoutSessionId, markPaidByResultId } from "@/lib/store";
import { supabaseServer } from "@/lib/supabase-server";
import { getOpenAIClient } from "@/lib/openai";
import { createMockPlushieDataUrl } from "@/lib/mock-image";
import { getPlushiePrompt, plushieStyles } from "@/lib/prompts";
import type { PlushieStyle } from "@/types";

export const runtime = "nodejs";

function toSafeNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function isPlushieStyle(value: string): value is PlushieStyle {
  return value === "classic" || value === "crochet" || value === "luxury";
}

async function getExistingGenerationBySessionId(checkoutSessionId: string) {
  const { data, error } = await supabaseServer
    .from("generations")
    .select("id")
    .eq("checkout_session_id", checkoutSessionId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.id ?? null;
}

async function getExistingPaymentBySessionId(checkoutSessionId: string) {
  const { data, error } = await supabaseServer
    .from("payments")
    .select("id")
    .eq("stripe_session_id", checkoutSessionId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.id ?? null;
}

async function insertPaymentRowIfMissing(params: {
  userId: string;
  generationId?: string | null;
  checkoutSessionId: string;
  paymentType: "paid_generation" | "credits";
  creditsAdded: number;
  amountGbp: number;
}) {
  const existingPaymentId = await getExistingPaymentBySessionId(params.checkoutSessionId);

  if (existingPaymentId) {
    return { inserted: false };
  }

  const paymentRow = {
    user_id: params.userId,
    generation_id: params.generationId ?? null,
    stripe_session_id: params.checkoutSessionId,
    payment_type: params.paymentType,
    credits_added: params.creditsAdded,
    amount_gbp: params.amountGbp,
    status: "paid"
  };

  const { error: paymentInsertError } = await supabaseServer.from("payments").insert(paymentRow);

  if (!paymentInsertError) {
    return { inserted: true };
  }

  const duplicateSession =
    paymentInsertError.code === "23505" ||
    paymentInsertError.message.toLowerCase().includes("duplicate key") ||
    paymentInsertError.message.toLowerCase().includes("unique");

  if (duplicateSession) {
    return { inserted: false };
  }

  throw new Error(paymentInsertError.message);
}

async function ensurePaidGenerationPaymentRow(params: {
  userId: string;
  generationId: string;
  checkoutSessionId: string;
  amountGbp: number;
}) {
  await insertPaymentRowIfMissing({
    userId: params.userId,
    generationId: params.generationId,
    checkoutSessionId: params.checkoutSessionId,
    paymentType: "paid_generation",
    creditsAdded: 0,
    amountGbp: params.amountGbp
  });
}

async function ensureCreditsPaymentApplied(session: Stripe.Checkout.Session) {
  const userId = typeof session.metadata?.userId === "string" ? session.metadata.userId : null;
  const creditsToAddRaw = session.metadata?.creditsToAdd;
  const creditsToAdd = typeof creditsToAddRaw === "string" ? Number.parseInt(creditsToAddRaw, 10) : Number.NaN;
  const amountGbp = typeof session.amount_total === "number" ? session.amount_total / 100 : 0;

  if (!userId || !Number.isFinite(creditsToAdd) || creditsToAdd <= 0) {
    throw new Error("Missing credit purchase metadata.");
  }

  const paymentInsert = await insertPaymentRowIfMissing({
    userId,
    generationId: null,
    checkoutSessionId: session.id,
    paymentType: "credits",
    creditsAdded: creditsToAdd,
    amountGbp
  });

  if (!paymentInsert.inserted) {
    return;
  }

  const { data: profile, error: profileError } = await supabaseServer
    .from("profiles")
    .select("credits")
    .eq("id", userId)
    .single();

  if (profileError || !profile) {
    throw new Error(profileError?.message || "Could not load profile for credit purchase.");
  }

  const nextCredits = toSafeNumber(profile.credits, 0) + creditsToAdd;

  const { error: updateError } = await supabaseServer
    .from("profiles")
    .update({ credits: nextCredits })
    .eq("id", userId);

  if (updateError) {
    throw new Error(updateError.message);
  }
}

async function handlePaidGeneration(session: Stripe.Checkout.Session) {
  const existingGenerationId = await getExistingGenerationBySessionId(session.id);

  const userId = typeof session.metadata?.userId === "string" ? session.metadata.userId : null;
  const amountGbp = typeof session.amount_total === "number" ? session.amount_total / 100 : 2.99;

  if (existingGenerationId) {
    if (userId) {
      await ensurePaidGenerationPaymentRow({
        userId,
        generationId: existingGenerationId,
        checkoutSessionId: session.id,
        amountGbp
      });
    }

    return existingGenerationId;
  }

  const styleValue = typeof session.metadata?.style === "string" ? session.metadata.style : null;
  const publicUrl = typeof session.metadata?.publicUrl === "string" ? session.metadata.publicUrl : null;
  const fileName = typeof session.metadata?.fileName === "string" ? session.metadata.fileName : "upload.jpg";
  const mimeType = typeof session.metadata?.mimeType === "string" ? session.metadata.mimeType : "image/jpeg";

  if (!userId || !styleValue || !isPlushieStyle(styleValue) || !publicUrl) {
    throw new Error("Missing paid generation metadata.");
  }

  const sourceResponse = await fetch(publicUrl);

  if (!sourceResponse.ok) {
    throw new Error("Could not load pending uploaded image.");
  }

  const sourceBuffer = Buffer.from(await sourceResponse.arrayBuffer());
  const sourceDataUrl = `data:${mimeType};base64,${sourceBuffer.toString("base64")}`;
  const prompt = getPlushiePrompt(styleValue);

  let generatedDataUrl: string;

  if (process.env.OPENAI_API_KEY) {
    const openai = getOpenAIClient();
    const response = await openai.images.edit({
      model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-1",
      image: [new File([sourceBuffer], fileName || "upload.jpg", { type: mimeType })],
      prompt,
      size: "auto"
    });

    const base64 = response.data?.[0]?.b64_json;

    if (!base64) {
      throw new Error("No image returned from OpenAI.");
    }

    generatedDataUrl = `data:image/png;base64,${base64}`;
  } else {
    const styleLabel = plushieStyles.find((item) => item.value === styleValue)?.label || "Classic Plush";
    generatedDataUrl = createMockPlushieDataUrl(styleLabel);
  }

  const generationId = crypto.randomUUID();

  const { error: insertError } = await supabaseServer.from("generations").insert({
    id: generationId,
    user_id: userId,
    style: styleValue,
    prompt,
    source_image_url: sourceDataUrl,
    preview_image_url: generatedDataUrl,
    hd_image_url: generatedDataUrl,
    status: "completed",
    is_unlocked: true,
    checkout_session_id: session.id
  });

  if (insertError) {
    throw new Error(insertError.message);
  }

  await ensurePaidGenerationPaymentRow({
    userId,
    generationId,
    checkoutSessionId: session.id,
    amountGbp
  });

  return generationId;
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const signature = (await headers()).get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return new Response("Missing webhook configuration.", { status: 400 });
  }

  const payload = await request.text();

  try {
    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const purchaseType =
          typeof session.metadata?.purchaseType === "string" ? session.metadata.purchaseType : "single_unlock";

        if (purchaseType === "credits") {
          await ensureCreditsPaymentApplied(session);
        } else if (purchaseType === "paid_generation") {
          await handlePaidGeneration(session);
        } else {
          await markPaidByCheckoutSessionId(session.id);

          const resultId = typeof session.metadata?.resultId === "string" ? session.metadata.resultId : null;
          if (resultId) {
            await markPaidByResultId(resultId);
          }
        }

        break;
      }

      default:
        break;
    }

    return new Response("ok", { status: 200 });
  } catch (error) {
    return new Response(error instanceof Error ? error.message : "Webhook error", { status: 400 });
  }
}
