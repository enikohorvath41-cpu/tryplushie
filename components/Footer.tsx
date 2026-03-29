import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-[rgba(173,118,63,0.2)] py-6 text-sm">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-[var(--muted)]">
          © {new Date().getFullYear()} TryPlushie
        </p>

        <div className="flex gap-4">
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/refund">Refund</Link>
        </div>
      </div>
    </footer>
  );
}