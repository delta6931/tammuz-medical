"""Reconcile catalog-wide `forcep` names with the Chapter 4 clinical matrix.

This audit reads only the public product index and the local 2025 Chapter 4
catalogue. It never opens the internal price sources.
"""

from __future__ import annotations

import json
import re
from collections import Counter
from pathlib import Path
from typing import Any

import fitz


ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "app" / "_data" / "asaCatalog.json"
CHAPTER_4 = ROOT / "data" / "asadental" / "Asa_Dental_2025_Catalog_-_Chapter_4_-_Extractive_Surgery.pdf"
DERIVED = ROOT / "data" / "asadental" / "derived"
CODE_PATTERN = re.compile(r"^(?:S|W|SW)?\d{4}[A-Z]?-[A-Z0-9/]+$", re.IGNORECASE)

# These facts are printed as explicit set/accessory tables on the cited pages.
CHAPTER_FACTS: dict[str, dict[str, Any]] = {
    "S0100-1": {"pdfPage": 3, "kind": "forceps_set", "componentCount": 8, "componentSkus": ["0100-1", "0100-17", "0100-18", "0100-79", "0100-67A", "0100-51A", "0100-13", "0100-22"]},
    "S0100-2": {"pdfPage": 3, "kind": "forceps_set", "componentCount": 8, "componentSkus": ["0100-1", "0100-7", "0100-17", "0100-18", "0100-4", "0100-13", "0100-22", "0100-86C"]},
    "S0110": {"pdfPage": 20, "kind": "children_forceps_set", "patientGroup": "children", "componentCount": 10, "componentSkus": ["0110-37", "0110-39", "0110-39R", "0110-39L", "0110-51S", "0110-13S", "0110-30S", "0110-33S", "0110-22S", "0110-38"]},
    "S0112": {"pdfPage": 20, "kind": "children_forceps_set", "patientGroup": "children", "patternName": "Klein", "componentCount": 7, "componentSkus": ["0112-1", "0112-2", "0112-3", "0112-4", "0112-5", "0112-6", "0112-7"]},
    "S0100-3": {"pdfPage": 37, "kind": "extraction_instrument_set", "componentCount": 9, "componentSkus": ["0100-33", "0100-51A", "0100-67A", "0100-79", "0200-1", "0201-2", "0201-3", "0202-320", "0202-321"]},
    "S0100-4": {"pdfPage": 37, "kind": "extraction_and_oral_surgery_set", "componentCount": 9, "componentSkus": ["0100-33", "0100-51A", "0100-67A", "0100-79", "0200-1", "0201-2", "0201-3", "0435-14TC", "0425-16TC"]},
    "9002-1": {"pdfPage": 37, "kind": "case_insert_accessory", "capacityForceps": 6},
}


def write_json(path: Path, value: Any) -> None:
    path.write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def main() -> None:
    catalog = json.loads(CATALOG.read_text(encoding="utf-8"))
    document = fitz.open(CHAPTER_4)
    matrix_codes = {
        word[4].strip()
        for word in document[1].get_text("words")
        if word[0] > 650 and CODE_PATTERN.fullmatch(word[4].strip())
    }
    forcep_named = [item for item in catalog if "forcep" in item["name"].lower()]
    non_matrix = [item for item in forcep_named if item["code"] not in matrix_codes]
    matrix_without_word = [
        item for item in catalog
        if item["code"] in matrix_codes and "forcep" not in item["name"].lower()
    ]

    records = []
    for item in non_matrix:
        facts = CHAPTER_FACTS.get(item["code"])
        records.append({
            **item,
            "reasonOutsideMatrix": (
                "set_or_accessory_not_an_individual_forceps_pattern"
                if facts else
                "different_forceps_family_or_not_listed_in_2025_chapter_4"
            ),
            "chapter4": {
                "listed": facts is not None,
                "availableFields": facts or {},
                "unavailableFields": (
                    ["individualClinicalMatrix", "overallLength", "material", "sterilization", "singleUse"]
                    if facts else
                    ["allFields"]
                ),
            },
        })

    report = {
        "sourcePath": str(CHAPTER_4.relative_to(ROOT)).replace("\\", "/"),
        "method": "Exact product-code reconciliation between the Chapter 4 application matrix and catalog-wide product names containing 'forcep'.",
        "counts": {
            "matrixCodes": len(matrix_codes),
            "catalogNamesContainingForcep": len(forcep_named),
            "matrixCodesWhoseCatalogNameContainsForcep": len(matrix_codes) - len(matrix_without_word),
            "matrixCodesWhoseCatalogNameDoesNotContainForcep": len(matrix_without_word),
            "forcepNamedRecordsOutsideMatrix": len(non_matrix),
            "outsideMatrixListedElsewhereInChapter4": sum(record["chapter4"]["listed"] for record in records),
            "outsideMatrixAbsentFromChapter4": sum(not record["chapter4"]["listed"] for record in records),
        },
        "reconciliation": "The apparent 243-versus-186 gap is not a cohort of 57 missing extraction forceps. The name search overlaps only 185 matrix rows because 0130-151/ is titled 'Extracting F.'; it also includes 58 non-matrix records from other forceps families, sets and accessories.",
        "matrixRecordMissedByNameSearch": matrix_without_word,
        "outsideMatrixByCategory": dict(sorted(Counter(item["category"] for item in non_matrix).items())),
        "records": records,
    }
    write_json(DERIVED / "non-matrix-forceps-audit.json", report)

    lines = [
        "# Non-matrix forceps reconciliation",
        "",
        report["reconciliation"],
        "",
        f"- Matrix codes: {report['counts']['matrixCodes']}",
        f"- Catalog names containing `forcep`: {report['counts']['catalogNamesContainingForcep']}",
        f"- Named-forceps records outside the matrix: {report['counts']['forcepNamedRecordsOutsideMatrix']}",
        f"- Outside records explicitly listed elsewhere in Chapter 4: {report['counts']['outsideMatrixListedElsewhereInChapter4']}",
        f"- Outside records absent from Chapter 4: {report['counts']['outsideMatrixAbsentFromChapter4']}",
        "",
        "## Complete outside-matrix list",
        "",
        "| Code | Catalog category | Product name | Chapter 4 data |",
        "|---|---|---|---|",
    ]
    for record in records:
        facts = record["chapter4"]["availableFields"]
        available = (
            f"PDF p. {facts['pdfPage']}: {facts['kind']}"
            if facts else "Not listed"
        )
        lines.append(f"| {record['code']} | {record['category']} | {record['name']} | {available} |")
    lines.extend([
        "",
        "The seven Chapter 4 records above are sets/accessories rather than individual forceps patterns. The PDF supplies component membership (or capacity for 9002-1), but no per-record anatomical matrix, overall length, material, sterilization or single-use fields.",
    ])
    (DERIVED / "NON_MATRIX_FORCEPS_AUDIT.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(report["counts"], indent=2))


if __name__ == "__main__":
    main()
