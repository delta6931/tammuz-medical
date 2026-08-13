import assert from"node:assert/strict";import test from"node:test";import{DENTAL_TERMS,searchDentalTerms}from"../app/tools/_lib/dental-terms.ts";
test("contains a useful trilingual reference set",()=>assert.ok(DENTAL_TERMS.length>=40));
test("searches English Turkish and Arabic",()=>{assert.equal(searchDentalTerms("forceps")[0]?.id,"extraction-forceps");assert.equal(searchDentalTerms("davye")[0]?.id,"extraction-forceps");assert.equal(searchDentalTerms("كلّابة")[0]?.id,"extraction-forceps")});
test("filters categories",()=>assert.ok(searchDentalTerms("","endo").every(term=>term.category==="endo")));
test("returns no result for an absent term",()=>assert.deepEqual(searchDentalTerms("not-a-dental-term"),[]));
