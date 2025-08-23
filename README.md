# Findr

AI‑first real estate search — web‑first MVP, then mobile.

---

## Repo Structure
```
findrr/
├─ web/                  # Netlify static site (public)
│  ├─ index.html         # Coming Soon + compliance
│  ├─ terms.html         # Terms of Use (click‑wrap ready)
│  ├─ assets/
│  │  └─ powered-by-realtor.svg
│  └─ data/              # (optional) static JSON for early /listings prototype
│
├─ api/                  # FastAPI backend (coming soon)
│  ├─ app/
│  │  └─ main.py         # /health, /listings (seeded)
│  ├─ sql/
│  │  ├─ 001_init.sql    # tables: brokerages, listings, media
│  │  └─ 002_seed.sql    # sample rows for early UI
│  ├─ Dockerfile
│  ├─ docker-compose.yml # Postgres + PostGIS + pgvector
│  └─ requirements.txt
│
└─ README.md             # You are here
```

---

## Local Development (web)
No build tools required.

1. Edit files in `web/`.
2. Open `web/index.html` in your browser to preview.
3. Deploy by dragging the entire `web/` folder to Netlify → **Deploys**.

**Asset paths**
- Place images in `web/assets/` and reference with `assets/<file>` in HTML.

---

## Netlify (Production)
- **Primary domain**: `findrr.ca` (or `www.findrr.ca`), both added to the Netlify site.
- **DNS** (at registrar):
  - `A` @ → `75.2.60.5`
  - `A` @ → `99.83.190.102`
  - `CNAME` `www` → `<your-site-name>.netlify.app`
- **HTTPS**: Netlify → Site configuration → Domains → HTTPS → Verify → issue Let’s Encrypt.

Optional: Add a Netlify Form to collect a waitlist.

---

## Compliance (DDF® / CREA)
- Show **site operator** (Marcus Alexander Roth, REALTOR® — RE/MAX All Points Realty) on every page.
- On any page with listings:
  - Display **listing brokerage name** adjacent to the listing.
  - Show the **Powered by REALTOR.ca** badge (≥90px; 1:1) linking to the **specific** REALTOR.ca listing URL.
- Include MLS®/REALTOR® trademark statements site‑wide.
- Add a **Terms** page (`/terms.html`); for National Pool, present click‑wrap before listing view.

---

## Roadmap (next 2 weeks)
1) **API scaffold**: FastAPI `/health`, `/listings`; Dockerized Postgres + PostGIS + pgvector; seed data.
2) **/listings** page (web): static JSON first → switch to API; compliant card layout + attribution.
3) **Ingestion prep**: DDF credential loader (env), field mapping plan, upsert scripts.
4) **Board onboarding**: GVR & FVREB sandbox access; collect RESO metadata & field dictionary.

---

## Scripts (coming soon)
- `make up` → docker compose up DB + API
- `make seed` → run SQL seeds
- `make test` → API unit tests

---

## Questions / Notes
- Email: marcusr@lariviererealty
- Phone: 778‑214‑9655

> Tip: Always drag the **entire** `web/` folder when redeploying to Netlify so assets and pages stay in sync.

