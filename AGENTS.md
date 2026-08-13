# Tammuz Medical repository rules

## Business and site

Tammuz Global Medical is a B2B distributor of European dental instruments, primarily AsaDental, for clinics, distributors and procurement teams in Turkey and Iraq. The site is quote-only: never publish prices.

- Locales: English at `/`, Turkish at `/tr`, Arabic at `/ar` with RTL.
- Design tokens: navy `#0e2737`, teal `#287873`, cream `#f7f5ef`, paper `#fffefa`, mint `#e4ebe6`, line `#d7ddd7`, muted `#65767b`.
- Fonts: Manrope Variable; Noto Sans Arabic Variable for RTL.
- Static build: `npm run export:pages` writes `dist/pages`.

## Medical-device data rules

1. Never invent or infer a specification. Unknown fields are omitted.
2. The local 2025 catalogue PDFs under `data/asadental/` are primary. `asadental.com` is verification and gap-fill only.
3. For forceps length, publish the official precise value only when it is within ±2.5 mm of the catalogue nominal. Otherwise leave it unknown.
4. Never publish prices or commercial workbook fields.
5. Never copy AsaDental descriptive prose. Extract facts and write original copy.
6. Native EN/TR/AR copy is required; do not machine-translate Arabic. Arabic tooth adjectives must agree with noun gender.
7. Research-only set extraction in `data/asadental/derived/asadental-sets.json` must not be wired into the site. Exact set contents require an explicit official composition list.

## Tool architecture

Each standalone tool uses:

- `app/tools/<name>/{page.tsx,shared.tsx,<name>.css}` for English, metadata, hreflang and scoped styles;
- thin wrappers at `app/tr/tools/<name>/page.tsx` and `app/ar/tools/<name>/page.tsx`;
- native copy in `app/tools/_strings/<name>.ts`;
- pure logic in `app/tools/_lib/<name>.ts`;
- a client component in `app/_components/`;
- a registered path in `toolPaths` in `scripts/site-routes.mjs`.

Tools render through `ToolShell`, never `SitePage`. Anatomical arch charts remain `direction:ltr` under RTL because patient right stays on viewer left.

## Production deployment - critical

`origin/main` contains built static output, not source. A normal source push to `main` would take down the site. Source belongs on `codex/site-growth-upgrade`.

Build a deploy commit from `dist/pages` with an alternate index:

```powershell
npm run export:pages
Remove-Item .deploy-index -ErrorAction SilentlyContinue
$env:GIT_INDEX_FILE="$PWD/.deploy-index"
git --work-tree="$PWD/dist/pages" add -A
$tree = git write-tree
$commit = $tree | git commit-tree -p origin/main -m "Deploy ..."
```

Before every push, inspect the deploy tree and assert all of the following:

- source paths `app`, `scripts`, `package.json`, `data`, `tsconfig.json` are absent;
- built markers `index.html`, `404.html`, `assets`, `_headers`, `tools` are present;
- `git diff --name-status origin/main $commit` contains zero deleted paths.

Only then push the commit SHA to `refs/heads/main`. Poll the live URL after deployment. Cloudflare can silently drop a build; if the new output is not live within about three minutes, create and push a new commit with the identical tree to retrigger it.

## Required checks

```powershell
.\node_modules\.bin\tsc.cmd --noEmit
npm run export:pages
node --test tests/rendered-html.test.mjs
node --test --experimental-strip-types tests/tooth-notation.test.mts tests/gracey.test.mts tests/iso-6360.test.mts tests/endo-sizing.test.mts tests/dental-terms.test.mts
```
