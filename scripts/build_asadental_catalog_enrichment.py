"""Build factual enrichment for every non-matrix AsaDental catalogue record.

The twelve local 2025 catalogue chapters are the only technical source. The
builder never opens price PDFs/workbooks, never performs a network request and
never copies catalogue prose. It matches each SKU to a catalogue page, then
normalizes only explicit label, heading and code-specific callout facts.

The approved forceps dataset is intentionally read-only and excluded from this
output. Its schema and field names are not shared with this broader catalogue
projection because the forceps selector relies on that stable contract.
"""

from __future__ import annotations

import json
import re
from collections import Counter, defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import fitz


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "asadental"
CATALOG_PATH = ROOT / "app" / "_data" / "asaCatalog.json"
FORCEPS_PATH = DATA / "derived" / "forceps-enriched.json"
OUTPUT_PATH = DATA / "derived" / "catalog-enriched.json"

CHAPTER_NAMES = {
    1: "AsaOne",
    2: "Diagnostics",
    3: "Oral Surgery",
    4: "Extractive Surgery",
    5: "Implant Surgery",
    6: "Restorative",
    7: "Endodontics",
    8: "Periodontal",
    9: "Orthodontics",
    10: "Instrument Cassettes and Trays",
    11: "Impression Trays",
    12: "Laboratory Instruments",
}

CATEGORY_CHAPTERS = {
    "AsaOne disposables": [1],
    "Diagnostic": [2],
    "Oral Surgery": [3],
    "Extractive Surgery": [4],
    "Implant Surgery": [5],
    "Restorative": [6, 7],
    "Periodontal": [8],
    "Orthodontic": [9],
    "Instrument cassettes and trays": [10],
    "Ideal Periotomi": [4],
    "Impression Trays": [11],
    "Laboratory instruments": [12],
    "Other ASA Dental instruments": list(range(1, 13)),
}

FAMILY_RULES = [
    ("root_elevator", ("root elevator", "elevator")),
    ("bone_rongeur", ("bone rongeur", "rongeur")),
    ("periotome", ("periotom", "periotome")),
    ("impression_tray", ("impression tray",)),
    ("instrument_tray", ("instrument tray", "sterilizing tray")),
    ("instrument_cassette", ("cassette",)),
    ("needle_holder", ("needle holder",)),
    ("scissors", ("scissor",)),
    ("plier", ("plier",)),
    ("probe", ("probe",)),
    ("curette", ("curette",)),
    ("scaler", ("scaler",)),
    ("chisel", ("chisel",)),
    ("osteotome", ("osteotome",)),
    ("spatula", ("spatula",)),
    ("mirror", ("mirror",)),
    ("clamp", ("clamp",)),
    ("forceps_other", ("forcep",)),
    ("retractor", ("retractor",)),
    ("excavator", ("excavator",)),
    ("burnisher", ("burnisher",)),
    ("carver", ("carver",)),
    ("articulator_component", ("articulator", "mounting plate", "incisal table")),
    ("disposable_supply", ("mask", "pouch", "roll", "dappen")),
]

MATERIALS = [
    ("stainless_steel", ("stainless steel",)),
    ("anodized_aluminum", ("anodized aluminum", "anodized aluminium")),
    ("aluminum", ("aluminum", "aluminium")),
    ("titanium", ("titanium",)),
    ("silicone", ("silicone", "silicon handle")),
    ("rubber", ("rubber",)),
    ("plastic", ("plastic",)),
    ("ptfe", ("ptfe", "teflon")),
    ("carbon", ("carbon",)),
    ("tungsten_carbide", ("tungsten carbide", " tc ")),
]

FINISHES = [
    ("satin", ("satin finish", "satin")),
    ("mirror_polished", ("mirror polished", "mirror finish")),
    ("non_reflective", ("non-reflective", "non reflective")),
]

COLORS = ("white", "light blue", "blue", "pink", "green", "red", "gold", "silver", "black", "yellow")
FORM_TERMS = {
    "straight": ("straight",),
    "curved": ("curved",),
    "angled": ("angular", "angled"),
    "left": (" left", "(left"),
    "right": (" right", "(right"),
    "perforated": ("perforated",),
    "non_perforated": ("non-perforated", "non perforated"),
    "serrated": ("serrated", "saw edge"),
    "blunt": ("blunt",),
    "sharp": ("sharp",),
    "locking": ("locking", "self-locking", "s.locking"),
    "single_ended": ("single ended", "single-ended"),
    "double_ended": ("double ended", "double-ended"),
    "double_action": ("double action",),
}

STOPWORDS = {
    "the", "and", "for", "with", "without", "of", "a", "an", "in", "to",
    "cm", "mm", "asa", "dental", "instrument", "instruments", "set", "single",
}


@dataclass(frozen=True)
class Occurrence:
    chapter: int
    pdf_page: int
    x: float
    y: float
    bbox: tuple[float, float, float, float]
    block_text: str
    page_text: str
    spans: tuple[dict[str, Any], ...]


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def normalize_code(value: str) -> str:
    value = value.upper().replace("–", "-").replace("—", "-").replace("½", "1/2")
    value = re.sub(r"\s+", "", value)
    return value.rstrip(".")


def normalize_text(value: str) -> str:
    value = value.lower().replace("–", "-").replace("—", "-").replace("×", "x")
    return re.sub(r"\s+", " ", value).strip()


def number(value: str) -> float:
    return float(value.replace(",", "."))


def compact_number(value: float) -> int | float:
    return int(value) if value.is_integer() else round(value, 3)


def chapter_paths() -> dict[int, Path]:
    paths = {}
    for chapter in CHAPTER_NAMES:
        matches = list(DATA.glob(f"Asa_Dental_2025_Catalog_-_Chapter_{chapter}_-*.pdf"))
        if len(matches) != 1:
            raise ValueError(f"Expected one non-price chapter PDF for chapter {chapter}, found {matches}")
        paths[chapter] = matches[0]
    return paths


def page_spans(page: fitz.Page) -> tuple[dict[str, Any], ...]:
    return tuple(
        span
        for block in page.get_text("dict")["blocks"]
        for line in block.get("lines", [])
        for span in line.get("spans", [])
        if span["text"].strip()
    )


def build_occurrence_index(paths: dict[int, Path], codes: set[str]) -> dict[str, list[Occurrence]]:
    index: dict[str, list[Occurrence]] = defaultdict(list)
    for chapter, path in paths.items():
        document = fitz.open(path)
        for page_index, page in enumerate(document):
            text = page.get_text()
            spans = page_spans(page)
            blocks = page.get_text("blocks")
            for word in page.get_text("words"):
                normalized = normalize_code(word[4])
                if normalized not in codes:
                    continue
                x = (word[0] + word[2]) / 2
                y = (word[1] + word[3]) / 2
                block_text = next(
                    (block[4] for block in blocks if block[0] - 1 <= x <= block[2] + 1 and block[1] - 1 <= y <= block[3] + 1),
                    word[4],
                )
                index[normalized].append(Occurrence(
                    chapter=chapter,
                    pdf_page=page_index + 1,
                    x=x,
                    y=y,
                    bbox=tuple(round(value, 3) for value in word[:4]),
                    block_text=block_text,
                    page_text=text,
                    spans=spans,
                ))
    return index


def meaningful_tokens(value: str) -> set[str]:
    return {
        token for token in re.findall(r"[a-z0-9]+", normalize_text(value))
        if len(token) > 1 and token not in STOPWORDS and not token.isdigit()
    }


def local_text(occurrence: Occurrence) -> str:
    pieces = []
    for span in occurrence.spans:
        sx = (span["bbox"][0] + span["bbox"][2]) / 2
        sy = (span["bbox"][1] + span["bbox"][3]) / 2
        if abs(sx - occurrence.x) <= 105 and occurrence.y - 120 <= sy <= occurrence.y + 35:
            pieces.append(span["text"].strip())
    return " ".join(pieces)


def source_heading(occurrence: Occurrence) -> str | None:
    page_width = max(span["bbox"][2] for span in occurrence.spans)
    occurrence_half = 0 if occurrence.x < page_width / 2 else 1
    candidates = []
    for span in occurrence.spans:
        text = span["text"].strip()
        sx = (span["bbox"][0] + span["bbox"][2]) / 2
        sy = (span["bbox"][1] + span["bbox"][3]) / 2
        same_half = (0 if sx < page_width / 2 else 1) == occurrence_half
        letters = re.sub(r"[^A-Za-z]", "", text)
        if not same_half or sy > occurrence.y or len(letters) < 5:
            continue
        if text.upper() != text or re.fullmatch(r"[A-Z]?\d[\w./-]*", text):
            continue
        candidates.append((sy, sx, text))
    if not candidates:
        return None
    return max(candidates, key=lambda item: (item[0], -abs(item[1] - occurrence.x)))[2]


def section_context(occurrence: Occurrence, heading: str | None) -> str:
    if not heading:
        return ""
    page_width = max(span["bbox"][2] for span in occurrence.spans)
    occurrence_half = 0 if occurrence.x < page_width / 2 else 1
    headings = [
        span for span in occurrence.spans
        if span["text"].strip() == heading
        and (0 if ((span["bbox"][0] + span["bbox"][2]) / 2) < page_width / 2 else 1) == occurrence_half
        and ((span["bbox"][1] + span["bbox"][3]) / 2) <= occurrence.y
    ]
    if not headings:
        return heading
    heading_y = max((span["bbox"][1] + span["bbox"][3]) / 2 for span in headings)
    return " ".join(
        span["text"].strip()
        for span in occurrence.spans
        if (0 if ((span["bbox"][0] + span["bbox"][2]) / 2) < page_width / 2 else 1) == occurrence_half
        and abs(((span["bbox"][0] + span["bbox"][2]) / 2) - occurrence.x) <= 260
        and heading_y - 3 <= ((span["bbox"][1] + span["bbox"][3]) / 2) <= heading_y + 30
    )


def callout_text(occurrence: Occurrence) -> str:
    pieces = []
    for span in occurrence.spans:
        sx = (span["bbox"][0] + span["bbox"][2]) / 2
        sy = (span["bbox"][1] + span["bbox"][3]) / 2
        if abs(sx - occurrence.x) <= 190 and occurrence.y - 20 <= sy <= occurrence.y + 210:
            pieces.append(span["text"].strip())
    return " ".join(pieces)


def choose_occurrence(item: dict[str, str], occurrences: list[Occurrence]) -> Occurrence | None:
    if not occurrences:
        return None
    expected = set(CATEGORY_CHAPTERS[item["category"]])
    expected_occurrences = [item for item in occurrences if item.chapter in expected]
    pool = expected_occurrences or occurrences
    name_tokens = meaningful_tokens(item["name"])

    family = family_for(item["name"])

    def score(occurrence: Occurrence) -> tuple[int, int, int, float]:
        page_overlap = len(name_tokens & meaningful_tokens(occurrence.page_text))
        local_overlap = len(name_tokens & meaningful_tokens(local_text(occurrence) + " " + occurrence.block_text))
        heading = normalize_text(source_heading(occurrence) or "")
        measurement = int(aligned_measurement(occurrence, "cm") is not None or aligned_measurement(occurrence, "mm") is not None)
        family_heading = int(any(token in heading for token in family.split("_")))
        kit_penalty = -8 if "kit" in heading and not re.search(r"\b(?:kit|set)\b", item["name"], re.IGNORECASE) else 0
        total = local_overlap * 5 + page_overlap + measurement * 7 + family_heading * 3 + kit_penalty
        return total, measurement, local_overlap, occurrence.y

    return max(pool, key=score)


def aligned_measurement(occurrence: Occurrence, unit: str) -> float | None:
    pattern = re.compile(rf"^[^0-9]{{0,4}}(\d+(?:[.,]\d+)?)\s*{unit}$", re.IGNORECASE)
    candidates = []
    for span in occurrence.spans:
        match = pattern.fullmatch(span["text"].strip())
        if not match:
            continue
        sx = (span["bbox"][0] + span["bbox"][2]) / 2
        sy = (span["bbox"][1] + span["bbox"][3]) / 2
        if abs(sx - occurrence.x) <= 8 and sy < occurrence.y:
            candidates.append((occurrence.y - sy, number(match.group(1))))
    return min(candidates)[1] if candidates else None


def explicit_length_mm(text: str) -> float | None:
    patterns = (
        r"\bcm\.?\s*(\d+(?:[.,]\d+)?)",
        r"\b(\d+(?:[.,]\d+)?)\s*cm\b",
    )
    matches = [number(match.group(1)) for pattern in patterns for match in re.finditer(pattern, text, re.IGNORECASE)]
    return compact_number(matches[0] * 10) if matches else None


def explicit_dimensions_mm(text: str) -> list[float] | None:
    normalized = normalize_text(text)
    for pattern in (
        r"\(?\s*(\d+(?:[.,]\d+)?)\s*x\s*(\d+(?:[.,]\d+)?)\s*x\s*(\d+(?:[.,]\d+)?)\s*mm\s*\)?",
        r"\(?\s*(\d+(?:[.,]\d+)?)\s*x\s*(\d+(?:[.,]\d+)?)\s*mm\s*\)?",
    ):
        match = re.search(pattern, normalized)
        if match:
            return [compact_number(number(value)) for value in match.groups()]
    return None


def page_confirms_dimensions(page_text: str, dimensions: list[float] | None) -> bool:
    if not dimensions:
        return False
    normalized = normalize_text(page_text).replace(" ", "")
    forms = []
    for value in dimensions:
        numeric = str(value).replace(".", "[.,]")
        forms.append(numeric)
    return re.search("x".join(forms) + r"mm", normalized) is not None


def explicit_diameter_mm(text: str) -> float | None:
    match = re.search(r"\b(?:diam(?:eter)?\.?|dia\.?|d\.)\s*(?:mm\.?)?\s*(\d+(?:[.,]\d+)?)", text, re.IGNORECASE)
    return compact_number(number(match.group(1))) if match else None


def explicit_quantity(text: str) -> int | None:
    patterns = (
        r"\bbox(?:\s+of)?\s+(\d+)\b",
        r"\bset(?:\s+of)?\s+(\d+)\b",
        r"\b(\d+)\s*(?:pcs|pieces|instruments|rolls)\b",
    )
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return int(match.group(1))
    return None


def family_for(name: str) -> str:
    lower = normalize_text(name)
    for family, phrases in FAMILY_RULES:
        if any(phrase in lower for phrase in phrases):
            return family
    return "catalogue_item"


def values_from_rules(text: str, rules: list[tuple[str, tuple[str, ...]]]) -> list[str]:
    lower = f" {normalize_text(text)} "
    return [value for value, phrases in rules if any(phrase in lower for phrase in phrases)]


def fact_record(
    item: dict[str, str],
    occurrence: Occurrence | None,
    occurrences: list[Occurrence],
    paths: dict[int, Path],
) -> dict[str, Any]:
    name = item["name"]
    family = family_for(name)
    heading = source_heading(occurrence) if occurrence else None
    section = section_context(occurrence, heading) if occurrence else ""
    local = local_text(occurrence) if occurrence else ""
    code_specific = " ".join(
        candidate.block_text + (
            " " + callout_text(candidate)
            if candidate.y < 250 and len(callout_text(candidate)) >= 80
            else ""
        )
        for candidate in occurrences
        if occurrence and candidate.chapter == occurrence.chapter and candidate.pdf_page == occurrence.pdf_page
    )
    # Technical facts must be visible in the matched PDF cell, heading or a
    # code-specific callout. The workbook-derived catalogue title remains a
    # display identifier and is not treated as technical authority here.
    evidence = " ".join(value for value in (local, section, code_specific) if value)
    lower = f" {normalize_text(evidence)} "

    overall_length = explicit_length_mm(evidence) if occurrence else None
    if occurrence:
        aligned_cm = aligned_measurement(occurrence, "cm")
        if aligned_cm is not None:
            overall_length = compact_number(aligned_cm * 10)

    tip_width = None
    if occurrence and family in {"root_elevator", "periotome", "osteotome"}:
        aligned_mm = aligned_measurement(occurrence, "mm")
        tip_width = compact_number(aligned_mm) if aligned_mm is not None else None

    diameter = explicit_diameter_mm(evidence) if occurrence else None
    if occurrence and diameter is None:
        named_diameter = explicit_diameter_mm(name)
        aligned_mm = aligned_measurement(occurrence, "mm")
        if named_diameter is not None and aligned_mm is not None and abs(named_diameter - aligned_mm) <= 0.1:
            diameter = compact_number(named_diameter)

    angles = {int(value) for value in re.findall(r"\b(\d{1,3})\s*°", evidence)}
    if occurrence:
        angles.update(
            int(value) for value in re.findall(r"\b(\d{1,3})\s*°", name)
            if re.search(rf"\b{re.escape(value)}\s*°", occurrence.page_text)
        )
    angles = sorted(angles)
    materials = values_from_rules(evidence, MATERIALS)
    finishes = values_from_rules(evidence, FINISHES)
    forms = [value for value, phrases in FORM_TERMS.items() if any(phrase in lower for phrase in phrases)]
    if "non_perforated" in forms and "perforated" in forms:
        forms.remove("perforated")

    arches = []
    if re.search(r"\bupper\b", lower):
        arches.append("upper")
    if re.search(r"\blower\b", lower):
        arches.append("lower")
    if occurrence:
        for value in ("upper", "lower"):
            if re.search(rf"\b{value}\b", name, re.IGNORECASE) and re.search(rf"\b{value}\b", occurrence.page_text, re.IGNORECASE):
                arches.append(value)
        arches = sorted(set(arches))
    sides = []
    if re.search(r"\bleft\b", lower):
        sides.append("left")
    if re.search(r"\bright\b", lower):
        sides.append("right")
    if occurrence:
        for value in ("left", "right"):
            if re.search(rf"\b{value}\b", name, re.IGNORECASE) and re.search(rf"\b{value}\b", occurrence.page_text, re.IGNORECASE):
                sides.append(value)
        sides = sorted(set(sides))
    tooth_groups = []
    group_patterns = (
        ("incisors", r"\bincisor"),
        ("canines", r"\bcanine"),
        ("premolars", r"\bpremolar"),
        ("molars", r"\bmolar"),
        ("wisdom_teeth", r"\bwisdom teeth\b|\bthird molar"),
        ("roots", r"\broot(?:s| fragment| tip)?\b"),
    )
    for value, pattern in group_patterns:
        if re.search(pattern, lower):
            tooth_groups.append(value)
        elif occurrence and re.search(pattern, name, re.IGNORECASE) and re.search(pattern, occurrence.page_text, re.IGNORECASE):
            tooth_groups.append(value)
    if "wisdom_teeth" in tooth_groups and "molars" in tooth_groups:
        without_third_molar = re.sub(r"\bthird molars?\b", "", lower)
        if not re.search(r"\bmolars?\b", without_third_molar):
            tooth_groups.remove("molars")

    patient_groups = []
    if re.search(r"\bchildren\b|\bpaediatric\b|\bpediatric\b|\bdeciduous\b", lower):
        patient_groups.append("children")
    elif occurrence and re.search(r"\bchildren\b|\bpaediatric\b|\bpediatric\b|\bdeciduous\b", name, re.IGNORECASE) and re.search(r"\bchildren\b|\bpaediatric\b|\bpediatric\b|\bdeciduous\b", occurrence.page_text, re.IGNORECASE):
        patient_groups.append("children")

    documented_uses = []
    use_rules = (
        ("root_elevation", ("root elevator",)),
        ("tooth_extraction", ("extracting", "extraction")),
        ("impression_taking", ("impression tray",)),
        ("periodontal_pocket_measurement", ("periodontal pocket probe", "perio pocket probe")),
        ("bone_cutting", ("bone chisel", "bone rongeur")),
        ("implant_osteotomy", ("implant osteotome",)),
        ("suture_handling", ("needle holder",)),
        ("impacted_wisdom_tooth_elevation", ("impacted wisdom teeth",)),
    )
    for value, phrases in use_rules:
        if any(phrase in lower for phrase in phrases):
            documented_uses.append(value)

    single_use = True if item["category"] == "AsaOne disposables" or "single use" in lower or "disposable" in lower else None
    sterilizable = True if re.search(r"\bsterili[sz]able\b|\bautoclavable\b", lower) else None
    max_temperature = None
    temperature_match = re.search(r"(\d{2,3})\s*°\s*c", lower)
    if temperature_match and (sterilizable or "autoclav" in lower):
        max_temperature = int(temperature_match.group(1))

    size_designations = set(re.findall(r"(?:^|[, (])((?:XXS|XS|S|M|L|XL|XXL))(?:$|[, )])", evidence.upper()))
    if occurrence:
        size_designations.update(
            value for value in re.findall(r"(?:^|[, (])((?:XXS|XS|S|M|L|XL|XXL))(?:$|[, )])", name.upper())
            if re.search(rf"\b{value}\b", occurrence.page_text)
        )
    size_designations = sorted(size_designations)
    colors = [
        color.replace(" ", "_") for color in COLORS
        if re.search(rf"\b{re.escape(color)}\b", lower)
        or (occurrence and re.search(rf"\b{re.escape(color)}\b", name, re.IGNORECASE) and re.search(rf"\b{re.escape(color)}\b", occurrence.page_text, re.IGNORECASE))
    ]
    named_dimensions = explicit_dimensions_mm(name) if occurrence else None
    dimensions = named_dimensions if occurrence and page_confirms_dimensions(occurrence.page_text, named_dimensions) else explicit_dimensions_mm(evidence)
    named_quantity = explicit_quantity(name) if occurrence else None
    quantity = named_quantity if occurrence and named_quantity is not None and re.search(rf"\b{named_quantity}\b", occurrence.page_text) else explicit_quantity(evidence)
    priority = "1b" if item["category"] in {"Extractive Surgery", "Ideal Periotomi"} else "2"

    unknown = []
    for path, value in (
        ("dimensions.overallLengthMm", overall_length),
        ("dimensions.workingLengthMm", None),
        ("dimensions.tipWidthMm", tip_width),
        ("material", materials),
        ("finish", finishes),
        ("reprocessing.singleUse", single_use),
        ("reprocessing.sterilizable", sterilizable),
        ("reprocessing.maxTemperatureC", max_temperature),
        ("clinical.arches", arches),
        ("clinical.toothGroups", tooth_groups),
        ("clinical.sides", sides),
        ("clinical.patientGroups", patient_groups),
    ):
        if value is None or value == []:
            unknown.append(path)

    source = None
    if occurrence:
        source = {
            "id": f"asadental-2025-ch{occurrence.chapter}",
            "authority": "primary",
            "type": "catalogue_pdf",
            "path": str(paths[occurrence.chapter].relative_to(ROOT)).replace("\\", "/"),
            "pdfPage": occurrence.pdf_page,
            "codeBBox": list(occurrence.bbox),
            "matchedHeading": heading,
        }

    return {
        "schemaVersion": "1.0.0",
        "sku": item["code"],
        "manufacturer": "AsaDental",
        "catalogueName": name,
        "category": item["category"],
        "priority": priority,
        "taxonomy": {
            "chapter": occurrence.chapter if occurrence else None,
            "chapterName": CHAPTER_NAMES[occurrence.chapter] if occurrence else None,
            "family": family,
            "catalogueHeading": heading,
        },
        "dimensions": {
            "overallLengthMm": overall_length,
            "workingLengthMm": None,
            "tipWidthMm": tip_width,
            "diameterMm": diameter,
            "sizeMm": dimensions,
            "anglesDegrees": angles,
        },
        "design": {
            "forms": sorted(set(forms)),
            "sizeDesignations": size_designations,
            "colors": colors,
        },
        "clinical": {
            "arches": arches,
            "toothGroups": tooth_groups,
            "sides": sides,
            "patientGroups": patient_groups,
            "documentedUses": documented_uses,
        },
        "material": materials,
        "finish": finishes,
        "packaging": {"quantity": quantity},
        "reprocessing": {
            "singleUse": single_use,
            "sterilizable": sterilizable,
            "maxTemperatureC": max_temperature,
        },
        "relationships": {"relatedVariants": [], "procedureCompanions": []},
        "unknownFields": unknown,
        "provenance": {
            "sources": [source] if source else [],
            "catalogueIndex": "app/_data/asaCatalog.json (product code and label only; no commercial fields)",
            "factPolicy": "Only explicit product-label, matched heading, geometric measurement or code-specific callout facts are normalized.",
            "reviewStatus": "catalogue_matched" if source else "source_page_not_matched_no_technical_facts_published",
        },
    }


def main() -> None:
    catalog = load_json(CATALOG_PATH)
    approved_forceps = {normalize_code(record["sku"]) for record in load_json(FORCEPS_PATH)["records"]}
    normalized_catalog = defaultdict(list)
    for item in catalog:
        normalized_catalog[normalize_code(item["code"])].append(item)
    collisions = {key: items for key, items in normalized_catalog.items() if len(items) > 1}
    if collisions:
        raise ValueError(f"Normalized catalog code collisions: {sorted(collisions)}")

    remaining = [item for item in catalog if normalize_code(item["code"]) not in approved_forceps]
    paths = chapter_paths()
    occurrence_index = build_occurrence_index(paths, set(normalized_catalog))
    records = []
    for item in remaining:
        occurrences = occurrence_index.get(normalize_code(item["code"]), [])
        occurrence = choose_occurrence(item, occurrences)
        records.append(fact_record(item, occurrence, occurrences, paths))

    serialized = json.dumps(records, ensure_ascii=False)
    if re.search(r'"(?:price|currency|unitPrice|listPrice)"\s*:', serialized, re.IGNORECASE):
        raise ValueError("Commercial field detected in enrichment output")

    matched = [record for record in records if record["provenance"]["sources"]]
    priority_counts = Counter(record["priority"] for record in records)
    field_coverage = {
        "sourcePageMatched": len(matched),
        "sourcePageUnmatched": len(records) - len(matched),
        "overallLengthMm": sum(record["dimensions"]["overallLengthMm"] is not None for record in records),
        "tipWidthMm": sum(record["dimensions"]["tipWidthMm"] is not None for record in records),
        "diameterMm": sum(record["dimensions"]["diameterMm"] is not None for record in records),
        "sizeMm": sum(record["dimensions"]["sizeMm"] is not None for record in records),
        "material": sum(bool(record["material"]) for record in records),
        "finish": sum(bool(record["finish"]) for record in records),
        "forms": sum(bool(record["design"]["forms"]) for record in records),
        "anatomicalApplication": sum(
            any(record["clinical"][key] for key in ("arches", "toothGroups", "sides", "patientGroups", "documentedUses"))
            for record in records
        ),
        "singleUse": sum(record["reprocessing"]["singleUse"] is not None for record in records),
        "sterilizable": sum(record["reprocessing"]["sterilizable"] is not None for record in records),
    }
    output = {
        "generatedFrom": [str(path.relative_to(ROOT)).replace("\\", "/") for path in paths.values()],
        "excludedSources": ["all price PDFs", "all price workbooks", "asadental.com product prose"],
        "recordCount": len(records),
        "priorityCounts": dict(sorted(priority_counts.items())),
        "fieldCoverage": field_coverage,
        "records": records,
    }
    write_json(OUTPUT_PATH, output)
    print(json.dumps({"output": str(OUTPUT_PATH), **{key: output[key] for key in ("recordCount", "priorityCounts", "fieldCoverage")}}, indent=2))


if __name__ == "__main__":
    main()
