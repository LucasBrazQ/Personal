/**
 * Pipedream component: Apple Ads daily reports → Google Sheets
 *
 * How to use
 * 1. Create a workflow with a Schedule trigger (cron, e.g. 0 7 * * *).
 * 2. Add a Node.js code step and paste this entire file.
 * 3. Fill in the props in the Pipedream UI (Apple Ads credentials + Sheet ID).
 * 4. Connect a Google Sheets account when prompted.
 *
 * The step upserts rows in a lookback window (default 14 days) so Apple's
 * late-attributing conversions do not create duplicate Databox points.
 */

import jwt from "jsonwebtoken";

const APPLE_TOKEN_URL = "https://appleid.apple.com/auth/oauth2/token";
const APPLE_API_BASE = "https://api.searchads.apple.com/api/v5";
const SHEETS_API = "https://sheets.googleapis.com/v4/spreadsheets";

const HEADER = [
  "Date",
  "Campaign",
  "Campaign ID",
  "App Name",
  "Adam ID",
  "Country",
  "Status",
  "Impressions",
  "Taps",
  "Spend",
  "Currency",
  "Installs",
  "New Downloads",
  "Redownloads",
  "TTR",
  "Avg CPT",
  "Avg CPI",
];

export default defineComponent({
  name: "Apple Ads to Google Sheets",
  description:
    "Pull daily Apple Ads campaign reports and upsert them into a Databox-ready Google Sheet.",
  props: {
    googleSheets: {
      type: "app",
      app: "google_sheets",
    },
    clientId: {
      type: "string",
      label: "Apple Ads Client ID",
      description: "SEARCHADS.{uuid} shown after you upload the public key.",
    },
    teamId: {
      type: "string",
      label: "Apple Ads Team ID",
      description: "Usually the same SEARCHADS.{uuid} value as the client ID.",
    },
    keyId: {
      type: "string",
      label: "Apple Ads Key ID",
      description: "keyId returned when the public key is uploaded.",
    },
    orgId: {
      type: "string",
      label: "Apple Ads Org ID",
      description:
        "Numeric organization ID from Apple Ads (Account Settings). Comma-separate multiple orgs.",
    },
    privateKey: {
      type: "string",
      label: "Private Key (PEM)",
      secret: true,
      description:
        "Full contents of the .pem / .p8 private key, including BEGIN/END lines.",
    },
    spreadsheetId: {
      type: "string",
      label: "Google Spreadsheet ID",
      description:
        "The ID from the sheet URL: docs.google.com/spreadsheets/d/<ID>/edit",
    },
    sheetName: {
      type: "string",
      label: "Sheet tab name",
      default: "Apple Ads Daily",
    },
    lookbackDays: {
      type: "integer",
      label: "Lookback days",
      description:
        "Re-pull this many days each run so late conversions overwrite stale rows.",
      default: 14,
    },
    timeZone: {
      type: "string",
      label: "Apple Ads reporting timezone",
      options: ["UTC", "ORTZ"],
      default: "UTC",
    },
    groupByCountry: {
      type: "boolean",
      label: "Split metrics by country",
      default: false,
    },
  },
  async run({ $ }) {
    const orgIds = String(this.orgId)
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    if (!orgIds.length) {
      throw new Error("At least one Apple Ads org ID is required.");
    }

    const accessToken = await getAccessToken({
      clientId: this.clientId,
      teamId: this.teamId,
      keyId: this.keyId,
      privateKey: normalizePrivateKey(this.privateKey),
    });

    const { startTime, endTime } = dateWindow(this.lookbackDays);
    const freshRows = [];

    for (const orgId of orgIds) {
      const reportRows = await fetchCampaignReport({
        accessToken,
        orgId,
        startTime,
        endTime,
        timeZone: this.timeZone,
        groupByCountry: this.groupByCountry,
      });
      freshRows.push(...reportRows);
    }

    const sheetsToken = this.googleSheets.$auth.oauth_access_token;
    await ensureSheetExists({
      sheetsToken,
      spreadsheetId: this.spreadsheetId,
      sheetName: this.sheetName,
    });

    const existing = await readSheet({
      sheetsToken,
      spreadsheetId: this.spreadsheetId,
      sheetName: this.sheetName,
    });

    const merged = upsertRows(existing, freshRows, startTime);
    await writeSheet({
      sheetsToken,
      spreadsheetId: this.spreadsheetId,
      sheetName: this.sheetName,
      rows: merged,
    });

    $.export("$summary", `Upserted ${freshRows.length} Apple Ads rows (${startTime} → ${endTime}) into ${this.sheetName}.`);

    return {
      startTime,
      endTime,
      orgs: orgIds,
      rowsWritten: merged.length - 1,
      rowsUpserted: freshRows.length,
      sample: freshRows.slice(0, 5),
    };
  },
});

function normalizePrivateKey(raw) {
  let key = String(raw || "").trim();
  if (!key) throw new Error("Private key is empty.");
  key = key.replace(/\\n/g, "\n");
  if (!key.includes("BEGIN")) {
    key = `-----BEGIN PRIVATE KEY-----\n${key}\n-----END PRIVATE KEY-----`;
  }
  return key;
}

async function getAccessToken({ clientId, teamId, keyId, privateKey }) {
  const clientSecret = jwt.sign(
    {
      sub: clientId,
      aud: "https://appleid.apple.com",
      iss: teamId,
    },
    privateKey,
    {
      algorithm: "ES256",
      keyid: keyId,
      expiresIn: "20m",
    },
  );

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
    scope: "searchadsorg",
  });

  const res = await fetchWithRetry(APPLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const json = await res.json();
  if (!res.ok || !json.access_token) {
    throw new Error(`Apple token exchange failed: ${JSON.stringify(json)}`);
  }
  return json.access_token;
}

async function fetchCampaignReport({
  accessToken,
  orgId,
  startTime,
  endTime,
  timeZone,
  groupByCountry,
}) {
  const rows = [];
  let offset = 0;
  const limit = 1000;

  while (true) {
    const payload = {
      startTime,
      endTime,
      timeZone,
      granularity: "DAILY",
      returnRecordsWithNoMetrics: false,
      returnRowTotals: false,
      returnGrandTotals: false,
      selector: {
        orderBy: [{ field: "campaignId", sortOrder: "ASCENDING" }],
        pagination: { offset, limit },
      },
    };
    if (groupByCountry) {
      payload.groupBy = ["countryOrRegion"];
    }

    const res = await fetchWithRetry(`${APPLE_API_BASE}/reports/campaigns`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-AP-Context": `orgId=${orgId}`,
      },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(`Apple Ads report failed for org ${orgId}: ${JSON.stringify(json)}`);
    }

    const reportRows = json?.data?.reportingDataResponse?.row || [];
    for (const row of reportRows) {
      rows.push(...flattenReportRow(row));
    }

    if (reportRows.length < limit) break;
    offset += limit;
  }

  return rows;
}

function flattenReportRow(row) {
  const meta = row.metadata || {};
  const daily = Array.isArray(row.granularity) && row.granularity.length
    ? row.granularity
    : [row.total || {}];

  return daily.map((metrics) => {
    const spend = money(metrics.localSpend);
    const avgCpt = money(metrics.avgCPT);
    const avgCpi = money(metrics.totalAvgCPI || metrics.avgCPA);
    return [
      toDataboxDate(metrics.date),
      meta.campaignName || "",
      String(meta.campaignId ?? ""),
      meta.app?.appName || "",
      String(meta.app?.adamId ?? ""),
      meta.countryOrRegion || (meta.countriesOrRegions || []).join("|"),
      meta.displayStatus || meta.campaignStatus || "",
      number(metrics.impressions),
      number(metrics.taps),
      spend.amount,
      spend.currency,
      number(metrics.totalInstalls ?? metrics.installs),
      number(metrics.totalNewDownloads ?? metrics.newDownloads),
      number(metrics.totalRedownloads ?? metrics.redownloads),
      number(metrics.ttr),
      avgCpt.amount,
      avgCpi.amount,
    ];
  });
}

function money(value) {
  if (value && typeof value === "object") {
    return {
      amount: number(value.amount),
      currency: value.currency || "",
    };
  }
  return { amount: number(value), currency: "" };
}

function number(value) {
  if (value === null || value === undefined || value === "") return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function dateWindow(lookbackDays) {
  const end = new Date();
  const start = new Date();
  start.setUTCDate(start.getUTCDate() - Math.max(1, Number(lookbackDays) || 14));
  return {
    startTime: isoDate(start),
    endTime: isoDate(end),
  };
}

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

function toDataboxDate(value) {
  if (!value) return isoDate(new Date());
  const raw = String(value).slice(0, 10);
  const [y, m, d] = raw.split("-");
  if (y && m && d) return `${m}/${d}/${y}`;
  return raw;
}

function fromDataboxDate(value) {
  const raw = String(value || "").trim();
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return raw;
  const us = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (us) {
    const [, m, d, y] = us;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return raw;
}

function rowKey(row) {
  return [fromDataboxDate(row[0]), row[2], row[5]].join("|");
}

function upsertRows(existingValues, freshRows, lookbackStart) {
  const header = existingValues[0]?.length ? existingValues[0] : HEADER;
  const kept = [];
  for (const row of existingValues.slice(1)) {
    if (!row || !row.length || row.every((cell) => cell === "")) continue;
    const iso = fromDataboxDate(row[0]);
    if (iso >= lookbackStart) continue;
    kept.push(row);
  }

  const byKey = new Map();
  for (const row of kept) byKey.set(rowKey(row), row);
  for (const row of freshRows) byKey.set(rowKey(row), row);

  const merged = Array.from(byKey.values()).sort((a, b) => {
    const dateCmp = fromDataboxDate(a[0]).localeCompare(fromDataboxDate(b[0]));
    if (dateCmp !== 0) return dateCmp;
    return String(a[1]).localeCompare(String(b[1]));
  });

  return [HEADER.map((_, i) => header[i] || HEADER[i]), ...merged];
}

async function ensureSheetExists({ sheetsToken, spreadsheetId, sheetName }) {
  const res = await fetchWithRetry(`${SHEETS_API}/${spreadsheetId}?fields=sheets.properties.title`, {
    headers: { Authorization: `Bearer ${sheetsToken}` },
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`Unable to read spreadsheet ${spreadsheetId}: ${JSON.stringify(json)}`);
  }
  const titles = (json.sheets || []).map((s) => s.properties?.title);
  if (titles.includes(sheetName)) return;

  const create = await fetchWithRetry(`${SHEETS_API}/${spreadsheetId}:batchUpdate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${sheetsToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      requests: [{ addSheet: { properties: { title: sheetName } } }],
    }),
  });
  if (!create.ok) {
    throw new Error(`Unable to create tab ${sheetName}: ${await create.text()}`);
  }
}

async function readSheet({ sheetsToken, spreadsheetId, sheetName }) {
  const range = encodeURIComponent(`'${sheetName}'`);
  const res = await fetchWithRetry(
    `${SHEETS_API}/${spreadsheetId}/values/${range}?valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=FORMATTED_STRING`,
    { headers: { Authorization: `Bearer ${sheetsToken}` } },
  );
  const json = await res.json();
  if (res.status === 400 && /Unable to parse range/i.test(JSON.stringify(json))) {
    return [HEADER];
  }
  if (!res.ok) {
    throw new Error(`Unable to read sheet values: ${JSON.stringify(json)}`);
  }
  return json.values?.length ? json.values : [HEADER];
}

async function writeSheet({ sheetsToken, spreadsheetId, sheetName, rows }) {
  const range = encodeURIComponent(`'${sheetName}'!A1:Q`);
  const clear = await fetchWithRetry(
    `${SHEETS_API}/${spreadsheetId}/values/${range}:clear`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${sheetsToken}` },
    },
  );
  if (!clear.ok) {
    throw new Error(`Unable to clear sheet: ${await clear.text()}`);
  }

  const write = await fetchWithRetry(
    `${SHEETS_API}/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${sheetsToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values: rows }),
    },
  );
  if (!write.ok) {
    throw new Error(`Unable to write sheet: ${await write.text()}`);
  }

  // Touch a metadata cell so Google Drive last-modified updates for Databox.
  const stampRange = encodeURIComponent(`'${sheetName}'!S1:T1`);
  await fetchWithRetry(
    `${SHEETS_API}/${spreadsheetId}/values/${stampRange}?valueInputOption=USER_ENTERED`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${sheetsToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        values: [["Last synced (UTC)", new Date().toISOString()]],
      }),
    },
  );
}

async function fetchWithRetry(url, options = {}, { retries = 5 } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url, options);
    if (res.status !== 429 && res.status < 500) return res;
    lastError = new Error(`HTTP ${res.status} from ${url}`);
    const retryAfter = Number(res.headers.get("retry-after"));
    const waitMs = Number.isFinite(retryAfter)
      ? retryAfter * 1000
      : Math.min(30000, 1000 * 2 ** attempt);
    await sleep(waitMs);
  }
  throw lastError;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
