#!/usr/bin/env node
/**
 * validate-tree.js
 * -----------------------------------------------------------------------------
 * Sanity-check the decision-tree definition embedded in index.html.
 *
 * The site is a single-file SPA: the TREE object lives inline in index.html
 * between `const TREE = { ... };` and a `// Only question nodes` sentinel
 * comment. This script extracts that object, validates every edge resolves
 * to a real node id, checks reachability from the configured entry node, and
 * prints a one-line summary suitable for CI logs.
 *
 * Run locally:
 *   node scripts/validate-tree.js
 *
 * Exits 1 on any broken edge or unreachable node so CI fails loudly.
 * -----------------------------------------------------------------------------
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Configuration — adjust these if the SPA's TREE shape or location changes.
// ---------------------------------------------------------------------------

/** Path (relative to repo root) to the file that contains the TREE literal. */
const SOURCE_FILE = 'index.html';

/**
 * Regex that captures the TREE object literal. The trailing sentinel comment
 * must remain in index.html — it bounds the match so we don't slurp the rest
 * of the script.
 */
const TREE_REGEX = /const TREE = (\{[\s\S]*?\});\s*\n\s*\/\/ Only question nodes/;

/**
 * Candidate entry nodes, in priority order. The first one that exists in TREE
 * becomes the reachability root. `start_tenant` is the runtime entry (tenant
 * baseline picker, step 1). `start_choice` is kept as a fallback in case the
 * tenant step is removed; `intro_overview` is a historical option.
 */
const ENTRY_NODE_CANDIDATES = ['start_tenant', 'intro_overview', 'start_choice'];

/** Process exit codes. */
const EXIT_OK = 0;
const EXIT_BROKEN_WIRING = 1;
const EXIT_TREE_NOT_FOUND = 2;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Load the TREE object from index.html by regex-extract + eval. Eval is safe
 * here because the source is repo-controlled and only runs in CI / dev.
 */
function loadTree(filePath) {
  const html = fs.readFileSync(filePath, 'utf8');
  const match = html.match(TREE_REGEX);
  if (!match) {
    console.error(`TREE literal not found in ${filePath}`);
    process.exit(EXIT_TREE_NOT_FOUND);
  }
  // eslint-disable-next-line no-eval
  return eval('(' + match[1] + ')');
}

/**
 * Classify a node by its shape. Order matters: choice / info / result are
 * explicit flags; anything else is a yes/no question.
 */
function nodeKind(node) {
  if (node.choice) return 'choice';
  if (node.info)   return 'info';
  if (node.result) return 'result';
  return 'question';
}

/**
 * Return every outgoing edge from a node as `{ label, target }` objects. This
 * is the single source of truth for "what does this node point at?" — both
 * the wiring check and the reachability walk consume it.
 */
function outgoingEdges(node) {
  switch (nodeKind(node)) {
    case 'choice': {
      // Choices may carry an internal `target` (next node id) or an external
      // `href` (opens in a new tab). Only internal targets count as edges.
      const edges = (node.choices || [])
        .filter(c => c.target)
        .map(c => ({ label: c.label, target: c.target }));
      // `helpLink` is an inline "Learn more →" affordance rendered below the
      // question help text; treat it as an outgoing edge for reachability.
      if (node.helpLink && node.helpLink.target) {
        edges.push({ label: 'helpLink', target: node.helpLink.target });
      }
      return edges;
    }
    case 'info':
    case 'result':
      // Result nodes only have edges if they define custom actions.
      return (node.actions || []).map(a => ({ label: a.label, target: a.target }));
    case 'question':
      return [
        { label: 'yes', target: node.yes },
        { label: 'no',  target: node.no  },
      ];
    default:
      return [];
  }
}

/** Check every edge resolves to a known id. Logs each broken edge. */
function checkWiring(tree, ids) {
  let ok = true;
  for (const [id, node] of Object.entries(tree)) {
    for (const edge of outgoingEdges(node)) {
      if (!ids.has(edge.target)) {
        console.error(`Broken edge: ${id} -> ${edge.label} -> ${edge.target}`);
        ok = false;
      }
    }
  }
  return ok;
}

/** Walk all edges from `entryId` and return the set of reachable node ids. */
function reachableFrom(tree, entryId) {
  const seen = new Set();
  (function walk(id) {
    if (!id || seen.has(id)) return;
    if (!tree[id]) return;
    seen.add(id);
    for (const edge of outgoingEdges(tree[id])) walk(edge.target);
  })(entryId);
  return seen;
}

/** Pick the first available entry node from the configured candidates. */
function pickEntry(ids) {
  for (const candidate of ENTRY_NODE_CANDIDATES) {
    if (ids.has(candidate)) return candidate;
  }
  return null;
}

/** Tally nodes by kind for the summary line. */
function summarize(tree) {
  const counts = { question: 0, choice: 0, info: 0, result: 0 };
  for (const node of Object.values(tree)) counts[nodeKind(node)]++;
  return counts;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const tree = loadTree(path.resolve(SOURCE_FILE));
  const ids = new Set(Object.keys(tree));

  let ok = checkWiring(tree, ids);

  const entryId = pickEntry(ids);
  if (!entryId) {
    console.error(`No entry node found. Expected one of: ${ENTRY_NODE_CANDIDATES.join(', ')}`);
    ok = false;
  }

  const reachable = entryId ? reachableFrom(tree, entryId) : new Set();
  for (const id of ids) {
    if (!reachable.has(id)) {
      console.error(`Unreachable: ${id}`);
      ok = false;
    }
  }

  const counts = summarize(tree);
  console.log(
    'Questions:', counts.question,
    '| Choice:',  counts.choice,
    '| Info:',    counts.info,
    '| Results:', counts.result,
    '| Reachable:', reachable.size, '/', ids.size,
    '| Wiring OK:', ok
  );

  process.exit(ok ? EXIT_OK : EXIT_BROKEN_WIRING);
}

main();
