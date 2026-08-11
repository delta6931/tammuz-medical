/**
 * Tests for Gracey curette indications.
 *
 *   node --test --experimental-strip-types tests/gracey.test.mts
 *
 * The area-specific Gracey series is a published clinical standard, so the
 * expectations below are fixed facts rather than implementation details.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  parseGraceyNumber, indicationFor, regionForPosition, matches, ALL_SURFACES,
} from "../app/tools/_lib/gracey.ts";

test("standard Gracey numbers map to their taught indications", () => {
  const expected: [string, string[], string[]][] = [
    ["1/2", ["anterior"], ALL_SURFACES],
    ["3/4", ["anterior"], ALL_SURFACES],
    ["5/6", ["anterior", "premolar"], ALL_SURFACES],
    ["7/8", ["premolar", "molar"], ["facial", "lingual"]],
    ["9/10", ["premolar", "molar"], ["facial", "lingual"]],
    ["11/12", ["premolar", "molar"], ["mesial"]],
    ["13/14", ["premolar", "molar"], ["distal"]],
    ["15/16", ["premolar", "molar"], ["mesial"]],
    ["17/18", ["premolar", "molar"], ["distal"]],
  ];

  for (const [label, regions, surfaces] of expected) {
    const ends = parseGraceyNumber(label);
    assert.ok(ends, `${label} should parse`);
    const indication = indicationFor(ends)!;
    assert.deepEqual(indication.regions, regions, `${label} regions`);
    assert.deepEqual(indication.surfaces, surfaces, `${label} surfaces`);
  }
});

test("combination instruments cover the union of both working ends", () => {
  // 11 is a mesial end, 14 is a distal end, so 11/14 reaches both.
  assert.deepEqual(indicationFor(parseGraceyNumber("11/14")!)!.surfaces, ["mesial", "distal"]);
  assert.deepEqual(indicationFor(parseGraceyNumber("12/13")!)!.surfaces, ["mesial", "distal"]);
  // 10 is a facial/lingual end paired with a mesial end.
  assert.deepEqual(indicationFor(parseGraceyNumber("10/12")!)!.surfaces, ["facial", "lingual", "mesial"]);
});

test("mirrored pairs do not gain surfaces they cannot reach", () => {
  // 11/12 is two mirrored mesial ends — it must not claim distal access.
  const eleven = indicationFor(parseGraceyNumber("11/12")!)!;
  assert.ok(!eleven.surfaces.includes("distal"));
  const thirteen = indicationFor(parseGraceyNumber("13/14")!)!;
  assert.ok(!thirteen.surfaces.includes("mesial"));
  // Anterior instruments must not reach molars.
  assert.ok(!indicationFor(parseGraceyNumber("1/2")!)!.regions.includes("molar"));
  // Posterior instruments must not claim anteriors.
  assert.ok(!indicationFor(parseGraceyNumber("7/8")!)!.regions.includes("anterior"));
});

test("FDI position maps to the right region", () => {
  assert.equal(regionForPosition(1), "anterior");
  assert.equal(regionForPosition(3), "anterior");
  assert.equal(regionForPosition(4), "premolar");
  assert.equal(regionForPosition(5), "premolar");
  assert.equal(regionForPosition(6), "molar");
  assert.equal(regionForPosition(8), "molar");
});

test("matching selects the expected instrument for a surface", () => {
  const mesialPosterior = indicationFor(parseGraceyNumber("11/12")!)!;
  assert.equal(matches(mesialPosterior, "molar", "mesial"), true);
  assert.equal(matches(mesialPosterior, "molar", "distal"), false);
  assert.equal(matches(mesialPosterior, "anterior", "mesial"), false);

  const anterior = indicationFor(parseGraceyNumber("1/2")!)!;
  assert.equal(matches(anterior, "anterior", "distal"), true);
  assert.equal(matches(anterior, "premolar", "facial"), false);
});

test("unknown figures are rejected rather than guessed", () => {
  assert.equal(parseGraceyNumber("19/20"), null);
  assert.equal(parseGraceyNumber("1-2"), null);
  assert.equal(parseGraceyNumber("SM11/12"), null);
  assert.equal(parseGraceyNumber(""), null);
});
