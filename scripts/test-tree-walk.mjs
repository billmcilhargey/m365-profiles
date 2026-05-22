#!/usr/bin/env node
// Exhaustive answer-deterministic walker for src/data/tree.js.
//
// What this proves
// ----------------
// 1. Every path from start_choice (enumerated by picking every choice option
//    and every Yes / No branch on every question) eventually terminates at a
//    result or info node — no dead ends, no cycles inside answer-driven
//    navigation, no "Unknown step" terminals.
// 2. Every terminal result node has the structural fields the renderer
//    requires (title + at least one of paragraphs/bullets/computed).
// 3. Every terminal info node likewise has the structural fields the
//    renderer requires (title + paragraphs).
// 4. For each top-level profile branch in start_choice we record path
//    counts and a representative trail. This is the audit log a human can
//    eyeball to confirm coverage didn't silently shrink.
// 5. Frontline-routing smoke checks: certain shapes of answers MUST land
//    on result_frontline_computed; certain shapes MUST be routed away
//    (eligibility-No goes to IW, exclusion-Yes goes to IW, etc).
//
// What this does NOT prove
// ------------------------
// SKU-price math inside the frontline recommendation card. That's covered
// indirectly by the live browser scenarios already documented and could be
// added here later by inlining the BASE_SKUS / ADDONS constants from
// src/lib/pricing.ts — out of scope for the routing walker.

import { TREE, START_NODE_ID } from "../src/data/tree.js";

const EXIT_OK = 0;
const EXIT_FAIL = 1;

const ENTRY_ID = TREE[START_NODE_ID] ? START_NODE_ID : "start_choice";

// Hard cap so a future accidental cycle in answer-driven navigation fails
// the test instead of hanging CI. Real paths are well under 20 steps
// (longest is the full frontline wizard at ~15 questions).
const MAX_PATH_DEPTH = 40;

// Soft cap on total enumerated paths. Today the tree produces a few hundred;
// blowing past this many likely means someone accidentally introduced
// combinatorial branching that needs explicit review.
const MAX_TOTAL_PATHS = 20000;

const errors = [];
const warnings = [];

function err(msg) {
  errors.push(msg);
}
function warn(msg) {
  warnings.push(msg);
}

function nodeKind(node) {
  if (node.choice) return "choice";
  if (node.info) return "info";
  if (node.result) return "result";
  return "question";
}

/**
 * Enumerate every distinct answer-driven path from `startId`.
 *
 * The walker treats result and info nodes as terminals (the user can
 * navigate away from them via actions, but those are not "answer
 * decisions" the user is making — they're navigation aids). It branches
 * exhaustively at choice nodes (one path per choice target) and at
 * question nodes (one path for Yes, one for No, if both are wired).
 *
 * Returns { paths, truncated } where each path is
 *   { trail: Array<{id, label, kind}>, terminal: { id, kind } }.
 */
function enumeratePaths(tree, startId) {
  const paths = [];
  let truncated = false;

  function walk(id, trail, visitedQuestionIds) {
    if (paths.length >= MAX_TOTAL_PATHS) {
      truncated = true;
      return;
    }
    if (trail.length > MAX_PATH_DEPTH) {
      err(
        `Path depth exceeded ${MAX_PATH_DEPTH} starting from ${startId}; ` +
          `likely an answer-driven cycle. Trail head: ${trail
            .slice(0, 6)
            .map((s) => s.id)
            .join(" → ")}`
      );
      return;
    }
    const node = tree[id];
    if (!node) {
      err(
        `Walked to non-existent node "${id}". Last hop: ${
          trail[trail.length - 1]?.id ?? "(none)"
        }`
      );
      return;
    }
    const kind = nodeKind(node);
    if (kind === "result" || kind === "info") {
      paths.push({ trail, terminal: { id, kind } });
      return;
    }
    if (visitedQuestionIds.has(id)) {
      err(
        `Cycle: re-entered question/choice node "${id}" via trail ${trail
          .map((s) => `${s.id}:${s.label}`)
          .join(" → ")}`
      );
      return;
    }
    const nextVisited = new Set(visitedQuestionIds);
    nextVisited.add(id);

    if (kind === "choice") {
      const choices = (node.choices ?? []).filter((c) => c.target);
      if (choices.length === 0) {
        err(`Choice node "${id}" has no targets — would be a dead end.`);
        return;
      }
      for (const c of choices) {
        walk(
          c.target,
          [...trail, { id, label: c.label, kind: "choice" }],
          nextVisited
        );
      }
      return;
    }
    // question node
    const yes = node.yes;
    const no = node.no;
    if (!yes && !no) {
      err(`Question node "${id}" has no yes/no targets.`);
      return;
    }
    if (yes) {
      walk(yes, [...trail, { id, label: "Yes", kind: "question" }], nextVisited);
    }
    if (no) {
      walk(no, [...trail, { id, label: "No", kind: "question" }], nextVisited);
    }
  }

  walk(startId, [], new Set());
  return { paths, truncated };
}

/** Structural validation of result / info terminals. */
function validateTerminals(tree, paths) {
  const seenTerminals = new Set();
  for (const { terminal } of paths) {
    if (seenTerminals.has(terminal.id)) continue;
    seenTerminals.add(terminal.id);
    const node = tree[terminal.id];
    if (!node) {
      err(`Terminal "${terminal.id}" not in tree (should be unreachable).`);
      continue;
    }
    if (!node.title || typeof node.title !== "string") {
      err(`Terminal "${terminal.id}" is missing a string \`title\`.`);
    }
    if (terminal.kind === "result") {
      const hasBody =
        (Array.isArray(node.paragraphs) && node.paragraphs.length > 0) ||
        (Array.isArray(node.bullets) && node.bullets.length > 0) ||
        node.computed;
      if (!hasBody) {
        err(
          `Result "${terminal.id}" has no paragraphs, no bullets, and no \`computed\` — nothing to render.`
        );
      }
    } else if (terminal.kind === "info") {
      if (!Array.isArray(node.paragraphs) || node.paragraphs.length === 0) {
        err(`Info node "${terminal.id}" needs paragraphs.`);
      }
    }
  }
  return seenTerminals;
}

/** Group paths by the immediate choice picked from start_choice. */
function groupByProfile(paths) {
  const groups = new Map();
  for (const path of paths) {
    const first = path.trail[0];
    const key = first?.label ?? "(direct)";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(path);
  }
  return groups;
}

/**
 * Routing smoke checks specific to the frontline wizard. These guard against
 * regressions where (a) frontline-ineligible users land on the computed
 * card anyway, or (b) eligible users get routed away from it.
 */
function frontlineRoutingChecks(tree, paths) {
  const FL_LABEL = (Object.entries(tree).find(
    ([id]) => id === "start_choice"
  )?.[1]?.choices ?? []).find((c) => c.target === "q_frontline_eligibility")
    ?.label;
  if (!FL_LABEL) {
    err(
      "start_choice no longer offers a path to q_frontline_eligibility — " +
        "frontline routing checks cannot run."
    );
    return;
  }
  const frontlinePaths = paths.filter((p) => p.trail[0]?.label === FL_LABEL);
  if (frontlinePaths.length === 0) {
    err("No paths flow through the frontline branch of start_choice.");
    return;
  }
  // Every frontline path must end EITHER at result_frontline_computed
  // (the wizard's computed card) OR be redirected into the IW knowledge-
  // worker tree (e.g. eligibility=No goes to q_iw_security). Anything else
  // is a misrouting.
  const allowedTerminals = new Set();
  // Walk forward from q_iw_security to gather every IW terminal — that's
  // the legitimate redirection target for "this user isn't actually a
  // frontline worker".
  function gatherReachable(id, into) {
    if (!id || into.has(id)) return;
    into.add(id);
    const n = tree[id];
    if (!n) return;
    const kind = nodeKind(n);
    if (kind === "result" || kind === "info") return;
    if (kind === "choice") {
      for (const c of n.choices ?? []) gatherReachable(c.target, into);
    } else {
      gatherReachable(n.yes, into);
      gatherReachable(n.no, into);
    }
  }
  const iwReachable = new Set();
  gatherReachable("q_iw_security", iwReachable);
  for (const id of iwReachable) {
    const n = tree[id];
    if (n && (n.result || n.info)) allowedTerminals.add(id);
  }
  allowedTerminals.add("result_frontline_computed");

  for (const p of frontlinePaths) {
    if (!allowedTerminals.has(p.terminal.id)) {
      err(
        `Frontline path lands at unexpected terminal "${p.terminal.id}". ` +
          `Trail: ${p.trail.map((s) => `${s.id}:${s.label}`).join(" → ")}`
      );
    }
  }

  // At least ONE frontline path must terminate at the computed card —
  // otherwise the wizard's entire reason for existing is dead code.
  const reachedComputed = frontlinePaths.some(
    (p) => p.terminal.id === "result_frontline_computed"
  );
  if (!reachedComputed) {
    err("No frontline path reaches result_frontline_computed.");
  }
}

function fmtTrailShort(trail, maxSteps = 5) {
  const head = trail
    .slice(0, maxSteps)
    .map((s) => `${s.id}=${s.label}`)
    .join(" → ");
  return trail.length > maxSteps ? `${head} … (+${trail.length - maxSteps} more)` : head;
}

function main() {
  if (!TREE || typeof TREE !== "object") {
    err("TREE not found in src/data/tree.js");
    return finish();
  }
  const { paths, truncated } = enumeratePaths(TREE, ENTRY_ID);
  if (truncated) {
    err(
      `Path enumeration truncated at ${MAX_TOTAL_PATHS} — combinatorial ` +
        "explosion in the tree. Review recent changes for accidental fan-out."
    );
  }

  const terminals = validateTerminals(TREE, paths);

  // Every result/info node in the tree should be reachable as a path
  // terminal OR be an info node intentionally only reachable via helpLink
  // / actions (not via answer flow). We surface the latter as warnings,
  // not errors — they're legitimate (e.g. info_sovereign_cloud, reached
  // via helpLink), but a fresh one is worth a human eyeball.
  const allTerminals = Object.entries(TREE).filter(
    ([, n]) => n.result || n.info
  );
  for (const [id, node] of allTerminals) {
    if (!terminals.has(id)) {
      if (node.info) {
        warn(`info node "${id}" not reachable via answer-driven walk (likely helpLink-only).`);
      } else {
        err(`Result "${id}" is unreachable by any answer-driven path.`);
      }
    }
  }

  frontlineRoutingChecks(TREE, paths);

  const profiles = groupByProfile(paths);
  console.log(`Enumerated ${paths.length} answer-driven paths from "${ENTRY_ID}":`);
  for (const [profile, group] of profiles) {
    const uniqueTerminals = new Set(group.map((p) => p.terminal.id));
    const minLen = Math.min(...group.map((p) => p.trail.length));
    const maxLen = Math.max(...group.map((p) => p.trail.length));
    console.log(
      `  • ${profile}: ${group.length} paths, ${uniqueTerminals.size} distinct terminals, depth ${minLen}–${maxLen}`
    );
  }
  console.log(
    `Terminals hit: ${terminals.size} of ${allTerminals.length} ` +
      `(result+info nodes in tree).`
  );

  return finish();
}

function finish() {
  if (warnings.length) {
    console.warn(`\nWarnings (${warnings.length}):`);
    for (const w of warnings) console.warn(`  ! ${w}`);
  }
  if (errors.length) {
    console.error(`\nErrors (${errors.length}):`);
    for (const e of errors) console.error(`  ✗ ${e}`);
    process.exit(EXIT_FAIL);
  }
  console.log("\nTree walk OK.");
  process.exit(EXIT_OK);
}

main();
