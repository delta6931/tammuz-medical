"use client";
import { useMemo,useState } from "react";
import type { SiteLocale } from "../_lib/catalog";
import { searchDentalTerms,type TermCategory } from "../tools/_lib/dental-terms";
import { terminologyStrings } from "../tools/_strings/terminology";
import { trackToolUse } from "./Analytics";
const CATEGORIES:TermCategory[]=["anatomy","diagnostic","surgical","restorative","periodontal","endo","procurement"];
export function DentalTerminology({locale="EN"}:{locale?:SiteLocale}){const s=terminologyStrings[locale];const[query,setQuery]=useState("");const[category,setCategory]=useState<TermCategory|"all">("all");const terms=useMemo(()=>searchDentalTerms(query,category),[query,category]);return <div className="terms">
  <div className="terms-controls"><label><span>{s.search}</span><input type="search" value={query} placeholder={s.placeholder} onChange={e=>setQuery(e.target.value)} onBlur={()=>query.trim()&&trackToolUse("dental_terminology","search",locale,{result_count:terms.length,category})}/></label><label><span>{s.all}</span><select value={category} onChange={e=>{const next=e.target.value as TermCategory|"all";setCategory(next);trackToolUse("dental_terminology","filter_category",locale,{category:next})}}><option value="all">{s.all}</option>{CATEGORIES.map(key=><option key={key} value={key}>{s.categories[key]}</option>)}</select></label></div>
  <div className="terms-status" aria-live="polite">{s.count(terms.length)}</div>
  {terms.length?<div className="terms-table"><div className="terms-head"><b>{s.headings.en}</b><b>{s.headings.tr}</b><b>{s.headings.ar}</b></div>{terms.map(term=><article key={term.id}><div><small>{s.categories[term.category]}</small><span lang="en">{term.en}</span></div><span lang="tr">{term.tr}</span><span lang="ar" dir="rtl">{term.ar}</span></article>)}</div>:<p className="terms-empty">{s.empty}</p>}
  <aside className="terms-note">{s.note}</aside>
  </div>}
