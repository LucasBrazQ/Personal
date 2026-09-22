# Agent prompt: Build a complete Matchnode BI platform inside the Super App

Copy everything below the line into an AI coding agent that already has the **Matchnode Super App** repo (`marinamatchnode/matchnode-full-dashboard`, live at `https://dashboard.matchnode.com`). Do not paste this into a repo that is not the Super App.

---

## Mission

Build a complete first-party BI product inside the Matchnode Super App that **replaces Databox and the agency's report-building use cases in Looker Studio** for Matchnode’s internal and client-reporting workflows.

Combine the best product capabilities of:

- **Databox:** metrics-first setup, Databoards/Datablocks, fast no-code Designer, metric library, goals, alerts, scorecards, templates, public datawalls, snapshots, and TV-friendly viewing.
- **Looker Studio:** reusable data sources, typed dimensions and measures, freeform multi-page reports, controls and parameters, calculated fields, data blending, cross-filtering, drill-down, reusable themes, extract/live modes, credential modes, governance, embedding, and scheduled PDF delivery.

Do not make a pixel clone or copy proprietary code, text, trademarks, logos, or visual identity. Reproduce useful capabilities and workflows with Matchnode branding and the Super App design system.

The result must **look and behave like every other Super App tool**: same shell, auth, client context, navigation, design system, data patterns, deployment model, and collaboration rules.

Expected result: a non-technical account manager or technical lead can connect a client’s paid-media and business data, model fields and metrics, assemble a multi-page interactive report by drag-and-drop, change dates and controls live, safely blend sources, share a public/passworded link, schedule Monday 8am snapshots, and run daily huddle scorecards — without leaving `dashboard.matchnode.com`.

Use the existing Super App naming convention. If none exists, call the product **Matchnode BI** and call its dashboard objects **Databoards**. Matchnode branding only.

This is a large product, not a credible one-commit task. Work autonomously through the phases below, keeping every phase deployable and demoable. Do not claim full parity when only mock screens or fixtures exist.

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
11. **Treat this prompt as product requirements, not as evidence about the codebase.** If any named route, service, library, table, or job pattern differs in the repository, use the repository's real convention and document the deviation.
12. **Do not silently reduce scope.** Maintain a capability matrix with statuses `not started`, `foundation`, `usable`, and `production-ready`. If a requested capability cannot be completed, leave an explicit tracked follow-up with the missing backend/UI/test work; never present a placeholder as done.

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

Reference Looker Studio product behavior (mimic capability, not brand):

- Connectors, data sources, credentials: https://cloud.google.com/looker/docs/studio/about-connectors-data-sources-and-credentials
- Data modeling and field types: https://cloud.google.com/looker/docs/studio/model-your-data
- Calculated fields: https://cloud.google.com/looker/docs/studio/about-calculated-fields
- Blending: https://cloud.google.com/looker/docs/studio/how-blends-work
- Controls: https://cloud.google.com/looker/docs/studio/about-controls
- Parameters: https://cloud.google.com/looker/docs/studio/parameters
- Filters and inheritance: https://cloud.google.com/looker/docs/studio/about-filter-properties
- Data freshness: https://cloud.google.com/looker/docs/studio/manage-data-freshness
- Extract data: https://cloud.google.com/looker/docs/studio/extract-data-for-faster-performance
- Embedding: https://cloud.google.com/looker/docs/studio/embed-a-report
- Governance: https://cloud.google.com/looker/docs/studio/data-governance-in-looker-studio-an-overview

## Product principles and scope control

1. **Metrics-first by default, fields-first when needed.** A beginner should create a useful board from governed metrics without understanding joins. Advanced users can model dimensions/measures, formulas, blends, controls, and report pages.
2. **Progressive disclosure.** Keep the default flow simple: template → source mapping → board. Put advanced modeling in clearly labeled editors.
3. **One semantic truth.** Charts, scorecards, alerts, goals, exports, and API consumers must query the same metric definitions and authorization layer.
4. **Private and tenant-scoped by default.** Public links, embeds, exports, and owner/service credentials are explicit capabilities with revocation and audit records.
5. **Freshness is part of every answer.** Every result includes source timezone, requested range, last successful sync, cache/extract status, and partial/error state.
6. **Correctness before chart variety.** Never trade tenancy, aggregation, timezone, or comparison correctness for more visualization types.
7. **No false real-time claims.** Distinguish live query, cached query, materialized extract, and scheduled sync.
8. **Accessible without drag-and-drop.** Every Designer action must have a keyboard/click alternative and sensible focus behavior.
9. **Capability parity, not identical limits.** Use vendor limits only as reference points. Choose and document Matchnode limits based on performance, provider quotas, and user needs.

## Required discovery output before implementation

Inspect the real Super App and commit an architecture decision record or implementation plan containing:

- repository/package map, runtime versions, route and navigation registration
- reusable UI, forms, charting, grid, date, table, modal, toast, and theme components
- auth/session provider, role model, client/workspace scoping, public-route middleware, and database row-level security
- current client → platform account mapping, including how multiple accounts are represented
- existing Meta, Google Ads, TikTok, GA4, Sheets/Drive, Adnova, analytics, budget, KPI, hours, and notification data paths
- database, migrations, object/file storage, cache, queue, cron, email/chat, PDF/image rendering, observability, feature flags, and secrets patterns
- deployed topology and local/test setup
- proposed reuse versus new components, with reasons
- a capability matrix and phased migration plan from Databox/Looker Studio

Do not begin broad implementation until this artifact exists. A thin vertical spike using one real source is allowed to validate the design.

## Reference architecture and boundaries

Use the Super App's actual stack, but preserve these logical boundaries:

```text
Connector adapters
  -> ingestion/sync jobs and optional live-query adapters
  -> raw landing tables/object storage (when needed)
  -> normalized facts/dimensions and materialized aggregates/extracts
  -> semantic catalog (fields, governed metrics, formulas, joins, parameters)
  -> authorized query planner/executor/cache
  -> boards/reports, pages, components, themes, templates, versions
  -> viewer, embeds, exports, schedules, alerts, goals, scorecards
```

Do not put provider API calls, formula evaluation, or tenancy decisions inside React chart components. The UI sends a declarative query; the backend validates scope, resolves semantics, plans execution, applies limits, and returns typed results plus freshness/provenance.

### Core services

- **Connection service:** OAuth/service credentials, scopes, account discovery, mappings, health, token rotation/reconnect.
- **Connector SDK/interface:** metadata, schema discovery, incremental cursor, backfill, query capability, rate-limit hints, timezone, retry classification, and health checks.
- **Ingestion service:** idempotent jobs, checkpoints, backfills, late-arriving corrections, deduplication, provider quota budgets, exponential backoff, dead-letter handling.
- **Semantic service:** typed fields, metrics, calculated fields, parameters, relationships/blends, validation, lineage, ownership, versioning.
- **Query service:** tenant-aware planning, aggregation, filtering, joining, comparison periods, timezone alignment, caching, cancellation, row/result limits.
- **Content service:** reports/boards, pages, components, layout, style, templates, drafts, versions, favorites, folders/tags, ownership.
- **Delivery service:** logged-in/public/embed viewing, snapshots, PDF/JPG/CSV export, schedules, destinations, retry history.
- **Monitoring service:** source freshness, sync failures, query latency/error rate, schedule delivery, alerts, audit events.

Keep these as modular boundaries; do not create network microservices unless the existing architecture and scale justify them.

### Storage model

Adapt names to repository conventions. At minimum model:

- organizations/workspaces, clients/brands, users/memberships/roles
- connections, connection accounts/properties, client-account mappings, encrypted credential references
- sync jobs/runs/checkpoints/errors and source freshness
- datasets, fields, field aliases, relationships, extracts/materializations
- metrics, metric versions, formulas, dimensions, formats, polarity, owners, tags, lineage
- reports/boards, pages, components/blocks, layouts, themes, drafts, versions
- filters, parameters, controls, blends, sort and drill configurations
- templates and template source-mapping requirements
- goals, alerts, scorecards, subscriptions/schedules, delivery attempts
- shares/public tokens/password hashes/expiry/domain or IP policy, embeds, audit logs

Use normalized relational records for permissions, connections, schedules, and governed definitions. JSON is appropriate for component configuration and layout, but validate it with versioned schemas and migrations. Use object storage for generated snapshots and large extract artifacts. Never store raw OAuth secrets in board JSON or return them to the browser.

### Canonical query contract

All visualizations and delivery features use one typed query contract equivalent to:

```ts
type BIQuery = {
  workspaceId: string
  clientIds: string[]
  accountIds: string[]
  datasetId?: string
  metricIds: string[]
  dimensions: string[]
  filters: FilterExpression
  parameters: Record<string, Scalar>
  dateRange: DateRange
  comparison?: ComparisonSpec
  timezone: string
  granularity?: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year'
  sort?: SortSpec[]
  limit?: number
}
```

The response must contain typed columns/rows or series plus totals, comparison values/deltas, executed timezone/range, warnings, truncation/partial flags, lineage, cache status, and freshness for every contributing source. Batch independent block queries to prevent serial waterfalls.

Define stable metric semantics. For ratios, explicitly distinguish `SUM(numerator) / SUM(denominator)` from `SUM(row_ratio)` and `AVG(row_ratio)`. Prevent double aggregation of provider-preaggregated metrics such as reach, frequency, and impression share.

## Product information architecture

Left-nav (or Super App equivalent) for this module:

| Area | Purpose |
| --- | --- |
| **Home / Performance** | Login landing: starred metrics, goals, recently viewed boards, trending/up-down metrics |
| **Reports / Databoards** | List, folders/tags, search, favorite, duplicate, templates, owner, modified date, new report |
| **Designer** | Full-screen drag-and-drop editor for report pages, charts, controls, text, images, and shapes |
| **Viewer** | Interactive report with pages, controls, drill/cross-filtering, and master date range |
| **Metrics** | Library of source metrics + custom + calculated; favorite; set goal; set alert |
| **Data / Models** | Connections, reusable data sources, datasets, fields, extracts, relationships/blends, parameters, freshness |
| **Scorecards** | Up to 15 metrics; daily/weekly/monthly delivery |
| **Goals** | Targets on any metric; traffic-light pacing (green ≥100%, amber 75–99%, red <75%) |
| **Alerts** | Threshold / % change / missing data; in-app + email/Slack/Google Chat if Super App already has a notifier |
| **Data sources** | Connect, status, last sync, reconnect, account mapping to Super App clients |
| **Templates** | Account templates (Matchnode standard client board, spend-only board, KPI board) |
| **Deliveries / Sharing** | Access, public link, embed, download, scheduled snapshots/PDFs, email/chat delivery history |
| **Admin / Health** | Connector health, job failures, freshness SLA, usage/query costs, audit log, feature limits |

Keep URLs stable and client-aware, e.g.:

- `/databoards`
- `/databoards/:boardId` (viewer)
- `/databoards/:boardId/edit` (designer)
- `/databoards/metrics`
- `/databoards/data`
- `/databoards/models/:modelId`
- `/databoards/scorecards`
- `/databoards/sources`
- `/databoards/deliveries`
- `/databoards/admin/health` (authorized internal users only)

If the Super App already namespaces by client (`/clients/:id/...`), nest under that **and** still support an agency-wide view for huddle scorecards and the “all-client spend / main KPI” boards.

## Designer (Databox speed plus Looker Studio depth)

The Designer is the core of the product. Ship it as a real editor, not a static dashboard.

**Canvas**

- Grid layout; blocks snap, move, resize; neighbors reflow like Databox.
- Support both **responsive grid** pages and **fixed/freeform** pages for presentation-style reports. Clearly label the mode and preserve layouts across reloads.
- Multi-page reports: add, rename, duplicate, reorder, hide, and delete pages; report-level and page-level components.
- Auto-save with Saving / Saved status.
- Undo/redo, copy/paste, multi-select, align/distribute, arrange layers, group/ungroup, lock, keyboard nudge, and duplicate.
- Draft/published state and version history. Protect against overwriting a newer revision; offer conflict recovery.
- Board title + optional client logo (bottom-left equivalent).
- Board background color + chart theme (use Matchnode tokens, not Databox palettes).
- Master date-range switcher on the board (bottom-right equivalent) that overrides block primary ranges **in viewer mode**.
- Full-screen view.
- Text, image, divider, rectangle/shape, page navigation, and optional URL/embed components with sanitization and allowlists.
- Configurable canvas/page size, background, grid, margins, and responsive preview breakpoints.

**Datablock library (left)**

- Visualization library (blank block of a type).
- Metric library filtered by connected source, with search and groups: Favorite, Basic, Custom, Calculated.
- Data panel with report data sources and searchable dimensions, measures, parameters, calculated fields, and field metadata.
- Pre-built blocks for Matchnode-critical metrics so a tech lead can assemble a new client board in minutes.

**Datablock editor (right, on select)**

- Visualization type
- Data source + account
- Metrics/measures, dimensions, optional breakdown dimension, aggregation, sort, row limit
- Primary date range
- Compare with: previous period, previous year, custom range, goal (multiple comparisons where the viz allows)
- Filters using nested AND/OR groups and operators appropriate to type: equals, in, contains, regex if safely supported, numeric/date ranges, null/empty
- Dimensions / breakdown (cap 15 selected values, matching Databox)
- Number format, currency, timezone
- Show total, trend line, average line
- Drill-down hierarchy, optional drill-through link, chart interactions/cross-filtering
- Conditional formatting, reference lines/bands, axis/legend/label/tooltip settings
- Title, description, font size, accessible label/summary, additional settings

**Controls and parameters**

- Date range, dropdown/list, advanced filter, text input, checkbox, slider/range, parameter input, page navigation, reset controls.
- Scope controls to component group, page, or entire report. Make inheritance and overrides visible.
- Support static option lists and values populated from a field.
- Parameters are typed, have defaults and validation, can feed formulas and connector queries only through parameterized APIs, and have explicit URL-sharing policy.
- Cross-filtering is opt-in per chart. Selecting a chart mark filters eligible components in the configured scope; provide a visible clear-filter state.

**Reusable data and styling**

- A report may use one or more reusable data sources; a component may use one data source or an explicit blend.
- Report theme controls typography, palette, chart defaults, backgrounds, borders, and spacing using Super App tokens.
- Copying a page/component must either preserve valid bindings or open a source-remapping flow.
- Template creation strips private account identifiers and stores required source/field mappings.

**Block actions:** move, resize, duplicate (same board or another board), delete (confirm).

Each block is independent (own source, metric, range) except when the viewer master date range is applied.

## Visualization and component system

Implement a typed visualization registry rather than one-off chart conditionals. Each visualization declares compatible field roles, minimum/maximum fields, supported interactions, configuration schema, renderer, empty/error behavior, export behavior, and accessibility fallback.

Required types:

- **KPI:** number/scorecard with comparison and sparkline, progress, radial progress, bullet, gauge
- **Time/category:** line, area, stacked area, vertical/horizontal bar, grouped/stacked/100% stacked bar, combo
- **Part-to-whole:** pie/donut, treemap
- **Tabular:** table, pivot table, leaderboard with pagination, sorting, totals, subtotals, conditional formatting
- **Relationship/distribution:** scatter, bubble, histogram, box plot, heatmap
- **Process:** funnel, pipeline/waterfall
- **Specialized:** radar/spider and cohort/retention heatmap where field semantics support them
- **Geospatial:** geo region and point/bubble map only when geo fields and the approved map provider are available
- **Content/control:** notes/rich text, image, divider/shape, filter controls, page navigation

Charts must have deterministic colors, localized number/date formatting, useful tooltips, legend behavior, no-data and partial-data states, keyboard-readable summaries, and CSV-compatible underlying data where authorized. Large tables require server-side pagination or virtualization.

Optional if time: AI summary block that explains the selected metric(s) for the active range using existing Matchnode AI notes patterns (weekly docs already have `{{overall_ai_performance}}` style summaries). Do not block v1 on LLM quality.

Traffic lights for goal-based viz:

- Green ≥ 100% of goal (or on-pace for the selected range)
- Amber 75–99%
- Red < 75%

## Metrics layer

Model data at two levels:

1. **Fields:** typed dimensions, measures, dates, geo fields, URLs, booleans, currencies, percentages, and durations belonging to a reusable data source/dataset.
2. **Governed metrics:** named, owned, reusable business definitions built from fields or other governed metrics and used consistently in charts, goals, alerts, scorecards, and exports.

Each field records source name, stable identifier, label, description, type, semantic role, default aggregation, format, visibility, sensitivity classification, and lineage. Each metric records owner, definition, aggregation, format, polarity, supported grains/dimensions, timezone behavior, version, certification state, and where it is used.

**Basic (native) metrics — priority sources**

1. **Meta Ads** — spend, impressions, reach, clicks, CTR, CPC, CPM, frequency, purchases/leads/custom conversions, cost per result, ROAS, thruPlay, video metrics. Support account, campaign, ad set, ad, creative.
2. **Google Ads** — cost, clicks, impressions, CTR, CPC, conversions, cost/conv, conv value, ROAS, impression share, search terms as table where feasible.
3. **TikTok Ads** — spend, conversions, cost/conversion, CTR, CPC (Matchnode weekly docs already report this).
4. **Microsoft/Bing Ads** — same core set when the Super App already has credentials.
5. **GA4** — sessions, users, conversions, landing pages (already “Add GA4 to the app” is done).
6. **Google Sheets / Drive** — named ranges or header-row tables; this is how Matchnode currently feeds custom conversions (appointments, donations, qualified leads).
7. **Super App internals** — client monthly budget, KPI goal, MTD spend, pacing from `/analytics`; hours; whatever is already first-party.
8. **Adnova** — creative/ad-name rollups as optional blocks, read-only.

After priority sources work end-to-end, use the same connector contract for BigQuery/warehouse tables, PostgreSQL/MySQL if already approved, CSV upload, and approved APIs/webhooks. Do not delay replacement of current Databox workflows to chase connector count.

**Custom metrics:** Metric Builder — pick source/dataset, measure, aggregation, filters, dimensions, format, and favorable direction. Support `SUM`, `AVG`, `COUNT`, `COUNT_DISTINCT`, `MIN`, `MAX`, `MEDIAN` where the engine supports it, and `LATEST` with deterministic date ordering.

**Calculated fields and metrics:**

- Formula editor with autocomplete, type checking, validation, preview, and human-readable errors.
- Arithmetic; safe division; comparisons; boolean logic; `CASE`; null handling; text/date functions; approved aggregations; period-over-period helpers.
- Report/data-source calculated fields are reusable. Chart-local fields are scoped to one component and may use a blend.
- Calculated metrics may combine governed metrics and constants across sources only when grain, join/alignment key, account scope, currency, and timezone are compatible.
- Prevent recursion and ambiguous nested aggregation. Store an AST or equivalent safe expression model; never evaluate arbitrary JavaScript/SQL from the browser.
- Timezone is mandatory for cross-source date alignment. Currency conversion requires an explicit rate source and effective date; never add mixed currencies silently.
- Preview sample results and SQL/query plan where safe for internal admins, with estimated scan/cost for metered warehouses.

**Data manipulation and modeling:**

- Rename/alias, hide, cast type, replace/null handling, groups, bins, sort keys, date grain, and custom fiscal periods without changing source data.
- Dataset builder for selecting columns, filtering rows, deriving fields, and scheduling an extract/materialization.
- Explicit relationships and blends with join type, ordered inputs, join keys, cardinality (`1:1`, `1:N`, `N:1`, `N:N` warning), pre-aggregation behavior, and preview.
- Support at least left and inner joins initially; add full/right only if the execution engine can preserve understandable semantics.
- A blend may combine up to a documented safe number of inputs. Do not copy Looker Studio's five-table limit blindly.
- Detect fan-out/double-count risks and incompatible grains before save. Display lineage and source freshness for every input.
- Filter execution order must be defined: authorization/RLS → connector/source restrictions → pre-aggregation filters → blend/join → calculated results/post-aggregation filters → presentation limits.
- Version governed definitions; show downstream impact and “used on N reports” before breaking changes.

**Metric catalog UX:** search, source/tag/certification filter, favorite, “used on N boards”, last refreshed, owner, definition, lineage, supported dimensions, grain, format, change history, and deprecate/replace flow.

Every metric has: id, display name, description, owner, source, aggregation (sum/avg/last/count), format (number, currency, percent, duration), polarity (up is good / down is good).

## Connector platform

Define one typed connector interface and contract tests. Every connector declares:

- authentication mode and required scopes
- account/property discovery and stable external identifiers
- schemas/fields/metrics, data types, aggregation constraints, supported dimensions and filters
- available date range, source timezone/currency, data latency, attribution caveats, retroactive-update window
- incremental sync cursor and backfill strategy, pagination, quotas, retryable versus terminal errors
- whether it supports live query, scheduled sync, extract, schema refresh, and viewer credentials
- health status and user-facing reconnect/remediation instructions

Connection creation flow:

1. choose connector
2. authorize through server-side OAuth or approved credential flow with `state`/PKCE where applicable
3. enumerate accounts/properties
4. map one or many accounts to an existing Super App client/workspace
5. select default timezone/currency only when the source does not provide them
6. review scope and start initial backfill
7. show progress, freshness, failures, and reconnect

Credential/access modes:

- **Workspace/service-owned:** authorized viewers can see results without direct source credentials, subject to BI permissions.
- **Viewer-owned:** query using the viewer's connection when supported and required.
- **Public/share token:** may only access a pre-authorized report and query envelope; never grants general connector access.

Encrypt credentials using the existing secret mechanism/KMS. Redact tokens and sensitive payloads from logs. Refresh and revoke safely. Validate OAuth callback ownership and prevent one workspace from attaching another workspace's connection.

### Priority connector acceptance

- Meta Ads, Google Ads, and Sheets/Drive must have real end-to-end paths, not fixtures.
- Multiple accounts per client and account-level timezone/currency differences must be tested.
- Ads connectors are read-only and request the least scopes possible.
- Historical backfill and incremental correction must handle provider attribution changes.
- Sheets supports header selection, type inference with overrides, named ranges/tabs, schema drift, blank/error cells, and a required date field for time-series metrics.
- Super App internal metrics use internal service contracts rather than scraping UI routes.
- Adnova data follows approved organization/workspace/account resolution and exposes data freshness.

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

- Metric above/below threshold, inside/outside range, % or absolute change vs prior period, goal reached/off pace, no data, stale data, and sync failed.
- Configure evaluation range, schedule/timezone, recipients/channels, cooldown/deduplication, recovery notification, and pause/resume.
- Persist every evaluation and notification outcome. An alert query uses exactly the same metric semantics and permissions as its chart.
- Existing Super App already has Daily Spend Alerts and Daily Conversion Alerts that currently point at Databox datawalls — **migrate those destinations** to this product rather than leaving a Databox dependency.

**Scheduled snapshots**

- JPG and PDF of a board.
- Recurring: default **Monday 08:00 America/Chicago** (Matchnode technical-lead default) to the client pod.
- Also: one-off email send, download, CSV/underlying data where authorized, public link.
- Render a consistent published revision with active default filters and record timezone, date range, report version, render status, and delivery status.
- Retry transient rendering/delivery failures with limits. Show delivery history and a manual retry action.

**Sharing**

- Public viewer URL analogous to Databox datawalls (stable token, no login).
- Optional password and expiry.
- Logged-in sharing by user/team/role with viewer/editor/publisher ownership.
- Embed snippet with fixed/responsive sizing, allowed-origin policy, and interactive/read-only options.
- Owner/service credential behavior must be explicit: a viewer may only see source data through the report's authorized query envelope.
- Publish workflow separates autosaved draft from public/client-visible revision. Preview “as viewer” and “as public.”
- Copy/duplicate can be allowed independently from view, export, and underlying-data download.
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

### Ingestion, freshness, and extracts

- Prefer existing warehouse data when its semantics and freshness meet the requirement. Do not duplicate pipelines without documenting why.
- Incremental jobs are idempotent and keyed so retries cannot double count. Store source cursor/checkpoint separately from job state.
- Support bounded backfills and late-data correction windows. Record row counts, covered date range, watermark, duration, warnings, and terminal error.
- Partition/index by tenant/client/source/account/date according to the actual database. Enforce retention and deletion policies.
- Queue provider calls and honor quotas with concurrency controls, jittered exponential backoff, and circuit breaking. Never refresh all accounts synchronously from a web request.
- Freshness policies are per connection/dataset. Active boards, alerts, and deliveries may maintain warmer data, but never exceed provider limits.
- Manual refresh enqueues work, returns a job ID, and reports progress. Deduplicate concurrent refreshes.
- Extracts select fields/date/filter and refresh schedule, have documented row/byte limits, and report truncation. Version or atomically swap extracts so viewers never see half-built data.
- Distinguish `last_attempt_at`, `last_success_at`, source watermark, cache age, and report render time.

### Query correctness and performance

- Enforce tenant/client/account authorization before planning or cache lookup. Cache keys include authorization scope, semantic-definition version, parameters, filters, timezone, currency, and data watermark.
- Push filters/aggregations down when safe; cap scan size, execution time, dimensions, rows, and concurrent queries. Support cancellation.
- Use deterministic inclusive/exclusive date boundaries and DST behavior. Define week start and fiscal calendar.
- Comparison periods use equal complete periods unless the user explicitly selects “to date.” Label partial periods.
- Return structured per-source errors so one failed block or blend input does not blank unrelated blocks.
- Batch dashboard requests and avoid N+1 metadata or account lookups. Stream or progressively render where the stack supports it.
- Set a measured performance budget after testing real data. As an initial target, cached 20-block viewers should become useful within 2 seconds at p75 and 5 seconds at p95; do not certify until instrumented results support the claim.

### Security, governance, and audit

- Authorization hierarchy: organization/workspace → client/brand → connection/account → data source/model → report/folder → share/delivery.
- Define a role matrix using existing roles for view, explore, create, edit, publish, share publicly, manage connections, manage governed metrics, schedule delivery, and administer.
- Apply database row-level security or equivalent defense in depth; do not rely only on UI filtering.
- Sensitive fields can be hidden or denied by role. Exports, underlying-data downloads, and public viewers must use the same field policy.
- Public links use high-entropy stored hashes, are revocable, optional password protected with a slow password hash, and can expire. Rate limit password attempts and token endpoints.
- Embeds have explicit allowed origins, restrictive CSP/frame policy, scoped signed tokens where authentication is required, and no arbitrary script injection.
- Prevent CSV/formula injection, stored XSS in labels/notes, unsafe SVG/image URLs, SSRF in connector URLs, SQL injection, parameter injection, and IDOR.
- Audit connection changes, permission/share changes, public access, exports, schedules, governed-definition changes, and admin actions with actor, scope, time, and outcome.
- Provide workspace data export/deletion hooks consistent with current policy. Never leak provider credentials, account IDs, or another client's metadata in errors.

### Observability and operations

- Structured logs with correlation IDs across viewer query, job, connector, snapshot, and delivery; redact secrets and sensitive payloads.
- Metrics/dashboards for query latency/cache hit/error/truncation, sync delay/success/failure/rate limits, source freshness SLA, queue depth, export duration, schedule success, and public-link abuse.
- Error tracking and traces use existing Super App tooling.
- Admin health view groups actionable issues by client/source and provides reconnect, retry, and run-history links.
- Alert operators on persistent failures and freshness breaches without creating per-account notification storms.
- Include migrations, backfill/runbook, rollback strategy, feature flags, and staged enablement. Do not enable replacement workflows globally until parity data checks pass.

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

**Phase 0 — Discovery and architecture**
Produce the required discovery artifact, capability matrix, data-flow diagrams, schema/query contracts, role matrix, connector reuse map, security risks, and migration plan. Validate one thin real-data query.

**Phase 1 — Foundations**
Migrations and typed models for connections, accounts, data sources, fields, governed metrics, reports/pages/components, goals, permissions, and jobs. Authorized query API and connector contract. Real Meta + Google Ads + Sheets paths, freshness/health, metric library, tests and instrumentation.

**Phase 2 — Usable Designer and Viewer**
Responsive grid, report pages, autosave/conflict handling, number/line/bar/pie/table/funnel/progress/gauge/notes, date and dropdown controls, viewer, templates 1–3, batching, loading/error/empty states, accessibility, draft/publish.

**Phase 3 — Sharing and operations**
Role-based sharing, public links, embed security, snapshot JPG/PDF, Monday 8am schedules, exports, scorecards, huddle template, alerts for spend/conversions, audit and admin health. Migrate selected Databox destinations behind a feature flag.

**Phase 4 — Modeling and advanced reports**
Custom/governed metrics, safe formula engine, calculated fields, reusable data sources, parameters, control scoping, cross-filtering, drill-down, explicit blends/relationships, extracts, pivot/advanced chart types, version impact analysis.

**Phase 5 — Connector and delivery breadth**
TikTok, GA4, Bing, Super App internals, Adnova, approved databases/warehouse/CSV/API; remaining visualizations; reusable themes; folders; anomaly alerts if justified; TV/loop if there is a kiosk use case; AI summary only with grounding, privacy, evaluation, and clear non-authoritative labeling.

**Phase 6 — Replacement readiness**
Parallel-run representative clients against Databox/Looker Studio, reconcile metric definitions and accepted discrepancies, load/security/accessibility tests, runbooks, migration tooling, user documentation, telemetry review, staged rollout, and explicit sign-off before retiring vendor workflows.

Each phase must be independently deployable, demoable, documented, tested, and protected by feature flags where appropriate. Commit and report after each phase. Do not leave the Designer, connectors, exports, or schedules as mocks.

For every phase:

1. restate scope and unresolved decisions
2. implement the smallest complete vertical slices
3. add migrations, tests, observability, docs, and rollback path with the code
4. run repository lint/typecheck/unit/integration checks
5. perform browser verification using real authorized data
6. update the capability matrix and list evidence, limitations, and next phase

## Acceptance criteria (definition of done)

A Matchnode technical lead can:

- Connect Meta + Google Ads for a client that already exists in the Super App, plus a Google Sheet of custom conversions.
- Create a board from the **standard client weekly** template and have real numbers, not fixtures.
- Drag, resize, duplicate, and reconfigure blocks; autosave survives reload.
- Change the board date range and see every eligible block update.
- Create a calculated metric `Spend / Conversions` (CPA) blending Meta + Google.
- Add a second page, a dropdown campaign filter, a typed parameter, and a cross-filtering chart; scope the controls and preview viewer behavior.
- Inspect a metric's definition, aggregation, lineage, timezone, owner, freshness, and downstream usage.
- Create and preview an explicit two-source blend; the UI blocks or warns about incompatible grain and fan-out.
- Publish a public viewer URL and open it logged-out.
- Revoke the URL and verify it immediately stops returning metadata and data.
- Duplicate the board for a second client and swap sources.
- Build a 15-metric yesterday-vs-prior scorecard for their assigned clients.
- See data freshness and a reconnect path if a token dies.
- Schedule a versioned PDF and inspect successful/failed delivery history.

A Matchnode AM can:

- Find the client board from Super App nav without Databox login.
- Screenshot/share the same way they do in weekly docs (link + image).

Engineering bar:

- Typesafe models; no `any` dumps of API payloads into React state.
- Unit tests for formula parsing/type checking/evaluation, date/comparison logic, number formatting, filter AST, aggregation, and connector normalization.
- Contract tests for each connector, query response, visualization configuration, and versioned board JSON.
- Integration tests for auth/RLS, multi-account and cross-client isolation, sync retry/idempotency, cache scoping/invalidation, extracts, blends, public tokens, schedules, and exports.
- End-to-end tests for connect/map → metric → report → edit → publish → view → filter → share/revoke → schedule.
- Golden-data reconciliation for provider API totals and representative Databox/Looker Studio reports, with documented attribution/timezone differences.
- Security tests for IDOR, public token enumeration, permission downgrade, XSS, injection, SSRF, CSV injection, allowed embed origins, and secret redaction.
- Accessibility checks for keyboard Designer paths, focus, labels, contrast, chart summaries, reduced motion, and zoom.
- Load tests for a representative 20-block report, agency-wide scorecard, concurrent public viewers, sync queue, and scheduled render burst.
- No campaign mutations.
- No secrets in client bundles.
- No cross-client metadata in autocomplete, cache, logs, errors, exports, or public responses.
- Database migrations are reversible or have a documented safe rollback; background jobs are backward compatible during deploy.
- Instrumented freshness, correctness, performance, and delivery SLOs have dashboards and owners.
- Lint/tests of the Super App pass for touched packages.

## Required handoff artifacts

Do not finish with only code. Deliver:

- architecture decision record and updated capability matrix
- schema diagram, query/connector contracts, metric semantics, and filter/blend execution rules
- role/share/credential-mode matrix and threat model
- connector setup and reconnect runbooks
- operations runbook for stale data, failed sync, failed render/delivery, quota pressure, and rollback
- user help for creating a source, metric, report, control, blend, goal, alert, scorecard, share, and schedule
- migration checklist for each Databox/Looker Studio workflow and client
- test evidence and known limitations
- screenshots or short walkthrough of the tested vertical flows if the environment supports artifacts
- sample templates containing no credentials, private account identifiers, or client data

## Constraints

- Do not build a generic Tableau/Looker clone (no SQL IDE as the primary UX). Databox is **metrics-first, no-code**.
- Do not embed Databox iframes as the solution.
- Do not embed Looker Studio as the implementation of the first-party product.
- Do not stop at a single hardcoded dashboard per client.
- Do not expose other clients’ data in public links or in the wrong client context.
- Do not change production campaigns, budgets, or ads.
- Ask before adding paid third-party dashboard SDKs.
- Do not expose arbitrary SQL to normal users. If an internal-admin SQL mode is later justified, isolate and sandbox it with read-only credentials, limits, audit, and explicit approval.
- Do not treat a frontend-only filter as authorization or row-level security.
- Do not use production client data in fixtures, screenshots, logs, or tests.
- Do not introduce a new database, queue, cache, auth provider, chart library, or semantic engine until the discovery artifact proves the existing stack cannot satisfy the requirement and records the operational cost.

## Suggested first message to yourself after the repo is open

1. Inventory routes, nav, auth, client model, and existing insights fetching.
2. Create the discovery artifact, capability matrix, role matrix, and architecture proposal; identify assumptions that need product/security decisions.
3. Implement one secure vertical slice against real Meta or Google data: connection mapping → governed metric → query → scorecard chart → saved report → authorized viewer.
4. Expand Phase 1–2 with Sheets, Designer, controls, templates, and publish.
5. Add public sharing, deliveries, scorecards, alerts, and onboarding only after authorization and query correctness tests pass.
6. Add advanced modeling/blending and connector breadth without regressing the simple metrics-first flow.

Work through the phases until the Super App contains a production-ready, first-party BI module combining Databox-style operational dashboards with Looker Studio-style interactive reporting and modeling. Be precise in every update about what is production-ready, what is usable but limited, and what remains.

---

End of agent prompt.
