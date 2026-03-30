export function cn(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(" ");
}

export function absoluteUrl(path: string) {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL ||
    "http://localhost:3000";

  const normalizedSiteUrl = siteUrl.startsWith("http") ? siteUrl : `https://${siteUrl}`;

  return new URL(path, normalizedSiteUrl).toString();
}

export function formatPrice(value: number, currency = "GBP") {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency
  }).format(value / 100);
}
