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
  "Transform the uploaded image into a premium plush version of the same subjects.",
  "The result should feel like a handcrafted plush toy recreation of the original photo.",
  "Balance is critical: preserve recognisability while clearly stylising into a plush toy.",
  "Do not aim for perfect realism — aim for a believable plush interpretation that still looks like the same people or animals.",

  "Keep all subjects clearly distinct, recognisable, and in the same left-to-right order.",
  "Preserve subject count, composition, pose relationships, and overall arrangement.",
  "Do not crop, zoom, or remove any subjects.",
  "Keep camera angle and perspective similar to the original.",

  "Preserve key identity features: face shape, eyes, brows, nose, smile, and hairstyle.",
  "Maintain likeness but allow soft stylisation typical of plush toys.",
  "Do not merge faces or make different subjects look identical.",

  "Convert materials into plush: soft fabric, stitched edges, gentle seams, and a tactile toy texture.",
  "Use slightly simplified facial features and softly rounded forms to enhance plush realism.",
  "Allow subtle stylisation (slightly larger eyes, softer cheeks) but keep identity recognisable.",

  "Use soft lighting, clean background, and a premium product-style presentation.",
  "The final result should feel like a high-quality custom plush toy made from this exact photo — cute, recognisable, and giftable."
].join(" ");

  const styleMap: Record<PlushieStyle, string> = {
    classic: [
      "Style direction: classic cuddly plush toy.",
      "Use velvety fabric, soft fleece texture, smooth seams, plush stuffing, and a timeless premium soft-toy finish.",
      "Keep likeness preservation extremely strong.",
      "The plush should look like the same real person, family, or pet translated into a classic plush form rather than a generic doll."
    ].join(" "),
    crochet: [
      "Style direction: handmade crochet plush toy.",
      "Use handmade crochet or amigurumi texture, soft yarn stitches, visible knitted patterns, and warm handcrafted detail.",
      "CRITICAL: preserve the identity of each subject exactly even after crochet stylisation.",
      "If multiple people or animals are present, each crochet plush must remain clearly different from the others.",
      "Do not simplify different faces into one repeated crochet face.",
      "Maintain unique facial differences, hair differences, expression differences, body differences, and subject-to-subject separation.",
      "Keep clothing colours, fur colours, and recognisable details accurate.",
      "Keep the composition similar to the original image.",
      "Do not crop, zoom, or cut off any subjects in crochet style.",
      "Ensure all subjects remain fully visible in the frame.",
      "Make the result feel like a real handcrafted crochet plush version of the original photo while still preserving strong likeness."
    ].join(" "),
    luxury: [
      "Style direction: premium luxury plush collectible.",
      "Use ultra-soft premium materials, elegant stitching, refined finishing, premium plush texture, and a polished high-end collectible presentation.",
      "Preserve likeness and individuality with extremely strong accuracy.",
      "The final plush should feel bespoke, premium, and faithful to the original image rather than stylised away from it."
    ].join(" ")
  };

  return `${base} ${styleMap[style]}`;
}
