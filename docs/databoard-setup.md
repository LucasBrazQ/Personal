# Pilates Anytime weekly platform report in Databox

Replicate the client spreadsheet: one row per ad platform, three metric groups
(Current week / Prior week / WoW %), and a TOTAL row.

The closest Databox visualization is a **Table** datablock with **Show columns =
Metrics**, **Compare with = Previous period**, and **% change**. Databox cannot
draw Excel-style grouped header bands, so current / prior / WoW appear as extra
columns on each metric instead of nested header rows.

## Why a single pushed dataset

Native connectors exist for Google Ads, Facebook Ads, and Microsoft Advertising.
Apple Search Ads has no native Databox connector. Brand vs non-brand Google also
needs campaign-name filters that do not line up with Meta / Microsoft / Apple in
one table.

Push one dataset with a `platform` dimension so the table rows match the sheet:

| Row | Source |
| --- | --- |
| Google Search Ads (Non-Brand) | Google Ads (Search, non-brand campaigns) |
| Meta Ads | Meta (all campaigns) |
| Microsoft Search Ads (Branded) | Microsoft Advertising (brand campaigns) |
| Google Search Ads (Brand) | Google Ads (Search, brand campaigns) |
| Apple Ads | Apple Search Ads (API / sheet → this dataset) |
| TOTAL | Either a `TOTAL` row in the dataset, or the table aggregate |

Do **not** turn on table **Show Aggregate = SUM** if you also send a `TOTAL`
row, or spend and acquisitions will double-count. CPA must be spend ÷
acquisitions (never an average of row CPAs).

## Metrics

| Spreadsheet | Dataset field | Databox metric |
| --- | --- | --- |
| Acquisitions | `acquisitions` | SUM |
| Spend | `spend` | SUM, currency USD |
| CPA | calculated | `spend / acquisitions`, currency USD, **favorable trend = down** |

Meta snapshot (as of ~10:31 AM PT on 24 Aug 2026; ask if you want it refreshed):

| Week | Acquisitions (Complete Registration) | Spend | CPA |
| --- | --- | --- | --- |
| 16–22 Aug 2026 | 169 | $15,997 | $95 |
| 2–8 Aug 2026 | 141 | $14,135 | $100 |

Meta **Purchases** for 16–22 Aug were only 16, so the sheet’s “Acquisitions”
column is not Purchases. Complete Registration is the closest count; confirm
before locking the mapping. Spreadsheet grand total for 16–22 Aug was 482 /
$32,872 / $68 CPA across every platform.

## Week definition

The sheet uses **Sunday–Saturday** weeks. Current week in the screenshot is
**16–22 Aug 2026**. Prior week is **2–8 Aug 2026** — that skips 9–15 Aug.

In Databox:

- **Previous period** = the immediately previous window of the same length
  (9–15 Aug if current is 16–22 Aug).
- To match the screenshot’s skipped week, set **Compare with → Custom range**
  to 2–8 Aug, or ingest only those two week-start dates.

Set the Databoard week start to **Sunday** (account timezone
`America/Los_Angeles` unless the client says otherwise).

## A. Push the dataset (recommended)

1. Create a Databox API key (Account settings → API) and put it in `.env` as
   `DATABOX_API_KEY` (see `.env.example`).
2. Create the source + dataset:

   ```bash
   python pilates_anytime/push_to_databox.py --setup
   ```

3. Push rows (one record per `date` + `platform`; `date` is the Sunday that
   starts the week):

   ```bash
   python pilates_anytime/push_to_databox.py --ingest pilates_anytime/sample_records.json
   ```

4. In Databox → Data Manager, open **Weekly platform performance** and create:

   - **Acquisitions** — SUM of `acquisitions`, dimension `platform`
   - **Spend** — SUM of `spend`, currency, dimension `platform`
   - **CPA** — calculated `Spend / Acquisitions` (use the metric builder
     calculated-column / custom metric so the ratio is computed after SUM)

## B. Build the Databoard

1. New Databoard, e.g. **Pilates Anytime — Weekly paid media**.
2. Optional: Image datablock with the co-branded header logo, top left.
   Upload `pilates_anytime/assets/matchnode-pilates-anytime-combined.png`
   (Matchnode mark + divider + Pilates Anytime wordmark on black). To regenerate
   after swapping either source logo, run
   `python scripts/create_combined_logo.py`.
3. Add a **Table** datablock, full width.

### Table settings

| Setting | Value |
| --- | --- |
| Title | `Current Week` / leave blank and use a Notes block for the dates |
| Date range | Last complete week (Sun–Sat), or a pinned custom range |
| Metrics | Acquisitions, Spend, CPA (in that order) |
| Breakdown by | `platform` |
| Show columns | **Metrics** |
| Compare with | Previous period (or Custom range) |
| Change function | Percentage change, format `+0%` |
| Sort by | Custom — order in `pilates_anytime/config.json` |
| Show Aggregate | Off if `TOTAL` is a row; otherwise SUM (CPA will be wrong — prefer a TOTAL row) |
| Label header | Source |
| Number rows | Off |

For each metric, open **Advanced metric settings**:

- Current-week column: format number / $0 / $0 (CPA).
- Comparison column: same format (this is “Prior Week”).
- Change column: percentage. CPA favorable trend **down** (green when CPA falls).
- Rename column titles to **Acquisitions**, **Spend**, **CPA** under each group
  if the designer lets you override comparison column names.

CPA green fill: Databox does not support Excel cell fill on a whole column.
Use a green metric color on CPA and/or conditional formatting if the account
has it. Call out large CPA swings with a Notes datablock (the sheet highlighted
Brand CPA WoW −67% in orange).

4. Pin the same date range on the Databoard so viewers do not switch to MTD.

## C. Native-connector fallback (not one table)

Use this only if you cannot push a dataset. You will get **separate** blocks,
not one spreadsheet-like grid.

1. Connect Google Ads, Facebook Ads, Microsoft Advertising.
2. Metric Builder:
   - Google: two metrics filtered by campaign name (Brand vs Non-Brand),
     conversions = the same acquisition event as the sheet, plus Cost.
   - Facebook Ads: Amount spent + the acquisition conversion.
   - Microsoft Advertising: branded Search campaigns only.
3. Apple Ads: Google Sheet → Databox, or continue using the push dataset.
4. Lay out Number or small Table datablocks in the same 3×3 column groups.

Brand / non-brand filters must match the client’s campaign naming. Do not guess
tokens; inspect campaign names in Google Ads first.

## Visual spec

Open `preview/weekly-platform-report.html` for the target grid. Meta cells are
filled from the live snapshot; other platforms stay empty until those sources
are ingested.
