// Typed wrapper around the JS decision-tree data module + shared helpers.

import { TREE as RAW_TREE, START_NODE_ID, TOTAL_MAJOR_STEPS } from "@data/tree.js";

export type DocLink = [label: string, url: string];

export type StepMeta = {
  major: number;
  sub?: number;
  subTotal?: number;
  label: string;
  secondary?: boolean;
};

export type Tone = "primary" | "secondary" | "ghost" | "warning";

export type Choice = {
  label: string;
  sublabel?: string;
  icon?: string;
  tone?: Tone;
  value?: string;
  target?: string;
  href?: string;
};

export type Action = {
  label: string;
  target?: string;
  href?: string;
  tone?: Tone;
};

export type Rationale = { why?: string; yes?: string; no?: string };

export type TreeNode = {
  step?: StepMeta;
  question?: string;
  help?: string;
  helpLink?: { label: string; target: string };
  rationale?: Rationale;
  examples?: string[];
  techDocs?: DocLink[];
  docs?: DocLink[];
  paragraphs?: string[];
  choice?: true;
  choices?: Choice[];
  info?: true;
  badge?: string;
  badgeClass?: string;
  title?: string;
  sub?: string;
  bullets?: string[];
  actions?: Action[];
  result?: true;
  yes?: string;
  no?: string;
};

export type Tree = Record<string, TreeNode>;

export const TREE: Tree = RAW_TREE as unknown as Tree;

export { START_NODE_ID, TOTAL_MAJOR_STEPS };

/** Combined docs list for a node — `docs` takes precedence over `techDocs`. */
export function docsOf(node: TreeNode | undefined): DocLink[] {
  return node?.docs ?? node?.techDocs ?? [];
}

export function treeStats(tree: Tree = TREE) {
  const nodes = Object.values(tree);
  const nodeCount = nodes.length;
  const resultCount = nodes.filter((n) => n.result).length;
  const choiceCount = nodes.filter((n) => n.choice).length;
  const infoCount = nodes.filter((n) => n.info).length;
  const questionCount = nodes.filter((n) => !n.choice && !n.info && !n.result).length;
  const docCount = nodes.reduce(
    (acc, n) => acc + (n.techDocs?.length ?? 0) + (n.docs?.length ?? 0),
    0
  );
  return { nodeCount, resultCount, choiceCount, infoCount, questionCount, docCount };
}

// ---------------------------------------------------------------------------
// Profile map — graph traversal + outcome classification used by /profiles.
// Mirrors the edge enumeration in scripts/validate-tree.js so the map and the
// CI validator agree on what "reachable from a profile" means.
// ---------------------------------------------------------------------------

/**
 * Upstream "router" nodes that every profile flows back into via "← Back to
 * profile selector" buttons. Following them during profile-scoped traversal
 * would cross-contaminate every profile with every other profile's results.
 */
const PROFILE_TRAVERSAL_STOPS = new Set(["start_tenant", "start_choice", "gov_cloud"]);

function outgoingTargets(node: TreeNode | undefined, forProfileScope = false): string[] {
  if (!node) return [];
  // Result nodes are terminal in the recommendation flow — their `actions` are
  // pure "← Back to …" navigation, not part of the decision path.
  if (forProfileScope && node.result) return [];

  const out: string[] = [];
  if (node.choice && node.choices) {
    for (const c of node.choices) if (c.target) out.push(c.target);
    if (node.helpLink?.target) out.push(node.helpLink.target);
  } else if ((node.info || node.result) && node.actions) {
    for (const a of node.actions) if (a.target) out.push(a.target);
  } else {
    if (node.yes) out.push(node.yes);
    if (node.no) out.push(node.no);
  }
  return forProfileScope ? out.filter((t) => !PROFILE_TRAVERSAL_STOPS.has(t)) : out;
}

/** All node ids reachable from `entryId` (BFS, includes entryId). */
export function reachableFrom(entryId: string, tree: Tree = TREE): Set<string> {
  const seen = new Set<string>();
  const queue = [entryId];
  while (queue.length) {
    const id = queue.shift()!;
    if (seen.has(id) || !tree[id]) continue;
    seen.add(id);
    for (const t of outgoingTargets(tree[id], true)) queue.push(t);
  }
  return seen;
}

/** All result-node ids reachable from `entryId`, in insertion order of the tree. */
export function reachableResults(entryId: string, tree: Tree = TREE): string[] {
  const reach = reachableFrom(entryId, tree);
  return Object.keys(tree).filter((id) => reach.has(id) && tree[id]?.result);
}

export type Profile = {
  key: string;
  label: string;
  sublabel?: string;
  icon?: string;
  tone?: Tone;
  /** Tree node the assessment jumps to when this profile is picked. */
  entry: string;
  /** Result ids reachable from this profile entry. */
  results: string[];
};

const PROFILE_KEY_BY_TARGET: Record<string, string> = {
  start: "admin",
  result_primary_account: "primary_account",
  q_iw_security: "iw",
  q_frontline_mailbox: "frontline",
  q_edu_security: "edu",
  q_gov_profile_cloud: "gov",
  q_npo_seats: "npo",
  q_smb_office: "smb",
  q_extid_features: "extid",
};

/** Profiles derived from the `start_choice` node — the canonical profile list. */
export const PROFILES: Profile[] = (() => {
  const startChoice = TREE["start_choice"];
  if (!startChoice?.choices) return [];
  const out: Profile[] = [];
  for (const c of startChoice.choices) {
    if (!c.target) continue;
    const key = PROFILE_KEY_BY_TARGET[c.target];
    if (!key) continue;
    out.push({
      key,
      label: c.label,
      sublabel: c.sublabel,
      icon: c.icon,
      tone: c.tone,
      entry: c.target,
      results: reachableResults(c.target),
    });
  }
  return out;
})();

export type Outcome = {
  key: string;
  label: string;
  short: string;
  /** One-line plain-English description for the matrix legend. */
  desc: string;
};

/** Capability buckets that appear as columns in the profile-outcome matrix. */
export const OUTCOMES: Outcome[] = [
  {
    key: "p2",
    label: "Entra ID P2",
    short: "Entra P2",
    desc: "PIM, Identity Protection, risk-based Conditional Access.",
  },
  {
    key: "governance",
    label: "Entra ID Governance",
    short: "Governance",
    desc: "Entitlement Management access packages, Lifecycle Workflows.",
  },
  {
    key: "entra_suite",
    label: "Entra Suite",
    short: "Entra Suite",
    desc: "Global Secure Access (Internet + Private) and Verified ID.",
  },
  {
    key: "defender",
    label: "Defender XDR / Suite",
    short: "Defender",
    desc: "Defender XDR, Endpoint P2, Identity, Cloud Apps, Office P2.",
  },
  {
    key: "purview",
    label: "Purview E5",
    short: "Purview",
    desc: "Insider Risk, Communication Compliance, eDiscovery Premium.",
  },
  {
    key: "intune_suite",
    label: "Intune Suite",
    short: "Intune+",
    desc: "EPM, Cloud PKI, Enterprise App Mgmt, Remote Help, Tunnel.",
  },
  {
    key: "teams_premium",
    label: "Teams Premium",
    short: "Teams+",
    desc: "Advanced webinars, town halls, intelligent recap, branded meetings.",
  },
  {
    key: "copilot",
    label: "Microsoft 365 Copilot",
    short: "Copilot",
    desc: "Copilot in Office, Teams, and Copilot Chat.",
  },
  {
    key: "frontier",
    label: "E7 (Frontier Suite)",
    short: "E7",
    desc: "E5 + Copilot + Entra Suite + Agent 365 in one SKU.",
  },
];

const OUTCOME_PATTERNS: Record<string, RegExp> = {
  p2: /\bentra (id )?p2\b|\bp2\b|privileged identity management|\bpim\b|identity protection/i,
  governance: /entra (id )?governance|lifecycle workflows|entitlement management/i,
  entra_suite:
    /entra suite|global secure access|\bgsa\b|verified id|internet access|private access/i,
  defender:
    /defender xdr|defender suite|defender for identity|defender for cloud apps|defender for endpoint p2|defender for office p2/i,
  purview:
    /purview e5|purview suite|insider risk|communication compliance|advanced ediscovery|ediscovery premium|customer lockbox/i,
  intune_suite:
    /intune suite|endpoint privilege management|\bepm\b|cloud pki|enterprise app management|microsoft tunnel|remote help|advanced endpoint analytics|\baea\b/i,
  teams_premium: /teams premium/i,
  copilot: /\bcopilot\b(?!\s+studio)/i,
  frontier: /\be7\b|frontier suite/i,
};

function resultHaystack(node: TreeNode | undefined): string {
  if (!node) return "";
  const parts: string[] = [];
  if (node.title) parts.push(node.title);
  if (node.sub) parts.push(node.sub);
  if (node.badge) parts.push(node.badge);
  // Some result nodes carry an extra `license` string — capture it loosely
  // via index-signature access without changing the public TreeNode type.
  const license = (node as unknown as { license?: string }).license;
  if (license) parts.push(license);
  // Deliberately exclude `bullets` and `decisionBasis`: those mention upsell
  // paths ("add Copilot later", "step up to E5"), which would otherwise tag
  // a baseline E3 result with the Copilot bucket.
  return parts.join("\n");
}

/** Which outcome buckets does a single result node belong to? */
export function classifyResult(id: string, tree: Tree = TREE): string[] {
  const node = tree[id];
  if (!node?.result) return [];
  const hay = resultHaystack(node);
  const out: string[] = [];
  for (const o of OUTCOMES) {
    const pattern = OUTCOME_PATTERNS[o.key];
    if (pattern && pattern.test(hay)) out.push(o.key);
  }
  return out;
}

/**
 * Build the profile × outcome matrix. For every (profile, outcome) cell, list
 * the result ids reachable from the profile that match the outcome bucket. An
 * empty array means the profile path never lands on that capability.
 */
export function buildProfileOutcomeMatrix(tree: Tree = TREE): Map<string, Map<string, string[]>> {
  const matrix = new Map<string, Map<string, string[]>>();
  for (const profile of PROFILES) {
    const row = new Map<string, string[]>();
    for (const outcome of OUTCOMES) row.set(outcome.key, []);
    for (const resultId of profile.results) {
      for (const outcomeKey of classifyResult(resultId, tree)) {
        row.get(outcomeKey)!.push(resultId);
      }
    }
    matrix.set(profile.key, row);
  }
  return matrix;
}
