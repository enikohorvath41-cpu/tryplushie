import { NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";
import { createMockPlushieDataUrl } from "@/lib/mock-image";
import { getPlushiePrompt, plushieStyles } from "@/lib/prompts";
import { createResult } from "@/lib/store";
import { supabaseServer } from "@/lib/supabase-server";
import type { PlushieStyle } from "@/types";

export const runtime = "nodejs";

function isPlushieStyle(value: string): value is PlushieStyle {
  return ["classic", "crochet", "luxury"].includes(value);
}

function getBearerToken(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.slice(7).trim();
}

function toSafeNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export async function POST(request: Request) {
  try {
    const accessToken = getBearerToken(request);

    if (!accessToken) {
      return NextResponse.json(
        {
          ok: false,
          error: "Please sign in before generating a plushie.",
          code: "AUTH_REQUIRED"
        },
        { status: 401 }
      );
    }

    const {
      data: { user },
      error: authError
    } = await supabaseServer.auth.getUser(accessToken);

    if (authError || !user) {
      return NextResponse.json(
        {
          ok: false,
          error: "Your session has expired. Please sign in again.",
          code: "AUTH_REQUIRED"
        },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const image = formData.get("image");
    const styleValue = String(formData.get("style") || "classic");
    const chargeModeValue = String(formData.get("chargeMode") || "");

    if (!(image instanceof File)) {
      return NextResponse.json({ ok: false, error: "Please upload an image." }, { status: 400 });
    }

    if (!isPlushieStyle(styleValue)) {
      return NextResponse.json({ ok: false, error: "Invalid plushie style." }, { status: 400 });
    }

    const { data: profile, error: profileError } = await supabaseServer
      .from("profiles")
      .select("id, free_generations_used, credits")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { ok: false, error: "Could not load your account profile." },
        { status: 500 }
      );
    }

    const freeGenerationsUsed = toSafeNumber(profile.free_generations_used, 0);
    const credits = toSafeNumber(profile.credits, 0);

    const hasFreeGeneration = freeGenerationsUsed < 1;
    const hasCredits = credits > 0;
    const wantsToUseCredit = chargeModeValue === "credit";

    if (wantsToUseCredit && !hasCredits) {
      return NextResponse.json(
        {
          ok: false,
          error: "You do not have any credits left.",
          code: "NO_CREDITS",
          freeGenerationsUsed,
          remainingCredits: credits
        },
        { status: 402 }
      );
    }

    if (!wantsToUseCredit && !hasFreeGeneration && !hasCredits) {
      return NextResponse.json(
        {
          ok: false,
          error: "You have already used your free plushie preview. Please unlock this image or buy credits to generate more.",
          code: "LIMIT_REACHED",
          freeGenerationsUsed,
          remainingCredits: credits,
          requiresPayment: true
        },
        { status: 402 }
      );
    }

    const style = styleValue as PlushieStyle;
    const prompt = getPlushiePrompt(style);
    const sourceBuffer = Buffer.from(await image.arrayBuffer());
    const sourceMimeType = image.type || "image/png";
    const sourceDataUrl = `data:${sourceMimeType};base64,${sourceBuffer.toString("base64")}`;

    let generatedDataUrl: string;

    if (process.env.OPENAI_API_KEY) {
      const openai = getOpenAIClient();
      const response = await openai.images.edit({
        model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-1.5",
        image: [new File([sourceBuffer], image.name || "upload.png", { type: sourceMimeType })],
        prompt,
        size: "auto"
      });

      const base64 = response.data?.[0]?.b64_json;

      if (!base64) {
        throw new Error("No image returned from OpenAI.");
      }

      generatedDataUrl = `data:image/png;base64,${base64}`;
    } else {
      const styleLabel = plushieStyles.find((item) => item.value === style)?.label || "Classic Plush";
      generatedDataUrl = createMockPlushieDataUrl(styleLabel);
    }

    const isUnlockedResult = wantsToUseCredit;

    const result = await createResult({
      style,
      prompt,
      sourceDataUrl,
      previewDataUrl: generatedDataUrl,
      hdDataUrl: generatedDataUrl
    });

    const { error: generationInsertError } = await supabaseServer.from("generations").insert({
      id: result.id,
      user_id: user.id,
      style,
      prompt,
      source_image_url: sourceDataUrl,
      preview_image_url: generatedDataUrl,
      hd_image_url: generatedDataUrl,
      status: "completed",
      is_unlocked: isUnlockedResult
    });

    if (generationInsertError) {
      throw new Error(generationInsertError.message);
    }

    let nextFreeGenerationsUsed = freeGenerationsUsed;
    let nextRemainingCredits = credits;
    let generationChargeType: "free_generation" | "credit" = "free_generation";

    if (wantsToUseCredit) {
      nextRemainingCredits = Math.max(0, credits - 1);
      generationChargeType = "credit";

      const { error: creditError } = await supabaseServer
        .from("profiles")
        .update({ credits: nextRemainingCredits })
        .eq("id", user.id);

      if (creditError) {
        throw new Error(creditError.message);
      }
    } else if (hasFreeGeneration) {
      nextFreeGenerationsUsed = freeGenerationsUsed + 1;
      generationChargeType = "free_generation";

      const { error: usageError } = await supabaseServer
        .from("profiles")
        .update({ free_generations_used: nextFreeGenerationsUsed })
        .eq("id", user.id);

      if (usageError) {
        throw new Error(usageError.message);
      }
    } else {
      nextRemainingCredits = Math.max(0, credits - 1);
      generationChargeType = "credit";

      const { error: creditError } = await supabaseServer
        .from("profiles")
        .update({ credits: nextRemainingCredits })
        .eq("id", user.id);

      if (creditError) {
        throw new Error(creditError.message);
      }
    }

    return NextResponse.json({
      ok: true,
      resultId: result.id,
      previewDataUrl: result.previewDataUrl,
      usedFreeGeneration: !wantsToUseCredit && hasFreeGeneration,
      generationChargeType,
      freeGenerationsUsed: nextFreeGenerationsUsed,
      remainingCredits: nextRemainingCredits,
      requiresPayment: nextFreeGenerationsUsed >= 1 && nextRemainingCredits <= 0,
      isUnlocked: isUnlockedResult
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Something went wrong while generating your plushie."
      },
      { status: 500 }
    );
  }
}
