import crypto from "node:crypto";
import { supabaseServer } from "@/lib/supabase-server";
import type { PlushieResult, PlushieStyle } from "@/types";

type GenerationRow = {
  id: string;
  style: string | null;
  prompt: string | null;
  source_image_url: string | null;
  preview_image_url: string | null;
  hd_image_url: string | null;
  is_unlocked: boolean | null;
  created_at: string | null;
  checkout_session_id?: string | null;
};

function toPlushieStyle(value: string | null): PlushieStyle {
  if (value === "classic" || value === "crochet" || value === "luxury") {
    return value;
  }

  return "classic";
}

function mapGenerationToResult(row: GenerationRow): PlushieResult {
  return {
    id: row.id,
    style: toPlushieStyle(row.style),
    prompt: row.prompt ?? "",
    sourceDataUrl: row.source_image_url ?? "",
    previewDataUrl: row.preview_image_url ?? "",
    hdDataUrl: row.hd_image_url ?? "",
    createdAt: row.created_at ?? new Date().toISOString(),
    isPaid: Boolean(row.is_unlocked),
    checkoutSessionId: row.checkout_session_id ?? undefined
  };
}

export async function createResult(input: Omit<PlushieResult, "id" | "createdAt" | "isPaid">) {
  const newResult: PlushieResult = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    isPaid: false
  };

  return newResult;
}

export async function getResult(id: string) {
  const { data, error } = await supabaseServer
    .from("generations")
    .select(
      "id, style, prompt, source_image_url, preview_image_url, hd_image_url, is_unlocked, created_at, checkout_session_id"
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapGenerationToResult(data as GenerationRow);
}

export async function markPaidByResultId(id: string) {
  const { data, error } = await supabaseServer
    .from("generations")
    .update({ is_unlocked: true })
    .eq("id", id)
    .select(
      "id, style, prompt, source_image_url, preview_image_url, hd_image_url, is_unlocked, created_at, checkout_session_id"
    )
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapGenerationToResult(data as GenerationRow);
}

export async function attachCheckoutSession(resultId: string, checkoutSessionId: string) {
  const { data, error } = await supabaseServer
    .from("generations")
    .update({ checkout_session_id: checkoutSessionId })
    .eq("id", resultId)
    .select(
      "id, style, prompt, source_image_url, preview_image_url, hd_image_url, is_unlocked, created_at, checkout_session_id"
    )
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapGenerationToResult(data as GenerationRow);
}

export async function markPaidByCheckoutSessionId(checkoutSessionId: string) {
  const { data, error } = await supabaseServer
    .from("generations")
    .update({ is_unlocked: true })
    .eq("checkout_session_id", checkoutSessionId)
    .select(
      "id, style, prompt, source_image_url, preview_image_url, hd_image_url, is_unlocked, created_at, checkout_session_id"
    )
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapGenerationToResult(data as GenerationRow);
}
