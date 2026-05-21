# Security Policy

## Scope

This repository hosts a **static, single-page web application** (vanilla HTML,
CSS, and JavaScript) deployed to GitHub Pages. It has:

- **No backend** and no server-side code.
- **No application dependencies** (no `package.json`, no installed packages).
- **No data collection, telemetry, cookies, or analytics.**
- **Local storage is used only for the optional light/dark theme preference.**
- **No authentication** or any handling of user secrets, tokens, or credentials.

All decision-tree content is hard-coded in `index.html`. The site does not
accept user input that is sent anywhere — the only "input" is button clicks
that navigate between hard-coded nodes in the page.

## Supported versions

Only the current `main` branch is supported. The deployed site at
<https://billmcilhargey.github.io/m365-profiles/>
always reflects the latest commit on `main`.

## Reporting a vulnerability

If you believe you have found a security vulnerability in this repository —
for example a cross-site scripting (XSS) issue in the rendered HTML, a
clickjacking concern, or a supply-chain issue in one of the GitHub Actions
workflows — please **do not open a public issue**.

Instead, use **GitHub's private vulnerability reporting**:

1. Go to the repository's [Security tab](https://github.com/billmcilhargey/m365-profiles/security).
2. Click **Report a vulnerability**.
3. Include a clear description, reproduction steps, and the impact.

You can expect an initial response within **7 days**. If the issue is confirmed,
a fix will be released as quickly as possible and you will be credited in the
release notes unless you ask to remain anonymous.

## Out of scope

Because this is a static informational site, the following are explicitly
**out of scope**:

- The correctness of any specific Microsoft 365 licensing recommendation
  (the site is an [independent community helper](README.md), not official
  Microsoft guidance). Licensing accuracy questions belong in regular GitHub
  issues, not security reports.
- Vulnerabilities in third-party sites linked from this page
  (`learn.microsoft.com`, `m365maps.com`, GitHub, etc.).
- Browser-specific UI rendering issues that do not have a security impact.

## Security hardening applied

For transparency, the following defense-in-depth measures are in place:

- **Content-Security-Policy** meta tag restricts script/style/image origins to
  `'self'` (plus `data:` for the inline favicon and `'unsafe-inline'` for the
  embedded styles and the SPA script — required for a no-build static page).
- **`form-action 'none'`** and **`frame-ancestors 'none'`** disable form
  submission and framing (clickjacking protection).
- **`Referrer-Policy: strict-origin-when-cross-origin`** limits referrer leakage.
- **`Permissions-Policy`** disables camera, microphone, geolocation, and
  Topics/FLoC.
- All outbound links use `target="_blank"` with **`rel="noopener"`** to prevent
  tab-napping.
- GitHub Actions workflows declare **explicit minimum permissions**
  (`contents: read` on lint, `contents: read` / `pages: write` / `id-token: write`
  on deploy — required for `actions/deploy-pages`).
- **Dependabot** monitors GitHub Actions versions weekly
  ([`.github/dependabot.yml`](.github/dependabot.yml)).
