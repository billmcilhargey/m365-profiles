// Microsoft 365 list prices — shared pricing catalog for the assessment.
//
// Single source of truth for per-user / month list prices across the SKU
// families recommended by the decision tree: Enterprise (E3, E5),
// Frontline (F1, F3), Business (Basic, Standard, Premium), plus the
// identity, security, compliance, endpoint, productivity, and AI add-ons
// that profile branches surface.
//
// Powers the frontline qualification wizard's "F + add-ons vs. E uplift"
// calculator today, and is the place any new pricing-aware UI should reach
// for SKU metadata (display name, list price, source citation, category).
//
// All values below are publicly published Microsoft list prices, USD, per
// user / month, on annual commitment (the most common purchasing motion).
// CSP / EA / volume / promo / partner-specific pricing always differs — the
// wizard surfaces a banner that says "verify with your Microsoft account
// team before purchase" in the result card.
//
// SKUs that don't fit a flat per-user / month list-price model on purpose
// live in the decision tree's result nodes instead of here:
//   • Microsoft 365 E7 (Frontier Suite) — bundled pricing, confirm with
//     account team (referenced from result_e7_full).
//   • Education (A1 / A3 / A5) — faculty vs. student SKUs price separately.
//   • Government (G1 / G3 / G5, IL5 / IL6 Air-Gapped) — varies by sovereign
//     cloud (GCC, GCC High, DoD).
//   • Nonprofit (NSP / grants) — first 10 seats free + NSP discount tier.
//   • Microsoft Entra External ID (B2B, P2, Verified ID, CIAM) — MAU-based.
//   • Workload Identities Premium — per workload identity, not per user.
//
// Last reviewed: 2026-05. When updating prices, bump PRICING_LAST_VERIFIED
// so the disclaimer renders the new date.

import { SOURCES } from "./sources.js";

export const PRICING_LAST_VERIFIED = "2026-05";

// Back-compat re-exports — these used to be declared locally in this file.
// Every existing import keeps working; new code should reach for SOURCES.
export const MICROSOFT_365_LICENSING_DOCS = SOURCES.LICENSING_DOCS_HUB;
export const MICROSOFT_365_ENTERPRISE_PRICING = SOURCES.ENTERPRISE_PRICING;
export const MICROSOFT_365_FRONTLINE_PRICING = SOURCES.FRONTLINE_PRICING;
export const MODERN_WORK_PLAN_COMPARISON = SOURCES.MODERN_WORK_PLAN_COMPARISON;
export const EXCHANGE_ONLINE_LIMITS = SOURCES.EXCHANGE_ONLINE_LIMITS;

/**
 * Category discriminator — lets consumers filter the catalog (e.g. "show
 * me only Intune add-ons", "show me only Business-tier base SKUs"). The
 * frontline wizard reaches for specific keys directly (BASE_SKUS.f1,
 * ADDONS.teams_phone_frontline, etc.) and does not filter by category, so
 * adding more categorised entries here is safe.
 */
export type SkuCategory =
  | "frontline" // F1, F3 + add-ons specifically authorised on F SKUs
  | "enterprise" // E3, E5 (and other enterprise base plans)
  | "business" // M365 Business Basic / Standard / Premium (SMB, ≤300 seats)
  | "ai" // Microsoft 365 Copilot and other per-user AI add-ons
  | "identity" // Entra ID P1 / P2, Entra Suite, Entra ID Governance
  | "security" // Defender for Endpoint / Office / Suite
  | "compliance" // Purview E5 Compliance / Purview Suite
  | "endpoint" // Intune Suite + standalone Intune add-ons
  | "productivity"; // Teams Premium, Teams Enterprise add-on, Exchange Plan 2, Teams Phone

export type PriceItem = {
  /** Stable key — also used as the addon dedupe key in wizard state. */
  key: string;
  /** Display name shown in the result card. */
  name: string;
  /** USD per user per month, list, annual commitment. */
  cost: number;
  /** Public Microsoft source for the price / SKU. */
  source: { label: string; url: string };
  /** Short blurb shown under the line item in the breakdown. */
  note?: string;
  /** Optional category for filtering (see SkuCategory). */
  category?: SkuCategory;
};

/**
 * Base SKU list prices (per user / month, USD, annual commitment).
 *
 * The frontline wizard reaches for `.f1`, `.f3`, `.e3`, and `.e5` by name —
 * those four entries must remain. Additional entries are reference data
 * for any other pricing-aware UI; they can be filtered via `.category`.
 */
export const BASE_SKUS = {
  // ---- Frontline (F SKUs) -------------------------------------------------
  f1: {
    key: "f1",
    name: "Microsoft 365 F1",
    cost: 2.25,
    category: "frontline",
    source: SOURCES.FRONTLINE_PRICING,
    note: "Kiosk-grade frontline — Teams + SharePoint browse + Stream + Intune + Entra ID P1. No personal Exchange mailbox (Teams calendar / free-busy only); no Office authoring.",
  },
  f3: {
    key: "f3",
    name: "Microsoft 365 F3",
    cost: 8.0,
    category: "frontline",
    source: SOURCES.FRONTLINE_PRICING,
    note: "Full-featured frontline — 2 GB Exchange mailbox (no archive mailbox per the Exchange Online limits doc; Recoverable Items quota 30 GB / 100 GB on hold), Office web + mobile (<10.9″ devices), Teams, Intune, Defender for Office P1, AIP P1.",
  },
  // ---- Enterprise (E SKUs) ------------------------------------------------
  e3: {
    key: "e3",
    name: "Microsoft 365 E3",
    cost: 36.0,
    category: "enterprise",
    source: SOURCES.ENTERPRISE_PRICING,
    note: "Information-worker baseline — Exchange Online Plan 2 (100 GB primary mailbox + 100 GB → 1.5 TB auto-expanding archive), desktop Office, full Teams, Intune, Entra ID P1, Defender for Office P1, AIP P1, 1+ TB OneDrive.",
  },
  e5: {
    key: "e5",
    name: "Microsoft 365 E5",
    cost: 57.0,
    category: "enterprise",
    source: SOURCES.ENTERPRISE_PRICING,
    note: "E3 mailbox / archive (100 GB + 1.5 TB auto-expanding) + Defender XDR (P2 + Defender for Identity + Defender for Cloud Apps + Defender for Office P2), Purview E5 (IRM / Comm Compliance / eDiscovery Premium / Customer Lockbox), Entra ID P2 (PIM / Identity Protection / Governance), Power BI Pro, Teams Phone.",
  },
  // ---- Business (SMB, ≤300 seat hard cap across all Business SKUs) --------
  business_basic: {
    key: "business_basic",
    name: "Microsoft 365 Business Basic",
    cost: 6.0,
    category: "business",
    source: SOURCES.BUSINESS_COMPARE_PLANS,
    note: "Web + mobile Office, Exchange Online (50 GB mailbox), Teams, OneDrive (1 TB), SharePoint. No desktop Office apps; no Defender / Intune. 300-seat hard cap shared across all Business SKUs in the tenant.",
  },
  business_standard: {
    key: "business_standard",
    name: "Microsoft 365 Business Standard",
    cost: 12.5,
    category: "business",
    source: SOURCES.BUSINESS_COMPARE_PLANS,
    note: "Business Basic + desktop Office apps (Outlook, Word, Excel, PowerPoint) and webinar / Clipchamp tooling. Eligible base plan for Microsoft 365 Copilot. 300-seat cap.",
  },
  business_premium: {
    key: "business_premium",
    name: "Microsoft 365 Business Premium",
    cost: 22.0,
    category: "business",
    source: SOURCES.BUSINESS_COMPARE_PLANS,
    note: "Business Standard + Intune, Entra ID P1, Defender for Business, Defender for Office P1, AIP P1 — the SMB equivalent of E3-class security and management. 300-seat cap.",
  },
} as const satisfies Record<string, PriceItem>;

/**
 * Per-user add-on list prices (USD per user / month, annual commitment).
 *
 * The frontline wizard reaches for specific keys when the decision tree's
 * `addon: { key: "…" }` branches fire — those must remain stable:
 *   teams_phone_frontline, teams_enterprise_addon, exchange_online_p2,
 *   defender_endpoint_p1, defender_endpoint_p2, defender_office_p2,
 *   entra_id_p2, purview_dlp, copilot_m365.
 *
 * Additional entries are reference data for any other pricing-aware UI;
 * they can be filtered via `.category`.
 */
export const ADDONS: Record<string, PriceItem> = {
  // ---- Productivity (Teams / Exchange add-ons on top of F or E SKUs) ------
  teams_phone_frontline: {
    key: "teams_phone_frontline",
    name: "Teams Phone Standard for Frontline Workers",
    cost: 4.0,
    category: "productivity",
    source: SOURCES.TEAMS_ADDON_LICENSING,
    note: "Add-on specifically authorised for F1 / F3 users — pairs with a Calling Plan or Direct Routing for PSTN.",
  },
  teams_enterprise_addon: {
    key: "teams_enterprise_addon",
    name: "Teams Enterprise add-on",
    cost: 5.25,
    category: "productivity",
    source: SOURCES.TEAMS_2025_PACKAGING,
    note: "Enables town halls, webinars, full meeting features on top of an F SKU. Required for any large-audience meeting hosting.",
  },
  teams_premium: {
    key: "teams_premium",
    name: "Microsoft Teams Premium",
    cost: 10.0,
    category: "productivity",
    source: SOURCES.TEAMS_ADDON_LICENSING,
    note: "Advanced meetings (intelligent recap, meeting templates, watermarks, advanced webinars / town halls, real-time captions / translation, premium virtual appointments). Not bundled with E3, E5, or E7 — separate per-user add-on for organisers / attendees in scope.",
  },
  exchange_online_p2: {
    key: "exchange_online_p2",
    name: "Exchange Online Plan 2",
    cost: 8.0,
    category: "productivity",
    source: SOURCES.EXCHANGE_ONLINE_PLANS,
    note: "100 GB primary mailbox + 100 GB → 1.5 TB auto-expanding archive (per Exchange Online service-description limits) + DLP for email. Replaces the F3 mailbox (re-license to EOP2 — you don't stack F3's 2 GB mailbox).",
  },
  // ---- AI (Microsoft 365 Copilot family) ----------------------------------
  copilot_m365: {
    key: "copilot_m365",
    name: "Microsoft 365 Copilot",
    cost: 30.0,
    category: "ai",
    source: SOURCES.COPILOT_FOR_WORK,
    note: "Per-user add-on on top of an eligible base plan (E3 / E5 / Business Standard / Business Premium). Already bundled inside Microsoft 365 E7.",
  },
  // ---- Identity (Entra ID, Entra Suite, Entra ID Governance) -------------
  entra_id_p1: {
    key: "entra_id_p1",
    name: "Microsoft Entra ID P1",
    cost: 6.0,
    category: "identity",
    source: SOURCES.ENTRA_PRICING,
    note: "Conditional Access, group-based licensing, dynamic groups, self-service password reset with writeback, Entra Connect Health. Already included in F1 / F3 / E3 / E5 / Business Premium.",
  },
  entra_id_p2: {
    key: "entra_id_p2",
    name: "Microsoft Entra ID P2",
    cost: 9.0,
    category: "identity",
    source: SOURCES.ENTRA_PRICING,
    note: "Privileged Identity Management, risk-based Conditional Access, Identity Protection. P1 is already included in F1 / F3 / E3.",
  },
  entra_id_governance: {
    key: "entra_id_governance",
    name: "Microsoft Entra ID Governance",
    cost: 7.0,
    category: "identity",
    source: SOURCES.ENTRA_GOVERNANCE_FUNDAMENTALS,
    note: "Entitlement management, access reviews, lifecycle workflows. Includes Entra ID P2. Targets, approvers, and reviewers in a governance flow all need this (or Entra Suite, or M365 E7).",
  },
  entra_suite: {
    key: "entra_suite",
    name: "Microsoft Entra Suite",
    cost: 12.0,
    category: "identity",
    source: SOURCES.ENTRA_SUITE,
    note: "Bundles Entra ID P2 + Entra ID Governance + Global Secure Access (Internet Access + Private Access) + Entra Verified ID. Also included in M365 E7.",
  },
  // ---- Security (Defender for Endpoint / Office / Suite) ------------------
  defender_endpoint_p1: {
    key: "defender_endpoint_p1",
    name: "Microsoft Defender for Endpoint Plan 1",
    cost: 3.0,
    category: "security",
    source: SOURCES.DEFENDER_ENDPOINT_PLANS,
    note: "Next-gen AV + attack-surface reduction + manual response. The frontline-tier MDE is sold separately from M365 F SKUs.",
  },
  defender_endpoint_p2: {
    key: "defender_endpoint_p2",
    name: "Microsoft Defender for Endpoint Plan 2",
    cost: 5.2,
    category: "security",
    source: SOURCES.DEFENDER_ENDPOINT_PLANS,
    note: "Adds EDR, automated investigation/response, threat hunting, vulnerability management to P1.",
  },
  defender_office_p2: {
    key: "defender_office_p2",
    name: "Microsoft Defender for Office 365 Plan 2",
    cost: 5.0,
    category: "security",
    source: SOURCES.DEFENDER_OFFICE_365,
    note: "Adds Threat Explorer, Attack Simulation Training, Threat Trackers, and Campaign Views on top of the P1 capabilities included with F3.",
  },
  defender_suite: {
    key: "defender_suite",
    name: "Microsoft Defender Suite (E5 Security add-on)",
    cost: 12.0,
    category: "security",
    source: SOURCES.DEFENDER_XDR,
    note: "Bundles Defender XDR (Defender for Endpoint P2 + Defender for Identity + Defender for Cloud Apps + Defender for Office 365 P2) and Entra ID P2. Already bundled inside Microsoft 365 E5 / E7.",
  },
  // ---- Compliance (Purview Suite / E5 Compliance add-on) -----------------
  purview_dlp: {
    key: "purview_dlp",
    name: "Microsoft Purview Suite (M365 E5 Compliance add-on)",
    cost: 12.0,
    category: "compliance",
    source: SOURCES.PURVIEW_COMPLIANCE_PLANS,
    note: "Brings Purview DLP, IRM, Communication Compliance, eDiscovery Premium, Audit Premium, Customer Lockbox, Insider Risk Management. Already bundled inside Microsoft 365 E5 / E7. Frontline workers rarely qualify — usually a hard fail to E5.",
  },
  // ---- Endpoint (Intune Suite + standalone Intune add-ons) ----------------
  intune_suite: {
    key: "intune_suite",
    name: "Microsoft Intune Suite",
    cost: 10.0,
    category: "endpoint",
    source: SOURCES.INTUNE_ADDONS,
    note: "Bundles Endpoint Privilege Management + Remote Help + Microsoft Tunnel for MAM + Microsoft Cloud PKI + Enterprise App Management + Advanced Endpoint Analytics. Break-even is roughly two or more standalone add-ons per user.",
  },
  intune_epm: {
    key: "intune_epm",
    name: "Microsoft Intune Endpoint Privilege Management",
    cost: 3.0,
    category: "endpoint",
    source: SOURCES.INTUNE_EPM,
    note: "Just-in-time, file-elevation-based local admin rights for Windows endpoints. Standalone add-on; also bundled in the Intune Suite.",
  },
  intune_remote_help: {
    key: "intune_remote_help",
    name: "Microsoft Intune Remote Help",
    cost: 3.5,
    category: "endpoint",
    source: SOURCES.INTUNE_ADDONS,
    note: "Cloud-based, Entra-authenticated remote-assistance / screen-sharing for Intune-managed endpoints. License both helpdesk technicians AND end users in scope of assistance sessions. Standalone add-on; also bundled in the Intune Suite.",
  },
  intune_tunnel_mam: {
    key: "intune_tunnel_mam",
    name: "Microsoft Tunnel for Mobile Application Management",
    cost: 2.0,
    category: "endpoint",
    source: SOURCES.INTUNE_ADDONS,
    note: "Per-app VPN for unenrolled (BYOD) iOS / Android devices managed via MAM app-protection policies. Standalone add-on; also bundled in the Intune Suite.",
  },
  intune_cloud_pki: {
    key: "intune_cloud_pki",
    name: "Microsoft Cloud PKI",
    cost: 2.0,
    category: "endpoint",
    source: SOURCES.INTUNE_ADDONS,
    note: "Managed cloud certificate authority for Intune-managed devices — replaces on-premises Microsoft AD CS + NDES + Intune Connector. Standalone add-on; also bundled in the Intune Suite.",
  },
  intune_eam: {
    key: "intune_eam",
    name: "Microsoft Intune Enterprise App Management",
    cost: 2.0,
    category: "endpoint",
    source: SOURCES.INTUNE_ADDONS,
    note: "Curated, Microsoft-maintained Windows app catalog with auto-updates inside Intune (alternative to packaging Win32 apps manually). Standalone add-on; also bundled in the Intune Suite.",
  },
  intune_aea: {
    key: "intune_aea",
    name: "Microsoft Intune Advanced Endpoint Analytics",
    cost: 2.0,
    category: "endpoint",
    source: SOURCES.INTUNE_ADDONS,
    note: "Deeper device + user experience telemetry (anomaly detection, device timeline, custom scopes) on top of the baseline Endpoint Analytics included with Intune. Standalone add-on; also bundled in the Intune Suite.",
  },
};

/**
 * Hard-fail uplift policy — which feature gap forces which enterprise SKU.
 * Used by the wizard to roll up many "no, F can't do this" signals into the
 * single cheapest E recommendation that closes every gap.
 */
export type UpliftTarget = "e3" | "e5";

/** Pretty-print a USD price to 2 decimals with a leading $. */
export function formatPrice(usd: number): string {
  return `$${usd.toFixed(2)}`;
}
