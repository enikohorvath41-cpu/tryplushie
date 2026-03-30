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
    "Transform the uploaded image into a premium plush version of the original subject.",
    "The plush result must look like a faithful like-for-like plush recreation of the uploaded image, not a generic cute replacement.",
    "Keep the original subject immediately recognizable.",
    "CRITICAL: preserve identity accuracy and exact subject separation.",
    "If there are multiple people or animals, every subject must remain clearly distinct, recognizable, and positioned correctly.",
    "Do not merge faces, duplicate faces, average features, or turn different subjects into matching copies.",
    "Preserve exact subject count.",
    "Preserve the original composition, framing, spacing, pose relationships, and left-to-right placement of all subjects.",
    "Preserve the full composition of the original image.",
    "Do not crop, zoom, reframe, cut off, or remove any subject.",
    "Ensure all people or animals remain fully visible in the frame.",
    "Keep the camera angle and perspective similar to the original image.",
    "Preserve pose, head angle, gaze direction, facial expression, body orientation, and interaction between subjects.",
    "Preserve age cues, gender presentation, proportions, and overall likeness of each individual.",
    "Preserve unique facial structure, eye spacing, eye shape, eyebrow shape, nose shape, mouth shape, smile style, cheek shape, jawline, chin shape, and ear placement.",
    "Preserve hairstyle, hairline, parting, hair length, hair volume, curl pattern, hair texture, and major hair details.",
    "Preserve skin tone or fur colour accurately.",
    "Preserve distinctive markings, patches, muzzle colouring, chest colouring, ear colouring, and any breed-defining or subject-defining traits.",
    "Preserve clothing colours, clothing shape, collars, accessories, and recognisable outfit details.",
    "Make the result clearly plush, but do not lose likeness.",
    "Use plush materials, soft fabric texture, stitched construction, rounded plush proportions, and a handcrafted premium collectible feel.",
    "Keep expressions and personality intact so the plush still feels emotionally like the original subject.",
    "Use soft studio-quality lighting, clean shading, and a simple premium background treatment.",
    "The final image should feel like a high-quality custom plush made from the original photo, with strong likeness, strong composition preservation, and giftable premium appeal."
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
