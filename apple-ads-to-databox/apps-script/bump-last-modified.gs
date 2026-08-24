/**
 * Databox only re-downloads a Google Sheet when Google Drive's last-modified
 * timestamp changes. Writes made through the Sheets API (including Pipedream)
 * sometimes do not bump that timestamp.
 *
 * Install
 * 1. Open the spreadsheet → Extensions → Apps Script.
 * 2. Paste this file and save.
 * 3. Triggers (clock icon) → Add trigger:
 *      Function: bumpLastModified
 *      Event source: Time-driven
 *      Type: Hour timer, every hour
 */

function bumpLastModified() {
  const ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName("Sync");
  if (!sheet) {
    sheet = ss.insertSheet("Sync");
  }
  sheet.getRange("A1").setValue("Last synced");
  sheet.getRange("B1").setValue(new Date());
}
