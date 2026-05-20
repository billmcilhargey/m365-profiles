# M365 Admin Licensing Decision Tree

[![Deploy to GitHub Pages](https://github.com/billmcilhargey/m365-admin-license-navigator/actions/workflows/pages.yml/badge.svg)](https://github.com/billmcilhargey/m365-admin-license-navigator/actions/workflows/pages.yml)
[![Lint](https://github.com/billmcilhargey/m365-admin-license-navigator/actions/workflows/lint.yml/badge.svg)](https://github.com/billmcilhargey/m365-admin-license-navigator/actions/workflows/lint.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Live site](https://img.shields.io/badge/Live%20site-GitHub%20Pages-0078d4)](https://billmcilhargey.github.io/m365-admin-license-navigator/)
[![Stack](https://img.shields.io/badge/Stack-Vanilla%20HTML%20%2F%20CSS%20%2F%20JS-success)](index.html)
[![Covers](https://img.shields.io/badge/Covers-M365%20E7%20%28May%202026%29-orange)](https://learn.microsoft.com/partner-center/announcements/2026-may)

> An interactive, single-page decision tree that helps Microsoft 365 admins
> figure out **whether a given _secondary_ (dedicated) admin account needs a
> license** — and which one (Entra ID Free, Entra ID P2, Entra ID Governance,
> Entra Suite, M365 E5, Defender Suite, Purview Suite, Intune Suite, Teams
> Premium, Microsoft 365 Copilot, or the new **M365 E7 Frontier Suite**).

**Live site:** <https://billmcilhargey.github.io/m365-admin-license-navigator/>

> ⚠️ **Not official Microsoft guidance.** This is an **independent community
> helper** — not a Microsoft product, not endorsed by Microsoft, and not a
> substitute for professional licensing advice. It is a quick decision-support
> tool to point you at the likely tier. Always confirm final licensing with
> your Microsoft account team or Cloud Solution Provider before you buy.

---

## Built for secondary (dedicated) admin accounts

Microsoft's privileged access strategy is built on **separation of duties**:
your daily-use identity (mailbox, Teams, Office) and your administrative
identity should be _two different accounts_. This tool answers the licensing
question for that **second** account.

| Why it matters | What it means |
| --- | --- |
| **Smaller blast radius** | If a daily mailbox is phished, the attacker doesn't automatically get Global Admin. The admin account is a separate identity behind separate sign-in protections (FIDO2, PIM, risk-based CA). |
| **Cheaper to license** | Most secondary admin accounts _never need a service license_ — they don't have a mailbox or use Teams. **Entra ID Free** is enough until they enter a premium policy scope. |
| **Aligned to Microsoft guidance** | "Use separate accounts for administrative privileges" is one of the top Microsoft Entra best practices and a core element of the [privileged access strategy](https://learn.microsoft.com/security/privileged-access-workgroup/overview). |

**What counts as a secondary admin account?** A separate cloud-only identity
(typically `admin-firstname@tenant.onmicrosoft.com`) that is used _only_ for
privileged work — Global Admin, Privileged Role Admin, Identity Admin,
Security / Compliance / Intune / Teams / Exchange Admin, etc. It has no
mailbox to phish, no Teams chats, and no Office apps — so most of the time it
doesn't consume a Microsoft 365 service license at all.

When you load the site, the **first screen** asks you to confirm what kind of
account you're evaluating:

1. **Secondary (dedicated) admin account** — recommended path, runs the full tree.
2. **Primary daily-use account that also holds admin roles** — shows a warning
   result explaining the different licensing rules, then lets you continue.
3. **"What's the difference?"** — shows a background screen with Microsoft Learn
   citations, then lets you continue.

### Microsoft Learn references for the secondary admin pattern

- [Microsoft Entra best practices for admin roles](https://learn.microsoft.com/entra/identity/role-based-access-control/best-practices)
- [Securing privileged access — overview](https://learn.microsoft.com/security/privileged-access-workgroup/overview)
- [Privileged access accounts](https://learn.microsoft.com/security/privileged-access-workgroup/privileged-access-accounts)
- [Emergency access accounts (break-glass)](https://learn.microsoft.com/entra/identity/role-based-access-control/security-emergency-access)

## Why this exists

Microsoft 365 licensing for admin accounts is full of "it depends":

- Global Administrators can administer **without** a user license.
- The moment you make that same admin **PIM-eligible**, you need **Entra ID P2**.
- The moment they show up in an **Insider Risk Management** policy scope, you
  need **M365 E5 / Purview Suite**.
- The moment they push **Endpoint Privilege Management** or **Remote Help**,
  you need the **Microsoft Intune Suite** add-on.
- Add Copilot or Agent 365 and you're looking at the **M365 Copilot add-on** or
  the new **M365 E7 (Frontier Suite)** that launched May 1 2026.

This tool walks you through a short Yes/No interview, scoped to a **secondary
admin account**, and gives a concrete licensing recommendation, with links
back to the exact Microsoft Learn pages that justify it — plus cross-references
to [m365maps.com](https://m365maps.com/) for visual SKU comparisons.

## What's included

- A single-file SPA (`index.html`) — no build step, no dependencies, no backend.
- A **point-and-click intro gate** that asks what type of admin account you're
  evaluating before running the tree.
- A **fully point-and-click flow** — each click takes you to the next screen,
  with keyboard shortcuts (`1`/`2`/`3` for intro choices, `Y` / `N` / `←` / `R`
  for the tree) for power users.
- A Microsoft-inspired UI modeled on the look-and-feel of the
  [Microsoft Zero Trust Assessment](https://microsoft.github.io/zerotrustassessment/)
  site: fixed top navbar, navy → MS-blue hero gradient, dark footer.
- **Mobile + desktop responsive** — large 52 px touch targets, single-column
  answers on small screens, fixed navbar with `scroll-margin-top` so anchored
  jumps don't get hidden, smooth scroll, reduced-motion support.
- A **tenant-baseline toggle** (E3 / E5 / E7 / Business Premium / F3 / none)
  that adjusts every recommendation based on what you already own.
- A **progress bar with step count**, back button, restart, **Copy summary**
  to clipboard, and a path trail of your answers.
- 12 question nodes + 1 intro choice + 1 background info screen + 14 result
  nodes, every edge verified reachable.
- Microsoft Learn + m365maps.com citations on every result page.
- Skip-to-content link, `aria-live` region for results, visible focus rings.

## Decision tree coverage

After the intro gate (account scope), the tree evaluates the **secondary admin
account** against, in order:

1. **Service usage** (Exchange / Teams / SharePoint / OneDrive / Office) —
   should be _none_ for a properly dedicated secondary admin
2. **Account type** (service principal / managed identity vs human admin)
3. **Microsoft 365 Copilot / Agent 365**
4. **Purview E5** (IRM, CC, Adaptive, endpoint DLP, eDiscovery Premium, Records
   Management, Customer Lockbox, Customer Key, Information Barriers, PAM for
   Office, Audit Premium)
5. **Defender XDR & security** (DfE P2, DfI, MDA, DfO P2, Defender XDR, Sentinel ops)
6. **Microsoft Intune Suite** (EPM, Remote Help, Tunnel for MAM, Cloud PKI,
   Enterprise App Management, Advanced Endpoint Analytics)
7. **Microsoft Teams Premium** (advanced webinars, town halls premium, meeting
   recap, real-time translation, branded meetings)
8. **PIM** (eligible, time-bound, approver, reviewer)
9. **Entra ID Protection** (risk-based CA, premium risk detections)
10. **Entra ID Governance** (entitlement management, lifecycle workflows)
11. **Entra Suite** (Global Secure Access, Internet Access, Private Access,
    Verified ID)
12. **Break-glass / emergency-access** exclusion
13. Default → **tools-only admin** (no license)

## License map

| Branch | Result | Microsoft documentation |
| --- | --- | --- |
| Account signs in to any M365 service | Service license (E3 / Business Premium / F3 minimum) | [Compare M365 plans](https://www.microsoft.com/microsoft-365/enterprise/microsoft365-plans-and-pricing) |
| Non-interactive service principal / managed identity | No user license — use managed identity | [Managed identities](https://learn.microsoft.com/entra/identity/managed-identities-azure-resources/overview) |
| Microsoft 365 Copilot / Copilot Studio / Agent 365 | M365 Copilot add-on **or M365 E7 (Frontier Suite)** | [Copilot licensing](https://learn.microsoft.com/microsoft-365/copilot/microsoft-365-copilot-licensing), [E7 announcement](https://learn.microsoft.com/partner-center/announcements/2026-may) |
| In scope of Purview E5 (IRM / CC / Adaptive / endpoint DLP / eDiscovery P / Audit P / Records Mgmt / Customer Lockbox / IB / PAM-for-Office) | M365 E5 / E5 Compliance / Purview Suite | [Insider Risk Management](https://learn.microsoft.com/purview/insider-risk-management-configure#subscriptions-and-licensing) |
| Uses Defender XDR / DfE P2 / Defender for Identity / Defender for Cloud Apps / DfO P2 | M365 E5 / Defender Suite | [Defender XDR](https://learn.microsoft.com/defender-xdr/microsoft-365-defender) |
| Uses Intune Suite premium features (EPM, Remote Help, Tunnel for MAM, Cloud PKI) | Microsoft Intune Suite add-on | [Intune add-ons](https://learn.microsoft.com/mem/intune/fundamentals/intune-add-ons) |
| Uses Teams Premium meeting features | Teams Premium add-on | [Teams Premium licensing](https://learn.microsoft.com/microsoftteams/teams-add-on-licensing/licensing-enhance-teams) |
| PIM eligible / approver / reviewer | Entra ID P2 (or Entra ID Governance) per user | [PIM licensing](https://learn.microsoft.com/entra/id-governance/licensing-fundamentals#privileged-identity-management) |
| In scope of Entra ID Protection / risk-based CA | Entra ID P2 | [Risk detections](https://learn.microsoft.com/entra/id-protection/concept-identity-protection-risks) |
| Uses Entitlement Management / Lifecycle Workflows | Entra ID Governance | [ID Governance licensing](https://learn.microsoft.com/entra/id-governance/licensing-fundamentals) |
| Uses Global Secure Access / Internet Access / Private Access / Verified ID | Entra Suite (or M365 E7) | [Entra Suite](https://learn.microsoft.com/entra/global-secure-access/overview-what-is-global-secure-access) |
| Break-glass / emergency-access only (excluded from CA/PIM/IDP) | No license required | [Emergency access accounts](https://learn.microsoft.com/entra/identity/role-based-access-control/security-emergency-access) |
| Tools-only Global / Power Platform Admin | No license required — Entra ID Free covers admin work | [Admins without a license](https://learn.microsoft.com/power-platform/admin/global-service-administrators-can-administer-without-license) |

For a visual cross-check of every SKU above, see
[m365maps.com](https://m365maps.com/).

## GitHub Actions

Two workflows ship with the repo:

| Workflow | Trigger | What it does |
| --- | --- | --- |
| [`pages.yml`](.github/workflows/pages.yml) | push to `main`, manual (`workflow_dispatch`) | Publishes the repo root to GitHub Pages via `actions/deploy-pages@v4` |
| [`lint.yml`](.github/workflows/lint.yml) | push + PR to `main`, manual (`workflow_dispatch`) | Runs **HTMLHint**, **markdownlint-cli2**, and **Lychee** link checker |

Configs:

- [`.htmlhintrc`](.htmlhintrc) — strict-ish HTMLHint rules (lowercase tags,
  doctype, quoted attrs, unique ids, required `alt` / `title`)
- [`.markdownlint.json`](.markdownlint.json) — relaxes line length and inline
  HTML so the badge table renders correctly

## Enable GitHub Pages

This repo deploys to a **GitHub Pages project site** under the owner's
`github.io` subdomain. The recommended (and default) URL is:

> **<https://billmcilhargey.github.io/m365-admin-license-navigator/>**

Recommended GitHub subdomain strategy:

- Keep the canonical GitHub Pages host as `billmcilhargey.github.io`.
- Publish this project as a project site at
  `billmcilhargey.github.io/m365-admin-license-navigator/`.
- If you later want a shorter branded URL, layer a custom domain on top,
  while keeping GitHub Pages as the origin.

That URL is wired into [`sitemap.xml`](sitemap.xml), [`robots.txt`](robots.txt),
the Open Graph `og:url` meta tag in [`index.html`](index.html), and the
"Live site" badge above. If you fork the repo under a different owner, search
and replace `billmcilhargey.github.io/m365-admin-license-navigator` with your
own `<owner>.github.io/<repo-name>` (or with the user/organization page URL
`<owner>.github.io` if you rename the repo to `<owner>.github.io`).

To turn Pages on:

1. Push to `main`.
2. **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. The `Deploy to GitHub Pages` workflow runs on the next push — or you can
   trigger it on demand from **Actions → Deploy to GitHub Pages → Run
  workflow** (the workflow declares `workflow_dispatch`).
4. For manual runs, you can optionally provide a `ref` (branch, tag, or commit
  SHA) in the workflow form to deploy that exact revision.
5. After the first successful run, the site is live at the URL above.

### Custom domain (optional)

If you want to serve the site from a custom domain (for example
`licensing.example.com`):

1. Add a `CNAME` file at the repo root containing only the bare hostname
   (no scheme, no trailing slash) — e.g. `licensing.example.com`.
2. Create a `CNAME` DNS record at your DNS provider pointing
   `licensing.example.com` to `billmcilhargey.github.io`.
3. In **Settings → Pages**, enter the custom domain and tick **Enforce HTTPS**
   once the certificate has provisioned.
4. Update the same URL references listed above (`sitemap.xml`, `robots.txt`,
   `og:url`, README badges) to point at your custom domain so SEO and link
   previews stay correct.

## Run it locally

```bash
git clone https://github.com/billmcilhargey/m365-admin-license-navigator.git
cd m365-admin-license-navigator
# open index.html in your browser, or:
python3 -m http.server 8080
# then visit http://localhost:8080
```

Validate the decision tree wiring after edits:

```bash
node scripts/validate-tree.js
```

Run lint locally before pushing:

```bash
npx htmlhint "**/*.html"
npx markdownlint-cli2 "**/*.md"
```

## Project layout

```text
index.html                     Single-file SPA (HTML + CSS + vanilla JS)
404.html                       Friendly 404 page for GitHub Pages
robots.txt                     Allow all + sitemap pointer
sitemap.xml                    Single-URL sitemap
README.md                      This file
LICENSE                        MIT
SECURITY.md                    Vulnerability reporting policy
.editorconfig                  Cross-editor formatting defaults
.htmlhintrc                    HTMLHint config
.markdownlint.json             markdownlint-cli2 config
.gitignore                     Secrets / node / OS / editor / cache exclusions
scripts/
  validate-tree.js             Sanity-checks the decision tree (no broken edges, all reachable)
.github/
  dependabot.yml               Weekly GitHub Actions version updates
  workflows/
    pages.yml                  GitHub Pages deploy (minimum permissions)
    lint.yml                   HTMLHint + markdownlint + Lychee link checker
```

No build tools, no frameworks, no backend.

## Security

This repo is a **static informational site**. There is no backend, no
application dependency tree, no telemetry, no cookies, and no user data
collection. See [`SECURITY.md`](SECURITY.md) for the vulnerability reporting
policy and the defense-in-depth measures applied (CSP, Referrer-Policy,
Permissions-Policy, least-privilege workflow permissions, and Dependabot for
GitHub Actions).

## Extending the tree

Decision logic lives in the `TREE` object inside `index.html`:

```js
const TREE = {
  start: {
    eyebrow: "Service usage",
    question: "...",
    help: "...",
    yes: "result_service",
    no: "q_service_principal"
  },
  // ...
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

To add a new branch:

1. Add a new question node (`q_xxx`) with `eyebrow`, `question`, `help`,
   `yes`, and `no`.
2. Add the corresponding result node (`result_xxx`) with `result: true`.
3. Re-wire the `no` edge of an existing question to point at your new
   question.
4. Add a `tenantHint` entry for `result_xxx` covering each tenant baseline.
5. Run `node scripts/validate-tree.js` to confirm wiring.

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| `1` / `2` / `3` | Pick a choice on the intro / info screens |
| `Y` or `1` | Answer **Yes** (on question screens) |
| `N` or `2` | Answer **No** (on question screens) |
| `←` or `Backspace` | Go back one step |
| `R` | Restart |
| `Tab` | Move focus through interactive elements |
| `Enter` / `Space` | Activate the focused button |

## Contributing

Issues and pull requests are welcome. Please cite the relevant Microsoft Learn
page in any PR that changes licensing logic so reviewers can verify the rule.
Lint runs automatically on every PR.

## Acknowledgements

- UI inspired by the
  [Microsoft Zero Trust Assessment](https://github.com/microsoft/zerotrustassessment)
  project — a sibling community tool that performs an automated tenant-side
  assessment of your Zero Trust posture.
- License cross-references built on top of the excellent
  [m365maps.com](https://m365maps.com/) visualizations by Aaron Dinnage.

## License

[MIT](LICENSE) © 2026 Bill McIlhargey
