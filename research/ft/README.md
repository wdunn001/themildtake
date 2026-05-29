# research/ft — Financial Times intake

Citation-grade FT material that informs the country assessments. FT is a first-tier
source for the **economic** sub-factors (sovereign debt, FX, banking, trade) and the
politics-of-the-economy, where it often runs ahead of IMF/World Bank reports.

## How it flows

1. **Save the session (once, on Windows).** FT is behind Cloudflare + a paywall, so a
   real login is needed; it writes the cleared session to `state/ft_storage.json`:
   ```
   cd H:\dev\pidscraper
   .\.venv\Scripts\python.exe scripts\ft_login.py            # sign in (Google ok), press Enter
   ```
   The scraper then loads that `storage_state` into a **fresh, non-persistent** headed
   Chrome (same pattern as `patreon_harvest.py`) — it never opens your login profile, so
   it can't collide with your login window or with re-runs.
2. **Find + pull** (see `queue.json` for the target list):
   ```
   .\.venv\Scripts\python.exe scripts\ft_api.py search "argentina inflation" -n 10
   .\.venv\Scripts\python.exe scripts\ft_api.py scrape https://www.ft.com/content/<id>
   .\.venv\Scripts\python.exe scripts\ft_api.py scrape-queue    # walk this queue.json end-to-end
   ```
   Raw pulls cache to `H:\dev\pidscraper\output\ft\<sha1>.json`.
3. **Ingest into this repo:**
   ```
   node scripts/ingest-ft.mjs           # reads ../pidscraper/output/ft → research/ft/
   ```
   This writes one `research/ft/<sha1>.md` per article (metadata + a short excerpt +
   the cache pointer) and updates `manifest.json`. Full article text is **not** tracked
   (copyright) — only bibliographic metadata and a brief quote for citation.

## What's tracked vs not

- **Tracked:** `README.md`, `queue.json`, `manifest.json`, and the per-article `<sha1>.md`
  notes (metadata + a capped ~600-char excerpt).
- **Not tracked:** `research/ft/_raw/` (any full-text dumps) — gitignored. The full body
  stays in pidscraper's gitignored `output/ft/`.

## Citing in an assessment

When an FT pull informs a score, reference it in the sub-factor note like any other
source, e.g. `(FT 2026-05-12)`, and add the article to `manifest.json` against the
relevant `iso3`. Keep to the standing discipline: FT is first-tier for economics, but
for governance/politics in non-Anglophone countries pair it with multilateral + local
sources rather than leaning on it alone.
