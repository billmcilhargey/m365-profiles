// Card-based assessment renderer. Reads the tree from an inline JSON island
// on the Astro page; handles keyboard, history, copy, print, and lazy PDF.

import { APP_VERSION } from "../lib/version";
import { STORAGE_KEYS } from "../lib/site";
import { each, escapeHTML, h, when } from "../lib/dom";
import type { Action, DocLink, Rationale, StepMeta, Tone, Tree, TreeNode } from "../lib/tree";

type Config = { tree: Tree; startId: string; totalSteps: number };
type HistoryEntry = { id: string; label?: string };
type State = {
  currentId: string;
  history: HistoryEntry[];
  tenant?: string;
  profile?: string;
  version: string;
};

const toneBtn = (t?: Tone) =>
  t === "primary"
    ? "btn-primary"
    : t === "ghost"
      ? "btn-ghost"
      : t === "warning"
        ? "btn-danger"
        : "btn-secondary";

const docsOf = (n: TreeNode) => n.docs ?? n.techDocs ?? [];

const truncate = (s: string, max: number) => (s.length > max ? `${s.slice(0, max)}…` : s);

class Assessment {
  private readonly cfg: Config;
  private readonly root: HTMLElement;
  private state: State;

  constructor(root: HTMLElement, cfg: Config) {
    this.cfg = cfg;
    this.root = root;
    this.state = this.load() ?? { currentId: cfg.startId, history: [], version: APP_VERSION };
    this.render();
    document.addEventListener("keydown", (e) => this.onKey(e));
  }

  // ---------- State ----------
  private load(): State | null {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEYS.assessmentState);
      if (!raw) return null;
      const p = JSON.parse(raw) as Partial<State>;
      if (p?.currentId && this.cfg.tree[p.currentId] && p.version === APP_VERSION)
        return p as State;
    } catch {
      /* ignore */
    }
    return null;
  }

  private save(): void {
    try {
      sessionStorage.setItem(STORAGE_KEYS.assessmentState, JSON.stringify(this.state));
    } catch {
      /* ignore */
    }
  }

  // ---------- Navigation ----------
  private goto(targetId: string, label?: string): void {
    if (!this.cfg.tree[targetId]) {
      console.warn("Unknown target:", targetId);
      return;
    }
    this.state.history.push({ id: this.state.currentId, label });
    this.state.currentId = targetId;
    this.captureContext();
    this.save();
    this.render();
    this.scrollToTop();
  }

  private captureContext(): void {
    const fromId = this.state.history[this.state.history.length - 1]?.id;
    const from = fromId ? this.cfg.tree[fromId] : undefined;
    if (!from?.choice) return;
    const picked = from.choices?.find((c) => c.target === this.state.currentId);
    if (!picked) return;
    if (this.state.history.length === 1) this.state.tenant = picked.label;
    if (!this.state.profile && from === this.cfg.tree["start_choice"])
      this.state.profile = picked.label;
  }

  private back(): void {
    const prev = this.state.history.pop();
    if (!prev) return;
    this.state.currentId = prev.id;
    this.save();
    this.render();
    this.scrollToTop();
  }

  private restart(): void {
    this.state = { currentId: this.cfg.startId, history: [], version: APP_VERSION };
    this.save();
    this.render();
    this.scrollToTop();
  }

  private scrollToTop(): void {
    const top = this.root.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }

  // ---------- Input ----------
  private onKey(e: KeyboardEvent): void {
    if ((e.target as HTMLElement | null)?.matches("input, textarea, select")) return;
    const node = this.cfg.tree[this.state.currentId];
    if (!node) return;

    const k = e.key.toLowerCase();
    if (e.key === "Backspace" || e.key === "ArrowLeft") {
      if (this.state.history.length > 0) {
        e.preventDefault();
        this.back();
      }
      return;
    }
    if (k === "r") {
      this.restart();
      return;
    }
    if (node.choice && /^[0-9a-z]$/.test(k)) {
      const c = node.choices?.find((x) => (x.icon ?? "").toLowerCase() === k);
      if (c?.target) {
        e.preventDefault();
        this.goto(c.target, c.label);
      }
      return;
    }
    if (!node.choice && !node.info && !node.result) {
      if ((k === "y" || k === "1") && node.yes) {
        e.preventDefault();
        this.goto(node.yes, "Yes");
      } else if ((k === "n" || k === "2") && node.no) {
        e.preventDefault();
        this.goto(node.no, "No");
      }
    }
  }

  // ---------- Rendering ----------
  private render(): void {
    const node = this.cfg.tree[this.state.currentId];
    this.root.replaceChildren();
    if (!node) {
      this.root.textContent = "Unknown step. Press R to restart.";
      return;
    }
    if (node.step) this.appendHTML(this.progressHTML(node.step));
    this.appendHTML(this.controlsHTML());

    if (node.choice) this.appendHTML(this.choiceCard(node));
    else if (node.info) this.appendHTML(this.infoCard(node));
    else if (node.result) this.appendHTML(this.resultCard(node));
    else this.appendHTML(this.questionCard(node));

    if (this.state.history.length > 0) this.appendHTML(this.trailHTML());

    this.bind();
  }

  private appendHTML(html: string): void {
    const tpl = document.createElement("template");
    tpl.innerHTML = html.trim();
    this.root.appendChild(tpl.content);
  }

  private progressHTML(step: StepMeta): string {
    const total = this.cfg.totalSteps;
    const subFrac = step.sub ? (step.sub / (step.subTotal ?? 1)) * (100 / total) : 0;
    const pct = Math.min(100, Math.max(2, ((step.major - 1) / total) * 100 + subFrac));
    const subTxt = step.sub ? ` · ${step.sub} of ${step.subTotal ?? "?"}` : "";
    const meta = `Step ${step.major}${step.secondary ? "·" : ""} of ${total} — ${escapeHTML(step.label)}${subTxt}`;
    return h(
      "div",
      { class: "step-progress" },
      h(
        "div",
        { class: "step-progress__meta" },
        h("span", null, meta),
        h("span", null, `${Math.round(pct)}%`)
      ),
      h(
        "div",
        { class: "step-progress__bar" },
        h("div", { class: "step-progress__fill", style: `width:${pct}%` })
      )
    );
  }

  private controlsHTML(): string {
    const disabled = this.state.history.length === 0;
    return h(
      "div",
      { class: "assess__controls no-print" },
      h(
        "button",
        { type: "button", class: "btn btn-ghost", "data-action": "back", disabled },
        "← Back"
      ),
      h("button", { type: "button", class: "btn btn-ghost", "data-action": "restart" }, "↺ Restart")
    );
  }

  private choiceCard(node: TreeNode): string {
    const choices = each(node.choices, (c, idx) => {
      const tag = c.href ? "a" : "button";
      const baseAttrs = c.href
        ? { href: c.href, target: "_blank", rel: "noopener" }
        : { type: "button" as const };
      const dataset = c.target ? { "data-target": c.target, "data-label": c.label } : {};
      return h(
        tag,
        { class: `choice choice--${c.tone ?? "primary"}`, ...baseAttrs, ...dataset },
        h(
          "span",
          { class: "choice__icon", "aria-hidden": "true" },
          escapeHTML(c.icon ?? String(idx + 1))
        ),
        h(
          "span",
          { class: "choice__body" },
          h("span", { class: "choice__label" }, escapeHTML(c.label)),
          when(c.sublabel, (s) => h("span", { class: "choice__sub" }, escapeHTML(s)))
        )
      );
    });
    return h(
      "section",
      { class: "card question-card" },
      h("h2", { class: "question-card__q" }, escapeHTML(node.question ?? "")),
      when(node.help, (s) => h("p", { class: "question-card__help" }, escapeHTML(s))),
      when(node.helpLink, (l) =>
        h("p", null, h("a", { href: "#", "data-helplink": l.target }, `${escapeHTML(l.label)} →`))
      ),
      h("div", { class: "choices" }, choices)
    );
  }

  private questionCard(node: TreeNode): string {
    return h(
      "section",
      { class: "card question-card" },
      h("h2", { class: "question-card__q" }, escapeHTML(node.question ?? "")),
      when(node.help, (s) => h("p", { class: "question-card__help" }, escapeHTML(s))),
      this.rationaleHTML(node.rationale),
      this.examplesHTML(node.examples),
      h(
        "div",
        { class: "yesno" },
        h("button", { type: "button", class: "btn btn-primary", "data-yes": true }, "Yes"),
        h("button", { type: "button", class: "btn btn-secondary", "data-no": true }, "No")
      ),
      this.footnotesHTML(node.techDocs)
    );
  }

  private infoCard(node: TreeNode): string {
    return h(
      "section",
      { class: "card info-card" },
      when(node.badge, (b) =>
        h("span", { class: `badge ${node.badgeClass ?? "badge-info"}` }, escapeHTML(b))
      ),
      h("h2", { class: "card__title" }, escapeHTML(node.title ?? "")),
      when(node.sub, (s) => h("p", { class: "card__sub" }, escapeHTML(s))),
      each(node.paragraphs, (p) => h("p", null, escapeHTML(p))),
      this.actionsHTML(node.actions),
      this.footnotesHTML(docsOf(node))
    );
  }

  private resultCard(node: TreeNode): string {
    return h(
      "section",
      { class: "card result-card", "data-result-id": this.state.currentId },
      when(node.badge, (b) =>
        h("span", { class: `badge ${node.badgeClass ?? "badge-success"}` }, escapeHTML(b))
      ),
      h("h2", { class: "card__title" }, escapeHTML(node.title ?? "")),
      when(node.sub, (s) => h("p", { class: "card__sub" }, escapeHTML(s))),
      each(node.paragraphs, (p) => h("p", null, escapeHTML(p))),
      node.bullets?.length
        ? h(
            "ul",
            { class: "result-card__bullets" },
            each(node.bullets, (b) => h("li", null, escapeHTML(b)))
          )
        : "",
      this.tenantBannerHTML(),
      this.actionsHTML(node.actions),
      h(
        "div",
        { class: "result-card__cta no-print" },
        h(
          "button",
          { type: "button", class: "btn btn-primary", "data-pdf": true },
          "📄 Download PDF handout"
        ),
        h(
          "button",
          { type: "button", class: "btn btn-secondary", "data-copy": true },
          "📋 Copy summary"
        ),
        h("button", { type: "button", class: "btn btn-secondary", "data-print": true }, "🖨️ Print"),
        h(
          "button",
          { type: "button", class: "btn btn-ghost", "data-restart": true },
          "↺ Start over"
        )
      ),
      this.footnotesHTML(docsOf(node))
    );
  }

  private rationaleHTML(r?: Rationale): string {
    if (!r) return "";
    const rows = [
      r.why && h("dt", null, "Why we ask") + h("dd", null, escapeHTML(r.why)),
      r.yes && h("dt", null, "If <strong>Yes</strong>") + h("dd", null, escapeHTML(r.yes)),
      r.no && h("dt", null, "If <strong>No</strong>") + h("dd", null, escapeHTML(r.no)),
    ]
      .filter(Boolean)
      .join("");
    return rows ? h("dl", { class: "rationale" }, rows) : "";
  }

  private examplesHTML(ex?: string[]): string {
    if (!ex?.length) return "";
    return h(
      "details",
      { class: "examples" },
      h("summary", null, "Examples"),
      h(
        "ul",
        null,
        each(ex, (e) => h("li", null, escapeHTML(e)))
      )
    );
  }

  private footnotesHTML(docs: DocLink[] | undefined): string {
    if (!docs || !docs.length) return "";
    return h(
      "div",
      { class: "footnotes" },
      h("div", { class: "footnotes__title" }, "Sources & further reading"),
      h(
        "ol",
        { class: "footnotes__list" },
        each(docs, ([label, url], i) =>
          h(
            "li",
            { id: `fn-${i + 1}` },
            h("a", { href: url, target: "_blank", rel: "noopener" }, escapeHTML(label))
          )
        )
      ),
      // Universal authoritative-source footnote. The Microsoft Learn refs
      // above describe how to operate the features; the Product Terms govern
      // who must be licensed and what each SKU includes.
      h(
        "p",
        { class: "footnotes__terms" },
        "<strong>Authoritative source &mdash;</strong> the legally binding Use Rights for every Microsoft Online Service named above live in the ",
        h(
          "a",
          { href: "https://www.microsoft.com/licensing/terms", target: "_blank", rel: "noopener" },
          "Microsoft Product Terms"
        ),
        " (per-SKU entries at ",
        h(
          "a",
          {
            href: "https://www.microsoft.com/licensing/terms/productoffering",
            target: "_blank",
            rel: "noopener",
          },
          "Product Offerings"
        ),
        "; cross-cutting rules at ",
        h(
          "a",
          {
            href: "https://www.microsoft.com/licensing/terms/product/UniversalLicenseTerms/all",
            target: "_blank",
            rel: "noopener",
          },
          "Universal License Terms"
        ),
        " and ",
        h(
          "a",
          {
            href: "https://www.microsoft.com/licensing/terms/product/ForOnlineServices/all",
            target: "_blank",
            rel: "noopener",
          },
          "For Online Services"
        ),
        "). The ",
        h(
          "a",
          { href: "https://www.microsoft.com/en-us/licensing", target: "_blank", rel: "noopener" },
          "Microsoft Licensing Hub"
        ),
        " carries program-level changes (e.g.&nbsp;the ",
        h(
          "a",
          {
            href: "https://www.microsoft.com/en-us/licensing/news/Microsoft365-Teams-2025",
            target: "_blank",
            rel: "noopener",
          },
          "Microsoft 365 + Teams 2025 packaging"
        ),
        " update and the ",
        h(
          "a",
          {
            href: "https://www.microsoft.com/en-us/licensing/news/Update-to-external-users-2024",
            target: "_blank",
            rel: "noopener",
          },
          "2024 External Users definition"
        ),
        "). Verify SKU eligibility with your Microsoft account team before purchase."
      )
    );
  }

  private actionsHTML(actions?: Action[]): string {
    if (!actions?.length) return "";
    const btns = each(actions, (a, i) => {
      const cls = `btn ${toneBtn(a.tone)}`;
      return a.href
        ? h(
            "a",
            { class: cls, href: a.href, target: "_blank", rel: "noopener" },
            escapeHTML(a.label)
          )
        : h(
            "button",
            {
              type: "button",
              class: cls,
              "data-action-target": a.target ?? "",
              "data-action-idx": i,
            },
            escapeHTML(a.label)
          );
    });
    return h("div", { class: "btn-row no-print" }, btns);
  }

  private tenantBannerHTML(): string {
    if (!this.state.tenant) return "";
    const profilePart = this.state.profile
      ? ` · <strong>Profile:</strong> ${escapeHTML(this.state.profile)}`
      : "";
    return h(
      "div",
      { class: "callout" },
      `<strong>Tenant baseline:</strong> ${escapeHTML(this.state.tenant)}${profilePart}`
    );
  }

  private trailHTML(): string {
    const items = each(this.state.history, (entry) => {
      const n = this.cfg.tree[entry.id];
      const q = n?.question ?? n?.title ?? entry.id;
      return h(
        "li",
        null,
        h("span", { class: "trail__q" }, escapeHTML(truncate(q, 90))),
        when(entry.label, (a) => h("span", { class: "trail__a" }, escapeHTML(a)))
      );
    });
    return h(
      "aside",
      { class: "trail no-print", "aria-label": "Your answers so far" },
      h(
        "details",
        null,
        h("summary", null, `Your answers (${this.state.history.length})`),
        h("ol", { class: "trail__list" }, items)
      )
    );
  }

  // ---------- Event binding ----------
  private bind(): void {
    this.root.addEventListener("click", this.onClick, { once: true });
  }

  private onClick = (e: Event): void => {
    const t = e.target as HTMLElement;
    const choice = t.closest<HTMLElement>("[data-target]");
    if (choice && choice.dataset.target) {
      e.preventDefault();
      this.goto(choice.dataset.target, choice.dataset.label);
      return;
    }
    const help = t.closest<HTMLAnchorElement>("[data-helplink]");
    if (help) {
      e.preventDefault();
      this.goto(help.dataset.helplink!);
      return;
    }
    const action = t.closest<HTMLElement>("[data-action-target]");
    if (action && action.dataset.actionTarget) {
      this.goto(action.dataset.actionTarget, action.textContent ?? undefined);
      return;
    }
    const ctrl = t.closest<HTMLElement>("[data-action]");
    if (ctrl) {
      if (ctrl.dataset.action === "back") this.back();
      else if (ctrl.dataset.action === "restart") this.restart();
      this.bind();
      return;
    }
    const node = this.cfg.tree[this.state.currentId];
    if (t.matches("[data-yes]") && node?.yes) {
      this.goto(node.yes, "Yes");
      return;
    }
    if (t.matches("[data-no]") && node?.no) {
      this.goto(node.no, "No");
      return;
    }
    if (t.matches("[data-restart]")) {
      this.restart();
      return;
    }
    if (t.matches("[data-print]")) {
      window.print();
      this.bind();
      return;
    }
    if (t.matches("[data-copy]")) {
      void this.copySummary(node);
      this.bind();
      return;
    }
    if (t.matches("[data-pdf]")) {
      void this.generatePDF(node);
      this.bind();
      return;
    }
    this.bind();
  };

  // ---------- Summary / PDF / Copy ----------
  private buildSummary(node?: TreeNode): string {
    if (!node) return "";
    const trail = this.state.history
      .map(
        (h) =>
          `  - ${this.cfg.tree[h.id]?.question ?? this.cfg.tree[h.id]?.title ?? h.id} → ${h.label ?? ""}`
      )
      .join("\n");
    const lines: (string | false)[] = [
      "M365 Profiles recommendation",
      "===========================",
      "",
      `Tenant baseline: ${this.state.tenant ?? "(not specified)"}`,
      `Profile:         ${this.state.profile ?? "(not specified)"}`,
      "",
      `Recommendation: ${node.title ?? "(see details)"}`,
      !!node.sub && node.sub,
      "",
      !!node.bullets?.length &&
        ["Key points:", ...node.bullets.map((b) => `  • ${b}`), ""].join("\n"),
      "Your answers:",
      trail || "  (none)",
      "",
      "Sources:",
      ...docsOf(node).map(([l, u]) => `  - ${l}: ${u}`),
      "",
      `Generated by m365-profiles ${APP_VERSION} — unofficial helper, not Microsoft guidance.`,
    ];
    return lines.filter((l): l is string => Boolean(l)).join("\n");
  }

  private async copySummary(node?: TreeNode): Promise<void> {
    if (!node) return;
    const txt = this.buildSummary(node);
    try {
      await navigator.clipboard.writeText(txt);
      this.toast("Summary copied to clipboard.");
    } catch {
      const ta = document.createElement("textarea");
      ta.value = txt;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } finally {
        ta.remove();
      }
      this.toast("Summary copied.");
    }
  }

  private async generatePDF(node?: TreeNode): Promise<void> {
    if (!node) return;
    this.toast("Building PDF…");
    try {
      const { buildHandoutPDF } = await import("./pdf");
      await buildHandoutPDF({
        tenant: this.state.tenant,
        profile: this.state.profile,
        title: node.title ?? "Recommendation",
        sub: node.sub,
        bullets: node.bullets ?? [],
        paragraphs: node.paragraphs ?? [],
        docs: docsOf(node),
        trail: this.state.history.map((entry) => {
          const n = this.cfg.tree[entry.id];
          return { q: n?.question ?? n?.title ?? entry.id, a: entry.label ?? "" };
        }),
      });
      this.toast("PDF downloaded.");
    } catch (err) {
      console.error(err);
      this.toast("PDF failed. Try Print instead.");
    }
  }

  private toast(msg: string): void {
    let t = document.getElementById("toast");
    if (!t) {
      t = document.createElement("div");
      t.id = "toast";
      t.className = "toast";
      t.setAttribute("role", "status");
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add("toast--visible");
    window.setTimeout(() => t!.classList.remove("toast--visible"), 2500);
  }
}

// ---------- Bootstrap ----------
function boot(): void {
  const dataEl = document.getElementById("tree-data");
  const root = document.getElementById("assessment");
  if (!dataEl || !root) return;
  try {
    const cfg = JSON.parse(dataEl.textContent || "{}") as Config;
    if (!cfg.tree || !cfg.startId) throw new Error("Invalid tree config");
    new Assessment(root as HTMLElement, cfg);
  } catch (err) {
    console.error(err);
    (root as HTMLElement).innerHTML =
      `<div class="callout callout--danger"><strong>Failed to load assessment.</strong> ${escapeHTML((err as Error).message)}</div>`;
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}
