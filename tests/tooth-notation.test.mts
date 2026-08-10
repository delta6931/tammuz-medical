/**
 * Reference-value tests for the tooth numbering converter.
 *
 *   node --test --experimental-strip-types tests/tooth-notation.test.mts
 *
 * These are published standards (FDI/ISO 3950, Universal, Palmer), so the
 * expected values below are fixed facts, not implementation details. If a
 * conversion changes, the conversion is wrong.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { toothFromFdi, parseTooth, allTeeth } from "../app/tools/_lib/tooth-notation.ts";

/** [FDI, Universal, Palmer] — quadrant boundaries and both dentitions. */
const REFERENCE: [number, string, string][] = [
  [18, "1", "8┘"], [16, "3", "6┘"], [11, "8", "1┘"],
  [21, "9", "└1"], [26, "14", "└6"], [28, "16", "└8"],
  [38, "17", "┌8"], [31, "24", "┌1"],
  [41, "25", "1┐"], [48, "32", "8┐"],
  [55, "A", "E┘"], [51, "E", "A┘"],
  [61, "F", "└A"], [65, "J", "└E"],
  [75, "K", "┌E"], [71, "O", "┌A"],
  [81, "P", "A┐"], [85, "T", "E┐"],
];

test("known reference conversions", () => {
  for (const [fdi, universal, palmer] of REFERENCE) {
    const tooth = toothFromFdi(fdi);
    assert.ok(tooth, `FDI ${fdi} should resolve`);
    assert.equal(tooth.universal, universal, `FDI ${fdi} universal`);
    assert.equal(tooth.palmer, palmer, `FDI ${fdi} palmer`);
  }
});

test("universal numbering is complete and unique", () => {
  const permanent = allTeeth("permanent").map(fdi => toothFromFdi(fdi)!.universal);
  assert.equal(permanent.length, 32);
  assert.equal(new Set(permanent).size, 32);
  assert.deepEqual(
    permanent.map(Number).sort((a, b) => a - b),
    Array.from({ length: 32 }, (_, i) => i + 1),
  );

  const primary = allTeeth("primary").map(fdi => toothFromFdi(fdi)!.universal).sort();
  assert.equal(primary.join(""), "ABCDEFGHIJKLMNOPQRST");
});

test("every tooth round-trips through every notation", () => {
  for (const fdi of [...allTeeth("permanent"), ...allTeeth("primary")]) {
    const tooth = toothFromFdi(fdi)!;
    for (const [system, value] of [
      ["fdi", String(fdi)],
      ["universal", tooth.universal],
      ["palmer", tooth.palmer],
    ] as const) {
      assert.equal(parseTooth(value, system)?.fdi, fdi, `${fdi} via ${system} "${value}"`);
    }
  }
});

test("quadrant prefixes are accepted for palmer", () => {
  assert.equal(parseTooth("UR6", "palmer")?.fdi, 16);
  assert.equal(parseTooth("LL3", "palmer")?.fdi, 33);
  assert.equal(parseTooth("UL8", "palmer")?.fdi, 28);
  assert.equal(parseTooth("LR1", "palmer")?.fdi, 41);
});

test("invalid input returns null rather than a wrong tooth", () => {
  assert.equal(parseTooth("19", "fdi"), null);   // no 9th tooth in a quadrant
  assert.equal(parseTooth("56", "fdi"), null);   // primary quadrants stop at 5
  assert.equal(parseTooth("33", "universal"), null);
  assert.equal(parseTooth("0", "universal"), null);
  assert.equal(parseTooth("U", "universal"), null);
  assert.equal(parseTooth("9┘", "palmer"), null);
  assert.equal(parseTooth("", "fdi"), null);
});
