function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function createMockPlushieDataUrl(styleLabel: string) {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200" fill="none">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#fff7ef" />
        <stop offset="100%" stop-color="#f7dfc0" />
      </linearGradient>
      <radialGradient id="glow" cx="50%" cy="25%" r="60%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9" />
        <stop offset="100%" stop-color="#fff7ef" stop-opacity="0" />
      </radialGradient>
    </defs>
    <rect width="1200" height="1200" rx="60" fill="url(#bg)"/>
    <circle cx="600" cy="360" r="260" fill="url(#glow)"/>
    <ellipse cx="420" cy="280" rx="110" ry="135" fill="#dca96b"/>
    <ellipse cx="780" cy="280" rx="110" ry="135" fill="#dca96b"/>
    <circle cx="600" cy="520" r="320" fill="#e3b276"/>
    <circle cx="600" cy="520" r="285" fill="#f0c78f"/>
    <circle cx="490" cy="495" r="28" fill="#3f2610"/>
    <circle cx="710" cy="495" r="28" fill="#3f2610"/>
    <ellipse cx="600" cy="605" rx="95" ry="72" fill="#f8e8d3"/>
    <ellipse cx="600" cy="574" rx="36" ry="28" fill="#70431c"/>
    <path d="M560 620C576 642 624 642 640 620" stroke="#70431c" stroke-width="14" stroke-linecap="round"/>
    <path d="M420 650C360 760 330 860 360 960" stroke="#dca96b" stroke-width="80" stroke-linecap="round"/>
    <path d="M780 650C840 760 870 860 840 960" stroke="#dca96b" stroke-width="80" stroke-linecap="round"/>
    <path d="M520 780C490 860 480 940 505 1030" stroke="#dca96b" stroke-width="95" stroke-linecap="round"/>
    <path d="M680 780C710 860 720 940 695 1030" stroke="#dca96b" stroke-width="95" stroke-linecap="round"/>
    <text x="600" y="110" text-anchor="middle" font-size="54" font-family="Arial, sans-serif" font-weight="700" fill="#7d4a16">Your plushie preview</text>
    <text x="600" y="170" text-anchor="middle" font-size="34" font-family="Arial, sans-serif" fill="#8b5b29">${escapeXml(styleLabel)}</text>
    <text x="600" y="1140" text-anchor="middle" font-size="28" font-family="Arial, sans-serif" fill="#8b5b29">Set OPENAI_API_KEY to generate real images</text>
  </svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}
