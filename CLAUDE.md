# CLAUDE.md

Developer notes for this repository. Covers build system, architecture decisions, and conventions that are not obvious from the code alone.

## Monorepo

This is an **npm workspaces monorepo**. The root is private and holds shared tooling (ESLint, Prettier, Vitest, Husky, commitlint, devDependencies). Publishable packages live under `packages/`.

**Versioning is lockstep** — all packages share the same version number. When cutting a release, bump both root `package.json` and `packages/core/package.json` to the same version before publishing.

Future packages (`packages/react/`, `packages/vue/`, etc.) follow the same layout as `packages/core/`.

## npm publishing

Each package is published independently from its own directory.

**To cut a release:**
```bash
# Bump version in root and in the package being released
npm version patch    # or minor / major — run from repo root
cd packages/core && npm version patch   # same version

git push && git push --tags
cd packages/core && npm publish   # prepublishOnly runs npm run build first
```

`npm pack --dry-run` (from `packages/core/`) previews what gets published. Only `dist/` is included — source, `types/`, and tests are excluded via the `files` field.

## Build system

- **Minification**: `terser` with `--comments /^!/` — preserves the `/*!` license comment in minified output.
- **Stamping**: `scripts/stamp.js` lives at repo root and accepts a package directory argument (`node ../../scripts/stamp.js .`), so each package reads its own `package.json` for the version — not the root one.
- **Type declarations**: source `.d.ts` files live in `packages/core/types/`; copied to `packages/core/dist/` by `npm run types`.
- **No Grunt** — fully replaced by npm scripts.

## Tests

CLI-based via Vitest + jsdom. Tests dynamically load source via `eval()` — the path resolves relative to each test file, so they work correctly from `packages/core/tests/`.

Tests that depend on real browser layout (`clientWidth`, `getBoundingClientRect`) are not included — jsdom has no layout engine. Verify those manually via the `examples/` folder.

## CI (GitHub Actions)

Three parallel jobs: **lint**, **test**, **build** — all run from repo root and cover all packages automatically. Skipped when only non-code files change.

Dependabot opens weekly grouped PRs for npm dependency updates.

## Architecture

Two independent parallel implementations in `packages/core/`, both with identical APIs:

- `loadgo.js` — jQuery 4 plugin (`$('#logo').loadgo(...)`)
- `loadgo-vanilla.js` — Vanilla JS (`Loadgo.init(el, options)`)

**How it works**: `init` wraps the `<img>` in a `div.loadgo-container` and injects a `div.loadgo-overlay`. Progress shrinks/grows the overlay (width for `lr`/`rl`, height for `bt`/`tb`). Resize events recalculate dimensions.

**State storage**: jQuery version uses `.data()` per element; vanilla version uses a module-level `[{ id, properties }]` array keyed by element ID.

## Code style

- ES6+: `const`/`let`, arrow functions, template literals, `.includes()`, `.find()`, `.findIndex()`
- ESLint 9 flat config at repo root with per-directory settings
- Prettier: single quotes, no semicolons, 2-space indent, trailing commas, 100-char print width
- `"type": "module"` in root `package.json` — all config files and scripts use ESM

## jQuery 4 compatibility notes

- `$.inArray()` removed — use `Array.prototype.includes()`
- `$.removeData(el, key)` static form removed — use `$el.removeData(key)`
- `.load()` event shorthand removed — use `.on('load', handler)`
- `$(window).load()` removed — use `$(document).ready()`
