# Moving 4U — Landing Page

[![CI](https://github.com/918stanley-droid/moving4u/actions/workflows/ci.yml/badge.svg)](https://github.com/918stanley-droid/moving4u/actions/workflows/ci.yml)

**Status:** CI is configured in `.github/workflows/ci.yml` and will run on push/PRs to `main`.
**Website:** https://918stanley-droid.github.io/moving4u/

Small static landing page that collects quick leads via a Google Apps Script endpoint.

## Quick start (local)

Requirements:
- Node.js (LTS recommended) and npm installed: https://nodejs.org/
- PowerShell (Windows) or any simple static server

1. Install dev dependencies (for linting and tests):

```bash
npm install
```

2. Run the linter:

```bash
npm run lint
```

3. Run tests:

```bash
npm test
```

4. Serve the site locally (PowerShell helper included):

```powershell
./serve.ps1
# then open http://localhost:8000
```

Or use `npx serve .` or any static server of your choice.

## CI

A GitHub Actions workflow is included at `.github/workflows/ci.yml` that runs `npm install`, `npm run lint`, and `npm test` on pushes and pull requests to `main`. The workflow now caches npm to speed subsequent runs.

> Tip: if you prefer a fully reproducible install, run `npm install` locally and commit the generated `package-lock.json` so CI can use `npm ci` in the future.

## Privacy & Sitemap

- A privacy page is available at `privacy.html` (details the data we collect and contact information). Please review the content and update contact information if needed.
- A `sitemap.xml` is included at the repository root and is already configured for the production domain `https://moving4u.x10hub.net/` with links for `/` and `/privacy.html`.

- You can auto-generate/update the sitemap from the project HTML files using the provided script:

```bash
# optionally set SITE_URL to your production domain
SITE_URL=https://moving4u.x10hub.net npm run sitemap
```

- A `robots.txt` file is included; it references the sitemap and allows all crawlers. Update these files if you change the site domain.


## Development notes

- Client script: `app.js` (implements client-side form handling: validation, POST to Apps Script endpoint, success/error UI messages, and sets the current year in the footer).
- Accessibility: added skip link, improved focus outlines for interactive elements, ARIA attributes on the form and live message, and automated accessibility tests (`jest-axe`).
- Spam protection: added a hidden honeypot field; submissions with the honeypot filled are treated as spam client-side (ignored) and server-side (logged as SPAM).
- Analytics (optional): opt-in consent banner that conditionally loads a GA4 tag when you set `data-analytics-id="YOUR_MEASUREMENT_ID"` on `<body>`; consent stored in localStorage; IP anonymized in config.
- Server: form posts to a Google Apps Script endpoint; check `google_apps_script.gs` for the server-side implementation used to append leads to a Google Sheet.

## Running on your machine

- If `npm` is not available on your machine, install Node.js from the link above.
- After running `npm install`, you can run `npm run lint` and `npm test` locally.
- To start the site locally run:

```bash
npm start
# then open http://localhost:8000
```

## E2E tests (Playwright)

- Install Playwright browsers once: `npx playwright install`
- Run E2E suite: `npm run test:e2e`
- The Playwright config starts a local static server on port 4173 and stubs outbound requests only to the Apps Script endpoint.
- Analytics consent flows are intentionally excluded from E2E for determinism; the tests disable analytics via `localStorage.setItem('analytics-consent','denied')` before navigation.

## Deployment

### GitHub Pages (automated)
- Workflow: `.github/workflows/deploy.yml` (runs on push to `main` or manual dispatch).
- Builds sitemap (`npm run sitemap`), packages static files, and deploys to GitHub Pages.
- After first run, set the Pages source to “GitHub Actions” in repo settings if not already.

### Netlify (optional)
- Build command: `npm run sitemap` (or leave empty for plain static).
- Publish directory: project root.
- Enable form endpoint/redirects as needed (this site posts directly to Google Apps Script).

## Reproducible dev environment (VS Code devcontainer)

If you use VS Code, you can use the included devcontainer for a ready-to-go environment (Node and Git preinstalled):

1. Install the **Dev Containers** (Remote - Containers) extension in VS Code.
2. Command Palette → **Dev Containers: Open Folder in Container...** and open the project root.
3. The container will run `npm install` automatically; then run `npm start`, `npm test`, or `npm run lint` inside the container.

## Notes

- If you run `npm install` locally, consider committing the generated `package-lock.json` so CI can later run `npm ci` for deterministic installs.

If you'd like, I can open a PR with these changes now — say “PR please” and I'll prepare the branch/commit message for you to run locally.
