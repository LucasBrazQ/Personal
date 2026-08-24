# Databox Long-Format Template

Import `databox-long-format-sample.csv` into a Google Sheet tab named `Databox_Long`.

## Columns

| Column | Purpose |
| --- | --- |
| `date` | Week start date (YYYY-MM-DD). Use the Sunday that begins each report week. |
| `platform` | Row label — must match spreadsheet order / naming. |
| `metric` | One of: `acquisitions`, `spend`, `cpa`. |
| `value` | Numeric value (no `$` or `%` symbols). |

## How to use in Databox

1. Connect the Google Sheet in Databox Data Manager.
2. Create three Custom Metrics via Metric Builder (one per `metric` filter):
   - **PA Acquisitions** — value where metric = acquisitions; Dimension = platform; Date = date
   - **PA Spend** — same for spend (Currency)
   - **PA CPA** — same for cpa (Currency)
3. On a Databoard, add a **Table** visualization:
   - Add all three metrics
   - Show columns = **Metrics**
   - Date range = the week you want to display
   - Sort = Custom (drag platforms into spreadsheet order)
4. Duplicate the table (or use Compare with Previous period / Custom range) for Prior and WoW views.

## Notes

- Sample current-week Meta / TOTAL values are taken from the client spreadsheet screenshot; other platform cells are placeholders (`0`) — replace with real weekly numbers.
- Prefer calculating `cpa` and `TOTAL` in Sheets (`=IF(acq=0,0,spend/acq)` and `SUM`) so Databox only displays.
- Keep a separate human-readable `Weekly_Matrix` tab that mirrors the client spreadsheet for stakeholders who still want the sheet look.
