import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Inter } from "next/font/google";
import { CreditCard, ImagePlus, UserRound } from "lucide-react";
import Footer from "@/components/Footer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter"
});

export const metadata: Metadata = {
  title: "TryPlushie",
  description: "Turn any photo into a cute plushie in seconds.",
  metadataBase: new URL("https://tryplushie.com")
};

function TopBarLink({
  href,
  icon,
  label
}: {
  href: string;
  icon: ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[rgba(173,118,63,0.16)] bg-white/72 px-4 text-sm font-semibold text-[var(--text)] transition hover:bg-white/88"
    >
      <span className="text-[var(--gold-strong)]">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} bg-[var(--bg)] text-[var(--text)] antialiased`}>
        <div className="min-h-screen">
          <header className="sticky top-0 z-40 border-b border-[rgba(173,118,63,0.08)] bg-[rgba(255,248,241,0.82)] backdrop-blur-xl">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
              <Link href="/" className="min-w-0">
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[rgba(183,125,63,0.12)] text-[var(--gold-strong)] shadow-[0_10px_30px_rgba(173,118,63,0.10)]">
                    ✨
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--gold-strong)]">
                      TryPlushie
                    </p>
                    <p className="truncate text-sm font-semibold text-[var(--text)]">
                      Cute plushies from your photos
                    </p>
                  </div>
                </div>
              </Link>

              <nav className="hidden items-center gap-2 sm:flex">
                <TopBarLink href="/#generator" icon={<ImagePlus size={16} />} label="Generate" />
                <TopBarLink href="/credits" icon={<CreditCard size={16} />} label="Credits" />
                <TopBarLink href="/account" icon={<UserRound size={16} />} label="Account" />
              </nav>
            </div>

            <div className="mx-auto flex w-full max-w-6xl gap-2 overflow-x-auto px-4 pb-3 sm:hidden sm:px-6">
              <TopBarLink href="/#generator" icon={<ImagePlus size={16} />} label="Generate" />
              <TopBarLink href="/credits" icon={<CreditCard size={16} />} label="Credits" />
              <TopBarLink href="/account" icon={<UserRound size={16} />} label="Account" />
            </div>
          </header>

          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}
