import type { PlushieStyle } from "@/types";

export const plushieStyles: Array<{ value: PlushieStyle; label: string; description: string }> = [
  {
    value: "classic",
    label: "Classic Plush",
    description: "Soft toy, rounded features, adorable finish"
  },
  {
    value: "crochet",
    label: "Crochet Plush",
    description: "Handmade yarn feel with stitched charm"
  },
  {
    value: "luxury",
    label: "Luxury Plush",
    description: "Premium collectible with polished studio feel"
  }
];

export function getPlushiePrompt(style: PlushieStyle) {
  const base = [
    "Transform the uploaded subject into a cute, high-quality plush toy.",
    "Keep the subject clearly recognizable while simplifying it into a plush doll form.",
    "Use soft felt or fleece texture, visible stitched seams, rounded proportions, and a handcrafted toy feel.",
    "Give the plush a slightly oversized head, small soft body, short limbs, and a cuddly silhouette.",
    "Use small black bead eyes, a subtle embroidered mouth, and minimal plush-style facial detail.",
    "Preserve key traits such as hairstyle, clothing colors, and defining features in a simplified plush form.",
    "Use soft studio lighting, smooth shading, and a clean or gently blurred background.",
    "The final result should feel like a charming, collectible plushie that is cute, cozy, giftable, and premium."
  ].join(" ");

  const styleMap: Record<PlushieStyle, string> = {
    classic: [
      "Style direction: classic cuddly plush toy.",
      "Use velvety fabric, warm soft colors, gentle fabric folds, and a timeless collectible plush aesthetic."
    ].join(" "),
    crochet: [
      "Style direction: handmade crochet plush toy.",
      "Use yarn texture, visible knitted stitching, cozy handcrafted detail, and a warm artisan feel."
    ].join(" "),
    luxury: [
      "Style direction: premium luxury plush collectible.",
      "Use ultra-soft premium materials, refined stitching, elegant presentation, and a polished high-end gift look."
    ].join(" ")
  };

  return `${base} ${styleMap[style]}`;
}
