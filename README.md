# M365 Profiles — Microsoft 365 Licensing Decision Tree

[![Deploy](https://github.com/billmcilhargey/m365-profiles/actions/workflows/deploy.yml/badge.svg)](https://github.com/billmcilhargey/m365-profiles/actions/workflows/deploy.yml)
[![Lint](https://github.com/billmcilhargey/m365-profiles/actions/workflows/lint.yml/badge.svg)](https://github.com/billmcilhargey/m365-profiles/actions/workflows/lint.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Live site](https://img.shields.io/badge/Live%20site-GitHub%20Pages-0078d4)](https://billmcilhargey.github.io/m365-profiles/)
[![Stack](https://img.shields.io/badge/Stack-Vanilla%20HTML%20%2F%20CSS%20%2F%20JS-success)](index.html)
[![Covers](https://img.shields.io/badge/Covers-M365%20E7%20%28May%202026%29-orange)](https://learn.microsoft.com/partner-center/announcements/2026-may)

> An interactive, single-page decision tree that helps you match a **Microsoft
> 365 identity profile** — privileged admin, information / knowledge worker,
> frontline worker (F1 / F3), education (A1 / A3 / A5), government (GCC /
> GCC High / DoD), nonprofit, small / mid-size business (≤ 300 seats), or
> External ID / B2B guest — to the right license: Entra ID Free / P1 / P2,
> Entra ID Governance, Entra Suite, M365 E3 / E5 / Business Basic / Standard
> / Premium / F1 / F3 / A1 / A3 / A5 / G1 / G3 / G5, Nonprofit Staff
> Pricing, Defender Suite, Purview Suite, Intune Suite, Teams Premium,
> Microsoft 365 Copilot, or the new **M365 E7 Frontier Suite**.

**Live site:** <https://billmcilhargey.github.io/m365-profiles/>

> ⚠️ **Not official Microsoft guidance.** This is an **independent community
> helper** — not a Microsoft product, not endorsed by Microsoft, and not a
> substitute for professional licensing advice. It is a quick decision-support
> tool to point you at the likely tier. Always confirm final licensing with
> your Microsoft account team or Cloud Solution Provider before you buy.

---

## Identity profiles covered

M365 Profiles starts with a profile selector. Pick the persona that best
matches the identity you are licensing — each path is grounded in Microsoft
Learn and [m365maps.com](https://m365maps.com/) and respects Microsoft's
eligibility rules where they apply.

| Profile | Industry term | Typical M365 SKUs | Notes |
| --- | --- | --- | --- |
| **Privileged admin account** | Dedicated administrative account, Tier-0 / Tier-1 admin, "PA" account, jump-account, "blue" account | Entra ID Free → P2, Entra ID Governance, Entra Suite, M365 E5, Defender / Purview / Intune Suite, Teams Premium, Copilot, M365 E7 | Runs the full 12-question Yes/No tree. Separation of duties from a user's daily-use identity. |
| **Primary daily-use account with admin roles** | Mixed-use account (not recommended) | Base E3 / E5 / Business Premium / F3 + premium add-ons | Warning path. Always needs a base service license plus any premium tier the role triggers. |
| **Information / knowledge worker** | Office worker, desk-based worker, productivity worker | M365 E3, M365 E5, M365 Business Premium (≤300 seats), + Copilot, + Teams Premium, + Intune Suite, + Entra Suite, M365 E7 | Standard Office / Teams / SharePoint / OneDrive / Outlook end user on a managed PC. |
| **Frontline worker** | Deskless worker, shift worker, field worker, first-line worker (FLW) — retail / manufacturing / healthcare / hospitality / public-safety / field-service | Microsoft 365 F1, Microsoft 365 F3, F-tier add-ons (Teams Phone, Defender for Endpoint P1, Copilot for Frontline) | **Eligibility-gated** — workers who don't primarily work at a desk, often share a device, and aren't assigned a personal PC. Subject to Microsoft Product Terms. |
| **Education — faculty** | Educator, instructor, staff | Microsoft 365 A1, A3, A5 (Faculty); A5 Compliance / A5 Security add-ons | Qualifying academic institution only. A SKUs are eligibility-gated under the Education Product Terms. |
| **Education — student** | Learner, pupil | Microsoft 365 A1, A3, A5 (Student) | Different entitlements and pricing than Faculty SKUs. |
| **Government — GCC** | US federal / state / local / tribal government, government contractors handling CUI (non-ITAR) | M365 G1 / G3 / G5, F1 / F3 Government | Azure Commercial regions, FedRAMP High. Closest feature parity to commercial. |
| **Government — GCC High** | DIB, DFARS 7012 / ITAR / EAR-regulated organizations, CMMC L2+ contractors | M365 G1 / G3 / G5 GCC High, F-tier GCC High | Azure Government regions, FedRAMP High + DoD IL4 / IL5. Reduced feature parity — confirm Copilot, Entra Suite, Defender XDR, Purview Premium availability. |
| **Government — DoD** | US Department of Defense | M365 G5 DoD | DoD IL5 (IL6 handled separately). Most restricted feature parity. |
| **Nonprofit** | Charitable / nonprofit organization enrolled in Microsoft Nonprofits | M365 Business Premium grant (≤ 300 seats), Nonprofit Staff Pricing on Business Basic / Standard / Premium / E3 / E5 / F3 | **Eligibility-gated** under the Microsoft Nonprofits program; validated annually. Excludes governmental orgs, hospitals, schools, and political / advocacy orgs. |
| **Small / mid-size business (SMB)** | Commercial org with ≤ 300 seats | M365 Business Basic, Business Standard, Business Premium, plus Copilot Business / Defender Suite for Business Premium / Teams Phone add-ons | Hard 300-seat cap across all Business SKUs. At 301 seats Microsoft requires moving the tenant to Enterprise SKUs. |
| **External ID / B2B guest** | Partner / vendor / contractor invited as a guest | None per-seat — billed by Monthly Active Users (MAU); first 50 000 MAU free per tenant. Premium features (P1 / P2 / Verified ID) priced per MAU. | Guests do NOT need an M365 service license to consume Teams / SharePoint shared with them. Use Entra ID Governance access reviews to expire stale guests. |

> The privileged-admin path is fully built out as a 12-question Yes/No tree.
> The information-worker, frontline, education, government, nonprofit, SMB,
> and External ID paths currently land on a single curated guidance screen
> each (with Microsoft Learn and m365maps.com citations). Building those
> into full Yes/No sub-trees is tracked as the next milestone —
> contributions welcome.

## Why the privileged-admin path goes deepest

Microsoft's privileged access strategy is built on **separation of duties**:
a user's daily-use identity (mailbox, Teams, Office) and their administrative
identity should be _two different accounts_. Of M365 Profiles' eight
identity paths, the privileged-admin path is the most license-sensitive — and
the only one fully built out as a 12-step Yes/No tree. Everything below
applies to that path.

| Why it matters | What it means |
| --- | --- |
| **Smaller blast radius** | If a daily mailbox is phished, the attacker doesn't automatically get Global Admin. The admin account is a separate identity behind separate sign-in protections (FIDO2, PIM, risk-based CA). |
| **Cheaper to license** | Most privileged admin accounts _never need a service license_ — they don't have a mailbox or use Teams. **Entra ID Free** is enough until they enter a premium policy scope. |
| **Aligned to Microsoft guidance** | "Use separate accounts for administrative privileges" is one of the top Microsoft Entra best practices and a core element of the [privileged access strategy](https://learn.microsoft.com/security/privileged-access-workgroup/overview). |

**What counts as a privileged admin account?** A separate cloud-only identity
(typically `admin-firstname@tenant.onmicrosoft.com`) that is used _only_ for
privileged work — Global Admin, Privileged Role Admin, Identity Admin,
Security / Compliance / Intune / Teams / Exchange Admin, etc. It has no
mailbox to phish, no Teams chats, and no Office apps — so most of the time it
doesn't consume a Microsoft 365 service license at all.

**The licensing twist:** small changes in scope flip the bill.

- Global Administrators can administer **without** a user license.
- The moment you make that same admin **PIM-eligible**, you need **Entra ID P2**.
- The moment they show up in an **Insider Risk Management** policy scope, you
  need **M365 E5 / Purview Suite**.
- The moment they push **Endpoint Privilege Management** or **Remote Help**,
  you need the **Microsoft Intune Suite** add-on.
- Add Copilot or Agent 365 and you're looking at the **M365 Copilot add-on** or
  the new **M365 E7 (Frontier Suite)** that launched May 1 2026.

The privileged-admin path walks through this as a short Yes/No interview and
links every answer back to the Microsoft Learn page that justifies it.

### Microsoft Learn references for the privileged admin pattern

- [Microsoft Entra best practices for admin roles](https://learn.microsoft.com/entra/identity/role-based-access-control/best-practices)
- [Securing privileged access — overview](https://learn.microsoft.com/security/privileged-access-workgroup/overview)
- [Privileged access accounts](https://learn.microsoft.com/security/privileged-access-workgroup/privileged-access-accounts)
- [Emergency access accounts (break-glass)](https://learn.microsoft.com/entra/identity/role-based-access-control/security-emergency-access)

## What's included

- A single-file SPA (`index.html`) — no build step, no dependencies, no backend.
- A streamlined **intro flow**: scope/disclaimer card first, then a profile
  picker (eight identity profiles) before running the per-profile path.
- A **fully point-and-click flow** — each click takes you to the next screen,
  with keyboard shortcuts (`1`–`9` to pick a profile, `Y` / `N` / `←` / `R`
  for the tree) for power users.
- A Microsoft-inspired UI modeled on the look-and-feel of the
  [Microsoft Zero Trust Assessment](https://microsoft.github.io/zerotrustassessment/)
  site: fixed top navbar, navy → MS-blue hero gradient, dark footer.
- A top-right **light/dark theme toggle** (saved locally in your browser).
- **Mobile + desktop responsive** — large 52 px touch targets, single-column
  answers on small screens, fixed navbar with `scroll-margin-top` so anchored
  jumps don't get hidden, smooth scroll, reduced-motion support.
- A **tenant-baseline toggle** — Enterprise (E3 / E5 / E7), Business
  (Premium / Standard), Frontline (F1 / F3), Education (A1 / A3 / A5),
  Government (G3 / G5), Nonprofit Staff Pricing (M365 E3), or "no plan yet"
  — that adjusts every recommendation based on what you already own and
  layers sovereign-cloud / education / nonprofit caveats where appropriate.
- A **progress bar with step count**, back button, restart, **Copy summary**
  to clipboard, and a path trail of your answers.
- 36 tree nodes total (12 questions, 1 profile picker, 2 info screens,
  21 results) — every edge verified reachable by `scripts/validate-tree.js`.
- Per-question **"How to decide quickly"** examples plus direct Microsoft
  Learn links for technical items in each question.
- Microsoft Learn + m365maps.com citations on every result page.
- Skip-to-content link, `aria-live` region for results, visible focus rings.

## Privileged-admin sub-tree coverage

After the intro flow (scope + profile picker), the privileged-admin path
evaluates the account against, in order:

1. **Service usage** (Exchange / Teams / SharePoint / OneDrive / Office) —
   should be _none_ for a properly dedicated privileged admin
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

## Frontline worker coverage

Frontline workers (Microsoft's "first-line workers", or FLW) are deskless,
shift-based, or field-based — retail associates, manufacturing operators,
healthcare clinicians, hospitality staff, first responders, field engineers.
They are eligible for **Microsoft 365 F1 and F3** at a fraction of the E-SKU
price, but Microsoft enforces eligibility under the Product Terms and the
wrong assignment is a compliance / audit risk.

| Frontline tier | Includes | Common use |
| --- | --- | --- |
| **Microsoft 365 F1** | Teams, SharePoint (browse), Viva Engage, Stream, Office for the web (view), Intune, Entra ID P1 — **no mailbox** | Light deskless / shared-device worker, kiosk users |
| **Microsoft 365 F3** | F1 + 2 GB Exchange mailbox, Office mobile apps (commercial use), Defender for Office 365 P1, AIP P1, Power Apps / Automate (F3 use rights) | Full frontline persona |

Frontline-specific add-ons to plan for:

- Teams Phone with Calling Plan (per user, where regulated by region)
- Defender for Endpoint P1 (frontline-specific tier)
- Microsoft Viva Communications & Communities for Frontline
- Microsoft 365 Copilot for Frontline (per-user, where licensed)
- Teams Premium for Frontline (when GA)

Frontline solutions to expect: Shifts in Teams, Walkie Talkie, Tasks
(Planner + To Do), Approvals, Updates, Virtual Appointments, Shared Device
mode for Teams, RealWear / shared-Android device enrollment.

**Microsoft Learn references:**

- [Microsoft 365 for frontline workers — overview](https://learn.microsoft.com/microsoft-365/frontline/flw-overview)
- [Compare frontline plans (F1 vs F3)](https://learn.microsoft.com/microsoft-365/frontline/flw-licensing-options)
- [Frontline worker license eligibility](https://learn.microsoft.com/microsoft-365/frontline/flw-licensing-options#frontline-worker-license-eligibility)
- [Deploy Microsoft 365 for frontline workers](https://learn.microsoft.com/microsoft-365/frontline/flw-deploy-overview)
- [Microsoft 365 Copilot for frontline workers](https://learn.microsoft.com/microsoft-365/frontline/flw-copilot)

## Education licensing coverage

Microsoft 365 Education uses the **A1 / A3 / A5** family for qualifying
academic institutions. Faculty and student SKUs have different entitlements
and pricing, and the tenant must pass Microsoft's academic-eligibility check.

| Education tier | Faculty / Student | Notes |
| --- | --- | --- |
| **A1** | Both | Bundled with qualifying tenants. Office for the web, Teams for Education, SharePoint, OneDrive (capped), Entra ID P1 (faculty) / Free (student). |
| **A3** | Both | Most common paid baseline. Desktop Office, Exchange, Intune, Entra ID P1, AIP P1, Defender for Office P1, Power BI Pro for faculty. |
| **A5** | Both | A3 + Defender XDR, Defender for Endpoint, Defender for Identity, Defender for Cloud Apps, Purview E5 (eDiscovery Premium, IRM, Audit Premium), Entra ID P2, Teams Phone (faculty). |

Education-specific add-ons include **Microsoft 365 Copilot for Education**
(Faculty / Student where available), **Minecraft Education**, and the
**Reflect / Reading Coach / Insights** family. Standalone **A5 Compliance**
and **A5 Security** SKUs let you bump from A3 without buying the full A5.

Schools may layer **F1 / F3** for non-faculty deskless staff (maintenance,
facilities, lab assistants) — confirm with the Microsoft Education account
team.

**Microsoft Learn references:**

- [Microsoft 365 Education plans](https://www.microsoft.com/education/products/microsoft-365)
- [Compare M365 Education plans (A1 / A3 / A5)](https://www.microsoft.com/education/products/office)
- [Microsoft 365 Education service description](https://learn.microsoft.com/office365/servicedescriptions/office-365-platform-service-description/office-365-education)
- [Microsoft 365 Copilot for Education](https://learn.microsoft.com/microsoft-365-copilot/microsoft-365-copilot-education)
- [Academic eligibility](https://www.microsoft.com/education/how-to-buy/academic-eligibility)

## Government (GCC / GCC High / DoD) coverage

Microsoft 365 for US public sector is split across three sovereign clouds.
Eligibility, data residency, accreditation, and feature parity differ from
commercial — **always validate before buying**.

| Cloud | Audience | Accreditation | Feature parity vs. commercial |
| --- | --- | --- | --- |
| **GCC** | US federal / state / local / tribal governments and their contractors handling CUI (non-ITAR) | FedRAMP High | Closest parity. Most workloads available with only minor deltas. |
| **GCC High** | DIB / DFARS 7012 / ITAR / EAR / CMMC L2+ organizations | FedRAMP High + DoD IL4 / IL5 | Reduced. Confirm Copilot, Entra Suite, Defender XDR, Purview Premium availability. |
| **DoD** | US Department of Defense exclusively | DoD IL5 (IL6 separate) | Most restricted. Validate every workload with the Microsoft FedCiv account team. |

Government SKUs mirror commercial: **M365 G1 / G3 / G5** ≈ commercial E1 / E3
/ E5, with **F1 / F3 Government** for frontline. Education-equivalent A SKUs
exist for qualifying US public-sector academic institutions.

Cross-tenant collaboration with commercial M365 tenants is restricted in
GCC High / DoD — plan B2B / cross-cloud trust and Teams external access
carefully.

Always verify before purchase:

1. Copilot availability in your cloud
2. Defender XDR feature parity
3. Entra Suite / Global Secure Access availability
4. Purview Premium eDiscovery, Customer Lockbox, Customer Key availability
5. Teams Phone Calling Plan availability per region

**Microsoft Learn references:**

- [Microsoft 365 Government — overview & plans](https://learn.microsoft.com/microsoft-365/enterprise/microsoft-365-us-government)
- [Compare Microsoft 365 Government plans (GCC / GCC High / DoD)](https://www.microsoft.com/microsoft-365/government)
- [GCC vs GCC High vs DoD feature differences](https://learn.microsoft.com/microsoft-365/enterprise/microsoft-365-us-government-gcc-high)
- [Microsoft Defender for Government](https://learn.microsoft.com/defender-xdr/usgov)
- [Microsoft Purview for US Government](https://learn.microsoft.com/purview/purview-fairfax)
- [Microsoft 365 Copilot for Government](https://learn.microsoft.com/microsoft-365-copilot/microsoft-365-copilot-government)

## Nonprofit coverage

Microsoft Nonprofits offers two flavors of pricing to qualifying charitable
organizations: a **grant tier** (free, capped seats) and **Nonprofit Staff
Pricing** (discounted commercial SKUs, no seat cap). Eligibility is
validated annually — typically through TechSoup or an equivalent country
partner.

| Tier | Offer | Cap |
| --- | --- | --- |
| **Grant** | Microsoft 365 Business Premium at no cost | Up to 300 seats per validated nonprofit |
| **Nonprofit Staff Pricing — Business** | Discounted Business Basic / Standard / Premium | ≤ 300 seats |
| **Nonprofit Staff Pricing — Enterprise** | Discounted M365 E3 / E5 / F3 | No seat cap |

Eligibility rules (Microsoft Nonprofits): public-benefit / charitable /
nongovernmental organization with recognized legal status in its country
(e.g., 501(c)(3) in the US). **Excludes** governmental orgs, hospital
systems, schools / universities (use **Education** SKUs instead), and
political / advocacy organizations.

Add-ons (Copilot, Teams Phone, Power BI Premium, Defender Suite for
Business Premium) are NOT free under the grant — they're sold at Nonprofit
Staff Pricing rates.

**Microsoft Learn references:**

- [Microsoft for Nonprofits — products & pricing](https://www.microsoft.com/nonprofits)
- [Microsoft 365 Business Premium grant eligibility](https://learn.microsoft.com/microsoft-365/nonprofit/microsoft-365-business-premium-grant)
- [Microsoft Nonprofits eligibility guidelines](https://www.microsoft.com/nonprofits/eligibility)
- [Microsoft 365 for nonprofits — get started](https://learn.microsoft.com/microsoft-365/nonprofit/)

## Small / mid-size business (SMB) coverage

The **Microsoft 365 Business** family targets commercial organizations with
**no more than 300 seats**. At 301 seats Microsoft requires the tenant to
move to the Enterprise (E) family.

| Business tier | Includes | Doesn't include |
| --- | --- | --- |
| **Business Basic** | Exchange (50 GB), Teams, SharePoint, OneDrive, Office for the web | Desktop Office apps, Defender, Intune, Entra ID Premium |
| **Business Standard** | Basic + desktop Office (Word, Excel, PowerPoint, Outlook, OneNote), Bookings, Loop | Defender, Intune, Entra ID Premium, Purview |
| **Business Premium** | Standard + Defender for Business + Intune (MDM/MAM) + Entra ID P1 + Defender for Office 365 P1 + AIP P1 | Defender XDR, Defender for Endpoint P2, Purview E5, Entra ID P2 (use Defender Suite for Business Premium add-on) |

The hard 300-seat cap applies across **all** Business SKUs combined.
Mixing Business and Enterprise SKUs in one tenant is supported but messy —
some Enterprise-only features (Defender XDR, Purview E5, Entra ID P2)
won't apply to Business-licensed users.

Common upgrade paths: **Microsoft 365 Copilot Business**, **Microsoft
Defender Suite for Business Premium** (adds Entra ID P2 + Defender XDR +
Purview Suite), **Teams Phone with Calling Plan**.

**Microsoft Learn references:**

- [Compare Microsoft 365 Business plans (Basic / Standard / Premium)](https://www.microsoft.com/microsoft-365/business/compare-all-plans)
- [Microsoft 365 Business Premium overview](https://learn.microsoft.com/microsoft-365/business-premium/)
- [Microsoft 365 Business 300-seat limit and how to switch to Enterprise](https://learn.microsoft.com/microsoft-365/commerce/subscriptions/upgrade-to-different-plan)
- [Microsoft Defender Suite for Business Premium](https://learn.microsoft.com/defender-xdr/microsoft-defender-suite-for-business-premium)

## External ID / B2B guest coverage

Guests, partners, vendors, and contractors invited into your tenant are
licensed under **Entra External ID's Monthly Active Users (MAU)** model —
**not** a per-seat M365 license. Microsoft grants the first 50 000 MAU
free per tenant; beyond that, MAU are billed monthly.

| Tier | What it covers | Pricing |
| --- | --- | --- |
| **External ID — Basic** | B2B Collaboration (guest invite), B2B Direct Connect (Teams shared channels), basic sign-in / consent | Free up to 50 000 MAU |
| **External ID — Premium P1** | Group-based CA, self-service password reset, smart lockout, basic risk-based policies | Per MAU above the free tier |
| **External ID — Premium P2** | Identity Protection, PIM for external users, risk-based CA at MAU pricing | Per MAU above the free tier |
| **Verified ID for external users** | Issue and verify verifiable credentials for guests | Per MAU |
| **External ID for customers (CIAM)** | Customer-facing apps (sign-up, sign-in, social IdPs) — separate product from B2B | Per MAU, separate pricing page |

Guests **do not** need an M365 service license to consume Teams /
SharePoint resources shared with them — they ride on the inviting
tenant's licensed resources (subject to per-service guest-access caps).

Use **Entra ID Governance** access reviews + entitlement management to
expire stale guests automatically. Without governance, guest sprawl is a
real audit / data-exfil risk.

**Microsoft Learn references:**

- [Microsoft Entra External ID — overview](https://learn.microsoft.com/entra/external-id/external-identities-overview)
- [External ID pricing & billing model (MAU)](https://learn.microsoft.com/entra/external-id/external-identities-pricing)
- [B2B collaboration overview](https://learn.microsoft.com/entra/external-id/what-is-b2b)
- [B2B Direct Connect (shared channels)](https://learn.microsoft.com/entra/external-id/b2b-direct-connect-overview)
- [External ID for customers (CIAM)](https://learn.microsoft.com/entra/external-id/customers/overview-customers-ciam)
- [Govern guest access with access reviews](https://learn.microsoft.com/entra/id-governance/manage-guest-access-with-access-reviews)

## GitHub Actions

Two workflows ship with the repo:

| Workflow | Trigger | What it does |
| --- | --- | --- |
| [`deploy.yml`](.github/workflows/deploy.yml) | push to `main`, manual (`workflow_dispatch`) | Validates the decision tree, publishes the repo root to GitHub Pages via `actions/deploy-pages@v4`, then tags + publishes a CalVer GitHub Release (`vYYYY.MM.DD-N`). Use `[skip release]` in the commit message to skip the tag/release step. |
| [`lint.yml`](.github/workflows/lint.yml) | push + PR to `main`, manual (`workflow_dispatch`) | Runs **HTMLHint**, **markdownlint-cli2**, and **Lychee** link checker |

Configs:

- [`.htmlhintrc`](.htmlhintrc) — strict-ish HTMLHint rules (lowercase tags,
  doctype, quoted attrs, unique ids, required `alt` / `title`)
- [`.markdownlint.json`](.markdownlint.json) — relaxes line length and inline
  HTML so the badge table renders correctly

## Enable GitHub Pages

This repo deploys to a **GitHub Pages project site** under the owner's
`github.io` subdomain. The recommended (and default) URL is:

> **<https://billmcilhargey.github.io/m365-profiles/>**

Recommended GitHub subdomain strategy:

- Keep the canonical GitHub Pages host as `billmcilhargey.github.io`.
- Publish this project as a project site at
  `billmcilhargey.github.io/m365-profiles/`.
- If you later want a shorter branded URL, layer a custom domain on top,
  while keeping GitHub Pages as the origin.

That URL is wired into [`sitemap.xml`](sitemap.xml), [`robots.txt`](robots.txt),
the Open Graph `og:url` meta tag in [`index.html`](index.html), and the
"Live site" badge above. If you fork the repo under a different owner, search
and replace `billmcilhargey.github.io/m365-profiles` with your
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
git clone https://github.com/billmcilhargey/m365-profiles.git
cd m365-profiles
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
    deploy.yml                 Validate + GitHub Pages deploy + CalVer GitHub Release
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

Decision logic lives in the `TREE` object inside `index.html`. Every node is
one of: a **question** (yes/no), a **choice** (n-way picker), an **info**
screen (read-only), or a terminal **result**.

```js
const TREE = {
  intro_overview: {
    info: true,
    badge: "How M365 Profiles works",
    title: "...",
    paragraphs: ["..."],
    actions: [{ label: "Continue", target: "start_choice", tone: "primary" }]
  },
  start_choice: {
    choice: true,
    question: "Pick the identity profile...",
    choices: [
      { label: "Privileged admin", target: "result_primary_account", icon: "1" },
      // ...
    ]
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

To add a new branch to the **privileged-admin** sub-tree:

1. Add a new question node (`q_xxx`) with `eyebrow`, `question`, `help`,
   `yes`, and `no` edges.
2. Add the corresponding result node (`result_xxx`) with `result: true`.
3. Re-wire the `no` edge of an existing question to point at your new
   question.
4. Add a `tenantHint` entry for `result_xxx` covering each tenant baseline.
5. Run `node scripts/validate-tree.js` to confirm wiring.

To build out another profile (info worker, frontline, edu, gov, nonprofit,
SMB, External ID) into its own sub-tree:

1. Add question nodes (`q_<profile>_xxx`) chained off a new entry node.
2. Re-target the matching `start_choice` entry from the current
   `result_profile_<profile>` straight to your new entry question.
3. Validate.

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| `1`–`9` | Pick a profile on the profile picker (or activate the matching choice on any choice screen) |
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
