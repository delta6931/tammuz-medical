import assert from "node:assert/strict";import test from "node:test";import{decodeIso6360,normalizeIso6360}from"../app/tools/_lib/iso-6360.ts";
test("normalizes separators",()=>assert.equal(normalizeIso6360("806 314-001.524 016"),"806314001524016"));
test("decodes a verified diamond example",()=>{const value=decodeIso6360("806 314 001 524 016");assert.ok(value);assert.equal(value.material.code,"806");assert.equal(value.shank.code,"314");assert.equal(value.shape.code,"001");assert.equal(value.characteristics.code,"524");assert.equal(value.diameter.millimetres,1.6)});
test("keeps unverified meanings unknown",()=>{const value=decodeIso6360("999999999999010");assert.ok(value);assert.equal(value.material.meaning,null);assert.equal(value.shank.meaning,null)});
test("rejects malformed lengths and zero diameter",()=>{assert.equal(decodeIso6360("80631400152401"),null);assert.equal(decodeIso6360("806314001524000"),null)});
test("accepts optional 18 digit group",()=>assert.equal(decodeIso6360("806314001524016123")?.optionalDiamondCode,"123"));
