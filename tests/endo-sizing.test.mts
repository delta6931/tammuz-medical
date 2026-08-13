import assert from"node:assert/strict";import test from"node:test";import{diameterAt,endoSize,ENDO_SIZES}from"../app/tools/_lib/endo-sizing.ts";
test("maps initial ISO sizes to colours",()=>{assert.equal(endoSize(6)?.colour,"pink");assert.equal(endoSize(8)?.colour,"grey");assert.equal(endoSize(10)?.colour,"purple")});
test("repeats standard six-colour sequence",()=>{assert.equal(endoSize(15)?.colour,"white");assert.equal(endoSize(40)?.colour,"black");assert.equal(endoSize(45)?.colour,"white");assert.equal(endoSize(80)?.colour,"black")});
test("derives tip diameter from size",()=>assert.equal(endoSize(25)?.tipDiameterMm,.25));
test("calculates constant taper geometry",()=>assert.equal(diameterAt(25,.04,10),.65));
test("rejects nonstandard size and distance beyond working part",()=>{assert.equal(diameterAt(22,.04,10),null);assert.equal(diameterAt(25,.04,17),null);assert.equal(ENDO_SIZES.length,21)});
