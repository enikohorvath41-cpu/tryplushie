"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, Sparkles, Upload } from "lucide-react";
import { StylePicker } from "@/components/style-picker";
import { supabase } from "@/lib/supabase";
import type { PlushieStyle } from "@/types";

type CheckoutResponse = {
  ok?: boolean;
  error?: string;
  code?: string;
  url?: string;
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
const MAX_IMAGE_DIMENSION = 1280;
const JPEG_QUALITY = 0.86;
const PAID_GENERATION_PRICE = "£2.99";

function makePendingUploadPath(file: File) {
  const extension = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
  const safeExtension = (extension || "jpg").replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || "jpg";
  const randomId = crypto.randomUUID();
  return `pending/${randomId}.${safeExtension}`;
}

function loadImageFromUrl(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not read your image."));
    image.src = url;
  });
}

async function compressImage(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please upload a valid image.");
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await loadImageFromUrl(objectUrl);
    const maxSide = Math.max(image.width, image.height);
    const scale = maxSide > MAX_IMAGE_DIMENSION ? MAX_IMAGE_DIMENSION / maxSide : 1;

    const targetWidth = Math.max(1, Math.round(image.width * scale));
    const targetHeight = Math.max(1, Math.round(image.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Could not prepare your image.");
    }

    context.drawImage(image, 0, 0, targetWidth, targetHeight);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY);
    });

    if (!blob) {
      throw new Error("Could not compress your image.");
    }

    const fileBaseName = file.name.replace(/\.[^.]+$/, "") || "upload";
    return new File([blob], `${fileBaseName}.jpg`, { type: "image/jpeg" });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function uploadPendingImage(file: File) {
  const path = makePendingUploadPath(file);

  const { error } = await supabase.storage.from(PENDING_UPLOADS_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || "image/jpeg"
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
  const fileName = pendingState.fileName || "pending-upload.jpg";
  const mimeType = pendingState.mimeType || blob.type || "image/jpeg";

  return new File([blob], fileName, { type: mimeType });
}

async function parseCheckoutResponse(response: Response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return (await response.json()) as CheckoutResponse;
  }

  return {
    ok: false,
    error: (await response.text()) || "Could not start checkout."
  } satisfies CheckoutResponse;
}

export function UploadCard() {
  const router = useRouter();
  const [style, setStyle] = useState<PlushieStyle>("classic");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pendingUpload, setPendingUpload] = useState<{ storagePath: string; publicUrl: string } | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isRestoringPending, setIsRestoringPending] = useState(false);
  const [isPreparingImage, setIsPreparingImage] = useState(false);
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
        setPendingUpload(
          pendingState.storagePath && pendingState.publicUrl
            ? { storagePath: pendingState.storagePath, publicUrl: pendingState.publicUrl }
            : null
        );

        const restoredFile = await restoreFileFromPendingState(pendingState);

        if (!isMounted) return;

        if (restoredFile) {
          const restoredPreviewUrl = URL.createObjectURL(restoredFile);
          setFile(restoredFile);
          setPreviewUrl(restoredPreviewUrl);
          setNotice("You're signed in. Your uploaded photo is still here — continue to checkout and we’ll create your plushie after payment.");
        } else if (pendingState.fileName) {
          setNotice(`You're signed in. Re-upload ${pendingState.fileName} to continue.`);
        } else {
          setNotice("You're signed in. Re-upload your photo to continue.");
        }
      } catch (restoreError) {
        if (!isMounted) return;

        setPendingUpload(null);
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

  function resetPendingSelection() {
    setError(null);
    setNotice(null);
    setPendingUpload(null);
  }

  async function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] ?? null;

    resetPendingSelection();

    if (!nextFile) {
      setFile(null);
      setPreviewUrl(null);
      return;
    }

    setIsPreparingImage(true);

    try {
      const compressedFile = await compressImage(nextFile);
      const localUrl = URL.createObjectURL(compressedFile);

      setFile(compressedFile);
      setPreviewUrl(localUrl);
      setNotice("Photo optimised and ready. Pay only when you're happy to create it.");
    } catch (compressionError) {
      setFile(null);
      setPreviewUrl(null);
      setError(
        compressionError instanceof Error ? compressionError.message : "Could not prepare your uploaded image."
      );
    } finally {
      setIsPreparingImage(false);
    }
  }

  async function ensurePendingUpload() {
    if (!file) {
      throw new Error("Please upload a photo first.");
    }

    if (pendingUpload) {
      return pendingUpload;
    }

    const uploaded = await uploadPendingImage(file);
    setPendingUpload(uploaded);
    return uploaded;
  }

  async function savePendingGenerateState() {
    if (typeof window === "undefined" || !file) return;

    const uploaded = await ensurePendingUpload();

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

  async function handleCheckout() {
    if (!file) {
      setError("Please upload a photo first.");
      return;
    }

    setIsCheckingOut(true);
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

      const uploaded = await ensurePendingUpload();

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          style,
          storagePath: uploaded.storagePath,
          publicUrl: uploaded.publicUrl,
          fileName: file.name,
          mimeType: file.type
        })
      });

      const data = await parseCheckoutResponse(response);

      if (!response.ok || !data.url) {
        if (data.code === "AUTH_REQUIRED") {
          await savePendingGenerateState();
          router.push("/auth?next=%2F%23generator&intent=generate");
          return;
        }

        throw new Error(data.error || "Could not start checkout.");
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setIsCheckingOut(false);
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
            <p className="text-sm text-[var(--muted)]">Upload free, choose your style free, and only pay when you're ready to create your plushie.</p>
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
          <p className="mb-3 text-sm text-[var(--muted)]">See your photo, pick your favourite style, then continue to checkout.</p>
          <StylePicker value={style} onChange={setStyle} />
        </div>

        {previewUrl ? (
          <div className="mt-5 rounded-[24px] border border-[rgba(173,118,63,0.16)] bg-[rgba(255,248,241,0.72)] p-4 sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--gold-strong)]">
                  Ready to create
                </p>
                <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[var(--text)] sm:text-2xl">
                  Create your plushie for {PAID_GENERATION_PRICE}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  Your plushie will be generated after checkout. This keeps the app fast for you and protects generation costs until a payment is confirmed.
                </p>
              </div>
              <div className="rounded-full bg-white/85 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--gold-strong)]">
                Pay first
              </div>
            </div>

            <div className="mt-4 grid gap-3">
              {[
                "Free upload and style selection",
                "Secure checkout before AI generation",
                "Your plushie is created after payment"
              ].map((line) => (
                <div
                  key={line}
                  className="rounded-[18px] border border-[rgba(173,118,63,0.14)] bg-white/82 px-4 py-3 text-sm font-medium text-[var(--text)]"
                >
                  {line}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {error ? <p className="mt-4 text-center text-sm font-medium text-[#a14321]">{error}</p> : null}
        {notice ? <p className="mt-4 text-center text-sm font-medium text-[var(--gold-strong)]">{notice}</p> : null}

        <button
          type="button"
          onClick={handleCheckout}
          disabled={!file || isCheckingOut || isRestoringPending || isPreparingImage}
          className="mt-5 flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-[var(--text)] px-5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(37,21,5,0.18)] transition hover:opacity-95 disabled:opacity-60"
        >
          {isCheckingOut || isRestoringPending || isPreparingImage ? <Loader2 className="animate-spin" size={18} /> : <Lock size={18} />}
          {isPreparingImage
            ? "Preparing your photo…"
            : isRestoringPending
              ? "Restoring your photo…"
              : isCheckingOut
                ? "Opening secure checkout…"
                : `Continue to create – ${PAID_GENERATION_PRICE}`}
        </button>

        <p className="mt-3 text-center text-sm text-[var(--muted)]">
          Upload free. Pay only when you are ready to generate.
        </p>
      </div>

      {previewUrl ? (
        <div className="glass-card overflow-hidden rounded-[30px] p-4">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--gold-strong)]">
                Your uploaded photo
              </p>
              <h3 className="mt-1 text-[1.9rem] font-semibold tracking-[-0.04em] text-[var(--text)] sm:text-[2.2rem]">
                This is ready to plushify
              </h3>
            </div>
            <div className="rounded-full border border-[rgba(173,118,63,0.2)] bg-white/70 px-4 py-2 text-sm font-semibold text-[var(--gold-strong)]">
              Awaiting payment
            </div>
          </div>

          <div className="relative aspect-square overflow-hidden rounded-[28px] bg-[linear-gradient(180deg,#fff8f2,#f6dec0)]">
            <img src={previewUrl} alt="Uploaded photo preview" className="h-full w-full object-cover" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_15%,rgba(255,255,255,0.08)_46%,rgba(0,0,0,0.10)_100%)]" />
            <div className="pointer-events-none absolute inset-x-4 bottom-4 rounded-full bg-[rgba(37,21,5,0.74)] px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-white backdrop-blur-sm sm:inset-x-8">
              Pay first · We create your plushie after checkout
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
