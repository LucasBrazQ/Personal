# Apple Ads → Databox (via Pipedream + Google Sheets)

Yes. There is still no native Apple Ads connector in Databox, but this path works:

```
Apple Ads Campaign Management API
        ↓  (Pipedream, on a daily schedule)
   Google Sheet  (Date / Campaign / Spend / Installs / …)
        ↓  (Databox Google Sheets data source)
     Databoard
```

Pipedream does not ship an Apple Ads app, so the Apple call is a Node.js step. Google Sheets **does** have a native Pipedream app, which this workflow uses to write the sheet.

This folder is a copy-paste kit: credentials setup, a Databox-ready sheet layout, and a Pipedream component that pulls daily campaign reports and upserts them.

## What you get

| File | Purpose |
| --- | --- |
| [`pipedream/apple-ads-to-sheets.mjs`](pipedream/apple-ads-to-sheets.mjs) | Main workflow: Apple Ads → Google Sheets |
| [`pipedream/apple-ads-to-databox-push.mjs`](pipedream/apple-ads-to-databox-push.mjs) | Optional: skip Sheets and push to Databox’s Push API |
| [`sheets/template.csv`](sheets/template.csv) | Header row + one example record |
| [`apps-script/bump-last-modified.gs`](apps-script/bump-last-modified.gs) | Hourly touch so Databox notices API writes |

The sheet is laid out the way Databox’s Metric Builder wizard expects: **Date in column A**, dimensions next, numeric metrics after that.

## 1. Create Apple Ads API credentials

You need Admin (or API) access on the Apple Ads account.

1. Generate an EC P-256 key pair locally:

   ```bash
   openssl ecparam -genkey -name prime256v1 -noout -out private-key.pem
   openssl pkcs8 -topk8 -nocrypt -in private-key.pem -out private-key.p8
   openssl ec -in private-key.pem -pubout -out public-key.pem
   ```

2. In [Apple Ads](https://searchads.apple.com/) go to **Account Settings → API**.
3. Paste the contents of `public-key.pem` and save.
4. Copy the three values Apple shows:
   - `clientId` (looks like `SEARCHADS.{uuid}`)
   - `teamId` (often the same as `clientId`)
   - `keyId`
5. Copy the numeric **Organization ID** from the Apple Ads UI (or from **Account Settings**).
6. Keep `private-key.p8` / `private-key.pem` private. You will paste it into Pipedream as a secret. Do not commit it.

Apple documents this OAuth flow here: [Implementing OAuth for the Apple Ads API](https://developer.apple.com/documentation/apple_ads/implementing-oauth-for-the-apple-search-ads-api).

The current API is **Campaign Management API v5** (`https://api.searchads.apple.com/api/v5`). Apple has announced a new Platform API (preview in 2026) and a January 2027 sunset for this API, so plan to revisit the endpoint later.

## 2. Create the Google Sheet

1. Create a spreadsheet (or import [`sheets/template.csv`](sheets/template.csv)).
2. Name the tab `Apple Ads Daily`.
3. Keep row 1 as headers. Do not put titles, totals, or blank spacer rows in the data block.
4. Format column A as **Date** (`Format → Number → Date`). Databox accepts `MM/DD/YYYY` and `DD/MM/YYYY`.
5. Format metric columns as **Number**.
6. Copy the spreadsheet ID from the URL:

   `https://docs.google.com/spreadsheets/d/<SPREADSHEET_ID>/edit`

Suggested columns (already in the template):

| Column | Role in Databox |
| --- | --- |
| Date | Date |
| Campaign, Campaign ID, App Name, Country, Status | Dimensions |
| Impressions, Taps, Spend, Installs, New Downloads, Redownloads, TTR, Avg CPT, Avg CPI | Metrics |

## 3. Build the Pipedream workflow

1. In [Pipedream](https://pipedream.com) create a workflow.
2. Trigger: **Schedule**. A daily cron such as `0 7 * * *` (07:00 UTC) is enough. Apple Ads conversion numbers can still move for several days, which is why the code re-pulls a lookback window.
3. Add a **Node.js** code step.
4. Paste the entire contents of [`pipedream/apple-ads-to-sheets.mjs`](pipedream/apple-ads-to-sheets.mjs).
5. Connect **Google Sheets** when the step asks for an account.
6. Fill the props:

   | Prop | Value |
   | --- | --- |
   | Apple Ads Client ID / Team ID / Key ID / Org ID | From step 1 |
   | Private Key (PEM) | Full `-----BEGIN …-----` private key |
   | Google Spreadsheet ID | From the sheet URL |
   | Sheet tab name | `Apple Ads Daily` |
   | Lookback days | `14` (use `30` if you care about slower conversion lag) |
   | Timezone | `UTC` or `ORTZ` (account time zone) |

7. Test the step. You should see new rows in the sheet and a summary like `Upserted N Apple Ads rows`.
8. Deploy / enable the workflow.

### What the step does

1. Signs a short-lived JWT with your private key (ES256) and exchanges it for an Apple access token (`scope=searchadsorg`).
2. Calls `POST /api/v5/reports/campaigns` with `granularity: "DAILY"` for the lookback window.
3. Paginates (1000 rows at a time) and supports multiple org IDs (comma-separated).
4. Reads the existing sheet, **replaces rows whose date is inside the lookback window**, and keeps older history. That prevents duplicate Databox points when yesterday is fetched again.
5. Writes with `USER_ENTERED` so Google parses dates and numbers.
6. Stamps `Last synced` in columns S–T to help Google Drive update `modifiedTime`.

## 4. Connect the sheet to Databox

1. Databox → **Data Manager → + New connection → Google Sheets**.
2. Authorize Google and pick this spreadsheet.
3. **Metrics → Custom Metrics → Create Custom Metric**.
4. For each KPI, map:
   - **Value** = a numeric column (Spend, Installs, Taps, …)
   - **Date** = Date
   - **Dimension** (optional) = Campaign or Country
5. Add those metrics to a Databoard.

Databox syncs Google Sheets on its metric schedule (typically hourly) and only re-downloads the file when Google Drive’s last-modified time has changed.

### If Databox does not pick up new rows

API writes (Pipedream, Apps Script, Zapier) sometimes **do not** bump Google Drive `modifiedTime`. If the sheet has data but Databox still shows stale numbers:

1. Open the spreadsheet in the browser once (that usually refreshes the timestamp).
2. Install [`apps-script/bump-last-modified.gs`](apps-script/bump-last-modified.gs) with an hourly time-driven trigger.

Also avoid deleting historical rows. Databox accumulates; if a value should disappear, set it to `0` rather than removing the row.

## 5. Optional: skip Google Sheets

If you would rather not maintain a spreadsheet, two Databox-native options exist:

- **Pipedream Databox app** → action **Send Custom Data** (one metric per call; fine for a few KPIs).
- **Databox Push API** in a code step. [`pipedream/apple-ads-to-databox-push.mjs`](pipedream/apple-ads-to-databox-push.mjs) fetches the same Apple Ads report and POSTs `$apple_ads_spend`, `$apple_ads_impressions`, `$apple_ads_taps`, and `$apple_ads_installs` with a `campaign` attribute.

Google Sheets is still the better default if non-engineers will audit the numbers or build extra Databox metrics later without touching code.

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| `invalid_client` / token exchange fails | Public key not uploaded, wrong `clientId` / `teamId` / `keyId`, or private key not ES256 / PEM |
| `401` / `403` from `api.searchads.apple.com` | Missing `X-AP-Context: orgId=…`, or the API user cannot access that org |
| Empty sheet after a successful run | No serving campaigns in the lookback window, or `returnRecordsWithNoMetrics` filtered them out |
| Duplicate dates in Databox | Appending instead of upserting; use this component as-is, do not also add an “Add Multiple Rows” step |
| Dates land in the wrong month | Sheet locale vs `MM/DD/YYYY`. Set the sheet locale, or switch the column format to Date |
| File too large for Databox | Keep one tab of daily campaign totals. Keyword/search-term dumps belong in a separate sheet |

## Limits worth knowing

- Apple access tokens last **one hour**; the workflow mints a new one every run.
- Daily reports are requested in a rolling lookback (default 14 days) because install/conversion metrics are not final on day 0.
- Databox Google Sheets: max file size **10 MB**, max **10 million** cells. Daily campaign totals stay well under that.
- Do not store the `.p8` key in this repo or in an unencrypted sheet.
