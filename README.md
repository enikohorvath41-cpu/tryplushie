# Plushify Starter

A mobile-first Next.js starter for a one-page plushie generator funnel.

## What is included

- Landing page with a mobile-first conversion funnel
- Image upload + 3 plushie styles
- Generate route with OpenAI image edit support
- Mock image fallback when `OPENAI_API_KEY` is not set
- Result page with locked preview state
- Stripe Checkout route
- Stripe webhook route
- Filesystem store for local development

## Important note before production

This starter uses a local JSON file in `.data/results.json` so you can move fast today.
That is great for local development, but you should replace it with Supabase, Postgres, KV, or another hosted database before production deployment.

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Environment variables

See `.env.example`.

## Recommended launch path

1. Test the entire flow locally with the mock generator.
2. Add your OpenAI API key.
3. Add your Stripe keys.
4. Replace the filesystem store.
5. Deploy.
