export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-semibold mb-6">Terms of Service</h1>

      <p className="mb-4">
        By using TryPlushie, you agree to the following terms.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Use of Service</h2>
      <p className="mb-4">
        You may upload images to generate plushie-style images. You must not upload illegal,
        harmful, or copyrighted content you do not have rights to use.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Generated Content</h2>
      <p className="mb-4">
        We aim to generate high-quality results, but we do not guarantee accuracy or likeness.
        You are responsible for how you use generated images.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Payments</h2>
      <p className="mb-4">
        Payments are one-time purchases for unlocking HD images.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Changes</h2>
      <p>
        We may update these terms at any time.
      </p>
    </main>
  );
}