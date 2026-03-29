"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, Upload } from "lucide-react";
import { StylePicker } from "@/components/style-picker";
import { GenerationStatus } from "@/components/generation-status";
import { ResultCard } from "@/components/result-card";
import { supabase } from "@/lib/supabase";
import type { PlushieStyle } from "@/types";

type GenerateResponse = {
  ok?: boolean;
  error?: string;
  code?: string;
  resultId?: string;
  previewDataUrl?: string;
  remainingCredits?: number;
  usedFreeGeneration?: boolean;
};

type PendingGenerateState = {
  intent: "generate";
  style: PlushieStyle;
  fileName: string | null;
  mimeType: string | null;
  storagePath: string | null;
  publicUrl: string | null;
};

const PENDING_GENERATE_KEY = "tryplushie_pending_generate";
const PENDING_UPLOADS_BUCKET = "pending-uploads";

function makePendingUploadPath(file: File) {
  const extension = file.name.includes(".") ? file.name.split(".").pop() : "png";
  const safeExtension = (extension || "png").replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || "png";
  const randomId = crypto.randomUUID();
  return `pending/${randomId}.${safeExtension}`;
}

async function uploadPendingImage(file: File) {
  const path = makePendingUploadPath(file);

  const { error } = await supabase.storage.from(PENDING_UPLOADS_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || "image/png"
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(PENDING_UPLOADS_BUCKET).getPublicUrl(path);

  return {
    storagePath: path,
    publicUrl: data.publicUrl
  };
}

async function restoreFileFromPendingState(pendingState: PendingGenerateState) {
  if (!pendingState.publicUrl) {
    return null;
  }

  const response = await fetch(pendingState.publicUrl);

  if (!response.ok) {
    throw new Error("Could not restore your uploaded image.");
  }

  const blob = await response.blob();
  const fileName = pendingState.fileName || "pending-upload.png";
  const mimeType = pendingState.mimeType || blob.type || "image/png";

  return new File([blob], fileName, { type: mimeType });
}

export function UploadCard() {
  const router = useRouter();
  const [style, setStyle] = useState<PlushieStyle>("classic");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultId, setResultId] = useState<string | null>(null);
  const [resultPreview, setResultPreview] = useState<string | null>(null);
  const [resultRemainingCredits, setResultRemainingCredits] = useState<number | null>(null);
  const [resultUsedFreeGeneration, setResultUsedFreeGeneration] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRestoringPending, setIsRestoringPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const helperText = useMemo(() => {
    if (!file) return "Use a clear selfie, pet photo, couple photo or baby photo.";
    return `${file.name} selected`;
  }, [file]);

  useEffect(() => {
    let isMounted = true;

    async function restorePendingGenerateState() {
      if (typeof window === "undefined") return;

      const rawPendingState = window.sessionStorage.getItem(PENDING_GENERATE_KEY);
      if (!rawPendingState) return;

      let pendingState: PendingGenerateState | null = null;

      try {
        pendingState = JSON.parse(rawPendingState) as PendingGenerateState;
      } catch {
        window.sessionStorage.removeItem(PENDING_GENERATE_KEY);
        return;
      }

      if (pendingState?.intent !== "generate") {
        window.sessionStorage.removeItem(PENDING_GENERATE_KEY);
        return;
      }

      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!isMounted || !session) return;

      setIsRestoringPending(true);

      try {
        setStyle(pendingState.style);

        const restoredFile = await restoreFileFromPendingState(pendingState);

        if (!isMounted) return;

        if (restoredFile) {
          const restoredPreviewUrl = URL.createObjectURL(restoredFile);
          setFile(restoredFile);
          setPreviewUrl(restoredPreviewUrl);
          setNotice("You're signed in. Your uploaded photo is still here — continue generating your plushie.");
        } else if (pendingState.fileName) {
          setNotice(`You're signed in. Re-upload ${pendingState.fileName} to finish generating your plushie.`);
        } else {
          setNotice("You're signed in. Re-upload your photo to finish generating your plushie.");
        }
      } catch (restoreError) {
        if (!isMounted) return;

        setNotice(
          pendingState.fileName
            ? `You're signed in. We couldn't restore ${pendingState.fileName}, so please upload it again.`
            : "You're signed in. We couldn't restore your photo, so please upload it again."
        );
        setError(restoreError instanceof Error ? restoreError.message : "Could not restore your uploaded photo.");
      } finally {
        window.sessionStorage.removeItem(PENDING_GENERATE_KEY);

        if (isMounted) {
          setIsRestoringPending(false);

          if (window.location.hash !== "#generator") {
            window.location.hash = "generator";
          }
        }
      }
    }

    restorePendingGenerateState();

    return () => {
      isMounted = false;
    };
  }, []);

  function resetResultState() {
    setResultId(null);
    setResultPreview(null);
    setResultRemainingCredits(null);
    setResultUsedFreeGeneration(false);
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] ?? null;
    setFile(nextFile);
    resetResultState();
    setError(null);
    setNotice(null);

    if (!nextFile) {
      setPreviewUrl(null);
      return;
    }

    const localUrl = URL.createObjectURL(nextFile);
    setPreviewUrl(localUrl);
  }

  async function savePendingGenerateState() {
    if (typeof window === "undefined" || !file) return;

    const uploaded = await uploadPendingImage(file);

    const pendingState: PendingGenerateState = {
      intent: "generate",
      style,
      fileName: file.name ?? null,
      mimeType: file.type ?? null,
      storagePath: uploaded.storagePath,
      publicUrl: uploaded.publicUrl
    };

    window.sessionStorage.setItem(PENDING_GENERATE_KEY, JSON.stringify(pendingState));
  }

  async function handleGenerate() {
    if (!file) {
      setError("Please upload a photo first.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setNotice(null);

    try {
      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        await savePendingGenerateState();
        router.push("/auth?next=%2F%23generator&intent=generate");
        return;
      }

      const formData = new FormData();
      formData.append("image", file);
      formData.append("style", style);

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`
        },
        body: formData
      });

      const data = (await response.json()) as GenerateResponse;

      if (!response.ok || !data.ok || !data.resultId || !data.previewDataUrl) {
        if (data.code === "AUTH_REQUIRED") {
          await savePendingGenerateState();
          router.push("/auth?next=%2F%23generator&intent=generate");
          return;
        }

        if (data.code === "LIMIT_REACHED") {
          throw new Error(data.error || "You have used your free preview. Please unlock an image or buy credits.");
        }

        throw new Error(data.error || "Could not generate your plushie.");
      }

      setResultId(data.resultId);
      setResultPreview(data.previewDataUrl);
      setResultRemainingCredits(typeof data.remainingCredits === "number" ? data.remainingCredits : null);
      setResultUsedFreeGeneration(Boolean(data.usedFreeGeneration));

      if (data.usedFreeGeneration) {
        setNotice("Your free plushie preview has been used. Next time you will need credits or an unlock.");
      } else if (typeof data.remainingCredits === "number") {
        setNotice(`Plushie generated. Remaining credits: ${data.remainingCredits}.`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <section id="generator" className="space-y-4">
      <div className="glass-card rounded-[32px] p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-full bg-[rgba(183,125,63,0.12)] p-3 text-[var(--gold-strong)]">
            <Upload size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--text)]">Upload your photo</p>
            <p className="text-sm text-[var(--muted)]">Sign in to generate your first free preview. Unlock HD only if you love it.</p>
          </div>
        </div>

        <label className="block cursor-pointer rounded-[28px] border border-dashed border-[rgba(173,118,63,0.28)] bg-white/60 p-4 transition hover:bg-white/80">
          <input type="file" accept="image/*" className="hidden" onChange={onFileChange} />
          <div className="flex flex-col items-center justify-center gap-3 rounded-[22px] bg-[rgba(255,248,241,0.9)] px-4 py-8 text-center">
            {previewUrl ? (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Selected preview"
                  className="h-44 w-44 rounded-[24px] object-cover gold-ring sm:h-48 sm:w-48"
                />
                <div className="absolute bottom-2 right-2 rounded-full bg-[var(--text)] px-3 py-1 text-xs font-semibold text-white shadow-[0_10px_24px_rgba(37,21,5,0.22)]">
                  Ready ✨
                </div>
              </div>
            ) : (
              <div className="flex h-36 w-36 items-center justify-center rounded-[28px] border border-[rgba(173,118,63,0.16)] bg-white/70 text-[var(--gold-strong)] sm:h-40 sm:w-40">
                <Upload size={34} />
              </div>
            )}

            <div>
              <p className="text-base font-semibold text-[var(--text)]">
                {previewUrl ? "Photo uploaded" : "Tap to upload a photo"}
              </p>
              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{helperText}</p>
            </div>
          </div>
        </label>

        <div className="mt-5">
          <p className="mb-2 text-sm font-semibold text-[var(--text)]">Choose your plushie style</p>
          <p className="mb-3 text-sm text-[var(--muted)]">Start with one signature look and keep it simple.</p>
          <StylePicker value={style} onChange={setStyle} />
        </div>

        {error ? <p className="mt-4 text-center text-sm font-medium text-[#a14321]">{error}</p> : null}
        {notice ? <p className="mt-4 text-center text-sm font-medium text-[var(--gold-strong)]">{notice}</p> : null}

        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating || isRestoringPending}
          className="mt-5 flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-[var(--text)] px-5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(37,21,5,0.18)] transition hover:opacity-95 disabled:opacity-60"
        >
          {isGenerating || isRestoringPending ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
          {isRestoringPending ? "Restoring your photo…" : isGenerating ? "Generating plushie…" : "Create my plushie"}
        </button>

        <p className="mt-3 text-center text-sm text-[var(--muted)]">
          One free preview per account. Pay only if you love it.
        </p>
      </div>

      {isGenerating ? <GenerationStatus /> : null}
      {resultPreview ? (
        <ResultCard
          imageUrl={resultPreview}
          resultId={resultId}
          remainingCredits={resultRemainingCredits}
          usedFreeGeneration={resultUsedFreeGeneration}
        />
      ) : null}
    </section>
  );
}
