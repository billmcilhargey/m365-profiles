// Card-based assessment renderer. Reads the tree from an inline JSON island
// on the Astro page; handles keyboard, history, copy, print, and lazy PDF.

import { APP_VERSION } from "../lib/version";
import { STORAGE_KEYS } from "../lib/site";
import { each, escapeHTML, h, when } from "../lib/dom";
import type {
  Action,
  DocLink,
  ProductScopeItem,
  Rationale,
  StepMeta,
  Tone,
  Tree,
  TreeNode,
} from "../lib/tree";

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
    const lastEntry = this.state.history[this.state.history.length - 1];
    const fromId = lastEntry?.id;
    const from = fromId ? this.cfg.tree[fromId] : undefined;
    if (!from?.choice) return;
    // Multiple choices can share the same `target`, so identify the picked
    // choice by the label that was just pushed onto history.
    const picked =
      from.choices?.find(
        (c) => c.target === this.state.currentId && c.label === lastEntry?.label
      ) ?? from.choices?.find((c) => c.target === this.state.currentId);
    if (!picked) return;
    if (from === this.cfg.tree[this.cfg.startId]) this.state.tenant = picked.label;
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

  private cardCopyButtonHTML(): string {
    return h(
      "div",
      { class: "card__toolbar no-print" },
      h(
        "button",
        {
          type: "button",
          class: "btn btn-ghost btn-sm",
          "data-copy-node": true,
          title: "Copy this question's full details to clipboard",
          "aria-label": "Copy question details to clipboard",
        },
        "📋 Copy details"
      )
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
      this.cardCopyButtonHTML(),
      h("h2", { class: "question-card__q" }, escapeHTML(node.question ?? "")),
      when(node.help, (s) => h("p", { class: "question-card__help" }, escapeHTML(s))),
      when(node.helpLink, (l) =>
        h("p", null, h("a", { href: "#", "data-helplink": l.target }, `${escapeHTML(l.label)} →`))
      ),
      h("div", { class: "choices" }, choices)
    );
  }

  private questionCard(node: TreeNode): string {
    const hasTitle = Boolean(node.title);
    return h(
      "section",
      { class: "card question-card" },
      this.cardCopyButtonHTML(),
      hasTitle
        ? h("h2", { class: "question-card__title" }, escapeHTML(node.title ?? ""))
        : h("h2", { class: "question-card__q" }, escapeHTML(node.question ?? "")),
      hasTitle && node.question
        ? h(
            "div",
            { class: "question-card__prompt", role: "group", "aria-label": "Question" },
            h("span", { class: "question-card__prompt-label" }, "Question"),
            h("p", { class: "question-card__prompt-text" }, escapeHTML(node.question))
          )
        : "",
      when(node.sub, (s) => h("p", { class: "question-card__sub" }, escapeHTML(s))),
      when(node.help, (s) => h("p", { class: "question-card__help" }, escapeHTML(s))),
      each(node.paragraphs, (p) => h("p", { class: "question-card__para" }, escapeHTML(p))),
      this.rationaleHTML(node.rationale),
      this.productBreakdownHTML(node.productBreakdown, node.breakdownIntro),
      this.examplesHTML(node.examples),
      h(
        "div",
        { class: "yesno" },
        h(
          "button",
          { type: "button", class: "btn btn-primary", "data-yes": true },
          node.productBreakdown?.length ? "Yes — at least one applies" : "Yes"
        ),
        h(
          "button",
          { type: "button", class: "btn btn-secondary", "data-no": true },
          node.productBreakdown?.length ? "No — none apply" : "No"
        )
      ),
      this.footnotesHTML(node.techDocs)
    );
  }

  private infoCard(node: TreeNode): string {
    return h(
      "section",
      { class: "card info-card" },
      this.cardCopyButtonHTML(),
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

  private productBreakdownHTML(items?: ProductScopeItem[], intro?: string): string {
    if (!items?.length) return "";
    const scopeLabel: Record<ProductScopeItem["scope"], string> = {
      "per-user": "Per-user licence",
      "per-device": "Per-device licence",
      "per-mailbox": "Per-mailbox licence",
      "tenant-wide-scopeable": "Tenant-wide · scopeable",
      "tenant-wide-not-scopeable": "Tenant-wide · not scopeable *",
    };
    const hasNotScopeable = items.some((i) => i.scope === "tenant-wide-not-scopeable");
    const rows = each(items, (item) => {
      const notScopeable = item.scope === "tenant-wide-not-scopeable";
      return h(
        "details",
        { class: "scope-item", "data-scope": item.scope },
        h(
          "summary",
          null,
          h("span", { class: "scope-item__name" }, escapeHTML(item.name)),
          when(item.sku, (s) => h("span", { class: "scope-item__sku" }, escapeHTML(s))),
          h(
            "span",
            { class: `scope-badge scope-badge--${item.scope}` },
            escapeHTML(scopeLabel[item.scope])
          )
        ),
        h(
          "div",
          { class: "scope-item__body" },
          notScopeable
            ? h(
                "p",
                { class: "scope-item__advisory" },
                h("strong", null, "Informational only \u2014 no verdict suggested. "),
                "This feature is tenant-wide and not scopeable, so the licensing call for this user is a judgement that depends on your reading of the Microsoft Product Terms, your tenant's technical posture, and Microsoft's Secure Future Initiative (SFI). The card below gives you the technical mechanics, the per-product Microsoft references, and both Microsoft statements side-by-side \u2014 use them to make the informed decision yourself. ",
                h("strong", null, "This card does not drive the answer to the outer question.")
              )
            : "",
          h(
            "p",
            { class: "scope-item__note" },
            h("strong", null, "How it scopes: "),
            escapeHTML(item.scopeNote)
          ),
          notScopeable
            ? ""
            : h("p", null, h("strong", null, "In scope when: "), escapeHTML(item.inScopeMeans)),
          notScopeable
            ? ""
            : when(item.notInScopeMeans, (s) =>
                h("p", null, h("strong", null, "Not in scope when: "), escapeHTML(s))
              ),
          !notScopeable && item.examples?.length
            ? h(
                "ul",
                { class: "scope-item__examples" },
                each(item.examples, (e) => h("li", null, escapeHTML(e)))
              )
            : "",
          notScopeable
            ? h(
                "aside",
                {
                  class: "scope-item__footnote",
                  "aria-label": "Microsoft Secure Future Initiative and Product Terms statements",
                },
                h(
                  "p",
                  { class: "scope-item__footnote-title" },
                  h(
                    "strong",
                    null,
                    "* Tenant-wide and not scopeable — two Microsoft statements to weigh"
                  )
                ),
                h(
                  "p",
                  { class: "scope-item__footnote-section" },
                  h("strong", null, "Microsoft Secure Future Initiative (SFI) — statement. "),
                  "Microsoft's ",
                  h(
                    "a",
                    {
                      href: "https://www.microsoft.com/en-us/trust-center/security/secure-future-initiative",
                      target: "_blank",
                      rel: "noopener",
                    },
                    "Secure Future Initiative"
                  ),
                  " is grounded in three principles — ",
                  h("em", null, "Secure by Design, Secure by Default, Secure Operations"),
                  ". Satya Nadella's ",
                  h(
                    "a",
                    {
                      href: "https://blogs.microsoft.com/blog/2024/05/03/prioritizing-security-above-all-else/",
                      target: "_blank",
                      rel: "noopener",
                    },
                    "May 2024 SFI memo"
                  ),
                  " states verbatim: \u201Csecurity protections are enabled and enforced by default, require no extra effort, and are not optional.\u201D Microsoft's recommendation for tenant-wide protections like this one is therefore to ",
                  h("strong", null, "enable them"),
                  " — leaving them off is the riskier posture."
                ),
                h(
                  "p",
                  { class: "scope-item__footnote-section" },
                  h("strong", null, "Microsoft Product Terms — statement. "),
                  "The feature is tenant-wide and not scopeable — once on, every user who benefits is technically protected. The licence, per ",
                  h(
                    "a",
                    {
                      href: "https://www.microsoft.com/licensing/terms/",
                      target: "_blank",
                      rel: "noopener",
                    },
                    "Microsoft Product Terms"
                  ),
                  " (also published as the ",
                  h(
                    "a",
                    {
                      href: "https://www.microsoft.com/en-us/licensing/product-licensing/products",
                      target: "_blank",
                      rel: "noopener",
                    },
                    "Microsoft Product Licensing portal"
                  ),
                  " and on ",
                  h(
                    "a",
                    {
                      href: "https://learn.microsoft.com/licensing/",
                      target: "_blank",
                      rel: "noopener",
                    },
                    "Microsoft Learn — Licensing"
                  ),
                  "), must still be assigned to every user who benefits — Microsoft simply can't enforce it technically."
                ),
                h(
                  "p",
                  { class: "scope-item__footnote-note" },
                  h("em", null, "Both statements are official Microsoft sources. "),
                  "See the per-product references on this card below for the specific service description and licensing data sheet \u2014 each one points back to the Product Terms entry and the SFI guidance for the product. The decision on how to balance Microsoft's security recommendation against the licensing footprint is yours."
                )
              )
            : "",
          item.docs?.length
            ? h(
                "ul",
                { class: "scope-item__docs" },
                each(item.docs, ([label, url]) =>
                  h(
                    "li",
                    null,
                    h("a", { href: url, target: "_blank", rel: "noopener" }, escapeHTML(label))
                  )
                )
              )
            : ""
        )
      );
    });
    return h(
      "section",
      { class: "scope-breakdown", "aria-label": "Per-product scope breakdown" },
      h(
        "div",
        { class: "scope-breakdown__head" },
        h("h3", { class: "scope-breakdown__title" }, "Walk through each product"),
        h(
          "p",
          { class: "scope-breakdown__intro" },
          escapeHTML(
            intro ??
              "Each product below is its own mini-card. Open any card to see how that feature is scoped (per-user, per-device, or tenant-wide), what 'in scope' means in plain language, examples, and the Microsoft source. Answer Yes below if at least one applies to this user."
          )
        ),
        hasNotScopeable
          ? h(
              "p",
              { class: "scope-breakdown__legend" },
              h("span", { class: "scope-breakdown__legend-star" }, "*"),
              " marks items that are tenant-wide and ",
              h("em", null, "not"),
              " scopeable. These cards are ",
              h(
                "strong",
                null,
                "informational only \u2014 they do not push the Yes / No on this question"
              ),
              ". Expand any starred card for the technical mechanics, the per-product Microsoft references, and Microsoft's two official statements (Secure Future Initiative and Product Terms), so you can make the call yourself."
            )
          : ""
      ),
      h("div", { class: "scope-breakdown__list" }, rows)
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
    if (t.closest("[data-copy-node]")) {
      void this.copyNodeDetails(node);
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
    await this.copyText(this.buildSummary(node), "Summary copied to clipboard.");
  }

  private buildNodeDetails(node: TreeNode): string {
    const heading = node.title ?? node.question ?? "Assessment step";
    const lines: (string | false)[] = [heading, "=".repeat(Math.min(heading.length, 80)), ""];
    if (node.title && node.question) lines.push(`Question: ${node.question}`, "");
    if (node.sub) lines.push(node.sub, "");
    if (node.help) lines.push("Context:", node.help, "");
    if (node.rationale?.why) lines.push("Why we ask:", `  ${node.rationale.why}`, "");
    if (node.rationale?.yes) lines.push("If Yes:", `  ${node.rationale.yes}`, "");
    if (node.rationale?.no) lines.push("If No:", `  ${node.rationale.no}`, "");
    if (node.paragraphs?.length) {
      for (const p of node.paragraphs) lines.push(p, "");
    }
    if (node.bullets?.length) {
      lines.push("Key points:");
      for (const b of node.bullets) lines.push(`  • ${b}`);
      lines.push("");
    }
    if (node.choices?.length) {
      lines.push("Options:");
      for (const c of node.choices) {
        lines.push(`  • ${c.label}${c.sublabel ? ` — ${c.sublabel}` : ""}`);
      }
      lines.push("");
    }
    if (node.examples?.length) {
      lines.push("Examples:");
      for (const ex of node.examples) lines.push(`  • ${ex}`);
      lines.push("");
    }
    if (node.productBreakdown?.length) {
      lines.push("Per-product scope breakdown:");
      for (const item of node.productBreakdown) {
        lines.push("");
        const star = item.scope === "tenant-wide-not-scopeable" ? " *" : "";
        lines.push(`  ▸ ${item.name}${item.sku ? `  [${item.sku}]` : ""}  (${item.scope}${star})`);
        if (item.scope === "tenant-wide-not-scopeable") {
          lines.push("      Informational only — no verdict suggested.");
          lines.push(
            "      This feature is tenant-wide and not scopeable, so the licensing call for this user is a judgement that depends on your reading of the Microsoft Product Terms, your tenant's technical posture, and Microsoft's Secure Future Initiative (SFI). The technical mechanics, per-product Microsoft references, and Microsoft's two official statements (SFI + Product Terms) are below — use them to make the informed decision yourself. This card does not drive the answer to the outer question."
          );
        }
        lines.push(`      How it scopes: ${item.scopeNote}`);
        if (item.scope !== "tenant-wide-not-scopeable") {
          lines.push(`      In scope when: ${item.inScopeMeans}`);
          if (item.notInScopeMeans) lines.push(`      Not in scope when: ${item.notInScopeMeans}`);
          if (item.examples?.length) {
            for (const ex of item.examples) lines.push(`        - ${ex}`);
          }
        }
        if (item.scope === "tenant-wide-not-scopeable") {
          lines.push("      * Tenant-wide and not scopeable — two Microsoft statements to weigh:");
          lines.push("        Microsoft Secure Future Initiative (SFI) — statement:");
          lines.push(
            "        - SFI is grounded in three principles: Secure by Design, Secure by Default, Secure Operations."
          );
          lines.push(
            "        - Per Satya Nadella's May 2024 SFI memo: \u201Csecurity protections are enabled and enforced by default, require no extra effort, and are not optional.\u201D"
          );
          lines.push(
            "        - Microsoft's recommendation for tenant-wide protections like this one is to enable them — leaving them off is the riskier posture."
          );
          lines.push(
            "        - Source: https://www.microsoft.com/en-us/trust-center/security/secure-future-initiative"
          );
          lines.push(
            "        - Source: https://blogs.microsoft.com/blog/2024/05/03/prioritizing-security-above-all-else/"
          );
          lines.push("        Microsoft Product Terms — statement:");
          lines.push(
            "        - The feature is tenant-wide and not scopeable — once on, every user who benefits is technically protected."
          );
          lines.push(
            "        - The licence, per Microsoft Product Terms, must still be assigned to every user who benefits — Microsoft simply can't enforce it technically."
          );
          lines.push("        - Source: https://www.microsoft.com/licensing/terms/");
          lines.push(
            "        - Source: https://www.microsoft.com/en-us/licensing/product-licensing/products"
          );
          lines.push("        - Source: https://learn.microsoft.com/licensing/");
          lines.push(
            "        Both statements are official Microsoft sources. See the per-product references on this card below for the specific service description and licensing data sheet."
          );
        }
        if (item.docs?.length) {
          for (const [l, u] of item.docs) lines.push(`        source: ${l} — ${u}`);
        }
      }
      lines.push("");
    }
    const docs = docsOf(node);
    if (docs.length) {
      lines.push("Sources & further reading:");
      for (const [label, url] of docs) lines.push(`  - ${label}: ${url}`);
      lines.push("");
    }
    lines.push(
      `Generated by m365-profiles ${APP_VERSION} — unofficial helper, not Microsoft guidance.`
    );
    return lines.filter((l): l is string => Boolean(l) || l === "").join("\n");
  }

  private async copyNodeDetails(node?: TreeNode): Promise<void> {
    if (!node) return;
    await this.copyText(this.buildNodeDetails(node), "Question details copied to clipboard.");
  }

  private async copyText(txt: string, successMsg: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(txt);
      this.toast(successMsg);
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
      this.toast(successMsg);
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
  // Honour ?restart=1 (or ?fresh=1) on the URL — clears any saved progress so
  // the assessment always starts from the first question. The flag is stripped
  // from the address bar afterwards so a refresh doesn't keep clobbering state.
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.has("restart") || url.searchParams.has("fresh")) {
      sessionStorage.removeItem(STORAGE_KEYS.assessmentState);
      url.searchParams.delete("restart");
      url.searchParams.delete("fresh");
      history.replaceState(null, "", url.toString());
    }
  } catch {
    /* ignore — fall through to normal load */
  }
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
