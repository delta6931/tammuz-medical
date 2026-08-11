"""Extract AsaDental set/kit contents from the 2025 catalogue PDFs.

Sets are printed as a label (S0100-1) beside a tightly x-aligned column of the
member product codes it contains. This walks every chapter, clusters product
codes into columns, and attaches each column to its nearest set label.

Contents are never inferred: a set whose column cannot be resolved is emitted
with `members: []` and `resolved: false` so downstream code can omit it rather
than guess. Verify counts against the printed "Set N pcs" wording in the
catalogue product names before trusting the output.

    python scripts/extract_asadental_sets.py
"""
from __future__ import annotations

import json
import re
from collections import defaultdict
from pathlib import Path

import fitz

ROOT = Path(__file__).resolve().parents[1]
PDF_DIR = ROOT / "data" / "asadental"
OUT = ROOT / "data" / "asadental" / "derived" / "asadental-sets.json"

SET_CODE = re.compile(r"^S[A-Z]*\d{3,4}(?:-[\w/]+)?$")
PRODUCT_CODE = re.compile(r"^(?:W|SW|LV|ML|SML)?\d{3,4}[-.][\w/]+$")

# Member codes sit in a column whose x-centres agree to well under a point.
X_TOLERANCE = 1.5
# Rows in a set column are ~11.6pt apart; allow a generous gap for wrapped rows.
MAX_ROW_GAP = 26.0
# A label is only matched to a column within this horizontal/vertical window.
MAX_LABEL_DX = 400.0
MAX_LABEL_DY = 160.0


def columns_of(words):
    """Group product-code words into vertically contiguous, x-aligned columns."""
    by_x: dict[float, list] = defaultdict(list)
    for word in words:
        if not PRODUCT_CODE.match(word[4]):
            continue
        key = next((k for k in by_x if abs(k - word[0]) <= X_TOLERANCE), word[0])
        by_x[key].append(word)

    columns = []
    for key, members in by_x.items():
        members.sort(key=lambda w: w[1])
        run = [members[0]]
        for previous, current in zip(members, members[1:]):
            if current[1] - previous[1] <= MAX_ROW_GAP:
                run.append(current)
            else:
                columns.append((key, run))
                run = [current]
        columns.append((key, run))
    # A single code is a product listing, not a set column.
    return [(x, run) for x, run in columns if len(run) >= 2]


def extract_page(page):
    words = page.get_text("words")
    labels = [w for w in words if SET_CODE.match(w[4])]
    if not labels:
        return []

    columns = columns_of(words)
    used: set[int] = set()
    results = []

    for label in labels:
        best = None
        for index, (x, run) in enumerate(columns):
            if index in used or x <= label[0]:
                continue
            dx = x - label[0]
            centre = (run[0][1] + run[-1][1]) / 2
            dy = abs(centre - label[1])
            if dx > MAX_LABEL_DX or dy > MAX_LABEL_DY:
                continue
            score = dx + dy
            if best is None or score < best[0]:
                best = (score, index, run)

        if best is None:
            results.append({"set": label[4], "members": [], "resolved": False})
            continue

        _, index, run = best
        used.add(index)
        seen, members = set(), []
        for word in run:
            if word[4] not in seen:
                seen.add(word[4])
                members.append(word[4])
        results.append({"set": label[4], "members": members, "resolved": True})

    return results


def main() -> None:
    catalog = json.loads((ROOT / "app" / "_data" / "asaCatalog.json").read_text(encoding="utf8"))
    known = {item["code"] for item in catalog}
    names = {item["code"]: item["name"] for item in catalog}

    found: dict[str, dict] = {}
    for pdf_path in sorted(PDF_DIR.glob("Asa_Dental_2025_Catalog_-_Chapter_*.pdf")):
        chapter = re.search(r"Chapter_(\d+)", pdf_path.name).group(1)
        document = fitz.open(pdf_path)
        for number, page in enumerate(document, start=1):
            for entry in extract_page(page):
                code = entry["set"]
                # Keep the richest reading if a set is printed more than once.
                if code in found and len(found[code]["members"]) >= len(entry["members"]):
                    continue
                entry.update(chapter=int(chapter), pdfPage=number, source=pdf_path.name)
                found[code] = entry
        document.close()

    records = []
    for code, entry in sorted(found.items()):
        members = [m for m in entry["members"] if m in known]
        dropped = [m for m in entry["members"] if m not in known]
        stated = re.search(r"(\d+)\s*pcs|Set\s+(?:of\s+)?(\d+)", names.get(code, ""), re.I)
        expected = int(next(g for g in stated.groups() if g)) if stated else None
        records.append({
            "code": code,
            "name": names.get(code),
            "inCatalog": code in known,
            "chapter": entry["chapter"],
            "pdfPage": entry["pdfPage"],
            "members": members,
            "memberCount": len(members),
            "statedCount": expected,
            "countMatchesStated": (expected == len(members)) if expected is not None else None,
            "droppedUnknownCodes": dropped,
            "resolved": entry["resolved"] and bool(members),
        })

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({
        "generatedFrom": "AsaDental 2025 catalogue chapter PDFs",
        "setCount": len(records),
        "records": records,
    }, indent=2, ensure_ascii=False) + "\n", encoding="utf8")

    resolved = [r for r in records if r["resolved"]]
    checked = [r for r in resolved if r["countMatchesStated"] is not None]
    agree = [r for r in checked if r["countMatchesStated"]]
    print(f"Wrote {OUT.relative_to(ROOT)}")
    print(f"  set labels found        {len(records)}")
    print(f"  with member lists       {len(resolved)}")
    print(f"  also present in catalog {sum(1 for r in resolved if r['inCatalog'])}")
    print(f"  stated count checkable  {len(checked)}  ->  agree {len(agree)}, disagree {len(checked) - len(agree)}")
    for record in checked:
        if not record["countMatchesStated"]:
            print(f"    MISMATCH {record['code']}: parsed {record['memberCount']} vs stated {record['statedCount']} — {record['name']}")


if __name__ == "__main__":
    main()
