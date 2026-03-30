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
    "Transform the uploaded image into a premium custom plush recreation of the original subjects.",
    "The result must look like the same real people or animals translated into plush form, not a generic cute redesign.",
    "CRITICAL: identity preservation is the highest priority.",
    "CRITICAL: composition preservation is the highest priority after identity.",
    "The transformation should behave like a material replacement process, not a redesign.",
    "Convert the original subjects into plush materials while preserving who they are, how they look, and how they are arranged.",
    "Keep the original subject immediately and unmistakably recognizable.",
    "If there are multiple people or animals, every subject must remain clearly distinct, recognizable, and correctly separated.",
    "Do not merge faces, duplicate faces, average features, blend identities, or turn different subjects into matching copies.",
    "Preserve the exact subject count.",
    "Preserve the original composition, framing, spacing, scale relationships, pose relationships, and left-to-right placement of all subjects.",
    "Preserve the full composition of the original image.",
    "Do not crop, zoom, reframe, cut off, remove, or replace any subject.",
    "Ensure all people or animals remain fully visible in the frame.",
    "Keep the camera angle, lens feel, and perspective similar to the original image.",
    "Preserve pose, head angle, gaze direction, facial expression, body orientation, gesture, and interaction between subjects.",
    "Preserve age cues, gender presentation, body proportions, and overall likeness of each individual.",
    "Preserve exact facial structure including eye spacing, eye size, eyelid shape, eyebrow shape, nose shape, nostril shape, mouth shape, lips, smile shape, cheek shape, jawline, chin shape, forehead shape, and ear placement.",
    "Preserve subtle asymmetry, natural imperfections, and human uniqueness.",
    "Do not beautify, idealise, glamorise, or replace the real identity with a cleaner generic plush face.",
    "Do not make faces more symmetrical, younger, more glamorous, or more cartoon-perfect than the original.",
    "Preserve hairstyle, hairline, parting, hair length, hair volume, curl pattern, hair texture, fringe, flyaways, and major hair details.",
    "Preserve skin tone, undertones, fur colour, and colour distribution accurately.",
    "Preserve distinctive markings, patches, muzzle colouring, chest colouring, ear colouring, freckles, facial hair, and any breed-defining or subject-defining traits.",
    "Preserve clothing colours, clothing shape, folds, collars, accessories, and recognisable outfit details.",
    "Preserve the emotional feel of the original photo so the plush still feels like the same people or animals.",
    "Make the result clearly plush without losing likeness.",
    "Use plush materials, soft fabric texture, stitched construction, premium toy craftsmanship, and gentle plush softness.",
    "Do not over-exaggerate anatomy.",
    "Do not enlarge heads too much.",
    "Do not simplify facial structure into a generic doll template.",
    "Use soft studio-quality lighting, clean shading, and a simple premium background treatment.",
    "The final image should feel like a high-quality bespoke plush made directly from this exact photo, with extremely strong likeness, strong composition preservation, and premium giftable appeal."
  ].join(" ");

  const styleMap: Record<PlushieStyle, string> = {
    classic: [
      "Style direction: classic cuddly plush toy.",
      "Use velvety fabric, soft fleece texture, smooth seams, plush stuffing, and a timeless premium soft-toy finish.",
      "Keep likeness preservation extremely strong.",
      "The plush should look like the same real person, family, or pet translated into a classic plush form rather than a generic doll.",
      "Maintain realistic plush proportions and avoid over-stylising the face."
    ].join(" "),
    crochet: [
      "Style direction: handmade crochet plush toy.",
      "Use handmade crochet or amigurumi texture, soft yarn stitches, visible knitted patterns, and warm handcrafted detail.",
      "CRITICAL: preserve the identity of each subject exactly even after crochet stylisation.",
      "If multiple people or animals are present, each crochet plush must remain clearly different from the others.",
      "Do not simplify different faces into one repeated crochet face.",
      "Do not replace specific identity with a generic amigurumi character face.",
      "Maintain unique facial differences, hair differences, expression differences, body differences, and subject-to-subject separation.",
      "Keep clothing colours, fur colours, and recognisable details accurate.",
      "Keep the composition similar to the original image.",
      "Do not crop, zoom, or cut off any subjects in crochet style.",
      "Ensure all subjects remain fully visible in the frame.",
      "Use crochet texture as a surface treatment while preserving strong likeness underneath.",
      "Make the result feel like a real handcrafted crochet plush version of the original photo while still preserving strong likeness."
    ].join(" "),
    luxury: [
      "Style direction: premium luxury plush collectible.",
      "Use ultra-soft premium materials, elegant stitching, refined finishing, premium plush texture, and a polished high-end collectible presentation.",
      "Preserve likeness and individuality with extremely strong accuracy.",
      "Keep the result bespoke, premium, and faithful to the original image rather than stylised away from it.",
      "Maintain polished realism in the plush construction and avoid generic toy-face simplification."
    ].join(" ")
  };

  return `${base} ${styleMap[style]}`;
}
