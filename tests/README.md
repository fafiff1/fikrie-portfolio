# Playwright UI automation

End-to-end tests for the Fahreza portfolio using [Playwright](https://playwright.dev/).

## Folder structure

```
tests/
  e2e/              # Test specs (*.spec.ts)
  fixtures/         # Shared Playwright fixtures (auth, etc.)
  helpers/          # Test data and utilities
  pages/            # Page Object Models
playwright.config.ts
```

## Setup

### Option A — use installed Chrome (recommended if `playwright install` fails)

This project is configured with `channel: "chrome"` in `playwright.config.ts`, so tests use your local Google Chrome and **do not** need a browser download.

Make sure Google Chrome is installed, then run:

```bash
npm run test:e2e
```

### Option B — download Playwright browsers

If you prefer bundled browsers:

```bash
npx playwright install chromium
```

If you see `SELF_SIGNED_CERT_IN_CHAIN`, see **SSL / certificate errors** below.

Optional environment overrides:

```bash
PLAYWRIGHT_USERNAME=fafiff
PLAYWRIGHT_PASSWORD=password
PLAYWRIGHT_PORT=3000
PLAYWRIGHT_BASE_URL=http://localhost:3000
```

## Run tests

```bash
# Run all e2e tests (starts dev server automatically)
npm run test:e2e

# Interactive UI mode
npm run test:e2e:ui

# Run with browser visible
npm run test:e2e:headed

# Open last HTML report
npm run test:e2e:report
```

## SSL / certificate errors (`playwright install`)

If install fails with `self-signed certificate in certificate chain`:

1. **Broken cert env var** — Your machine has `NODE_EXTRA_CA_CERTS=C:\Users\fafiff\certs`, but that folder does not exist. Remove it:
   - Windows → search **Environment Variables**
   - Under **User** and **System**, delete `NODE_EXTRA_CA_CERTS` if it points to a missing path
   - Restart Cursor/terminal

2. **Corporate proxy / VPN** — Your network may intercept HTTPS. Try one of:
   - Disconnect VPN and retry on a home/mobile hotspot
   - Ask IT for the corporate root CA `.pem` file, then set:
     ```powershell
     $env:NODE_EXTRA_CA_CERTS = "C:\path\to\corporate-root.pem"
     npx playwright install chromium
     ```
   - **Skip the download** and use Option A above (`channel: "chrome"`)

3. **One-time install workaround** (less secure — use only if you trust the network):
   ```powershell
   $env:NODE_EXTRA_CA_CERTS = $null
   $env:NODE_TLS_REJECT_UNAUTHORIZED = "1"
   npx playwright install chromium
   Remove-Item Env:NODE_TLS_REJECT_UNAUTHORIZED
   ```

## Writing tests

- Add new specs under `tests/e2e/`
- Reuse page objects from `tests/pages/`
- Use the `authenticatedPage` fixture from `tests/fixtures/auth.fixture.ts` for logged-in flows

Example:

```typescript
import { test, expect } from "../fixtures/auth.fixture";

test("example authenticated test", async ({ page, authenticatedPage }) => {
  void authenticatedPage;
  await page.goto("/contact");
  await expect(page.getByRole("heading", { name: /Get In Touch/i })).toBeVisible();
});
```
