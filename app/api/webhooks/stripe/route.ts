import Stripe from "stripe";
import { headers } from "next/headers";
import { getStripe } from "@/lib/stripe";
import { markPaidByCheckoutSessionId, markPaidByResultId } from "@/lib/store";
import { supabaseServer } from "@/lib/supabase-server";

export const runtime = "nodejs";

function toSafeNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
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
          const userId = typeof session.metadata?.userId === "string" ? session.metadata.userId : null;
          const creditsToAddRaw = session.metadata?.creditsToAdd;
          const creditsToAdd =
            typeof creditsToAddRaw === "string" ? Number.parseInt(creditsToAddRaw, 10) : Number.NaN;

          if (!userId || !Number.isFinite(creditsToAdd) || creditsToAdd <= 0) {
            throw new Error("Missing credit purchase metadata.");
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
