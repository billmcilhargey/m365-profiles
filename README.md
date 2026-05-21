# M365 Profiles — Microsoft 365 Licensing Decision Tree

[![Deploy](https://github.com/billmcilhargey/m365-profiles/actions/workflows/deploy.yml/badge.svg)](https://github.com/billmcilhargey/m365-profiles/actions/workflows/deploy.yml)
[![Lint](https://github.com/billmcilhargey/m365-profiles/actions/workflows/lint.yml/badge.svg)](https://github.com/billmcilhargey/m365-profiles/actions/workflows/lint.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Live site](https://img.shields.io/badge/Live%20site-GitHub%20Pages-0078d4)](https://billmcilhargey.github.io/m365-profiles/)
[![Stack](https://img.shields.io/badge/Stack-Vanilla%20HTML%20%2F%20CSS%20%2F%20JS-success)](index.html)

An interactive, single-page decision tree that matches a **Microsoft 365
identity profile** — privileged admin, information worker, frontline (F1/F3),
education (A1/A3/A5), government (GCC / GCC High / DoD / IL6), nonprofit,
SMB, or External ID guest — to the right license tier (Entra ID Free / P1 /
P2, Entra ID Governance, Entra Suite, M365 E3 / E5 / Business Premium /
F1 / F3 / A1 / A3 / A5 / G3 / G5, Defender Suite, Purview Suite, Intune
Suite, Teams Premium, Microsoft 365 Copilot, or the new M365 E7
**Frontier Suite**).

**Live site:** <https://billmcilhargey.github.io/m365-profiles/>

> ⚠️ **Not official Microsoft guidance.** This is an independent community
> helper — not a Microsoft product, not endorsed by Microsoft, and not a
> substitute for professional licensing advice. Always verify SKUs and
> entitlements with your Microsoft account team or licensing partner.
> Microsoft Product Terms are the source of truth.

---

## What it is

- A single `index.html` file. No build step, no dependencies, no backend,
  no telemetry, no cookies.
- 38 decision-tree nodes (12 questions, 3 choice screens, 2 info screens,
  21 results) — every edge verified reachable by
  [`scripts/validate-tree.js`](scripts/validate-tree.js).
- The privileged-admin path runs as a 12-question Yes/No tree; the other
  seven profile paths land on curated single-screen guidance with
  Microsoft Learn + [m365maps.com](https://m365maps.com/) citations.
- A tenant-baseline picker on entry (E3 / E5 / Business Premium / F1 / F3 /
  A1 / A3 / A5 / G3 / G5 / Nonprofit / none) plus a US-sovereign-cloud
  sub-step (GCC / GCC High / DoD IL5 / Air-Gapped IL6) that layers a
  feature-parity caveat on every result.
- Light/dark theme, full keyboard support, mobile-first responsive,
  reduced-motion aware, Copy summary + Print/Save-as-PDF on every result.

## Why no framework?

The site is one HTML file with inline CSS and vanilla JS. There are no
third-party libraries, no network calls beyond the initial page load, no
component model, and nothing that benefits from a bundler. Adding Astro,
Next.js, or any SPA framework would inflate the dependency surface, add a
CI build step, and gain nothing the user can see. **Stack is intentionally
boring.**

## Run it locally

```bash
git clone https://github.com/billmcilhargey/m365-profiles.git
cd m365-profiles
python3 -m http.server 8080   # or just open index.html in a browser
# then visit http://localhost:8080
```

Validate the decision-tree wiring after edits:

```bash
node scripts/validate-tree.js
```

Run the same lint that CI runs:

```bash
npx --yes htmlhint@1.1.4 index.html 404.html
npx --yes markdownlint-cli2 "**/*.md"
```

## Deploy

Two GitHub Actions workflows ship with the repo:

| Workflow | Trigger | What it does |
| --- | --- | --- |
| [`deploy.yml`](.github/workflows/deploy.yml) | push to `main`, `workflow_dispatch` | Validates the tree, publishes the repo root to GitHub Pages via `actions/deploy-pages@v5`, then tags + publishes a CalVer release (`vYYYY.MM.DD-N`). Add `[skip release]` to the commit message to skip tagging. |
| [`lint.yml`](.github/workflows/lint.yml) | push + PR to `main`, `workflow_dispatch` | Runs HTMLHint, markdownlint-cli2, and the Lychee link checker. |

To enable Pages on a fork:

1. Push to `main`.
2. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
3. The deploy workflow runs on the next push.

If you fork under a different owner, search-and-replace
`billmcilhargey.github.io/m365-profiles` across [`index.html`](index.html),
[`sitemap.xml`](sitemap.xml), and [`robots.txt`](robots.txt) so the OG tag,
sitemap, and crawler hints stay correct. For a custom domain, add a `CNAME`
file with the bare hostname and configure DNS + HTTPS under **Settings →
Pages**.

## Project layout

```text
index.html             Single-file SPA (HTML + CSS + vanilla JS)
404.html               Self-contained Pages 404 page
robots.txt             Allow all + sitemap pointer
sitemap.xml            Single-URL sitemap
LICENSE                MIT
README.md              This file
SECURITY.md            Vulnerability reporting + defense-in-depth notes
.editorconfig          Cross-editor formatting defaults
.htmlhintrc            HTMLHint rules
.markdownlint.json     markdownlint-cli2 config
.gitignore             Secrets / node / OS / editor / cache exclusions
scripts/
  validate-tree.js     Tree wiring + reachability check (no deps)
.github/
  dependabot.yml       Weekly Action version updates
  workflows/
    deploy.yml         Validate → GitHub Pages → CalVer release
    lint.yml           HTMLHint + markdownlint + Lychee
```

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| `1`–`9` | Pick a numbered choice on a choice screen |
| `Y` / `N` | Yes / No on question screens (`1` / `2` also work) |
| `←` or `Backspace` | Go back one step |
| `R` | Restart |
| `Tab` / `Enter` / `Space` | Standard focus + activation |

## Extending the tree

Decision logic lives in the `TREE` object inside [`index.html`](index.html).
Each node is one of: a **question** (yes/no), a **choice** (n-way picker),
an **info** screen (read-only), or a terminal **result**.

```js
const TREE = {
  start_choice: {
    choice: true,
    step: { major: 2, label: "Profile" },
    question: "Which identity profile fits this account best?",
    choices: [
      { label: "Privileged admin", value: "admin", target: "q_uses_services", icon: "1" },
      // ...
    ]
  },
  result_intune_suite: {
    result: true,
    badge: "Intune Suite add-on",
    badgeClass: "badge-premium",
    title: "Microsoft Intune Suite (or standalone Intune add-on)",
    sub: "...",
    bullets: ["...", "..."],
    docs: [["Doc title", "https://learn.microsoft.com/..."]]
  }
};
```

Workflow:

1. Add the new node(s) to `TREE`.
2. Re-wire an existing `yes` / `no` / `target` edge to point at your node.
3. Run `node scripts/validate-tree.js` to confirm every edge resolves and
   every node is still reachable from `start_tenant`.
4. Open a PR; lint and validation run automatically.

> **Heads up:** the validator depends on a sentinel comment immediately
> after the closing `};` of `TREE`. Don't remove it.

## Security

Static informational site. No backend, no application dependencies, no
telemetry, no cookies, no user data collection. See
[`SECURITY.md`](SECURITY.md) for the vulnerability-reporting policy and the
defense-in-depth headers applied (CSP, Referrer-Policy, Permissions-Policy,
least-privilege workflow permissions, Dependabot).

## Contributing

Issues and pull requests welcome. For PRs that change licensing logic,
please cite the Microsoft Learn page the rule comes from so reviewers can
verify it. Feedback from inside the live assessment uses the navbar
**Report issue** link, which pre-populates a labelled GitHub issue with the
current node id and step.

## Acknowledgements

- UI inspired by the
  [Microsoft Zero Trust Assessment](https://github.com/microsoft/zerotrustassessment).
- License cross-references built on top of
  [m365maps.com](https://m365maps.com/) by Aaron Dinnage.

## License

[MIT](LICENSE) © 2026 Dr. Bill Mcilhargey
