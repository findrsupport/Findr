# Findr™ — Project Notes (Source of Truth)

_Last updated: {{update this date when you edit}}_

## What we’re building
Findr™ is an AI-first real estate search engine (web now; mobile later). Goal: modern, map-centric search with plain-language queries and best-in-class UX for consumers and realtors.

## Hosting & Repo
- Hosting: **Netlify** (CD from GitHub)
- Repo: **findrsupport/Findr**
- Publish dir: `web/` (static site)
- Domain: `findrr.ca` (temporary until `findr.ca`/`.com` secured)

## Compliance (must keep)
- Show **Listing Brokerage name** with each property.
- Display **“Powered by REALTOR.ca”** badge (link to the listing on REALTOR.ca).
- Include CREA trademark statements (REALTOR®, MLS®, DDF®).
- Respect board rules (GVR IDX access in progress; FVREB deferred to GVR).
- Maintain Terms/Privacy pages.

## Current UI/UX
- Dark theme default with **light/dark toggle** (stored in `localStorage`).
- Site-wide **nav** on primary pages: Home · Listings · Map + 🌙/☀️ toggle.
- Brand tokens (CSS variables): `--brand`, `--bg`, `--fg`, `--muted`, `--card`, `--stroke`, `--surface`.

## Files (web/)
web/
index.html # Home / Coming Soon + Waitlist (Netlify form + honeypot)
listings.html # Mock listings grid + filters/sort + compliance
map.html # Leaflet map with photo/price popups + compliance
terms.html # Basic terms page
privacy.html # Basic privacy page
thank-you.html # Post-waitlist redirect
404.html # Not found
assets/
powered-by-realtor.svg
data/
listings.json # 6 demo listings (3 condos, 3 houses) with stable Unsplash CDN links + lat/lon

## Tech decisions
- **Static first**: everything runs without a backend.
- **Mock data** now; later swap to **CREA DDF** JSON feed/API.
- **Leaflet** for maps; **OpenStreetMap tiles**.
- Minimal, accessible, mobile-friendly UI.

## Done ✅
- Netlify + GitHub CI/CD pipeline
- Home page + compliance boilerplate
- Waitlist form (honeypot + thank-you)
- Security headers (Netlify `_headers` already configured previously)
- Listings grid (filters, sort, badge)
- Map with pins + photos + popups (badge)
- Theme toggle + site-wide nav on primary pages
- Stable demo photo links (Unsplash CDN base IDs)

## Next ⏭️
- Apply **nav + theme toggle** to **all** minor pages (terms/privacy/404/thank-you) for total consistency.
- Finalize **brand palette** (update CSS variables).
- Optional: brokerage logos in cards/popups (`brokerage_logo` field).
- Optional: share state between listings ↔ map (URL params).
- Prepare **API scaffold** for CREA DDF.
- Prototype **plain-language search** (keyword/embedding) on mock data.

## Style & Workflow Rules (for assistants)
- Always provide **full paste-ready HTML files** (not snippets).
- Always include **git commands** to deploy.
- Keep **compliance text/badges** with any listing UI.
- Default to **dark theme**, keep light toggle working.
- Use **CSS variables** for brand colors.
- Maintain accessibility (labels, alt text, aria where appropriate).

## Deploy
```bash
cd ~/desktop/findr
git add .
git commit -m "Update all project files"
git push

