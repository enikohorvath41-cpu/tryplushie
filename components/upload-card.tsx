"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, CreditCard, Loader2, Lock, Sparkles, Upload, Wand2 } from "lucide-react";
import { StylePicker } from "@/components/style-picker";
import { supabase } from "@/lib/supabase";
import type { PlushieStyle } from "@/types";

type CheckoutResponse = {
  ok?: boolean;
  error?: string;
  code?: string;
  url?: string;
};

type GenerateResponse = {
  ok?: boolean;
  error?: string;
  code?: string;
  resultId?: string;
  remainingCredits?: number;
};

type PendingGenerateState = {
  intent: "generate";
  style: PlushieStyle;
  fileName: string | null;
  mimeType: string | null;
  storagePath: string | null;
  publicUrl: string | null;
};

type ProfileRow = {
  credits: number | null;
};

const PENDING_GENERATE_KEY = "tryplushie_pending_generate";
const PENDING_UPLOADS_BUCKET = "pending-uploads";
const MAX_IMAGE_DIMENSION = 1280;
const JPEG_QUALITY = 0.86;
const PAID_GENERATION_PRICE = "£2.99";

const CREDIT_PROGRESS_LINES = [
  "Performing plushie generation",
  "Applying plushie style",
  "Finalising your result"
];

const CREDIT_PROGRESS_TIPS = [
  "Stay on this page while we finish creating your plushie.",
  "Most plushies finish quickly, but it can take a little longer at busy times.",
  "Once ready, we’ll take you straight to your finished result."
];

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

async function parseGenerateResponse(response: Response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return (await response.json()) as GenerateResponse;
  }

  return {
    ok: false,
    error: (await response.text()) || "Could not generate your plushie."
  } satisfies GenerateResponse;
}

export function UploadCard() {
  const router = useRouter();
  const [style, setStyle] = useState<PlushieStyle>("classic");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pendingUpload, setPendingUpload] = useState<{ storagePath: string; publicUrl: string } | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isGeneratingWithCredit, setIsGeneratingWithCredit] = useState(false);
  const [isRestoringPending, setIsRestoringPending] = useState(false);
  const [isPreparingImage, setIsPreparingImage] = useState(false);
  const [credits, setCredits] = useState(0);
  const [isLoadingCredits, setIsLoadingCredits] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [creditProgressIndex, setCreditProgressIndex] = useState(0);

  const helperText = useMemo(() => {
    if (!file) return "Use a clear selfie, pet photo, couple photo or baby photo.";
    return `${file.name} selected`;
  }, [file]);

  const hasCredits = credits > 0;
  const currentCreditProgressLine = useMemo(
    () => CREDIT_PROGRESS_LINES[creditProgressIndex],
    [creditProgressIndex]
  );

  useEffect(() => {
    let isMounted = true;

    async function loadCredits() {
      setIsLoadingCredits(true);

      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!isMounted) return;

      if (!session) {
        setCredits(0);
        setIsLoadingCredits(false);
        return;
      }

      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("credits")
        .eq("id", session.user.id)
        .single();

      if (!isMounted) return;

      if (profileError) {
        setCredits(0);
      } else {
        const profile = data as ProfileRow | null;
        setCredits(typeof profile?.credits === "number" ? profile.credits : 0);
      }

      setIsLoadingCredits(false);
    }

    loadCredits();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(() => {
      loadCredits();
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isGeneratingWithCredit) return;

    const interval = setInterval(() => {
      setCreditProgressIndex((current) => (current + 1) % CREDIT_PROGRESS_LINES.length);
    }, 1700);

    return () => clearInterval(interval);
  }, [isGeneratingWithCredit]);

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
          setNotice("You're signed in. Your uploaded photo is still here — continue to create your plushie.");
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

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function resetPendingSelection() {
    setError(null);
    setNotice(null);
    setPendingUpload(null);
  }

  async function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] ?? null;

    resetPendingSelection();

    if (!nextFile) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setFile(null);
      setPreviewUrl(null);
      return;
    }

    setIsPreparingImage(true);

    try {
      const compressedFile = await compressImage(nextFile);

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      const localUrl = URL.createObjectURL(compressedFile);

      setFile(compressedFile);
      setPreviewUrl(localUrl);
      setNotice("Photo optimised and ready. Use a credit or pay only when you're ready to create it.");
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

  async function getCurrentSession() {
    const {
      data: { session }
    } = await supabase.auth.getSession();

    return session;
  }

  async function handleCheckout() {
    if (!file) {
      setError("Please upload a photo first.");
      return;
    }

    setIsCheckingOut(true);
    setIsGeneratingWithCredit(false);
    setError(null);
    setNotice(null);

    try {
      const session = await getCurrentSession();

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

  async function handleGenerateWithCredit() {
    if (!file) {
      setError("Please upload a photo first.");
      return;
    }

    setIsGeneratingWithCredit(true);
    setCreditProgressIndex(0);
    setIsCheckingOut(false);
    setError(null);
    setNotice(null);

    try {
      const session = await getCurrentSession();

      if (!session?.access_token) {
        await savePendingGenerateState();
        router.push("/auth?next=%2F%23generator&intent=generate");
        return;
      }

      if (credits <= 0) {
        throw new Error("You do not have any credits left.");
      }

      const formData = new FormData();
      formData.append("image", file);
      formData.append("style", style);
      formData.append("chargeMode", "credit");

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`
        },
        body: formData
      });

      const data = await parseGenerateResponse(response);

      if (!response.ok || !data.resultId) {
        if (data.code === "AUTH_REQUIRED") {
          await savePendingGenerateState();
          router.push("/auth?next=%2F%23generator&intent=generate");
          return;
        }

        throw new Error(data.error || "Could not generate your plushie.");
      }

      setCredits(typeof data.remainingCredits === "number" ? data.remainingCredits : Math.max(0, credits - 1));
      router.push(`/result/${data.resultId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setIsGeneratingWithCredit(false);
    }
  }

  if (isGeneratingWithCredit) {
    return (
      <div className="space-y-4">
        <div className="glass-card rounded-[32px] p-5 sm:p-6">
          <div className="mb-4 inline-flex rounded-full bg-[rgba(183,125,63,0.12)] p-3 text-[var(--gold-strong)]">
            <Loader2 className="animate-spin" size={22} />
          </div>

          <h3 className="text-[2rem] font-semibold leading-[1.02] tracking-[-0.04em] text-[var(--text)] sm:text-[2.5rem]">
            Generating your plushie
          </h3>

          <p className="mt-3 text-sm leading-7 text-[var(--muted)] sm:text-base">
            Your credit has been used for this generation. Give us a moment to finish creating your plushie.
          </p>

          <div className="mt-6 rounded-[28px] border border-[rgba(173,118,63,0.14)] bg-[rgba(255,255,255,0.72)] p-5">
            <div className="flex items-center gap-3 text-[var(--text)]">
              <Loader2 className="animate-spin text-[var(--gold-strong)]" size={18} />
              <p className="text-sm font-semibold sm:text-base">{currentCreditProgressLine}</p>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[rgba(173,118,63,0.12)]">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-[var(--text)]" />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {CREDIT_PROGRESS_TIPS.map((tip) => (
                <div
                  key={tip}
                  className="rounded-[22px] border border-[rgba(173,118,63,0.14)] bg-[rgba(255,248,241,0.76)] p-4"
                >
                  <div className="mb-3 inline-flex rounded-full bg-[rgba(183,125,63,0.12)] p-2.5 text-[var(--gold-strong)]">
                    <Sparkles size={16} />
                  </div>
                  <p className="text-sm leading-6 text-[var(--text)]">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-[26px] border border-[rgba(173,118,63,0.14)] bg-[rgba(255,248,241,0.72)] p-4">
            <div className="flex items-center gap-3">
              <div className="inline-flex rounded-full bg-[rgba(183,125,63,0.12)] p-2.5 text-[var(--gold-strong)]">
                <CheckCircle2 size={16} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text)]">Credit route active</p>
                <p className="text-sm leading-6 text-[var(--muted)]">
                  This generation should open as an unlocked result as soon as it is ready.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
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
            <p className="text-sm text-[var(--muted)]">
              Upload free, choose your style free, and only pay or use a credit when you're ready to create your plushie.
            </p>
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
          <p className="mb-3 text-sm text-[var(--muted)]">See your photo, pick your favourite style, then continue to create.</p>
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
                  {hasCredits ? "Use 1 credit or pay once" : `Create your plushie for ${PAID_GENERATION_PRICE}`}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  {hasCredits
                    ? "You already have credits on your account, so you can create this plushie instantly with 1 credit or still choose the single payment route."
                    : "Your plushie will be generated after checkout. This keeps the app fast for you and protects generation costs until a payment is confirmed."}
                </p>
              </div>
              <div className="rounded-full bg-white/85 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--gold-strong)]">
                {hasCredits ? "1 image = 1 credit" : "Pay first"}
              </div>
            </div>

            <div className="mt-4 grid gap-3">
              {hasCredits ? (
                <>
                  <div className="flex items-center justify-between rounded-[18px] border border-[rgba(173,118,63,0.14)] bg-white/82 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-[rgba(183,125,63,0.12)] p-2 text-[var(--gold-strong)]">
                        <CreditCard size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--text)]">Credits on your account</p>
                        <p className="text-xs text-[var(--muted)]">Use 1 credit to generate this image now.</p>
                      </div>
                    </div>
                    <div className="rounded-full bg-[var(--text)] px-3 py-1 text-xs font-semibold text-white">
                      {isLoadingCredits ? "Loading…" : `${credits} credit${credits === 1 ? "" : "s"}`}
                    </div>
                  </div>
                  {[
                    "Generate instantly with 1 credit",
                    `Or choose single payment for ${PAID_GENERATION_PRICE}`,
                    "Your finished plushie opens as soon as it is ready"
                  ].map((line) => (
                    <div
                      key={line}
                      className="rounded-[18px] border border-[rgba(173,118,63,0.14)] bg-white/82 px-4 py-3 text-sm font-medium text-[var(--text)]"
                    >
                      {line}
                    </div>
                  ))}
                </>
              ) : (
                [
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
                ))
              )}
            </div>
          </div>
        ) : null}

        {error ? <p className="mt-4 text-center text-sm font-medium text-[#a14321]">{error}</p> : null}
        {notice ? <p className="mt-4 text-center text-sm font-medium text-[var(--gold-strong)]">{notice}</p> : null}

        {hasCredits ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={handleGenerateWithCredit}
              disabled={!file || isCheckingOut || isGeneratingWithCredit || isRestoringPending || isPreparingImage}
              className="flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-[var(--text)] px-5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(37,21,5,0.18)] transition hover:opacity-95 disabled:opacity-60"
            >
              {isGeneratingWithCredit || isRestoringPending || isPreparingImage ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Sparkles size={18} />
              )}
              {isPreparingImage
                ? "Preparing your photo…"
                : isRestoringPending
                  ? "Restoring your photo…"
                  : isGeneratingWithCredit
                    ? "Generating with 1 credit…"
                    : "Use 1 credit now"}
            </button>

            <button
              type="button"
              onClick={handleCheckout}
              disabled={!file || isCheckingOut || isGeneratingWithCredit || isRestoringPending || isPreparingImage}
              className="flex min-h-14 w-full items-center justify-center gap-2 rounded-full border border-[rgba(173,118,63,0.2)] bg-white/78 px-5 text-sm font-semibold text-[var(--text)] transition hover:bg-white/90 disabled:opacity-60"
            >
              {isCheckingOut || isRestoringPending || isPreparingImage ? <Loader2 className="animate-spin" size={18} /> : <Lock size={18} />}
              {isPreparingImage
                ? "Preparing your photo…"
                : isRestoringPending
                  ? "Restoring your photo…"
                  : isCheckingOut
                    ? "Opening secure checkout…"
                    : `Pay once – ${PAID_GENERATION_PRICE}`}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleCheckout}
            disabled={!file || isCheckingOut || isGeneratingWithCredit || isRestoringPending || isPreparingImage}
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
        )}

        <p className="mt-3 text-center text-sm text-[var(--muted)]">
          {hasCredits ? "Use 1 credit instantly, or pay once for this plushie." : "Upload free. Pay only when you are ready to generate."}
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
              {hasCredits ? `${credits} credit${credits === 1 ? "" : "s"} available` : "Awaiting payment"}
            </div>
          </div>

          <div className="relative aspect-square overflow-hidden rounded-[28px] bg-[linear-gradient(180deg,#fff8f2,#f6dec0)]">
            <img src={previewUrl} alt="Uploaded photo preview" className="h-full w-full object-cover" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_15%,rgba(255,255,255,0.08)_46%,rgba(0,0,0,0.10)_100%)]" />
            <div className="pointer-events-none absolute inset-x-4 bottom-4 rounded-full bg-[rgba(37,21,5,0.74)] px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-white backdrop-blur-sm sm:inset-x-8">
              {hasCredits ? "Use 1 credit now · Or pay once at checkout" : "Pay first · We create your plushie after checkout"}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
