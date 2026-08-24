# PilatesAnytime → Databox: Weekly Platform Performance Report

Replicate the client’s weekly ad-platform spreadsheet in Databox: **Current Week vs Prior Week vs WoW %** for **Acquisitions, Spend, and CPA**, by platform, with a **TOTAL** row.

## What the spreadsheet is

| Rows (platforms) | Column groups |
| --- | --- |
| Google Search Ads (Non-Brand) | **Current Week** — Acquisitions, Spend, CPA |
| Meta Ads | **Prior Week** — Acquisitions, Spend, CPA |
| Microsoft Search Ads (Branded) | **WoW % Difference** — Acquisitions %, Spend %, CPA % |
| Google Search Ads (Brand) | |
| Apple Ads | |
| **TOTAL** | |

**Formulas**

- `CPA = Spend / Acquisitions` (per platform and for TOTAL)
- `WoW % = (Current − Prior) / Prior`
- TOTAL Acquisitions / Spend = sum of platform rows; TOTAL CPA = TOTAL Spend / TOTAL Acquisitions (not average of CPAs)

**Date ranges in the sample sheet**

- Current: `2026-08-16` → `2026-08-22` (Sun–Sat)
- Prior: `2026-08-02` → `2026-08-08` (Sun–Sat, **two weeks prior**, not the adjacent week)

Confirm with the client whether Prior should be:

1. **Adjacent previous week** (standard Databox “Previous period”), or  
2. **Same weekday window two weeks ago** (as in the sample — needs a custom comparison range)

---

## Recommended approach (pick one)

### Option A — Exact spreadsheet layout (recommended for fidelity)

Use a **Google Sheet as the hub**, then visualize it in Databox.

**Why:** Native Databox tables can show metrics + % change, but they do **not** cleanly produce the full 9-column Current / Prior / WoW grid across **multiple ad platforms as rows** in one block. Sheets preserves the exact layout and TOTAL logic.

**Flow**

1. Keep (or automate) a weekly tab with the same structure as the client sheet.
2. Add a Databox-friendly **long** sheet (Metric Builder works best with Date + Dimension + Value).
3. Connect Google Sheets → Databox → Table / Number datablocks.
4. Optionally schedule a Scorecard or PDF snapshot every Monday.

### Option B — Native connectors (more automated, layout is approximate)

Connect each ad platform in Databox and build a Databoard of tables / numbers with **Compare → Previous period**.

**Pros:** Less manual entry, live sync.  
**Cons:** Harder to get Brand vs Non-Brand Google rows, Apple Ads coverage, and the exact 3×3 column grouping in one table.

### Option C — Hybrid

Native connectors for Meta + Google + Microsoft; Sheets (or Metric Builder) for Apple / brand-split / acquisition definition; Data Calculations for TOTAL CPA.

---

## Data sources to connect in Databox

| Spreadsheet row | Databox source | Notes |
| --- | --- | --- |
| Google Search Ads (Non-Brand) | Google Ads | Filter campaigns (or use labels) to **non-brand** |
| Google Search Ads (Brand) | Google Ads | Filter to **brand** campaigns |
| Meta Ads | Facebook Ads (Meta) | Account: Pilates Anytime |
| Microsoft Search Ads (Branded) | Microsoft Advertising | Filter to branded search |
| Apple Ads | Apple Search Ads *or* Google Sheets | Native support varies by Databox plan; Sheets is a reliable fallback |
| TOTAL | Data Calculation | `SUM` spend & acquisitions; CPA = spend ÷ acquisitions |

Confirm the **Acquisitions** definition with the client (trial starts, subscriptions, Wicked Sales custom conversions, CRM closed deals, etc.). Meta for this brand has custom conversions such as Wicked Sales / Complete Registration — CPA in the sheet may not be Meta’s default “purchase” CPA.

**Meta spot-check (Adnova, week of 2026-08-16 → 2026-08-22):** account spend ≈ **$15,997** (sheet: $16,031). Platform “purchases” ≈ 16; **Complete Registration** custom conversion ≈ **169** (sheet Meta acquisitions: 196). Do not wire Databox to default purchase CPA until the acquisition event is confirmed — Complete Registration (or a Wicked Sales variant / blended CRM count) is the likely candidate.

---

## Option A — Sheets schema for Databox

### Tab 1: `Weekly_Matrix` (client-facing, matches the spreadsheet)

Leave this as the human-readable report (logo, merged headers, green CPA columns, etc.).

### Tab 2: `Databox_Long` (for Metric Builder)

| date | platform | metric | value |
| --- | --- | --- | --- |
| 2026-08-16 | Google Search Ads (Non-Brand) | acquisitions | 126 |
| 2026-08-16 | Google Search Ads (Non-Brand) | spend | 14161 |
| 2026-08-16 | Google Search Ads (Non-Brand) | cpa | 112 |
| 2026-08-16 | Meta Ads | acquisitions | 196 |
| … | … | … | … |
| 2026-08-16 | TOTAL | acquisitions | 482 |
| 2026-08-16 | TOTAL | spend | 32872 |
| 2026-08-16 | TOTAL | cpa | 68 |

- `date` = **week start** (Sunday) for each week’s snapshot  
- One row per platform × metric × week  
- Pre-calculate CPA and TOTAL in Sheets so Databox only displays  

### Metric Builder (per metric)

For each of **acquisitions**, **spend**, **cpa**:

1. Data Manager → Google Sheets → Metric Builder  
2. **Value** = `value` column (Data Type: Event / Currency for spend & CPA)  
3. **Date** = `date`  
4. **Dimension** = `platform`  
5. Filter `metric` = the metric name  

### Databoard layout (closest to the sheet)

1. **Title:** PilatesAnytime — Weekly Paid Media  
2. **Table A — Current week**  
   - Metrics: Acquisitions, Spend, CPA  
   - Show columns: **Metrics**  
   - Date range: Last week (Sun–Sat) or fixed custom range  
   - Sort: Custom (match spreadsheet row order)  
   - Show Aggregate: Off (use TOTAL row from Sheets) or SUM for Acq/Spend only  
3. **Table B — Prior week**  
   - Same metrics; date range = prior comparison window  
4. **Table C — WoW %**  
   - Either pre-computed % columns in Sheets, **or** Current table with **Compare with → Previous period / Custom range** and Change Function = **Percentage change**  
5. Highlight CPA columns visually (Datablock colors) to mimic the green CPA columns.

If you need **one** table with all nine columns, keep `Weekly_Matrix` as the source of truth and use a wide Sheets range mapped as custom metrics, or embed the Sheet via a Databox Google Sheets table of the matrix range.

---

## Option B — Native Databoard blueprint

### 1. Custom / calculated metrics

| Metric | Formula / setup |
| --- | --- |
| Platform Acquisitions | Source conversion (purchase / trial / Wicked Sales / etc.) with campaign filters |
| Platform Spend | Native spend, same filters |
| Platform CPA | Data Calculation: `Spend / Acquisitions` |
| Total Acquisitions | Sum of platform acquisition metrics |
| Total Spend | Sum of platform spend metrics |
| Total CPA | `Total Spend / Total Acquisitions` |

### 2. Filters / segments (critical)

- Google: Brand vs Non-Brand via campaign name contains / excludes brand terms, or Google Ads labels  
- Microsoft: Branded campaigns only  
- Meta: whole account (or exclude testing campaigns if needed)

### 3. Visualization

**Best native approximation**

- One **Table** Datablock per platform group is awkward; prefer:
  - **Horizontal layout of Number datablocks** (5 platforms × 3 metrics), each with Compare → Previous period, **or**
  - One Table with **Show columns = Metrics**, rows = manually added metrics named by platform (e.g. `Meta — Spend`), Compare = Previous period

**Date range**

- Databoard default: **Last week** (align account timezone to client’s week definition — Sun–Sat vs Mon–Sun)  
- Compare with: **Previous period** *or* **Custom range** if they truly want two weeks prior

### 4. Weekly Scorecard / notification

- Metrics: Total Acquisitions, Total Spend, Total CPA (+ optional Meta / Google Non-Brand)  
- Show data for: Last week  
- Compared to: Previous period  
- Frequency: Monday morning email / Slack  

Scorecards are capped (currently a small number of metrics per scorecard) — use them for **TOTAL + highlights**, not the full matrix.

---

## Formatting checklist (match the sheet)

- [ ] Platform row order matches the spreadsheet  
- [ ] TOTAL bold / aggregate row  
- [ ] CPA emphasized (color)  
- [ ] Currency for Spend & CPA; integers for Acquisitions; % for WoW  
- [ ] WoW: green for “good” direction — note CPA down is good (invert comparison color if Databox supports inverted polarity)  
- [ ] Week labels show date ranges in the Databoard title or text block  
- [ ] Brand logo / client name in header  

---

## Validation sample (from client sheet)

| Platform | Current Acq | Current Spend | Current CPA | WoW Acq | WoW Spend | WoW CPA |
| --- | --- | --- | --- | --- | --- | --- |
| Meta Ads | 196 | $16,031 | $82 | (from sheet) | (from sheet) | (from sheet) |
| TOTAL | 482 | $32,872 | $68 | +9% | +3% | −5% |

After connecting sources, reconcile Meta Spend / Acquisitions / CPA for `2026-08-16`–`2026-08-22` against the sheet before going live.

---

## Implementation order

1. Confirm **Acquisitions** event and **week + prior-week** definition with the client.  
2. Connect Meta, Google Ads, Microsoft Advertising (+ Apple or Sheets).  
3. Build Brand / Non-Brand / Branded filters.  
4. Choose Option A (exact) or B (native).  
5. Build Databoard + Monday Scorecard.  
6. Spot-check one closed week against the spreadsheet.  
7. Hand off: how to add a new platform row and how TOTAL is calculated.

---

## Open questions for the client / account team

1. Exact conversion event for **Acquisitions** on each platform?  
2. Prior week = adjacent week or two weeks back (as in the sample)?  
3. Week boundary: Sun–Sat or Mon–Sun? Timezone?  
4. Should Apple Ads be live-connected or remain Sheets-fed?  
5. Who receives the weekly Databox Scorecard / snapshot?
