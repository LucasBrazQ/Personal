/**
 * Optional Pipedream component: push the same Apple Ads rows straight to Databox.
 *
 * Use this instead of (or in addition to) Google Sheets when you want to skip
 * the spreadsheet hop. Requires a Databox Custom Data / Push API token from
 * Data Manager → your Push API data source.
 *
 * Paste into a Node.js step after apple-ads-to-sheets.mjs, or run standalone
 * by duplicating the fetch logic. This version expects `steps.apple_ads_to_google_sheets`
 * to have already run and exported `sample` plus the full upsert payload is
 * not returned — so for a standalone push, prefer combining fetch + push here.
 *
 * Standalone usage: paste this file as the only code step (it fetches + pushes).
 */

import jwt from "jsonwebtoken";

const APPLE_TOKEN_URL = "https://appleid.apple.com/auth/oauth2/token";
const APPLE_API_BASE = "https://api.searchads.apple.com/api/v5";
const DATABOX_PUSH_URL = "https://push.databox.com";

export default defineComponent({
  name: "Apple Ads to Databox Push API",
  description:
    "Pull daily Apple Ads campaign reports and push Spend / Installs / Taps / Impressions to Databox.",
  props: {
    clientId: { type: "string", label: "Apple Ads Client ID" },
    teamId: { type: "string", label: "Apple Ads Team ID" },
    keyId: { type: "string", label: "Apple Ads Key ID" },
    orgId: {
      type: "string",
      label: "Apple Ads Org ID",
      description: "Comma-separate multiple orgs.",
    },
    privateKey: {
      type: "string",
      label: "Private Key (PEM)",
      secret: true,
    },
    databoxToken: {
      type: "string",
      label: "Databox Push API token",
      secret: true,
    },
    lookbackDays: { type: "integer", label: "Lookback days", default: 14 },
    timeZone: {
      type: "string",
      label: "Apple Ads reporting timezone",
      options: ["UTC", "ORTZ"],
      default: "UTC",
    },
  },
  async run({ $ }) {
    const orgIds = String(this.orgId)
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    const accessToken = await getAccessToken({
      clientId: this.clientId,
      teamId: this.teamId,
      keyId: this.keyId,
      privateKey: normalizePrivateKey(this.privateKey),
    });

    const { startTime, endTime } = dateWindow(this.lookbackDays);
    const events = [];

    for (const orgId of orgIds) {
      const rows = await fetchCampaignReport({
        accessToken,
        orgId,
        startTime,
        endTime,
        timeZone: this.timeZone,
      });
      for (const row of rows) {
        events.push(...toDataboxEvents(row));
      }
    }

    const pushed = await pushToDatabox(this.databoxToken, events);
    $.export("$summary", `Pushed ${events.length} Databox events covering ${startTime} → ${endTime}.`);
    return { startTime, endTime, eventCount: events.length, pushed };
  },
});

function toDataboxEvents(row) {
  const date = `${row.date} 00:00:00`;
  const attributes = { campaign: row.campaignName };
  return [
    { $apple_ads_spend: row.spend, date, attributes },
    { $apple_ads_impressions: row.impressions, date, attributes },
    { $apple_ads_taps: row.taps, date, attributes },
    { $apple_ads_installs: row.installs, date, attributes },
  ];
}

async function pushToDatabox(token, events) {
  const chunks = [];
  for (let i = 0; i < events.length; i += 500) {
    chunks.push(events.slice(i, i + 500));
  }

  const results = [];
  const auth = Buffer.from(`${token}:`).toString("base64");
  for (const data of chunks) {
    const res = await fetch(DATABOX_PUSH_URL, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
        Accept: "application/vnd.databox.v2+json",
      },
      body: JSON.stringify({ data }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(`Databox push failed: ${JSON.stringify(json)}`);
    }
    results.push(json);
  }
  return results;
}

function normalizePrivateKey(raw) {
  let key = String(raw || "").trim().replace(/\\n/g, "\n");
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
    { algorithm: "ES256", keyid: keyId, expiresIn: "20m" },
  );

  const res = await fetch(APPLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
      scope: "searchadsorg",
    }),
  });
  const json = await res.json();
  if (!res.ok || !json.access_token) {
    throw new Error(`Apple token exchange failed: ${JSON.stringify(json)}`);
  }
  return json.access_token;
}

async function fetchCampaignReport({ accessToken, orgId, startTime, endTime, timeZone }) {
  const rows = [];
  let offset = 0;
  const limit = 1000;

  while (true) {
    const res = await fetch(`${APPLE_API_BASE}/reports/campaigns`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-AP-Context": `orgId=${orgId}`,
      },
      body: JSON.stringify({
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
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(`Apple Ads report failed for org ${orgId}: ${JSON.stringify(json)}`);
    }
    const reportRows = json?.data?.reportingDataResponse?.row || [];
    for (const row of reportRows) {
      const meta = row.metadata || {};
      const daily = Array.isArray(row.granularity) && row.granularity.length
        ? row.granularity
        : [row.total || {}];
      for (const metrics of daily) {
        rows.push({
          date: String(metrics.date || startTime).slice(0, 10),
          campaignName: meta.campaignName || String(meta.campaignId || "unknown"),
          spend: Number(metrics.localSpend?.amount || 0),
          impressions: Number(metrics.impressions || 0),
          taps: Number(metrics.taps || 0),
          installs: Number(metrics.totalInstalls || metrics.installs || 0),
        });
      }
    }
    if (reportRows.length < limit) break;
    offset += limit;
  }
  return rows;
}

function dateWindow(lookbackDays) {
  const end = new Date();
  const start = new Date();
  start.setUTCDate(start.getUTCDate() - Math.max(1, Number(lookbackDays) || 14));
  return {
    startTime: start.toISOString().slice(0, 10),
    endTime: end.toISOString().slice(0, 10),
  };
}
