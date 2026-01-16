# Template Setup Checklist

Use this checklist after copying the template into a new repo.

## 1) Branding and URLs

- Update `src/config/app.ts`:
  - `name`, `shortName`, `description`, `author`, `keywords`, `storagePrefix`
  - `url` should match your real domain
- Update `.env.example` and your hosting env:
  - `NEXT_PUBLIC_SITE_URL=https://your-domain.com`
- Update `public/manifest.json`:
  - `name`, `short_name`, `description`, colors if needed
- Replace icons in `public/icons/`
- Update `public/sw.js` cache name if you want a new cache namespace

## 2) Training Provider

- Keep the default math provider, or create a new one:
  - Add a new provider in `src/features/training/providers/`
  - Point `src/config/training.ts` to the new provider
- Update copy strings in `src/config/training.ts` if the UI wording should change

## 3) Feature Toggles

- Enable/disable features in `src/config/features.ts`:
  - `seo`, `pwa`, `ads`

## 4) Ads (Optional)

- Update providers in `src/config/ads.ts` or disable ads entirely

## 5) Metadata + SEO

- Update `src/config/seo.ts` with:
  - `title`, `description`, `keywords`, `verification.google`

## 6) Package Metadata

- Update `package.json`:
  - `name`, `description`
- Update `README.md` to match your product

## 7) Verify

```bash
npm run lint
npm run build
```

## Tip

If you use GitHub Templates, this file tells new users what to update after they click "Use this template".
