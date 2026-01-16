# Training Template - Adaptive Practice Starter

A reusable Next.js template for building adaptive training apps. It includes a configurable training engine, modular providers, optional PWA/SEO/ads, and a polished UI you can keep or swap.

## Features

- Provider-driven training flow with session settings and analytics
- Modular config for branding, SEO, ads, and PWA behavior
- Responsive UI with light/dark theme toggle
- Local storage persistence for sessions and settings
- Optional ads (disabled by default)

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- CSS Modules
- PWA-ready service worker and manifest

## Getting Started

```bash
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

### Production build

```bash
npm run build
npm run start
```

## Template Setup

See `TEMPLATE_SETUP.md` for a step-by-step checklist.

## Project Structure

```
training-template/
  src/
    app/
      layout.tsx
      page.tsx
      page.module.css
      globals.css
      sitemap.ts
      robots.ts
    config/
      app.ts
      features.ts
      training.ts
      seo.ts
      ads.ts
      pwa.ts
    components/
      ads/
        InlineScriptAdSlot.tsx
      PopUnderAd.tsx
      ServiceWorkerRegister.tsx
    features/
      training/
        providers/
          mathTrainingProvider.ts
        types.ts
        useTrainingSession.ts
    hooks/
      useThemeMode.ts
    lib/
      math.ts
      storage.ts
  public/
    manifest.json
    sw.js
    icons/
```

## Customization Overview

- Branding and metadata: `src/config/app.ts`, `src/config/seo.ts`
- Feature toggles (PWA/SEO/ads): `src/config/features.ts`
- Training flow + copy: `src/config/training.ts`
- Provider logic: `src/features/training/providers/`

## Deployment

For production, set:

```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

Deploy to Vercel or any Node-compatible hosting.
