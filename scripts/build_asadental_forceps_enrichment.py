"""Build the approved 186-record AsaDental forceps enrichment slice.

The 2025 Extractive Surgery catalogue is the primary source. Matrix marks,
caption text and nominal lengths are associated geometrically; PDF text order
is never used to pair a code with a measurement. Cached official product pages
are optional secondary evidence for precise lengths, material, reprocessing and
manufacturer-listed similar products.

The script never reads a price workbook and never performs network requests.
Use ``fetch_asadental_audit_sources.py`` separately when refreshing the cache.
"""

from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path
from typing import Any

import fitz
from bs4 import BeautifulSoup


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "data" / "asadental"
DERIVED_DIR = SOURCE_DIR / "derived"
CACHE_DIR = SOURCE_DIR / "cache" / "asadental.com"
CHAPTER_4 = SOURCE_DIR / "Asa_Dental_2025_Catalog_-_Chapter_4_-_Extractive_Surgery.pdf"
SCHEMA_PATH = DERIVED_DIR / "product-enrichment.schema.json"
SAMPLE_PATH = DERIVED_DIR / "forceps-sample-20.json"
OUTPUT_PATH = DERIVED_DIR / "forceps-enriched.json"
VERIFICATION_PATH = DERIVED_DIR / "forceps-enriched-verification.json"
OVERRIDE_PATH = SOURCE_DIR / "overrides" / "confirmed-lengths.json"

PRIMARY_SOURCE_ID = "asadental-2025-ch4"
MATRIX_SOURCE_ID = "asadental-2025-ch4-matrix"
OFFICIAL_SOURCE_ID = "asadental-web-product"
LENGTH_AGREEMENT_TOLERANCE_MM = 2.5

CODE_PATTERN = re.compile(r"^(?:S|W|SW)?\d{4}[A-Z]?-[A-Z0-9/]+$", re.IGNORECASE)
LENGTH_PATTERN = re.compile(r"^(\d+(?:\.\d+)?)\s*cm$", re.IGNORECASE)

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

PATTERN_NAMES = (
    "Ogden-Felsch",
    "Routurier",
    "Stieglitz",
    "Trotter",
    "Physick",
    "Tomes",
    "Nevius",
    "Harris",
    "Cryer",
    "Witzel",
    "White",
    "Hull",
)

SUBCATEGORY_BY_HEADING = {
    "EXTRACTING FORCEPS": "extracting_forceps_standard",
    "EXTRACTING FORCEPS - ASALADY": "extracting_forceps_asalady",
    "EXTRACTING FORCEPS - MEAD PATTERN": "extracting_forceps_mead_pattern",
    "EXTRACTING FORCEPS - AMERICAN PATTERN": "extracting_forceps_american_pattern",
    "EXTRACTING FORCEPS - AMERICAN PATTERN - ASALADY": "extracting_forceps_american_pattern_asalady",
    "EXTRACTING FORCEPS - ANATOMICALLY SHAPED HANDLE": "extracting_forceps_anatomically_shaped_handle",
    "EXTRACTING FORCEPS FOR CHILDREN": "extracting_forceps_children",
    "EXTRACTING FORCEPS FOR CHILDREN - KLEIN PATTERN": "extracting_forceps_children_klein_pattern",
    "EXTRACTING FORCEPS FOR ROOTS": "extracting_forceps_roots",
    "ROOT AND SPLINTER FORCEPS": "root_and_splinter_forceps",
}

# Five captions are split into separate PDF text blocks even though they are a
# single visual template cell. Values below are transcribed from those cells;
# their code/length geometry is still validated independently.
SPLIT_CAPTIONS: dict[str, dict[str, Any]] = {
    "0100-7": {"patternName": None, "side": None, "qualifier": None},
    "0101-1": {"patternName": "Witzel", "side": None, "qualifier": None},
    "0102-1": {"patternName": "Stieglitz", "side": None, "qualifier": "root_fragments"},
    "0112-2": {"patternName": "Klein", "side": None, "qualifier": None},
    "0112-6": {"patternName": "Klein", "side": None, "qualifier": None},
}

SPECIAL_OFFICIAL_SLUGS = {
    "0100-67/L": "0100-67-12-l",
    "0100-67/R": "0100-67-12-r",
}


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def validate_against_schema(value: Any, schema: dict[str, Any], root_schema: dict[str, Any], path: str = "$.") -> list[str]:
    """Validate the schema features used by product-enrichment.schema.json.

    Keeping this small validator in the builder avoids adding a production
    dependency solely for an offline data-generation script.
    """

    if "$ref" in schema:
        target: Any = root_schema
        for segment in schema["$ref"].removeprefix("#/").split("/"):
            target = target[segment]
        return validate_against_schema(value, target, root_schema, path)

    if "oneOf" in schema:
        branches = [validate_against_schema(value, branch, root_schema, path) for branch in schema["oneOf"]]
        if sum(not branch for branch in branches) != 1:
            return [f"{path} did not match exactly one oneOf branch"]
        return []

    errors: list[str] = []
    allowed_types = schema.get("type")
    if allowed_types:
        allowed_types = [allowed_types] if isinstance(allowed_types, str) else allowed_types

        def matches_type(kind: str) -> bool:
            return {
                "object": isinstance(value, dict),
                "array": isinstance(value, list),
                "string": isinstance(value, str),
                "integer": isinstance(value, int) and not isinstance(value, bool),
                "number": isinstance(value, (int, float)) and not isinstance(value, bool),
                "boolean": isinstance(value, bool),
                "null": value is None,
            }[kind]

        if not any(matches_type(kind) for kind in allowed_types):
            return [f"{path} expected {allowed_types}, received {type(value).__name__}"]

    if "const" in schema and value != schema["const"]:
        errors.append(f"{path} must equal {schema['const']!r}")
    if "enum" in schema and value not in schema["enum"]:
        errors.append(f"{path} is not in enum {schema['enum']!r}")
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        if "minimum" in schema and value < schema["minimum"]:
            errors.append(f"{path} is below minimum {schema['minimum']}")
        if "maximum" in schema and value > schema["maximum"]:
            errors.append(f"{path} is above maximum {schema['maximum']}")
        if "exclusiveMinimum" in schema and value <= schema["exclusiveMinimum"]:
            errors.append(f"{path} is not above {schema['exclusiveMinimum']}")
    if isinstance(value, str) and len(value) < schema.get("minLength", 0):
        errors.append(f"{path} is shorter than minLength")
    if isinstance(value, list):
        if len(value) < schema.get("minItems", 0):
            errors.append(f"{path} has too few items")
        if "maxItems" in schema and len(value) > schema["maxItems"]:
            errors.append(f"{path} has too many items")
        if schema.get("uniqueItems") and len({json.dumps(item, sort_keys=True) for item in value}) != len(value):
            errors.append(f"{path} contains duplicate items")
        if "items" in schema:
            for index, item in enumerate(value):
                errors.extend(validate_against_schema(item, schema["items"], root_schema, f"{path}[{index}]"))
    if isinstance(value, dict):
        properties = schema.get("properties", {})
        for required in schema.get("required", []):
            if required not in value:
                errors.append(f"{path} missing required property {required}")
        additional = schema.get("additionalProperties", True)
        if additional is False:
            for key in value.keys() - properties.keys():
                errors.append(f"{path} has unexpected property {key}")
        for key, item in value.items():
            if key in properties:
                errors.extend(validate_against_schema(item, properties[key], root_schema, f"{path}{key}."))
            elif isinstance(additional, dict):
                errors.extend(validate_against_schema(item, additional, root_schema, f"{path}{key}."))
    return errors


def page_spans(page: fitz.Page) -> list[dict[str, Any]]:
    return [
        span
        for block in page.get_text("dict")["blocks"]
        for line in block.get("lines", [])
        for span in line.get("spans", [])
    ]


def span_center_x(span: dict[str, Any]) -> float:
    return (span["bbox"][0] + span["bbox"][2]) / 2


def forceps_codes(document: fitz.Document) -> list[str]:
    return sorted(
        {
            word[4].strip()
            for word in document[1].get_text("words")
            if word[0] > 650 and CODE_PATTERN.fullmatch(word[4].strip())
        },
        key=lambda value: (value.lower(), value),
    )


def extract_geometry_and_serration(document: fitz.Document, codes: set[str]) -> tuple[dict[str, Any], dict[str, str], list[str]]:
    details: dict[str, Any] = {}
    serration: dict[str, str] = {}
    ambiguous: list[str] = []

    for pdf_page in range(3, 22):
        page = document[pdf_page - 1]
        spans = page_spans(page)
        lengths = [span for span in spans if LENGTH_PATTERN.fullmatch(span["text"].strip())]
        headings: list[dict[str, Any]] = []
        for block in page.get_text("dict")["blocks"]:
            for line in block.get("lines", []):
                text = " ".join(span["text"].strip() for span in line.get("spans", []) if span["text"].strip()).lower()
                if text in {"serrated tips", "without serrated tips"} and line["bbox"][1] < 100:
                    headings.append({
                        "kind": "non_serrated" if text.startswith("without") else "serrated",
                        "xStart": line["bbox"][0],
                    })

        for code_span in [span for span in spans if span["text"].strip() in codes]:
            code = code_span["text"].strip()
            code_x = span_center_x(code_span)
            matches = []
            for length_span in lengths:
                length_x = span_center_x(length_span)
                vertical_gap = code_span["bbox"][1] - length_span["bbox"][3]
                if abs(code_x - length_x) <= 1.0 and -1.0 <= vertical_gap <= 8.0:
                    matches.append(length_span)
            if len(matches) != 1:
                continue
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
            if len(same_half) == 1:
                serration[code] = same_half[0]["kind"]
            elif len(same_half) > 1:
                ambiguous.append(code)
            else:
                raise ValueError(f"No same-page serration heading for {code} on PDF page {pdf_page}")

    if set(details) != codes:
        raise ValueError(f"Missing x-aligned detail geometry for: {sorted(codes - set(details))}")
    return details, serration, sorted(set(ambiguous))


def parse_matrix(document: fitz.Document, codes: list[str]) -> dict[str, dict[str, Any]]:
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
    for code in codes:
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
                row_marks.append({
                    "group": group,
                    "arch": arch,
                    "render": "filled" if render_types == {0, 1} else "hollow",
                    "x": x,
                    "y": mark_y,
                })
        render_styles = {mark["render"] for mark in row_marks}
        output[code] = {
            "marks": row_marks,
            # A mixed-symbol row cannot be represented by the record-level
            # field without guessing. Preserve the marks and leave the summary
            # unknown for that SKU.
            "beaksAtRest": (
                "open"
                if render_styles == {"filled"}
                else "closed"
                if render_styles == {"hollow"}
                else None
            ),
        }
    return output


def normalize_pattern_code(code: str) -> str:
    suffix = code.split("-", 1)[1]
    if suffix.endswith("/"):
        return suffix[:-1] + "½"
    if "/" in suffix:
        return suffix.replace("/L", "½L").replace("/R", "½R")
    return suffix


def qualifier_from_caption(text: str) -> str | None:
    lower = text.lower()
    if "root fragment" in lower:
        return "root_fragments"
    if "overlapping" in lower:
        return "overlapping_teeth"
    if "fractured or decayed" in lower:
        return "fractured_or_decayed_teeth"
    if "broken crown" in lower:
        return "broken_crowns"
    if "deciduous" in lower or "for children" in lower:
        return "deciduous_teeth"
    if "separating" in lower:
        return "tooth_separation"
    return None


def product_heading(page: fitz.Page, code_x: float) -> str:
    expected_half = "left" if code_x < 610 else "right"
    candidates = []
    for block in page.get_text("dict")["blocks"]:
        for line in block.get("lines", []):
            text = " ".join(span["text"].strip() for span in line.get("spans", []) if span["text"].strip())
            if line["bbox"][1] >= 67 or text not in SUBCATEGORY_BY_HEADING:
                continue
            half = "left" if line["bbox"][0] < 610 else "right"
            if half == expected_half:
                candidates.append(text)
    if len(candidates) != 1:
        raise ValueError(f"Expected one product-family heading in {expected_half} half, found {candidates}")
    return candidates[0]


def extract_catalogue_details(document: fitz.Document, codes: list[str], geometry: dict[str, Any]) -> dict[str, dict[str, Any]]:
    details: dict[str, dict[str, Any]] = {}
    caption_blocks: dict[int, list[list[str]]] = {}
    headings: dict[tuple[int, str], str] = {}
    for pdf_page in range(3, 22):
        page = document[pdf_page - 1]
        caption_blocks[pdf_page] = [
            [line.strip() for line in block[4].splitlines() if line.strip()]
            for block in page.get_text("blocks")
        ]
        for block in page.get_text("dict")["blocks"]:
            for line in block.get("lines", []):
                text = " ".join(span["text"].strip() for span in line.get("spans", []) if span["text"].strip())
                if line["bbox"][1] < 67 and text in SUBCATEGORY_BY_HEADING:
                    half = "left" if line["bbox"][0] < 610 else "right"
                    headings[(pdf_page, half)] = text

    for code in codes:
        pdf_page = geometry[code]["pdfPage"]
        caption_lines: list[str] | None = None
        for lines in caption_blocks[pdf_page]:
            if code in lines and any(LENGTH_PATTERN.fullmatch(line) for line in lines):
                caption_lines = lines
                break

        pattern_name = None
        side = None
        qualifier = None
        if caption_lines:
            length_index = next(index for index, line in enumerate(caption_lines) if LENGTH_PATTERN.fullmatch(line))
            code_index = caption_lines.index(code)
            pattern_text = " ".join(caption_lines[:length_index])
            pattern_name = next((name for name in PATTERN_NAMES if name.lower() in pattern_text.lower()), None)
            clinical_text = " ".join(caption_lines[code_index + 1 :])
            lower = clinical_text.lower()
            side = "left" if "left" in lower else "right" if "right" in lower else None
            qualifier = qualifier_from_caption(clinical_text)
        elif code in SPLIT_CAPTIONS:
            pattern_name = SPLIT_CAPTIONS[code]["patternName"]
            side = SPLIT_CAPTIONS[code]["side"]
            qualifier = SPLIT_CAPTIONS[code]["qualifier"]
        else:
            raise ValueError(f"No catalogue caption found for {code}")

        half = "left" if geometry[code]["codeXCenter"] < 610 else "right"
        heading = headings[(pdf_page, half)]
        # Klein is an official section-level pattern name, not an inferred name.
        if heading.endswith("KLEIN PATTERN"):
            pattern_name = "Klein"

        details[code] = {
            "pdfPage": pdf_page,
            "patternCode": normalize_pattern_code(code),
            "patternName": pattern_name,
            "side": side,
            "qualifier": qualifier,
            "heading": heading,
            "officialSubcategory": SUBCATEGORY_BY_HEADING[heading],
        }
    return details


def matrix_to_clinical(detail: dict[str, Any], matrix_row: dict[str, Any]) -> dict[str, Any]:
    child_arches = {mark["arch"] for mark in matrix_row["marks"] if mark["group"] == "children"}
    applications = []
    for mark in matrix_row["marks"]:
        if mark["group"] == "children":
            continue
        applications.append({
            "arch": mark["arch"],
            "toothGroup": mark["group"],
            "side": detail["side"],
            "patientGroup": "children" if mark["arch"] in child_arches else "unspecified",
            "qualifier": detail["qualifier"],
        })
    if not applications:
        # 0102-1 has a visually blank matrix row. Its product caption supplies
        # only the tooth-group fact (root fragments), not an upper/lower arch.
        # Preserve that fact without manufacturing an anatomical assignment.
        tooth_groups = ["roots"] if detail["qualifier"] == "root_fragments" else []
        return {
            "applications": [],
            "arches": sorted(child_arches),
            "toothGroups": tooth_groups,
            "sides": [],
            "patientGroups": ["children"] if child_arches else ["unspecified"],
        }
    return {
        "applications": applications,
        "arches": sorted({item["arch"] for item in applications}),
        "toothGroups": sorted({item["toothGroup"] for item in applications}),
        "sides": sorted({item["side"] for item in applications if item["side"]}),
        "patientGroups": sorted({item["patientGroup"] for item in applications}),
    }


def official_slug(code: str) -> str:
    return SPECIAL_OFFICIAL_SLUGS.get(code, code.lower().replace("/", ""))


def cache_paths(url: str) -> tuple[Path, Path]:
    readable = url.split("asadental.com/", 1)[1].strip("/").replace("/", "__")
    digest = hashlib.sha256(url.encode("utf-8")).hexdigest()[:12]
    stem = f"{readable[:120]}__{digest}"
    return CACHE_DIR / f"{stem}.body", CACHE_DIR / f"{stem}.json"


def parse_official_page(code: str) -> dict[str, Any] | None:
    url = f"https://www.asadental.com/en/products/{official_slug(code)}/"
    body_path, metadata_path = cache_paths(url)
    if not body_path.exists() or not metadata_path.exists():
        return None

    metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
    soup = BeautifulSoup(body_path.read_bytes(), "lxml")
    lines = [line.strip() for line in soup.get_text("\n").splitlines() if line.strip()]
    start = lines.index("Product code")
    end = lines.index("Similar products")
    product = lines[start:end]

    def value(label: str) -> str:
        return product[product.index(label) + 1]

    temperature_label = next(label for label in product if label.strip("Â") == "°C")
    description = product[product.index(temperature_label) + 1]
    length_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:Â?±\s*(\d+(?:\.\d+)?))?\s*cm", description)
    similar_start = lines.index("Similar products") + 1
    similar_end = lines.index("View more", similar_start)
    variants = []
    for candidate in lines[similar_start:similar_end]:
        if candidate != code and re.fullmatch(r"[A-Z0-9][A-Z0-9./-]*", candidate):
            variants.append(candidate)
        if len(variants) == 6:
            break

    return {
        "url": metadata.get("finalUrl", url),
        "fetchedAtUnix": metadata["fetchedAtUnix"],
        "pattern": value("Pattern"),
        "patternName": None if value("Scientific name") == "-" else value("Scientific name"),
        "singleUse": value("Single use") == "Yes",
        "sterilizable": value("Sterilization") == "Yes",
        "material": value("Material"),
        "maxTemperatureC": int(value("Reprocessing temp.")),
        "lengthMm": float(length_match.group(1)) * 10 if length_match else None,
        "lengthToleranceMm": float(length_match.group(2)) * 10 if length_match and length_match.group(2) else None,
        "serration": "serrated" if "serrated rim" in description.lower() else None,
        "relatedVariants": variants,
    }


def load_confirmed_lengths() -> dict[str, Any]:
    if not OVERRIDE_PATH.exists():
        return {}
    return json.loads(OVERRIDE_PATH.read_text(encoding="utf-8")).get("overrides", {})


def build_record(
    code: str,
    detail: dict[str, Any],
    geometry: dict[str, Any],
    matrix_row: dict[str, Any],
    local_serration: str | None,
    official: dict[str, Any] | None,
    confirmed_length: dict[str, Any] | None,
) -> dict[str, Any]:
    asalady = code.startswith(("W", "SW"))
    clinical = matrix_to_clinical(detail, matrix_row)
    catalogue_length_mm = geometry["catalogueNominalLengthMm"]
    resolved_length = None
    resolved_tolerance = None
    length_status = "secondary_not_cached"

    if official and official["lengthMm"] is not None:
        difference = abs(catalogue_length_mm - official["lengthMm"])
        if difference <= LENGTH_AGREEMENT_TOLERANCE_MM:
            resolved_length = official["lengthMm"]
            resolved_tolerance = official["lengthToleranceMm"]
            length_status = "official_precise_within_catalogue_nominal_tolerance"
        else:
            length_status = "unresolved_catalogue_website_conflict"
    elif official:
        length_status = "official_length_not_published"

    if confirmed_length:
        resolved_length = confirmed_length["valueMm"]
        resolved_tolerance = confirmed_length.get("tolerancePlusMinusMm")
        length_status = "manufacturer_confirmed_override"

    serration_conflict = bool(
        local_serration
        and official
        and official["serration"]
        and official["serration"] != local_serration
    )
    resolved_serration = None if serration_conflict else local_serration

    material = {"name": official["material"], "finish": None} if official else None
    reprocessing = {
        "singleUse": official["singleUse"] if official else None,
        "sterilizable": official["sterilizable"] if official else None,
        "maxTemperatureC": official["maxTemperatureC"] if official else None,
    }
    related_variants = (
        [{"sku": sku, "relationship": "official_similar_product"} for sku in official["relatedVariants"]]
        if official
        else []
    )

    unknown_fields = [
        "dimensions.workingLengthMm",
        "material.finish",
        "relationships.procedureCompanions",
    ]
    if resolved_length is None:
        unknown_fields.append("dimensions.overallLengthMm")
    if resolved_serration is None:
        unknown_fields.append("design.tipSerration")
    if matrix_row["beaksAtRest"] is None:
        unknown_fields.append("design.beaksAtRest")
    if not clinical["applications"]:
        unknown_fields.append("clinical.applications")
        if not clinical["arches"]:
            unknown_fields.append("clinical.arches")
        if not clinical["toothGroups"]:
            unknown_fields.append("clinical.toothGroups")
    if not official:
        unknown_fields.extend([
            "material.name",
            "reprocessing.singleUse",
            "reprocessing.sterilizable",
            "reprocessing.maxTemperatureC",
            "relationships.relatedVariants",
        ])

    field_sources: dict[str, list[str]] = {
        "taxonomy": [PRIMARY_SOURCE_ID],
        "design.patternCode": [PRIMARY_SOURCE_ID],
        "design.patternName": [PRIMARY_SOURCE_ID],
        "design.handleVariant": [PRIMARY_SOURCE_ID],
        "design.beaksAtRest": [MATRIX_SOURCE_ID],
        "clinical.applications[].arch": [PRIMARY_SOURCE_ID, MATRIX_SOURCE_ID],
        "clinical.applications[].toothGroup": [PRIMARY_SOURCE_ID, MATRIX_SOURCE_ID],
        "clinical.applications[].side": [PRIMARY_SOURCE_ID],
        "clinical.applications[].patientGroup": [PRIMARY_SOURCE_ID, MATRIX_SOURCE_ID],
    }
    if resolved_serration:
        field_sources["design.tipSerration"] = [PRIMARY_SOURCE_ID]
    if official:
        field_sources["material.name"] = [OFFICIAL_SOURCE_ID]
        field_sources["reprocessing"] = [OFFICIAL_SOURCE_ID]
        field_sources["relationships.relatedVariants"] = [OFFICIAL_SOURCE_ID]
    if resolved_length is not None:
        field_sources["dimensions.overallLengthMm"] = (
            ["manufacturer-confirmed-length-override"]
            if confirmed_length
            else [PRIMARY_SOURCE_ID, OFFICIAL_SOURCE_ID]
        )

    sources: list[dict[str, Any]] = [
        {
            "id": PRIMARY_SOURCE_ID,
            "authority": "primary",
            "type": "catalogue_pdf",
            "path": str(CHAPTER_4.relative_to(ROOT)).replace("\\", "/"),
            "pdfPage": detail["pdfPage"],
            "catalogueNominalLengthMm": catalogue_length_mm,
            "lengthGeometry": geometry,
            "catalogueSerrationHeading": local_serration,
        },
        {
            "id": MATRIX_SOURCE_ID,
            "authority": "primary",
            "type": "catalogue_matrix",
            "path": str(CHAPTER_4.relative_to(ROOT)).replace("\\", "/"),
            "pdfPage": 2,
            "matrixMarks": matrix_row["marks"],
        },
    ]
    if official:
        official_source = {
            "id": OFFICIAL_SOURCE_ID,
            "authority": "secondary",
            "type": "official_product_page_cached",
            "url": official["url"],
            "fetchedAtUnix": official["fetchedAtUnix"],
            "officialSerration": official["serration"],
            "lengthResolutionStatus": length_status,
        }
        if official["lengthMm"] is not None:
            official_source["officialPreciseLengthMm"] = official["lengthMm"]
            official_source["officialTolerancePlusMinusMm"] = official["lengthToleranceMm"]
        sources.append(official_source)
    if confirmed_length:
        sources.append({
            "id": "manufacturer-confirmed-length-override",
            "authority": "primary",
            "type": "manufacturer_confirmation",
            "confirmedBy": confirmed_length["confirmedBy"],
            "confirmedAt": confirmed_length["confirmedAt"],
            "evidenceReference": confirmed_length["evidenceReference"],
        })

    return {
        "schemaVersion": "1.0.0-review",
        "sku": code,
        "manufacturer": "AsaDental",
        "taxonomy": {
            "chapter": 4,
            "chapterName": "Extractive Surgery",
            "family": "extracting_forceps",
            "officialSubcategory": detail["officialSubcategory"],
        },
        "design": {
            "patternCode": detail["patternCode"],
            "patternName": detail["patternName"],
            "handleVariant": "asalady" if asalady else "standard",
            "handleFeatures": ["smaller_lighter_handle", "smaller_finger_holes", "reduced_size"] if asalady else [],
            "tipSerration": resolved_serration,
            "beaksAtRest": matrix_row["beaksAtRest"],
        },
        "dimensions": {
            "overallLengthMm": {
                "value": resolved_length,
                "tolerancePlusMinusMm": resolved_tolerance,
            },
            "workingLengthMm": None,
        },
        "clinical": clinical,
        "material": material,
        "reprocessing": reprocessing,
        "relationships": {
            "relatedVariants": related_variants,
            "procedureCompanions": [],
        },
        "unknownFields": sorted(set(unknown_fields)),
        "provenance": {
            "sources": sources,
            "fieldSources": field_sources,
            "reviewStatus": "matrix_forceps_secondary_verified" if official else "matrix_forceps_primary_only",
        },
    }


def main() -> None:
    with fitz.open(CHAPTER_4) as document:
        codes = forceps_codes(document)
        if len(codes) != 186:
            raise ValueError(f"Expected 186 forceps matrix codes, found {len(codes)}")
        geometry, serration, ambiguous_serration = extract_geometry_and_serration(document, set(codes))
        matrix = parse_matrix(document, codes)
        details = extract_catalogue_details(document, codes, geometry)

    official = {code: parse_official_page(code) for code in codes}
    confirmed_lengths = load_confirmed_lengths()
    records = [
        build_record(
            code,
            details[code],
            geometry[code],
            matrix[code],
            serration.get(code),
            official[code],
            confirmed_lengths.get(code),
        )
        for code in codes
    ]

    # Preserve every approved sample record byte-for-byte at the record level.
    # The remaining 166 records use the same schema and authority rules.
    approved_samples = {
        record["sku"]: record
        for record in json.loads(SAMPLE_PATH.read_text(encoding="utf-8"))["records"]
    }
    records = [approved_samples.get(record["sku"], record) for record in records]

    schema = json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))
    errors = []
    for record in records:
        errors.extend(f"{record['sku']} {error}" for error in validate_against_schema(record, schema, schema))
    if errors:
        raise ValueError("Schema validation failed:\n" + "\n".join(errors))

    payload = {"recordCount": len(records), "records": records}
    serialized = json.dumps(payload, ensure_ascii=False).lower()
    if '"price"' in serialized or '"currency"' in serialized:
        raise ValueError("Commercial price data was detected in enrichment output")

    unresolved_lengths = [record["sku"] for record in records if record["dimensions"]["overallLengthMm"]["value"] is None]
    official_sources = {
        record["sku"]: next(
            source for source in record["provenance"]["sources"] if source["id"] == OFFICIAL_SOURCE_ID
        )
        for record in records
    }
    conflicting_lengths = [
        record["sku"]
        for record in records
        if record["dimensions"]["overallLengthMm"]["value"] is None
        and official_sources[record["sku"]].get("officialPreciseLengthMm") is not None
    ]
    official_length_not_published = [
        record["sku"]
        for record in records
        if official_sources[record["sku"]].get("officialPreciseLengthMm") is None
    ]
    unknown_serration = [record["sku"] for record in records if record["design"]["tipSerration"] is None]
    report = {
        "recordCount": len(records),
        "schemaVersion": "1.0.0-review",
        "schemaChanged": True,
        "schemaChange": "clinical.applications now permits an empty array for one blank matrix row (0102-1) and six child-only rows that do not supply a tooth group; field names are unchanged",
        "matrixAndDetailCodeSetsMatch": True,
        "maximumXCenterDeltaPt": max(item["xCenterDelta"] for item in geometry.values()),
        "verticalGapPt": {
            "minimum": min(item["verticalGap"] for item in geometry.values()),
            "maximum": max(item["verticalGap"] for item in geometry.values()),
        },
        "officialPagesCached": sum(value is not None for value in official.values()),
        "resolvedLengthCount": len(records) - len(unresolved_lengths),
        "unresolvedLengthCount": len(unresolved_lengths),
        "unresolvedLengthSkus": unresolved_lengths,
        # The 20 approved sample records predate lengthResolutionStatus. Derive
        # these totals from their actual evidence so legacy records are counted.
        "conflictingLengthCount": len(conflicting_lengths),
        "conflictingLengthSkus": conflicting_lengths,
        "officialLengthNotPublishedCount": len(official_length_not_published),
        "officialLengthNotPublishedSkus": official_length_not_published,
        "ambiguousSerrationPanelCount": len(ambiguous_serration),
        "ambiguousSerrationPanelSkus": ambiguous_serration,
        "unknownSerrationCount": len(unknown_serration),
        "unknownSerrationSkus": unknown_serration,
        "mixedBeaksAtRestCount": sum(record["design"]["beaksAtRest"] is None for record in records),
        "mixedBeaksAtRestSkus": [record["sku"] for record in records if record["design"]["beaksAtRest"] is None],
        "priceFieldsPresent": False,
    }

    write_json(OUTPUT_PATH, payload)
    write_json(VERIFICATION_PATH, report)
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
