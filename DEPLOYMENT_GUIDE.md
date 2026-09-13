# Siddhivinayak Overseas — Project Setup & Deployment Guide

## Project Overview

This is a **Vite + React + TypeScript** single-page app, built with:
- **Frontend**: Vite, React 18, TypeScript, React Router
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Styling**: Tailwind CSS with shadcn/ui + Radix UI components
- **Hosting**: Static build (`dist/`) uploaded to **Hostinger** (Apache), routed via `public/.htaccess`

> An earlier, unrelated Next.js prototype (`app/`, `next.config.mjs`) previously
> lived in this repo alongside the real Vite app. It was never wired into
> `package.json` (no `next` dependency, `npm run build` never touched it) and
> has been removed. The live site is, and has been, the Vite app under `src/`.

## Setup Instructions

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SITE_URL=https://siddhivinayakoverseas.com

# Optional — activates GA4 tracking + the cookie consent banner.
# Leave blank to ship with analytics fully disabled.
VITE_GA_MEASUREMENT_ID=
```

Server-only secrets (`SUPABASE_SERVICE_ROLE_KEY`, email provider credentials, etc.)
belong in **Supabase Edge Function secrets** (`supabase secrets set ...`), never in
this `.env` file — anything prefixed `VITE_` is bundled into the public client build.

### 3. Apply the database schema

Migrations live in `supabase/migrations/`. Apply with the Supabase CLI:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

Deploy Edge Functions (e.g. the admin email sender):

```bash
supabase functions deploy admin-user-email
supabase functions deploy send-welcome-email
```

## Running the project

### Development server

```bash
npm run dev
# http://localhost:5173 (default Vite port)
```

### Production build

```bash
npm run build
```

This runs three steps in order:
1. `scripts/generate-sitemap.mjs` — syncs `public/sitemap.xml` with currently
   published blog posts, countries, and active urgent requirements from
   Supabase (requires `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` to be set;
   otherwise it warns and leaves the sitemap untouched).
2. `vite build` — outputs the static site to `dist/`.
3. `scripts/prerender.mjs` — uses Playwright to pre-render ~40 public SEO
   routes to static HTML inside `dist/`, so crawlers and social-share
   scrapers get fully-rendered content without executing JavaScript.

`npm run build:only` skips the sitemap sync and prerender steps if you just
want a fast Vite build for local testing.

## Deploying to Hostinger

Hostinger shared hosting serves static files over Apache — there is no
Node.js runtime for the app itself (Supabase Edge Functions run on
Supabase's own infrastructure, not on Hostinger).

1. Run `npm run build` locally (or in CI) with production env vars set.
2. Upload the **entire contents of `dist/`** (not the `dist` folder itself —
   its *contents*) to your Hostinger `public_html/` directory, via:
   - Hostinger's File Manager (zip `dist/*`, upload, extract in `public_html/`), or
   - FTP/SFTP (credentials from hPanel → Files → FTP Accounts), or
   - Git-based deployment if configured in hPanel.
3. Confirm `.htaccess` was uploaded (`public/.htaccess` is copied into
   `dist/.htaccess` by Vite automatically — it must land in `public_html/`
   alongside `index.html`). Without it, direct navigation to any route other
   than `/` will 404, since this is a client-side-routed SPA.
4. Confirm HTTPS is active in hPanel (Hostinger issues a free SSL
   certificate) — `Strict-Transport-Security` in `.htaccess` assumes HTTPS is
   already enforced.
5. Re-run `npm run build` and re-upload whenever content changes — this is a
   static build, so there is no live server to restart, but stale files in
   `public_html/` will keep serving until overwritten.

### What `.htaccess` (in `public/`, shipped to `dist/`) actually does

- Rewrites all non-file, non-directory requests to `/index.html` so React
  Router can handle client-side routing.
- Enables Brotli/Gzip compression.
- Sets long-lived caching for hashed static assets, short caching for HTML.
- Sets security headers: HSTS, X-Content-Type-Options, X-Frame-Options,
  Referrer-Policy, Permissions-Policy, and Content-Security-Policy.

There is no `vercel.json` or `netlify.toml` in this repo — those platforms
are not used. If the site is ever migrated off Hostinger to a platform with
its own routing/headers config, that config needs to be written fresh for
the new host; `public/.htaccess` only applies to Apache-based hosting.

## Project structure (actual, as deployed)

```
src/
├── pages/              # Route-level page components (React Router)
│   ├── admin/           # /admin/* — internal admin panel
│   └── *.tsx             # Public + authenticated routes
├── components/          # Reusable UI, including components/ui (shadcn)
├── hooks/               # Data-fetching and app hooks (react-query based)
├── lib/
│   ├── supabase/         # Browser Supabase client
│   ├── seo/               # SeoHead component, schema.ts, site.ts (NAP/constants)
│   └── ga.ts              # Consent-aware GA4 loader
├── content/              # Static content data (destinations, guides, FAQs)
└── App.tsx               # Route table

supabase/
├── migrations/           # SQL schema migrations
└── functions/             # Edge Functions (service-role email sending, RBAC)

public/
├── .htaccess              # Apache SPA rewrite + headers (→ copied to dist/)
├── robots.txt
└── sitemap.xml             # Static entries + a generated dynamic block

scripts/
├── generate-sitemap.mjs    # Syncs dynamic sitemap entries from Supabase
└── prerender.mjs            # Playwright-based static HTML prerender
```

## Troubleshooting

### Routes 404 on direct load (e.g. reloading `/study-in-uk`)
**Cause**: `.htaccess` wasn't uploaded, or Hostinger's Apache config doesn't
have `mod_rewrite` enabled for the account.
**Fix**: Confirm `.htaccess` exists in `public_html/` (it's a hidden file —
enable "show hidden files" in File Manager) and that mod_rewrite is on
(standard on Hostinger shared hosting).

### New blog/country/urgent-requirement pages missing from the sitemap
**Cause**: The site wasn't rebuilt after the content was published in the
admin panel — this is a static build, so `public/sitemap.xml` only reflects
what existed in Supabase at the last `npm run build`.
**Fix**: Re-run `npm run build` and re-upload `dist/` to pick up new
published content.

### Analytics events not appearing anywhere
**Cause**: `VITE_GA_MEASUREMENT_ID` isn't set at build time, or the visitor
hasn't accepted the cookie consent banner yet.
**Fix**: Set the real GA4 Measurement ID in the build environment and
rebuild; verify in GA4 DebugView after accepting the consent banner.

### Build failing on `scripts/generate-sitemap.mjs`
**Cause**: Missing/invalid Supabase env vars, or a Supabase table query
failing (e.g. RLS blocking anon reads on `countries`/`blog_posts`/
`urgent_requirements`).
**Fix**: The script logs a warning per failing query and continues — it
never fails the build. Check the build log for `[sitemap]` warnings and fix
the underlying Supabase env var or RLS policy.
