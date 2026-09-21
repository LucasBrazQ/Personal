# Agent prompt: Build Matchnode Databox inside the Super App

Copy everything below the line into an AI coding agent that already has the **Matchnode Super App** repo (`marinamatchnode/matchnode-full-dashboard`, live at `https://dashboard.matchnode.com`). Do not paste this into a repo that is not the Super App.

---

## Mission

Build a complete first-party BI product inside the Matchnode Super App that **replaces Databox** for Matchnode’s internal and client-reporting workflows.

The product must **feel and work like Databox** (Databoards, Datablocks, Designer, Metrics, Scorecards, Goals, Alerts, sharing, scheduled snapshots), while **looking and behaving like every other Super App tool**: same shell, auth, client context, navigation, design system, data patterns, and collaboration rules.

Expected result: an account manager or technical lead can connect a client’s paid-media sources, assemble a dashboard by drag-and-drop, change date ranges live, share a public/passworded link, schedule Monday 8am snapshots, and run daily huddle scorecards — without leaving `dashboard.matchnode.com` and without Databox.

Name the product **Matchnode Databoards** (or the existing Super App naming convention if one already exists). Do **not** copy Databox trademarks, logos, or visual identity. Matchnode branding only.

## How you must work (Super App standards)

These rules come from internal Super App practice. Follow them even if they conflict with a generic “greenfield app” approach.

1. **This is not a new app.** Implement inside `matchnode-full-dashboard`. Reuse the existing app shell, auth, routing, client/workspace picker, design tokens, UI components, API helpers, and data stores. Do not bootstrap a separate Next/Vite app.
2. **Discover before you write code.** First map:
   - routing (`/analytics`, `/ad-approvals`, `/client/onboarding`, `/hours`, `/change-logs`, `/roadmap`, `/ugc/dashboard`, etc.)
   - how new pages are registered in the nav
   - how a page is scoped to a **client / brand / workspace**
   - how existing analytics/KPI pacing (`/analytics`) fetches Meta, Google Ads, TikTok, GA4
   - auth, roles, and which screens are internal vs client-facing
   - how env vars, secrets, and background jobs are done
   Then implement BI as another first-class module that matches those patterns.
3. **Shared components are dangerous.** The navigation bar and other shared layout files are edited by multiple teammates. Prefer adding a **single nav item** with the smallest possible change. Do not restyle the shell. If a shared file must change, isolate the diff and keep it additive.
4. **Do not collide with in-progress pages.** Keep BI files in a dedicated folder (e.g. `src/.../databoards/` or the repo’s equivalent). Do not rewrite `/analytics` Budget/KPI pacing; **integrate** with it (a Datablock can show the same KPI/pacing numbers).
5. **Git hygiene for this repo:** pull latest default branch before starting; work on a feature branch; commit often; do not rewrite teammates’ pages. If a merge conflict appears in shared files, stop and keep both behaviors rather than deleting theirs.
6. **Match existing stack.** Use whatever the Super App already uses (likely React/Next, existing chart lib, existing backend/Supabase/API routes, existing job runner). Only add a library if the Super App has no equivalent. Prefer the chart/grid libraries already in `package.json`.
7. **Paid-media data rules:** never invent ad account IDs or mix clients. Resolve organization → workspace/brand → ad account before querying. Use platform timezone and the user-selected date range. State data freshness on every block. **Never** mutate campaigns, budgets, ads, or publishing from this product. Read-only analytics.
8. **Reuse Matchnode data pipes first.** Prefer Super App APIs, Adnova, Meta Ads, Google Ads, and existing warehouse/sync jobs over new third-party BI vendors. Google Sheets remains a first-class source because Matchnode still pipes custom conversions into Sheets for reporting.
9. **Internal-first, client-shareable second.** Default UX is Matchnode teammates. Public/embed links are a sharing mode, not a separate product.
10. **Verify like a user.** After UI work, exercise create → edit → view → date-range change → share in the browser (or the closest substitute). Check empty, error, loading, no-permission, and disconnected-source states. Check desktop; Designer must remain usable at 1280px+.

## Why this exists (Matchnode today)

Matchnode currently uses Databox as the agency BI layer:

- Technical lead creates a **Databoard per new client** during onboarding (`Creating a Databox Dashboard for a New Client` / Guru `cMa4rERi`).
- Dashboards are composed of **Datablocks** (metric + visualization): spend, conversions, CPA/CPL, funnel steps, custom conversions.
- Account teams paste a **public datawall link + screenshot** into weekly docs.
- Technical lead sets **Scheduled Snapshots every Monday 8am** to the client’s account team.
- Account huddle **scorecards** sum yesterday’s spend % change vs previous period across all of an AM’s clients (`Accounts Team Huddle Daily Number Instructions`).
- New-client Asana includes: add Google + Meta spend to the agency spend dashboard, create the client Databoard, add the **main KPI** to the agency KPI datawall, add the public URL to weekly-doc templates and media-buying Looker.
- Pain we are solving: Databox disconnects, date-range mismatches, extra SaaS, and data that already lives in the Super App / Adnova not showing up in Databox.
- Super App already **does not** fully support multiple ad accounts per client (LendingTree is the known exception). The BI tool must support **multiple ad accounts per client** from day one.

Reference Databox product behavior (mimic capability, not brand):

- Designer: https://help.databox.com/overview-designer
- Datablock config: https://help.databox.com/configure-a-datablock
- Visualizations: https://help.databox.com/choose-the-best-visualization-for-your-data
- Metrics: https://help.databox.com/overview-metrics
- Custom/calculated metrics: https://help.databox.com/create-a-custom-metric
- Matchnode Databox training (Drive): `1Cc3LcF_VSszjvtzdor34pUxRXssa4j7jHTZdW41i8lU`
- Example public datawall pattern: `https://app.databox.com/datawall/<token>`

## Product information architecture (mirror Databox)

Left-nav (or Super App equivalent) for this module:

| Area | Purpose |
| --- | --- |
| **Home / Performance** | Login landing: starred metrics, goals, recently viewed boards, trending/up-down metrics |
| **Databoards** | List, search, favorite, duplicate, templates, new board |
| **Designer** | Full-screen drag-and-drop editor for one board |
| **Viewer** | Live board with master date-range switcher (this is what weekly docs link to) |
| **Metrics** | Library of source metrics + custom + calculated; favorite; set goal; set alert |
| **Scorecards** | Up to 15 metrics; daily/weekly/monthly delivery |
| **Goals** | Targets on any metric; traffic-light pacing (green ≥100%, amber 75–99%, red <75%) |
| **Alerts** | Threshold / % change / missing data; in-app + email/Slack/Google Chat if Super App already has a notifier |
| **Data sources** | Connect, status, last sync, reconnect, account mapping to Super App clients |
| **Templates** | Account templates (Matchnode standard client board, spend-only board, KPI board) |
| **Sharing** | Public link, password, expiry, embed, download JPG/PDF, scheduled snapshot, send email |

Keep URLs stable and client-aware, e.g.:

- `/databoards`
- `/databoards/:boardId` (viewer)
- `/databoards/:boardId/edit` (designer)
- `/databoards/metrics`
- `/databoards/scorecards`
- `/databoards/sources`

If the Super App already namespaces by client (`/clients/:id/...`), nest under that **and** still support an agency-wide view for huddle scorecards and the “all-client spend / main KPI” boards.

## Designer (must-have Databox parity)

The Designer is the core of the product. Ship it as a real editor, not a static dashboard.

**Canvas**

- Grid layout; blocks snap, move, resize; neighbors reflow like Databox.
- Auto-save with Saving / Saved status.
- Board title + optional client logo (bottom-left equivalent).
- Board background color + chart theme (use Matchnode tokens, not Databox palettes).
- Master date-range switcher on the board (bottom-right equivalent) that overrides block primary ranges **in viewer mode**.
- Full-screen view.

**Datablock library (left)**

- Visualization library (blank block of a type).
- Metric library filtered by connected source, with search and groups: Favorite, Basic, Custom, Calculated.
- Pre-built blocks for Matchnode-critical metrics so a tech lead can assemble a new client board in minutes.

**Datablock editor (right, on select)**

- Visualization type
- Data source + account
- Metric
- Primary date range
- Compare with: previous period, previous year, custom range, goal (multiple comparisons where the viz allows)
- Filters (campaign, ad set, ad, campaign type, brand/non-brand, conversion action, country, etc.)
- Dimensions / breakdown (cap 15 selected values, matching Databox)
- Number format, currency, timezone
- Show total, trend line, average line
- Title, font size, additional settings

**Block actions:** move, resize, duplicate (same board or another board), delete (confirm).

Each block is independent (own source, metric, range) except when the viewer master date range is applied.

## Visualization types (ship all of these)

Number, Line, Bar, Horizontal bar, Combo, Pie, Table, Leaderboard, Funnel, Pipeline, Heatmap, Progress, Radial progress, Gauge, Spider, Bubble, plus **Notes** and **Image**.

Optional if time: AI summary block that explains the selected metric(s) for the active range using existing Matchnode AI notes patterns (weekly docs already have `{{overall_ai_performance}}` style summaries). Do not block v1 on LLM quality.

Traffic lights for goal-based viz:

- Green ≥ 100% of goal (or on-pace for the selected range)
- Amber 75–99%
- Red < 75%

## Metrics layer

**Basic (native) metrics — priority sources**

1. **Meta Ads** — spend, impressions, reach, clicks, CTR, CPC, CPM, frequency, purchases/leads/custom conversions, cost per result, ROAS, thruPlay, video metrics. Support account, campaign, ad set, ad, creative.
2. **Google Ads** — cost, clicks, impressions, CTR, CPC, conversions, cost/conv, conv value, ROAS, impression share, search terms as table where feasible.
3. **TikTok Ads** — spend, conversions, cost/conversion, CTR, CPC (Matchnode weekly docs already report this).
4. **Microsoft/Bing Ads** — same core set when the Super App already has credentials.
5. **GA4** — sessions, users, conversions, landing pages (already “Add GA4 to the app” is done).
6. **Google Sheets / Drive** — named ranges or header-row tables; this is how Matchnode currently feeds custom conversions (appointments, donations, qualified leads).
7. **Super App internals** — client monthly budget, KPI goal, MTD spend, pacing from `/analytics`; hours; whatever is already first-party.
8. **Adnova** — creative/ad-name rollups as optional blocks, read-only.

**Custom metrics:** Metric Builder — pick source, measure, aggregation, filters, dimensions.

**Calculated metrics:** formula editor combining metrics and constants across sources (CPA, ROAS, blended spend, blended CPA, conversion rate). Timezone required so operands align on dates.

**Metric catalog UX:** search, source filter, favorite, “used on N boards”, last refreshed, owner, definition text.

Every metric has: id, display name, description, owner, source, aggregation (sum/avg/last/count), format (number, currency, percent, duration), polarity (up is good / down is good).

## Scorecards, goals, alerts, snapshots

**Scorecards (huddle daily number)**

- Up to 15 metrics, mixed sources/clients.
- Preset: Yesterday vs previous period, showing value + % change + up/down.
- Schedule: daily/weekly/monthly, time of day (huddles need **before** huddle).
- Delivery: in-app + email; Slack/Google Chat if a notifier already exists.
- Agency template: “all spend metrics for clients assigned to this teammate.” Client assignment must come from Super App teammate/client mapping (`dashboard.matchnode.com` teammate outline), not a hardcoded sheet.

**Goals**

- Attach a numeric goal to any metric for a period (day/week/month/quarter/custom).
- Used by gauges, progress, comparisons, and scorecards.

**Alerts**

- Metric above/below threshold, % change vs prior period, no data / sync failed.
- Existing Super App already has Daily Spend Alerts and Daily Conversion Alerts that currently point at Databox datawalls — **migrate those destinations** to this product rather than leaving a Databox dependency.

**Scheduled snapshots**

- JPG and PDF of a board.
- Recurring: default **Monday 08:00 America/Chicago** (Matchnode technical-lead default) to the client pod.
- Also: one-off email send, download, public link.

**Sharing**

- Public viewer URL analogous to Databox datawalls (stable token, no login).
- Optional password and expiry.
- Embed snippet.
- Respect client confidentiality: public links are created explicitly; default boards are private to Matchnode.

## Data platform (backend)

Design this as a real BI backend, not only UI mockups.

- **Source connections** stored per Super App org/client, with OAuth or existing Super App tokens. Status: connected, needs reconnect, error, last success.
- **Sync:** incremental pulls into a metrics store keyed by `client_id`, `source`, `account_id`, `metric`, `dimensions`, `date` (source timezone). Do not query live ads APIs on every dashboard paint if Super App already warehouses insights — query the warehouse and show freshness.
- **Refresh:** manual refresh on a board/source; poll like Adnova’s refresh-insights (return immediately, data appears after job).
- **Query API** used by every Datablock: metric + filters + range + comparison → current value, series, breakdown, comparison delta.
- **Board JSON** persisted (layout, blocks, style). Autosave. Version or `updated_at` for conflict awareness.
- **Permissions:** Matchnode teammate roles; client-facing public token is a separate capability. Do not leak other clients’ metrics in agency-wide queries.
- **Multi-account:** one client → N ad accounts per platform. Blocks pick an account; calculated metrics may blend accounts.
- **No writes** to ads platforms.

If a source is not yet wired in the Super App, still ship the UI + connector interface and a working **Sheets + Meta + Google Ads** path. Stubbing every source with fake numbers is not acceptable for the primary three.

## Matchnode templates (must ship)

These replace the Guru “new client Databox” ritual.

1. **Standard client weekly board** — last 7 days and MTD: Meta spend / primary conversion / CPA, Google cost / conversions / CPA / CPC, TikTok if connected, blended totals, small trend lines, table of campaigns optional.
2. **Agency spend scoreboard** — yesterday and MTD spend by client (replaces “Add Client Spend to Databox”).
3. **Agency main KPI board** — one block per client for the contracted KPI (replaces adding KPI to the shared datawall `fbca9314…`).
4. **AM huddle scorecard** — yesterday spend % change for all of *my* clients.

Creating a new client in Super App onboarding should be able to **clone template 1**, attach that client’s sources, and produce a public viewer URL that can be pasted into the weekly-doc template. Hook this into existing onboarding (`/client/onboarding`) if the change is small; otherwise document the API/function the onboarding flow should call.

## UX standards (Super App, not Databox skin)

- Use Super App typography, color, buttons, modals, toasts, empty states, tables, date pickers.
- Designer may be denser than typical Super App pages (Databox is dense); still use Super App controls.
- Client context: if the Super App has a global client switcher, boards filter to that client; agency boards ignore it or use “All clients”.
- Loading skeletons on blocks; error state with reconnect CTA; empty library when no sources.
- Accessibility: keyboard selectable blocks, don’t rely on drag-only (click-to-add from library).
- Performance: a 20-block board must load without serial waterfalls; batch metric queries.

## Implementation order (do not skip to polish)

Ship in this order so Matchnode can abandon Databox for paid media first.

**Phase 0 — Spike (short)**  
Map Super App patterns; write a brief architecture note in the PR (routes, tables, which existing insight APIs to call).

**Phase 1 — Foundations**  
Schema for sources, metrics, boards, blocks, goals. Query API for Meta + Google Ads + Sheets. Metric library UI.

**Phase 2 — Designer + Viewer**  
Grid, all listed visualizations that have a Super App chart primitive (minimum viable set if a type is missing: Number, Line, Bar, Pie, Table, Funnel, Progress, Gauge, Notes). Date-range switcher. Templates 1–3.

**Phase 3 — Share + ops**  
Public links, snapshot JPG/PDF, Monday 8am schedule, scorecards, huddle template, alerts for spend/conversions (replace Databox datawalls).

**Phase 4 — Calculated/custom metrics, TikTok/GA4/Bing, AI summary, embed, TV/loop if Super App has a kiosk use case.**

Each phase must be demoable. Do not leave the Designer as a mock.

## Acceptance criteria (definition of done)

A Matchnode technical lead can:

- Connect Meta + Google Ads for a client that already exists in the Super App, plus a Google Sheet of custom conversions.
- Create a board from the **standard client weekly** template and have real numbers, not fixtures.
- Drag, resize, duplicate, and reconfigure blocks; autosave survives reload.
- Change the board date range and see every eligible block update.
- Create a calculated metric `Spend / Conversions` (CPA) blending Meta + Google.
- Publish a public viewer URL and open it logged-out.
- Duplicate the board for a second client and swap sources.
- Build a 15-metric yesterday-vs-prior scorecard for their assigned clients.
- See data freshness and a reconnect path if a token dies.

A Matchnode AM can:

- Find the client board from Super App nav without Databox login.
- Screenshot/share the same way they do in weekly docs (link + image).

Engineering bar:

- Typesafe models; no `any` dumps of API payloads into React state.
- Tests for metric query (aggregation, comparison, timezone, multi-account isolation).
- Tests for calculated metric evaluator.
- No campaign mutations.
- No secrets in client bundles.
- Lint/tests of the Super App pass for touched packages.

## Constraints

- Do not build a generic Tableau/Looker clone (no SQL IDE as the primary UX). Databox is **metrics-first, no-code**.
- Do not embed Databox iframes as the solution.
- Do not stop at a single hardcoded dashboard per client.
- Do not expose other clients’ data in public links or in the wrong client context.
- Do not change production campaigns, budgets, or ads.
- Ask before adding paid third-party dashboard SDKs.

## Suggested first message to yourself after the repo is open

1. Inventory routes, nav, auth, client model, and existing insights fetching.
2. Propose the folder layout and schema in a short note.
3. Implement Phase 1–2 against real Meta/Google data for one existing client.
4. Add templates and public viewer.
5. Only then scorecards, snapshots, and onboarding hook.

Work until the Super App contains a complete Databox-class BI module that Matchnode can use as the system of record for client KPI dashboards.

---

End of agent prompt.
