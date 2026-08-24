#!/usr/bin/env python3
"""Create the Pilates Anytime weekly platform dataset in Databox and ingest records.

Requires DATABOX_API_KEY (Account settings → API). Optional:
  DATABOX_ACCOUNT_ID   numeric account if the key can see more than one
  DATABOX_TIMEZONE     IANA tz, default America/Los_Angeles
  DATABOX_DATA_SOURCE_ID / DATABOX_DATASET_ID to reuse existing objects

Usage:
  python pilates_anytime/push_to_databox.py --setup
  python pilates_anytime/push_to_databox.py --ingest pilates_anytime/sample_records.json
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

API = "https://api.databox.com"
STATE_PATH = Path(__file__).resolve().parent.parent / ".databox-state.json"
SCHEMA = [
    {"name": "date", "dataType": "datetime"},
    {"name": "platform", "dataType": "string"},
    {"name": "sort_order", "dataType": "number"},
    {"name": "acquisitions", "dataType": "number"},
    {"name": "spend", "dataType": "number"},
]


def load_dotenv(path: Path) -> None:
    if not path.exists():
        return
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        os.environ.setdefault(key.strip(), value.strip())


def request(method: str, path: str, api_key: str, body: dict | None = None) -> dict:
    data = None
    headers = {"x-api-key": api_key, "Accept": "application/json"}
    if body is not None:
        data = json.dumps(body).encode("utf-8")
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(API + path, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            raw = resp.read().decode("utf-8")
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise SystemExit(f"Databox {method} {path} failed ({exc.code}): {detail}") from exc


def load_state() -> dict:
    if STATE_PATH.exists():
        return json.loads(STATE_PATH.read_text())
    return {}


def save_state(state: dict) -> None:
    STATE_PATH.write_text(json.dumps(state, indent=2) + "\n")


def setup(api_key: str) -> dict:
    state = load_state()
    validate = request("GET", "/v1/auth/validate-key", api_key)
    print("API key valid:", json.dumps(validate, indent=2)[:500])

    accounts = request("GET", "/v1/accounts", api_key)
    account_id = os.environ.get("DATABOX_ACCOUNT_ID") or state.get("account_id")
    account_list = accounts.get("data") or accounts.get("accounts") or accounts
    if isinstance(account_list, dict):
        account_list = account_list.get("items") or [account_list]
    if not account_id:
        if isinstance(account_list, list) and account_list:
            first = account_list[0]
            account_id = first.get("id") or first.get("accountId")
        else:
            raise SystemExit(f"Could not resolve a Databox account from: {accounts}")
    state["account_id"] = account_id
    print("Using account:", account_id)

    source_id = os.environ.get("DATABOX_DATA_SOURCE_ID") or state.get("data_source_id")
    if not source_id:
        created = request(
            "POST",
            "/v1/data-sources",
            api_key,
            {
                "accountId": int(account_id) if str(account_id).isdigit() else account_id,
                "title": "Pilates Anytime — Weekly paid media",
                "timezone": os.environ.get("DATABOX_TIMEZONE", "America/Los_Angeles"),
            },
        )
        source_id = created.get("id")
        print("Created data source:", created)
        if source_id is None:
            raise SystemExit(f"No data source id in response: {created}")
    state["data_source_id"] = source_id

    dataset_id = os.environ.get("DATABOX_DATASET_ID") or state.get("dataset_id")
    if not dataset_id:
        created = request(
            "POST",
            "/v1/datasets",
            api_key,
            {
                "title": "Weekly platform performance",
                "dataSourceId": int(source_id) if str(source_id).isdigit() else source_id,
                "primaryKeys": ["date", "platform"],
                "schema": SCHEMA,
            },
        )
        dataset_id = created.get("id")
        print("Created dataset:", created)
        if dataset_id is None:
            raise SystemExit(f"No dataset id in response: {created}")
    state["dataset_id"] = dataset_id
    save_state(state)
    print("Wrote", STATE_PATH)
    return state


def ingest(api_key: str, records_path: Path) -> None:
    state = load_state()
    dataset_id = os.environ.get("DATABOX_DATASET_ID") or state.get("dataset_id")
    if not dataset_id:
        raise SystemExit("No dataset id. Run --setup first.")
    records = json.loads(records_path.read_text())
    if isinstance(records, dict) and "records" in records:
        records = records["records"]
    if not isinstance(records, list):
        raise SystemExit("Records file must be a JSON array or {\"records\": [...]}")
    for i in range(0, len(records), 100):
        batch = records[i : i + 100]
        result = request(
            "POST",
            f"/v1/datasets/{dataset_id}/data",
            api_key,
            {"records": batch},
        )
        print(f"Ingested {len(batch)} records:", result)


def main() -> None:
    load_dotenv(Path(__file__).resolve().parent.parent / ".env")
    parser = argparse.ArgumentParser()
    parser.add_argument("--setup", action="store_true", help="Create data source + dataset")
    parser.add_argument("--ingest", type=Path, help="JSON file of records to push")
    args = parser.parse_args()
    if not args.setup and not args.ingest:
        parser.print_help()
        raise SystemExit(2)
    api_key = os.environ.get("DATABOX_API_KEY")
    if not api_key:
        raise SystemExit("Set DATABOX_API_KEY in the environment or a .env file.")
    if args.setup:
        setup(api_key)
    if args.ingest:
        ingest(api_key, args.ingest)


if __name__ == "__main__":
    sys.exit(main())
