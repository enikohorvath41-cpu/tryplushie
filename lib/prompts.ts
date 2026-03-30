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
    "Turn the uploaded photo into a premium custom plush recreation of the same subjects.",
    "This must be a like-for-like plush translation, not a redesign.",
    "Highest priority: preserve identity.",
    "Second priority: preserve composition.",
    "First, accurately reconstruct the real subjects exactly as they appear in the original image. Then apply a plush material transformation on top of that reconstruction without changing identity.",
    "The underlying face structure must remain realistic and human-accurate or animal-accurate beneath the plush texture, not replaced by a simplified toy face.",
    "Keep every person or animal immediately recognisable.",
    "If multiple subjects are present, keep them clearly distinct, separated, and in the same left-to-right order.",
    "Do not merge faces, duplicate subjects, average features, replace identity, or turn different subjects into matching copies.",
    "Preserve exact subject count, framing, spacing, scale relationships, pose relationships, and overall arrangement.",
    "Preserve the full composition of the original image.",
    "Do not crop, zoom, reframe, remove, or cut off any subject.",
    "Keep camera angle and perspective close to the original.",
    "Preserve pose, head angle, gaze direction, expression, gesture, and interaction between subjects.",
    "Preserve age cues, body proportions, and overall likeness.",
    "Preserve exact facial identity: face shape, eye spacing, eye shape, brows, nose, mouth, smile, cheeks, jawline, chin, ears, and identity-defining facial proportions.",
    "Preserve asymmetry, natural imperfections, and unique real-life features.",
    "Do not beautify, idealise, glamorise, or make faces more generic, symmetrical, younger, or more cartoon-perfect.",
    "Do not clean up the face into a generic plush character.",
    "Preserve hairstyle, hairline, parting, length, volume, curl pattern, and texture.",
    "Preserve skin tone or fur colour accurately.",
    "Preserve distinctive markings, patches, muzzle colouring, chest colouring, freckles, facial hair, collars, accessories, and recognisable outfit details.",
    "Keep the emotional feel of the original photo so the plush still feels like the same real people or animals.",
    "Make the result unmistakably a real plush toy.",
    "Make it clearly plush by changing material, not identity.",
    "Show clear plush construction: soft stuffed form, fabric seams, plush surface texture, and toy-like material definition.",
    "Use soft plush fabric, stitched construction, premium toy craftsmanship, and gentle plush softness.",
    "Do not drift into a soft painted portrait or realistic human rendering with only light texture.",
    "Do not over-exaggerate anatomy or enlarge heads too much.",
    "Do not simplify facial structure into a generic doll template.",
    "Use soft clean lighting and a simple premium background treatment.",
    "The final image should feel like a bespoke plush made directly from this exact photo, with strong likeness and strong composition preservation."
  ].join(" ");

  const styleMap: Record<PlushieStyle, string> = {
    classic: [
      "Style: classic cuddly plush toy.",
      "Use velvety fabric, soft fleece texture, smooth seams, and a timeless premium soft-toy finish.",
      "Keep realistic plush proportions and avoid over-stylising the face.",
      "The plush should feel like the same real people or animals translated into soft plush form.",
      "Ensure the final result still reads clearly as a stuffed plush toy, with visible plush volume, soft sewn construction, and tactile toy materials."
    ].join(" "),
    crochet: [
      "Style: handmade crochet plush toy.",
      "Use amigurumi texture, soft yarn stitches, visible knitted detail, and warm handcrafted finish.",
      "Keep strong likeness under the crochet treatment.",
      "Do not simplify different faces into one repeated crochet face.",
      "Do not replace specific identity with a generic amigurumi character look.",
      "Keep facial differences, expression differences, and subject separation clear.",
      "Keep all subjects fully visible and composition close to the original.",
      "Treat the crochet texture as a material layer over the same real underlying identity.",
      "Ensure the result still reads clearly as a handmade stuffed crochet plush, not just a soft portrait with yarn texture."
    ].join(" "),
    luxury: [
      "Style: premium luxury plush collectible.",
      "Use ultra-soft premium materials, elegant stitching, refined finishing, and polished high-end collectible presentation.",
      "Keep the result faithful to the original image rather than stylised away from it.",
      "Preserve individuality with strong likeness and premium realism in the plush treatment.",
      "Ensure the luxury version still reads clearly as a crafted plush collectible with visible premium plush construction."
    ].join(" ")
  };

  return `${base} ${styleMap[style]}`;
}
