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
    "CRITICAL: preserve identity accuracy.",
    "Each person must remain clearly recognizable as the original individual.",
    "If multiple people are present, they must not look identical.",
    "Do not merge faces, duplicate faces, or blend different people into one repeated look.",
    "Maintain unique facial features such as eye shape, smile, face structure, hairstyle, hair length, and hair differences.",
    "Preserve age cues, expression differences, pose differences, and overall likeness for each person.",
    "Preserve key traits such as hairstyle, clothing colors, clothing shape, and defining features in a simplified plush form.",
    "Keep the composition and person-to-person differences similar to the original image.",
    "Use soft felt or fleece texture, visible stitched seams, rounded proportions, and a handcrafted toy feel.",
    "Give the plush a slightly oversized head, small soft body, short limbs, and a cuddly silhouette.",
    "Use small black bead eyes, a subtle embroidered mouth, and minimal plush-style facial detail without losing identity.",
    "Use soft studio lighting, smooth shading, and a clean or gently blurred background.",
    "The final result should feel like a charming, collectible plushie that is cute, cozy, giftable, and premium."
  ].join(" ");

  const styleMap: Record<PlushieStyle, string> = {
    classic: [
      "Style direction: classic cuddly plush toy.",
      "Use velvety fabric, warm soft colors, gentle fabric folds, and a timeless collectible plush aesthetic.",
      "Keep likeness preservation especially strong so the plush still feels clearly based on the original person or people."
    ].join(" "),
    crochet: [
      "Style direction: handmade crochet plush toy.",
      "Use handmade crochet or amigurumi texture.",
      "Use soft yarn stitches, visible knitted patterns, cozy handcrafted detail, and a warm artisan feel.",
      "CRITICAL: preserve the identity of each person exactly.",
      "If multiple people are present, they must remain clearly different individuals.",
      "Do not make faces identical.",
      "Maintain unique facial differences between people, including eyes, smile, face shape, hairstyle, and hair differences.",
      "Keep clothing colours and overall appearance recognisable.",
      "Keep the composition similar to the original image.",
      "Make the result feel like a real handcrafted crochet plush toy while still clearly representing the original people."
    ].join(" "),
    luxury: [
      "Style direction: premium luxury plush collectible.",
      "Use ultra-soft premium materials, refined stitching, elegant presentation, and a polished high-end gift look.",
      "Preserve likeness and individuality while making the result feel polished and premium."
    ].join(" ")
  };

  return `${base} ${styleMap[style]}`;
}
