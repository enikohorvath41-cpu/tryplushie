export type PlushieStyle = "classic" | "crochet" | "luxury";

export type PlushieResult = {
  id: string;
  style: PlushieStyle;
  prompt: string;
  previewDataUrl: string;
  hdDataUrl: string;
  sourceDataUrl?: string;
  isPaid: boolean;
  createdAt: string;
  checkoutSessionId?: string;
};
