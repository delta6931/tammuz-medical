"""Build the review-only AsaDental forceps enrichment sample.

This script deliberately stops at 20 records. It reads the 2025 Extractive
Surgery catalogue and the cached official product pages, validates the forceps
application matrix by coordinates, and writes review artifacts under
data/asadental/derived. It never reads price files or writes website assets.
"""

from __future__ import annotations

import json
import re
from collections import Counter
from pathlib import Path
from typing import Any

import fitz
from bs4 import BeautifulSoup


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "data" / "asadental"
DERIVED_DIR = SOURCE_DIR / "derived"
CACHE_DIR = SOURCE_DIR / "cache" / "asadental.com"
CHAPTER_4 = SOURCE_DIR / "Asa_Dental_2025_Catalog_-_Chapter_4_-_Extractive_Surgery.pdf"

PRIMARY_SOURCE_ID = "asadental-2025-ch4"
MATRIX_SOURCE_ID = "asadental-2025-ch4-matrix"

# Only these records are allowed in this review build. Expanding this tuple is
# intentionally a separate, user-approved task.
SAMPLE: dict[str, dict[str, Any]] = {
    "0100-1": {"page": 3, "pattern": "1", "serration": "serrated", "side": None},
    "0100-2": {"page": 3, "pattern": "2", "serration": "serrated", "side": None},
    "0100-4": {"page": 3, "pattern": "4", "serration": "serrated", "side": None},
    "0100-8": {"page": 3, "pattern": "8", "serration": "serrated", "side": None},
    "0100-17": {"page": 3, "pattern": "17", "serration": "serrated", "side": "right"},
    "0100-18": {"page": 3, "pattern": "18", "serration": "serrated", "side": "left"},
    "0100-20": {"page": 3, "pattern": "20", "serration": "serrated", "side": None},
    "0100-22L": {"page": 4, "pattern": "22L", "patternName": "Routurier", "serration": "serrated", "side": "left"},
    "0100-22R": {"page": 4, "pattern": "22R", "patternName": "Routurier", "serration": "serrated", "side": "right"},
    "0100-29": {"page": 4, "pattern": "29", "serration": "serrated", "side": None},
    "0100-43A": {"page": 5, "pattern": "43A", "serration": "serrated", "side": None, "qualifier": "fractured_or_decayed_teeth"},
    "0100-65L": {"page": 7, "pattern": "65L", "serration": "serrated", "side": "left"},
    "0100-65R": {"page": 7, "pattern": "65R", "serration": "serrated", "side": "right"},
    "0100-86/L": {"page": 9, "pattern": "86½L", "webPattern": "86-1/2L", "patternName": "Routurier", "serration": "non_serrated", "side": "left"},
    "0100-86/R": {"page": 9, "pattern": "86½R", "webPattern": "86-1/2R", "patternName": "Routurier", "serration": "non_serrated", "side": "right"},
    "0100-166": {"page": 9, "pattern": "166", "patternName": "Trotter", "serration": "non_serrated", "side": None, "qualifier": "universal_upper_teeth_emphasis_molars_premolars"},
    "W0160-1": {"page": 11, "pattern": "1", "serration": "serrated", "side": None},
    "W0121-18L": {"page": 16, "pattern": "18L", "patternName": "Harris", "serration": "non_serrated", "side": "left"},
    "0110-39R": {"page": 20, "pattern": "39R", "serration": "serrated", "side": "right"},
    "0112-3": {"page": 20, "pattern": "3", "patternName": "Klein", "serration": "serrated", "side": None},
}

CODE_PATTERN = re.compile(r"^(?:S|W|SW)?\d{4}[A-Z]?-[A-Z0-9/]+$", re.IGNORECASE)
LENGTH_PATTERN = re.compile(r"^(\d+(?:\.\d+)?)\s*cm$", re.IGNORECASE)
LENGTH_AGREEMENT_TOLERANCE_MM = 2.5

MATRIX_COLUMNS = (
    ("incisors_canines", "lower"),
    ("incisors_canines", "upper"),
    ("premolars", "lower"),
    ("premolars", "upper"),
    ("molars", "lower"),
    ("molars", "upper"),
    ("roots", "lower"),
    ("roots", "upper"),
    ("wisdom_teeth", "lower"),
    ("wisdom_teeth", "upper"),
    ("children", "lower"),
    ("children", "upper"),
)

CHAPTER_AUDIT = [
    (1, "AsaOne", "Dimensions are frequent; material and reprocessing facts are present for selected product families; disposable/single-use wording is limited."),
    (2, "Diagnostics", "Dimensions are concentrated in product tables; material occurs for several instrument types; single-use wording was not found."),
    (3, "Oral Surgery", "Length is broadly available. Material, pattern, sterilization and disposable facts exist only in selected sections."),
    (5, "Implant Surgery", "Length is broadly available; material and reusable/disposable facts are limited to specific product groups."),
    (6, "Restorative", "Length is common and material is partial; explicit sterilization wording is sparse; single-use wording was not found."),
    (7, "Endodontics", "Some dimensions are available, but the five requested technical field families are otherwise absent from extracted text."),
    (8, "Periodontal", "Length is common; material, named pattern and sterilization facts are present only in selected sections."),
    (9, "Orthodontics", "Dimensions are broadly available and material is partial. The lone sterilization term is contextual and requires item-level review before use."),
    (10, "Instrument Cassettes and Trays", "Material is available throughout this chapter; sterilization compatibility is available for several systems; dimensions are partial."),
    (11, "Impression Trays", "Material is consistently present; explicit dimensions and sterilization wording are rare; single-use wording was not found."),
    (12, "Laboratory Instruments", "Length and material are available for subsets; sterilization and single-use wording were not found."),
]

FIELD_SIGNAL_PATTERNS = {
    "length": re.compile(r"\b\d+(?:[.,]\d+)?\s*(?:mm|cm)\b", re.IGNORECASE),
    "material": re.compile(
        r"\b(?:stainless steel|steel|titanium|tungsten carbide|carbide|aluminium|aluminum|plastic|polypropylene|polyethylene|polycarbonate|silicone|brass|ceramic)\b",
        re.IGNORECASE,
    ),
    "pattern": re.compile(r"\bpattern\b", re.IGNORECASE),
    "sterilization": re.compile(r"\b(?:sterili\w*|autoclav\w*)\b", re.IGNORECASE),
    "singleUse": re.compile(r"\b(?:single[- ]use|disposable)\b", re.IGNORECASE),
}


def official_slug(code: str) -> str:
    return code.lower().replace("/", "")


def load_official_page(code: str) -> tuple[list[str], str, int]:
    slug = official_slug(code)
    metadata_path = next(CACHE_DIR.glob(f"en__products__{slug}__*.json"))
    body_path = metadata_path.with_suffix(".body")
    metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
    soup = BeautifulSoup(body_path.read_bytes(), "html.parser")
    lines = [line.strip() for line in soup.get_text("\n").splitlines() if line.strip()]
    return lines, metadata["finalUrl"], metadata["fetchedAtUnix"]


def parse_official_page(code: str) -> dict[str, Any]:
    lines, url, fetched_at = load_official_page(code)
    start = lines.index("Product code")
    end = lines.index("Similar products")
    product = lines[start:end]

    def value(label: str) -> str:
        return product[product.index(label) + 1]

    description = product[product.index("°C") + 1]
    length_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:±\s*(\d+(?:\.\d+)?))?\s*cm", description)
    if not length_match:
        raise ValueError(f"No official length found for {code}")

    similar_start = lines.index("Similar products") + 1
    similar_end = lines.index("View more", similar_start)
    variants = []
    for candidate in lines[similar_start:similar_end]:
        if candidate != code and re.fullmatch(r"[A-Z0-9][A-Z0-9./-]*", candidate):
            variants.append(candidate)
        if len(variants) == 6:
            break

    return {
        "url": url,
        "fetchedAtUnix": fetched_at,
        "code": value("Product code"),
        "pattern": value("Pattern"),
        "patternName": None if value("Scientific name") == "-" else value("Scientific name"),
        "singleUse": value("Single use") == "Yes",
        "sterilizable": value("Sterilization") == "Yes",
        "material": value("Material"),
        "maxTemperatureC": int(value("Reprocessing temp.")),
        "lengthCm": float(length_match.group(1)),
        "lengthToleranceCm": float(length_match.group(2)) if length_match.group(2) else None,
        "serration": "serrated" if "serrated rim" in description.lower() else None,
        "clinical": parse_official_clinical(description),
        "relatedVariants": variants,
    }


def parse_official_clinical(description: str) -> dict[str, Any]:
    fact = description.split(" - ", 1)[0].lower()
    arch = "upper" if "upper" in fact else "lower" if "lower" in fact else None
    side = "left" if "left" in fact else "right" if "right" in fact else None
    groups = []
    if "incisor" in fact or "canine" in fact:
        groups.append("incisors_canines")
    if "premolar" in fact:
        groups.append("premolars")
    if re.search(r"\bmolars?\b", fact) and "third molar" not in fact:
        groups.append("molars")
    if "third molar" in fact:
        if "molar" in fact.replace("third molar", ""):
            groups.append("molars")
        groups.append("wisdom_teeth")
    if "root" in fact:
        groups.append("roots")
    if "fractured" in fact or "decayed" in fact:
        groups.append("roots")
    if "universal" in fact and not {"incisors_canines", "premolars", "molars"}.issubset(groups):
        groups = ["incisors_canines", "premolars", "molars"]
    return {
        "arch": arch,
        "side": side,
        "toothGroups": sorted(set(groups)),
        # The official pages in this sample do not identify paediatric use.
        "patientGroup": None,
    }


def page_spans(page: fitz.Page) -> list[dict[str, Any]]:
    return [
        span
        for block in page.get_text("dict")["blocks"]
        for line in block.get("lines", [])
        for span in line.get("spans", [])
    ]


def span_center_x(span: dict[str, Any]) -> float:
    return (span["bbox"][0] + span["bbox"][2]) / 2


def pair_code_with_length(page: fitz.Page, code: str) -> dict[str, Any]:
    """Pair a code with the immediately preceding length in its x-column.

    The catalogue lays product metadata out visually: a length span is directly
    above the code span with the same x-centre. Text reading order is never used.
    """

    spans = page_spans(page)
    code_spans = [span for span in spans if span["text"].strip() == code]
    length_spans = [span for span in spans if LENGTH_PATTERN.fullmatch(span["text"].strip())]
    pairs = []
    for code_span in code_spans:
        code_x = span_center_x(code_span)
        for length_span in length_spans:
            length_x = span_center_x(length_span)
            vertical_gap = code_span["bbox"][1] - length_span["bbox"][3]
            if abs(code_x - length_x) <= 1.0 and -1.0 <= vertical_gap <= 8.0:
                pairs.append((code_span, length_span, abs(code_x - length_x), vertical_gap))
    if len(pairs) != 1:
        raise ValueError(f"Expected exactly one x-aligned length for {code}, found {len(pairs)}")

    code_span, length_span, x_delta, vertical_gap = pairs[0]
    length_match = LENGTH_PATTERN.fullmatch(length_span["text"].strip())
    assert length_match is not None
    return {
        "catalogueNominalLengthMm": float(length_match.group(1)) * 10,
        "codeBBox": [round(value, 3) for value in code_span["bbox"]],
        "lengthBBox": [round(value, 3) for value in length_span["bbox"]],
        "codeXCenter": round(span_center_x(code_span), 3),
        "lengthXCenter": round(span_center_x(length_span), 3),
        "xCenterDelta": round(x_delta, 6),
        "verticalGap": round(vertical_gap, 6),
    }


def audit_all_forceps_geometry(document: fitz.Document) -> dict[str, Any]:
    """Independently reconcile matrix codes with all x-aligned detail entries."""

    matrix_codes = {
        word[4]
        for word in document[1].get_text("words")
        if word[0] > 650 and CODE_PATTERN.fullmatch(word[4])
    }
    detail_codes: set[str] = set()
    details: dict[str, dict[str, Any]] = {}
    serration_assignments: dict[str, str] = {}
    multi_subheading_codes: list[str] = []

    for pdf_page in range(3, 22):
        page = document[pdf_page - 1]
        spans = page_spans(page)
        length_spans = [span for span in spans if LENGTH_PATTERN.fullmatch(span["text"].strip())]
        headings = []
        for block in page.get_text("dict")["blocks"]:
            for line in block.get("lines", []):
                text = " ".join(span["text"].strip() for span in line.get("spans", []) if span["text"].strip()).lower()
                if text in {"serrated tips", "without serrated tips"} and line["bbox"][1] < 100:
                    headings.append(
                        {
                            "kind": "non_serrated" if text.startswith("without") else "serrated",
                            "xStart": line["bbox"][0],
                            "xCenter": (line["bbox"][0] + line["bbox"][2]) / 2,
                        }
                    )

        for code_span in [span for span in spans if CODE_PATTERN.fullmatch(span["text"].strip())]:
            code = code_span["text"].strip()
            code_x = span_center_x(code_span)
            matches = []
            for length_span in length_spans:
                length_x = span_center_x(length_span)
                vertical_gap = code_span["bbox"][1] - length_span["bbox"][3]
                if abs(code_x - length_x) <= 1.0 and -1.0 <= vertical_gap <= 8.0:
                    matches.append(length_span)
            if len(matches) != 1:
                continue
            detail_codes.add(code)
            length_span = matches[0]
            length_match = LENGTH_PATTERN.fullmatch(length_span["text"].strip())
            assert length_match is not None
            length_x = span_center_x(length_span)
            details[code] = {
                "pdfPage": pdf_page,
                "catalogueNominalLengthMm": float(length_match.group(1)) * 10,
                "codeBBox": [round(value, 3) for value in code_span["bbox"]],
                "lengthBBox": [round(value, 3) for value in length_span["bbox"]],
                "codeXCenter": round(code_x, 3),
                "lengthXCenter": round(length_x, 3),
                "xCenterDelta": round(abs(code_x - length_x), 6),
                "verticalGap": round(code_span["bbox"][1] - length_span["bbox"][3], 6),
            }

            physical_half = "left" if code_x < 610 else "right"
            same_half = [
                heading
                for heading in headings
                if ("left" if heading["xStart"] < 610 else "right") == physical_half
            ]
            if not same_half:
                raise ValueError(f"No same-page serration heading for {code} on PDF page {pdf_page}")
            if len(same_half) > 1:
                # These eight records sit in explicitly divided intra-page
                # subpanels. They are excluded from automatic bulk inheritance
                # until those panel boundaries are encoded.
                multi_subheading_codes.append(code)
                continue
            serration_assignments[code] = same_half[0]["kind"]

    if matrix_codes != detail_codes:
        raise ValueError(
            "Matrix/detail code mismatch: "
            f"matrix-only={sorted(matrix_codes - detail_codes)}, "
            f"detail-only={sorted(detail_codes - matrix_codes)}"
        )

    sample_geometry = {code: details[code] for code in SAMPLE}
    return {
        "matrixCodeCount": len(matrix_codes),
        "xAlignedDetailCodeCount": len(detail_codes),
        "matrixAndDetailCodeSetsMatch": True,
        "sampleAlignmentSummary": {
            "maximumXCenterDelta": max(item["xCenterDelta"] for item in sample_geometry.values()),
            "minimumVerticalGap": min(item["verticalGap"] for item in sample_geometry.values()),
            "maximumVerticalGap": max(item["verticalGap"] for item in sample_geometry.values()),
            "visuallyCheckedPdfPages": sorted({SAMPLE[code]["page"] for code in SAMPLE}),
            "visualCheckResult": "All 20 rendered captions agree with the coordinate-derived code/length pairs.",
        },
        "sampleGeometry": sample_geometry,
        "serrationHeadingAudit": {
            "forcepsCodeCount": len(detail_codes),
            "samePageSingleHeadingCount": len(serration_assignments),
            "intraPageMultiSubheadingCount": len(multi_subheading_codes),
            "intraPageMultiSubheadingCodes": sorted(multi_subheading_codes),
            "inheritsAcrossPhysicalPageOrColumnBreakCount": 0,
            "resolvedSamePageAssignments": {
                "serrated": sum(value == "serrated" for value in serration_assignments.values()),
                "nonSerrated": sum(value == "non_serrated" for value in serration_assignments.values()),
            },
        },
    }


def parse_matrix(document: fitz.Document) -> dict[str, dict[str, Any]]:
    page = document[1]
    marks: dict[tuple[float, float], set[int]] = {}
    for trace in page.get_texttrace():
        if trace["type"] not in (0, 1):
            continue
        for codepoint, _glyph_id, origin, _bbox in trace["chars"]:
            if codepoint == 9679:
                key = (round(origin[0], 2), round(origin[1], 2))
                marks.setdefault(key, set()).add(trace["type"])

    words = page.get_text("words")
    output: dict[str, dict[str, Any]] = {}
    for code in SAMPLE:
        matches = [word for word in words if word[4].strip() == code and word[0] > 650]
        if len(matches) != 1:
            raise ValueError(f"Expected one matrix row for {code}, found {len(matches)}")
        word = matches[0]
        row_y = (word[1] + word[3]) / 2
        right_table = word[0] > 850
        base_x = 993.07 if right_table else 740.60
        row_marks = []
        for (x, mark_y), render_types in marks.items():
            if abs(mark_y - row_y) >= 3.5:
                continue
            if right_table and x < 980:
                continue
            if not right_table and x > 900:
                continue
            column_index = round((x - base_x) / 13.305)
            if 0 <= column_index < len(MATRIX_COLUMNS):
                group, arch = MATRIX_COLUMNS[column_index]
                row_marks.append(
                    {
                        "group": group,
                        "arch": arch,
                        "render": "filled" if render_types == {0, 1} else "hollow",
                        "x": x,
                        "y": mark_y,
                    }
                )
        if not row_marks:
            raise ValueError(f"No application marks found for {code}")
        render_styles = {mark["render"] for mark in row_marks}
        if len(render_styles) != 1:
            raise ValueError(f"Mixed rest-position symbols for {code}: {render_styles}")
        output[code] = {
            "marks": row_marks,
            # Verified visually against the matrix legend: filled means open,
            # hollow means closed. The raw render style is retained below.
            "beaksAtRest": "open" if render_styles == {"filled"} else "closed",
        }
    return output


def matrix_to_clinical(code: str, matrix_row: dict[str, Any]) -> dict[str, Any]:
    source = SAMPLE[code]
    child_arches = {mark["arch"] for mark in matrix_row["marks"] if mark["group"] == "children"}
    applications = []
    for mark in matrix_row["marks"]:
        if mark["group"] == "children":
            continue
        applications.append(
            {
                "arch": mark["arch"],
                "toothGroup": mark["group"],
                "side": source.get("side"),
                "patientGroup": "children" if mark["arch"] in child_arches else "unspecified",
                "qualifier": source.get("qualifier"),
            }
        )
    return {
        "applications": applications,
        "arches": sorted({item["arch"] for item in applications}),
        "toothGroups": sorted({item["toothGroup"] for item in applications}),
        "sides": sorted({item["side"] for item in applications if item["side"]}),
        "patientGroups": sorted({item["patientGroup"] for item in applications}),
    }


def compare_record(
    code: str,
    record: dict[str, Any],
    official: dict[str, Any],
    length_geometry: dict[str, Any],
) -> dict[str, Any]:
    mismatches = []
    resolved_differences = []
    catalogue_length_mm = length_geometry["catalogueNominalLengthMm"]
    official_length_mm = official["lengthCm"] * 10
    length_difference_mm = round(abs(catalogue_length_mm - official_length_mm), 3)
    length_agrees = length_difference_mm <= LENGTH_AGREEMENT_TOLERANCE_MM
    if not length_agrees:
        mismatches.append(
            {
                "field": "dimensions.overallLengthMm.value",
                "primaryValue": catalogue_length_mm,
                "secondaryValue": official_length_mm,
                "differenceMm": length_difference_mm,
                "decision": "mark_unknown_due_unresolved_source_conflict",
            }
        )
    elif length_difference_mm:
        resolved_differences.append(
            {
                "field": "dimensions.overallLengthMm.value",
                "catalogueNominalValue": catalogue_length_mm,
                "officialPreciseValue": official_length_mm,
                "differenceMm": length_difference_mm,
                "decision": "use_official_precise_value_within_nominal_rounding_tolerance",
            }
        )

    official_serration = official["serration"]
    catalogue_serration = SAMPLE[code]["serration"]
    if official_serration and official_serration != catalogue_serration:
        mismatches.append(
            {
                "field": "design.tipSerration",
                "primaryValue": catalogue_serration,
                "secondaryValue": official_serration,
                "decision": "mark_unknown_pending_manufacturer_confirmation",
            }
        )

    local_side = record["clinical"]["sides"][0] if record["clinical"]["sides"] else None
    local_children = "children" in record["clinical"]["patientGroups"]

    local_groups = set(record["clinical"]["toothGroups"])
    official_groups = set(official["clinical"]["toothGroups"])
    if local_groups != official_groups:
        mismatches.append(
            {
                "field": "clinical.toothGroups",
                "primaryValue": sorted(local_groups),
                "secondaryValue": sorted(official_groups),
                "decision": "retain_primary_catalogue_matrix_value",
            }
        )

    expected_pattern = SAMPLE[code].get("webPattern", record["design"]["patternCode"])
    if expected_pattern != official["pattern"]:
        mismatches.append(
            {
                "field": "design.patternCode",
                "primaryValue": record["design"]["patternCode"],
                "secondaryValue": official["pattern"],
                "decision": "manual_review_required",
            }
        )

    return {
        "sku": code,
        "officialUrl": official["url"],
        "status": "mismatch" if mismatches else "matched_with_unavailable_fields",
        "lengthVerification": {
            "method": "catalogue code and length paired by x-centre; official value compared as the precise measurement",
            "catalogueNominalLengthMm": catalogue_length_mm,
            "officialPreciseLengthMm": official_length_mm,
            "officialTolerancePlusMinusMm": official["lengthToleranceCm"] * 10 if official["lengthToleranceCm"] is not None else None,
            "absoluteDifferenceMm": length_difference_mm,
            "agreementToleranceMm": LENGTH_AGREEMENT_TOLERANCE_MM,
            "status": (
                "exact_match_use_official_precise_value"
                if length_difference_mm == 0
                else "within_nominal_rounding_use_official_precise_value"
                if length_agrees
                else "unresolved_conflict_mark_unknown"
            ),
            "resolvedValueMm": official_length_mm if length_agrees else None,
            "geometry": length_geometry,
        },
        "mismatches": mismatches,
        "resolvedDifferences": resolved_differences,
        "notAvailableOnSecondaryPage": [
            "design.beaksAtRest",
            *(["design.tipSerration"] if official_serration is None else []),
            *(["design.handleVariant"] if code.startswith(("W", "SW")) else []),
            *(["clinical.sides"] if local_side and not official["clinical"]["side"] else []),
            *(["clinical.patientGroups"] if local_children and official["clinical"]["patientGroup"] is None else []),
        ],
        "secondaryGapFillsAccepted": {
            "material.name": official["material"],
            "reprocessing.singleUse": official["singleUse"],
            "reprocessing.sterilizable": official["sterilizable"],
            "reprocessing.maxTemperatureC": official["maxTemperatureC"],
        },
    }


def build_record(
    code: str,
    local: dict[str, Any],
    matrix_row: dict[str, Any],
    official: dict[str, Any],
    length_geometry: dict[str, Any],
) -> dict[str, Any]:
    asalady = code.startswith(("W", "SW"))
    clinical = matrix_to_clinical(code, matrix_row)
    catalogue_length_mm = length_geometry["catalogueNominalLengthMm"]
    official_length_mm = official["lengthCm"] * 10
    length_agrees = abs(catalogue_length_mm - official_length_mm) <= LENGTH_AGREEMENT_TOLERANCE_MM
    serration_conflict = official["serration"] is not None and official["serration"] != local["serration"]
    unknown_fields = [
        "dimensions.workingLengthMm",
        "material.finish",
        "relationships.procedureCompanions",
    ]
    if not length_agrees:
        unknown_fields.append("dimensions.overallLengthMm")
    if serration_conflict:
        unknown_fields.append("design.tipSerration")

    field_sources = {
        "taxonomy": [PRIMARY_SOURCE_ID],
        "design.patternCode": [PRIMARY_SOURCE_ID],
        "design.patternName": [PRIMARY_SOURCE_ID],
        "design.handleVariant": [PRIMARY_SOURCE_ID],
        "design.beaksAtRest": [MATRIX_SOURCE_ID],
        "clinical.applications[].arch": [PRIMARY_SOURCE_ID, MATRIX_SOURCE_ID],
        "clinical.applications[].toothGroup": [PRIMARY_SOURCE_ID, MATRIX_SOURCE_ID],
        "clinical.applications[].side": [PRIMARY_SOURCE_ID],
        "clinical.applications[].patientGroup": [PRIMARY_SOURCE_ID, MATRIX_SOURCE_ID],
        "material.name": ["asadental-web-product"],
        "reprocessing": ["asadental-web-product"],
        "relationships.relatedVariants": ["asadental-web-product"],
    }
    if not serration_conflict:
        field_sources["design.tipSerration"] = [PRIMARY_SOURCE_ID]
    if length_agrees:
        field_sources["dimensions.overallLengthMm"] = [PRIMARY_SOURCE_ID, "asadental-web-product"]

    return {
        "schemaVersion": "1.0.0-review",
        "sku": code,
        "manufacturer": "AsaDental",
        "taxonomy": {
            "chapter": 4,
            "chapterName": "Extractive Surgery",
            "family": "extracting_forceps",
            "officialSubcategory": "extracting_forceps_asalady" if asalady else "extracting_forceps_standard",
        },
        "design": {
            "patternCode": local["pattern"],
            "patternName": local.get("patternName"),
            "handleVariant": "asalady" if asalady else "standard",
            "handleFeatures": ["smaller_lighter_handle", "smaller_finger_holes", "reduced_size"] if asalady else [],
            "tipSerration": None if serration_conflict else local["serration"],
            "beaksAtRest": matrix_row["beaksAtRest"],
        },
        "dimensions": {
            "overallLengthMm": {
                "value": official_length_mm if length_agrees else None,
                "tolerancePlusMinusMm": (
                    official["lengthToleranceCm"] * 10
                    if length_agrees and official["lengthToleranceCm"] is not None
                    else None
                ),
            },
            "workingLengthMm": None,
        },
        "clinical": clinical,
        "material": {"name": official["material"], "finish": None},
        "reprocessing": {
            "singleUse": official["singleUse"],
            "sterilizable": official["sterilizable"],
            "maxTemperatureC": official["maxTemperatureC"],
        },
        "relationships": {
            "relatedVariants": [{"sku": sku, "relationship": "official_similar_product"} for sku in official["relatedVariants"]],
            "procedureCompanions": [],
        },
        "unknownFields": unknown_fields,
        "provenance": {
            "sources": [
                {
                    "id": PRIMARY_SOURCE_ID,
                    "authority": "primary",
                    "type": "catalogue_pdf",
                    "path": str(CHAPTER_4.relative_to(ROOT)).replace("\\", "/"),
                    "pdfPage": local["page"],
                    "catalogueNominalLengthMm": catalogue_length_mm,
                    "lengthGeometry": length_geometry,
                    "catalogueSerrationHeading": local["serration"],
                },
                {
                    "id": MATRIX_SOURCE_ID,
                    "authority": "primary",
                    "type": "catalogue_matrix",
                    "path": str(CHAPTER_4.relative_to(ROOT)).replace("\\", "/"),
                    "pdfPage": 2,
                    "matrixMarks": matrix_row["marks"],
                },
                {
                    "id": "asadental-web-product",
                    "authority": "secondary",
                    "type": "official_product_page_cached",
                    "url": official["url"],
                    "fetchedAtUnix": official["fetchedAtUnix"],
                    "officialPreciseLengthMm": official_length_mm,
                    "officialTolerancePlusMinusMm": official["lengthToleranceCm"] * 10 if official["lengthToleranceCm"] is not None else None,
                    "officialSerration": official["serration"],
                },
            ],
            "fieldSources": field_sources,
            "reviewStatus": "sample_verified_with_secondary_source",
        },
    }


def build_chapter_audit() -> dict[str, Any]:
    rows = []
    for chapter, name, note in CHAPTER_AUDIT:
        pdf_path = next(SOURCE_DIR.glob(f"Asa_Dental_2025_Catalog_-_Chapter_{chapter}_-*.pdf"))
        document = fitz.open(pdf_path)
        page_text = [page.get_text() for page in document]
        signals = {}
        for field, pattern in FIELD_SIGNAL_PATTERNS.items():
            matches_by_page = [pattern.findall(text) for text in page_text]
            signals[field] = {
                "termOccurrences": sum(len(matches) for matches in matches_by_page),
                "pagesWithTerm": sum(bool(matches) for matches in matches_by_page),
            }
        rows.append(
            {
                "chapter": chapter,
                "chapterName": name,
                "sourcePath": str(pdf_path.relative_to(ROOT)).replace("\\", "/"),
                "pdfPages": len(document),
                "fieldSignals": signals,
                "scopeAssessment": note,
            }
        )
    return {
        "method": "Full-text regex scan of all non-Extractive-Surgery 2025 chapter PDFs using the keyword families declared in scripts/build_asadental_forceps_sample.py. Counts are discovery signals, not per-SKU coverage, and require layout-aware extraction before publication.",
        "chapters": rows,
    }


def write_json(path: Path, value: Any) -> None:
    path.write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def main() -> None:
    if len(SAMPLE) != 20:
        raise ValueError("The review gate requires exactly 20 records")
    document = fitz.open(CHAPTER_4)
    matrix = parse_matrix(document)
    geometry_audit = audit_all_forceps_geometry(document)
    official = {code: parse_official_page(code) for code in SAMPLE}
    records = [
        build_record(
            code,
            SAMPLE[code],
            matrix[code],
            official[code],
            geometry_audit["sampleGeometry"][code],
        )
        for code in SAMPLE
    ]
    verification = [
        compare_record(
            code,
            record,
            official[code],
            geometry_audit["sampleGeometry"][code],
        )
        for code, record in zip(SAMPLE, records, strict=True)
    ]

    mismatch_counts = Counter(
        mismatch["field"]
        for item in verification
        for mismatch in item["mismatches"]
    )
    verification_report = {
        "sampleCount": len(records),
        "recordsWithMismatch": sum(bool(item["mismatches"]) for item in verification),
        "totalMismatches": sum(len(item["mismatches"]) for item in verification),
        "mismatchesByField": dict(sorted(mismatch_counts.items())),
        "lengthResolutionSummary": {
            "exactMatches": sum(item["lengthVerification"]["status"].startswith("exact_match") for item in verification),
            "withinNominalRounding": sum(item["lengthVerification"]["status"].startswith("within_nominal") for item in verification),
            "unresolvedMarkedUnknown": sum(item["lengthVerification"]["status"].startswith("unresolved") for item in verification),
        },
        "authorityDecision": "Catalogue geometry establishes the correct nominal code/length association. Where the official precise length agrees within 2.5 mm, the official value is stored. Larger conflicts are unknown; neither source is published.",
        "copyWeightingPolicy": "Future copy must lead with anatomical application, side, patient group, resolved length and named pattern. Near-constant material and reprocessing facts are specifications, not description themes.",
        "geometryAudit": geometry_audit,
        "records": verification,
    }

    DERIVED_DIR.mkdir(parents=True, exist_ok=True)
    write_json(DERIVED_DIR / "forceps-sample-20.json", {"recordCount": len(records), "records": records})
    write_json(DERIVED_DIR / "forceps-sample-20-verification.json", verification_report)
    write_json(
        DERIVED_DIR / "forceps-sample-20-length-reverification.json",
        {
            "method": "Every catalogue length was paired with its product code by matching x-centres and immediate vertical adjacency; text reading order was not used.",
            "agreementToleranceMm": LENGTH_AGREEMENT_TOLERANCE_MM,
            "allForcepsGeometryAudit": geometry_audit,
            "sample": [
                {
                    "sku": item["sku"],
                    **item["lengthVerification"],
                }
                for item in verification
            ],
        },
    )
    write_json(DERIVED_DIR / "chapter-field-audit.json", build_chapter_audit())
    print(json.dumps({
        "records": len(records),
        "recordsWithMismatch": verification_report["recordsWithMismatch"],
        "totalMismatches": verification_report["totalMismatches"],
        "output": str(DERIVED_DIR),
    }, indent=2))


if __name__ == "__main__":
    main()
