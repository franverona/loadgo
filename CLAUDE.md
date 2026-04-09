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

**State storage**: jQuery version uses `.data()` per element; vanilla version uses a module-level `[{ id, properties, firedThresholds }]` array keyed by element ID. `firedThresholds` is stored as a sibling of `properties` (not inside it) because `Loadgo.options()` replaces `properties` entirely — storing it inside would wipe the fired state on every options update.

## Code style

- ES6+: `const`/`let`, arrow functions, template literals, `.includes()`, `.find()`, `.findIndex()`
- ESLint 9 flat config at repo root with per-directory settings
- Prettier: single quotes, no semicolons, 2-space indent, trailing commas, 100-char print width
- `"type": "module"` in root `package.json` — all config files and scripts use ESM

## Custom events

Both implementations dispatch native DOM `CustomEvent`s (not jQuery `.trigger()`). This ensures listeners registered via `addEventListener` work in both versions.

**Implementation rules that are not obvious from the code:**

- `dispatchCustomEvent` requires a raw DOM element. In jQuery plugin methods, `this` is a jQuery wrapper — always use `this[0]` (or `$this[0]` / `rawElement`). The `_setprogress` helper in `loadgo.js` normalises via `const rawElement = $element[0]` for this reason.
- `CUSTOM_EVENTS` (the `type → 'loadgo:type'` lookup map) is defined at IIFE scope, above `dispatchCustomEvent`, so it is not recreated on every call.
- `resetprogress` and `stop` call `_setprogress(..., false)` (`shouldEmit = false`) and then dispatch their own events (`loadgo:reset` / `loadgo:stop`). This prevents `loadgo:progress` from firing alongside them.
- `loadgo:complete` is guarded by `!data.interval` — it never fires inside a loop even when progress hits 100.
- `loadgo:options` is guarded by an `isUpdate` flag computed before the `if/else` branch. It fires only on the update path (existing options + user-provided options), not during first-time init and not when `options()` is used as a getter.
- Events with no payload (`loadgo:init`, `loadgo:start`, `loadgo:cycle`, `loadgo:destroy`) are dispatched without a `detail` argument — the Web API defaults `event.detail` to `null`. The TypeScript types use `CustomEvent<null>` accordingly.

## jQuery 4 compatibility notes

- `$.inArray()` removed — use `Array.prototype.includes()`
- `$.removeData(el, key)` static form removed — use `$el.removeData(key)`
- `.load()` event shorthand removed — use `.on('load', handler)`
- `$(window).load()` removed — use `$(document).ready()`
