const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const m = html.match(/const TREE = (\{[\s\S]*?\});\s*\n\s*\/\/ Only question nodes/);
if (!m) { console.error('TREE not found'); process.exit(1); }
const TREE = eval('(' + m[1] + ')');
const ids = new Set(Object.keys(TREE));
let ok = true;

// Validate edges based on node type.
for (const [id, n] of Object.entries(TREE)) {
  if (n.choice) {
    for (const c of (n.choices || [])) {
      if (!ids.has(c.target)) { console.error('Broken choice edge:', id, '->', c.label, '->', c.target); ok = false; }
    }
    continue;
  }
  if (n.info) {
    for (const a of (n.actions || [])) {
      if (!ids.has(a.target)) { console.error('Broken info action edge:', id, '->', a.label, '->', a.target); ok = false; }
    }
    continue;
  }
  if (n.result) {
    // Results may have optional custom actions.
    for (const a of (n.actions || [])) {
      if (!ids.has(a.target)) { console.error('Broken result action edge:', id, '->', a.label, '->', a.target); ok = false; }
    }
    continue;
  }
  // Default: yes/no question.
  for (const ans of ['yes', 'no']) {
    if (!ids.has(n[ans])) { console.error('Broken edge:', id, '->', ans, '->', n[ans]); ok = false; }
  }
}

// Reachability — start from the configured entry node and follow every kind of edge.
const reachable = new Set();
const entryId = ids.has('intro_overview') ? 'intro_overview' : 'start_choice';
(function walk(id) {
  if (!id || reachable.has(id)) return;
  reachable.add(id);
  const n = TREE[id];
  if (!n) return;
  if (n.choice) { for (const c of (n.choices || [])) walk(c.target); return; }
  if (n.info)   { for (const a of (n.actions || [])) walk(a.target); return; }
  if (n.result) { for (const a of (n.actions || [])) walk(a.target); return; }
  walk(n.yes); walk(n.no);
})(entryId);

for (const id of ids) if (!reachable.has(id)) { console.error('Unreachable:', id); ok = false; }

const questions = Object.values(TREE).filter(n => !n.result && !n.choice && !n.info).length;
const choices   = Object.values(TREE).filter(n => n.choice).length;
const infos     = Object.values(TREE).filter(n => n.info).length;
const results   = Object.values(TREE).filter(n => n.result).length;
console.log(
  'Questions:', questions,
  '| Choice:', choices,
  '| Info:', infos,
  '| Results:', results,
  '| Reachable:', reachable.size, '/', ids.size,
  '| Wiring OK:', ok
);
if (!ok) process.exit(1);
