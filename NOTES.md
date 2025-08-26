# Findr™ — Project Notes (Source of Truth)

_Last updated: 2025-08-25_

## What we’re building
Findr™ is an AI-first real estate search engine (web first; iOS/Android/Windows later). Goal: a modern, map-centric search that accepts plain-language queries and serves consumers + REALTORS® with better discovery, lead gen, and compliant display.

## Hosting & Repo
- Hosting: **Netlify** (continuous deploy from GitHub)
- Repo: **findrsupport/Findr**
- Publish directory: `web/` (static site)
- Domain: `findrr.ca` (temporary while `findr.ca/.com` are unavailable)

## Compliance (must keep)
- Show **Listing Brokerage name** with each listing.
- Display **“Powered by REALTOR.ca”** badge and **link it to the listing on REALTOR.ca**.
- Include CREA trademark statements (REALTOR®, MLS®, DDF®).
- Respect board rules (GVR IDX access pending; FVREB referred us to GVR).
- Maintain Terms/Privacy pages.

## Current UI/UX (status)
- **Theme:** Dark default with **light/dark toggle** (persists via `localStorage`, toggles `data-theme` on `<html>`).
- **Nav bar:** **NOT YET ADDED** (next step: consistent top nav across pages).
- **Aesthetic:** Clean, minimal, professional; CSS variables for brand tokens.

### Brand tokens (CSS variables)
`--brand`, `--bg`, `--fg`, `--muted`, `--card`, `--stroke`, `--surface`  
(Adjust these to change the color scheme demo-wide.)

## Files (web/)
web/
index.html # Home / Coming Soon + waitlist (Netlify form + honeypot + thank-you redirect)
listings.html # Mock listings grid with filters/sort + REALTOR.ca badge + brokerage name
map.html # Leaflet map; pins w/ photo, price, beds/baths, brokerage, badge/link
terms.html # Terms (simple)
privacy.html # Privacy (simple)
thank-you.html # Waitlist confirmation
404.html # Not found
assets/
powered-by-realtor.svg
data/
listings.json # 6 demo listings (3 condos, 3 houses) w/ stable Unsplash CDN URLs + lat/lon

## Data contract (mock)
Each listing object:
```json
{
  "id": "L-1001",
  "address": "123 Quayside Dr #1204",
  "city": "New Westminster",
  "price": 749900,
  "beds": 2,
  "baths": 2,
  "lat": 49.201,
  "lon": -122.912,
  "brokerage": "Example Realty",
  "realtorca_url": "https://www.realtor.ca/",
  "photo": "https://images.unsplash.com/photo-1507089947368-19c1da9775ae"
  }
lat/lon required for map pins.

photo must be a direct CDN image URL (stable Unsplash ID, no params).

Do not rename keys without updating all pages that consume them.

Tech decisions
Static first (no backend required to demo).

Leaflet + OpenStreetMap for the map.

Minimal dependencies; no frameworks.

Accessibility: alt text, sensible aria, readable contrast.

Done ✅
Netlify + GitHub CI/CD connected and deploying.

Domain wired; SSL working.

index.html with compliance boilerplate and waitlist (honeypot + redirect).

listings.html grid with filters/sort; brokerage + badge shown.

map.html with pins + rich popups (photo, price, beds/baths, brokerage, badge).

data/listings.json with 6 mock listings (3 condos, 3 houses) + stable photos + lat/lon.

Light/dark toggle implemented (persisted).

Netlify _headers for security previously configured.

Next ⏭️ (priority ordered)
Add site-wide top nav (Home · Listings · Map + theme toggle) consistently to all pages.

Apply/refine Findr™ brand palette via CSS variables (keep contrast/compliance).

Optional polish:

Brokerage logos (brokerage_logo optional field; display in cards/popups).

Keep listings ↔ map filters in sync (URL params).

Small motion/hover polish; mobile spacing audit.

Integration prep:

API scaffold to ingest CREA DDF (JSON endpoint to replace data/listings.json).

Compliance checks with GVR once IDX access is granted.

AI prototype:

Plain-language query simulation against mock data (keywords/embeddings).

Workflow rules (for assistants)
Always deliver full paste-ready HTML files for any page you touch (no snippets).

Always include the git deploy block after code.

Do not rewrite the UI from scratch or change the file structure unless requested.

Keep compliance elements intact (brokerage + badge + trademarks).

Use CSS variables; dark default; maintain the theme toggle behavior.

Deploy
bash
Copy
Edit
cd ~/desktop/findr
git add .
git commit -m "Update all project files"
git push
Troubleshooting
Netlify didn’t redeploy → Netlify Deploys → Trigger deploy; verify repo/branch is findrsupport/Findr on main, publish dir web/.

Map empty → ensure lat/lon present and numeric.

