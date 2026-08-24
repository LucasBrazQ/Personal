# Pilates Anytime — Databox weekly paid media report

This repo maps the client’s weekly platform spreadsheet (Google Search brand /
non-brand, Meta, Microsoft branded Search, Apple Ads, TOTAL) onto a Databox
**Table** datablock.

## Start here

Read **[docs/databoard-setup.md](docs/databoard-setup.md)** for Designer
settings, metric definitions, and week-over-week comparison behavior.

Then:

1. Copy `.env.example` to `.env` and add a Databox API key.
2. `python pilates_anytime/push_to_databox.py --setup`
3. `python pilates_anytime/push_to_databox.py --ingest pilates_anytime/sample_records.json`
4. Create Acquisitions, Spend, and CPA metrics on the new dataset and add the
   Table datablock as documented.

`pilates_anytime/sample_records.json` currently contains **Meta only** (Complete
Registration + spend for 16–22 Aug and 2–8 Aug 2026). Add Google, Microsoft,
and Apple rows in the same shape (`date`, `platform`, `sort_order`,
`acquisitions`, `spend`) before the TOTAL line will match the spreadsheet.

A static layout preview is in `preview/weekly-platform-report.html`.
