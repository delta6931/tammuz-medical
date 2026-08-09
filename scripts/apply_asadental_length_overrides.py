"""Apply manufacturer-confirmed length overrides without rebuilding extraction data.

The source geometry and cached official-page audit remain immutable. This utility
touches only matching SKU records in already-derived enrichment JSON files, so a
manufacturer confirmation can be backfilled independently of PDF extraction.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OVERRIDES = ROOT / "data" / "asadental" / "overrides" / "confirmed-lengths.json"
DEFAULT_TARGETS = (
    ROOT / "data" / "asadental" / "derived" / "forceps-sample-20.json",
    ROOT / "data" / "asadental" / "derived" / "forceps-enriched.json",
)
OVERRIDE_SOURCE_ID = "asadental-manufacturer-confirmed-length-override"


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def validate_override(sku: str, item: dict[str, Any]) -> None:
    required = {"valueMm", "confirmedBy", "confirmedAt", "evidenceReference"}
    missing = sorted(required - item.keys())
    if missing:
        raise ValueError(f"Length override {sku} is missing: {', '.join(missing)}")
    if not isinstance(item["valueMm"], (int, float)) or item["valueMm"] <= 0:
        raise ValueError(f"Length override {sku}.valueMm must be a positive number")


def apply_to_record(record: dict[str, Any], override: dict[str, Any]) -> None:
    value = override["valueMm"]
    tolerance = override.get("tolerancePlusMinusMm")
    record["dimensions"]["overallLengthMm"] = {
        "value": value,
        "tolerancePlusMinusMm": tolerance,
    }
    record["unknownFields"] = [
        field for field in record.get("unknownFields", [])
        if field != "dimensions.overallLengthMm"
    ]

    provenance = record.setdefault("provenance", {})
    sources = provenance.setdefault("sources", [])
    sources[:] = [source for source in sources if source.get("id") != OVERRIDE_SOURCE_ID]
    sources.append({
        "id": OVERRIDE_SOURCE_ID,
        "authority": "primary",
        "type": "manufacturer_confirmation",
        "confirmedBy": override["confirmedBy"],
        "confirmedAt": override["confirmedAt"],
        "evidenceReference": override["evidenceReference"],
        "confirmedValueMm": value,
        "confirmedTolerancePlusMinusMm": tolerance,
    })
    provenance.setdefault("fieldSources", {})["dimensions.overallLengthMm"] = [OVERRIDE_SOURCE_ID]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--overrides", type=Path, default=DEFAULT_OVERRIDES)
    parser.add_argument("--target", action="append", type=Path)
    parser.add_argument("--sku", action="append", help="Apply only the named SKU; repeatable")
    parser.add_argument("--check", action="store_true", help="Validate and report without writing")
    args = parser.parse_args()

    payload = read_json(args.overrides)
    overrides = payload.get("overrides", {})
    selected = set(args.sku or overrides.keys())
    unknown_selection = sorted(selected - overrides.keys())
    if unknown_selection:
        raise ValueError(f"No confirmed override exists for: {', '.join(unknown_selection)}")
    for sku in selected:
        validate_override(sku, overrides[sku])

    targets = tuple(args.target or DEFAULT_TARGETS)
    applied: dict[str, list[str]] = {}
    for target in targets:
        if not target.exists():
            continue
        document = read_json(target)
        records = document.get("records", [])
        changed = []
        for record in records:
            sku = record.get("sku")
            if sku in selected:
                apply_to_record(record, overrides[sku])
                changed.append(sku)
        if changed and not args.check:
            target.write_text(json.dumps(document, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        applied[str(target.relative_to(ROOT))] = sorted(changed)

    print(json.dumps({"checkOnly": args.check, "applied": applied}, indent=2))


if __name__ == "__main__":
    main()
