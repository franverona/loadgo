# Changelog

## 3.1.1 — 2026-03-26

- Using `loop()` with the `filter` option active would crash immediately — the overlay doesn't exist in filter mode, but the code tried to update it anyway (jQuery).
- After calling `stop()`, you could never start a new `loop()` on the same element — the stale interval ID was left behind and mistaken for an active loop (vanilla).
- Images without an `id` attribute would conflict with each other — all of them shared the same empty-string key, so initialising a second one would silently corrupt the first (vanilla).
- The overlay width was set to a bare number instead of a pixel value, so it never actually resized in modern browsers (vanilla).
- Calling `init()` a second time on the same element would nest a new container inside the existing one, breaking the DOM structure and leaving a ghost overlay behind. It now cleans up properly before reinitialising (jQuery and vanilla).
- Calling `destroy()` while a `loop()` was running would leave the interval alive forever, quietly burning CPU in the background (jQuery and vanilla).
- After `destroy()`, the image was moved to the end of its parent instead of back to where it originally was, silently reordering the page (vanilla).
- Overlay positioning ignored any margin or padding set through a stylesheet — only inline styles were read. It now uses computed styles, so CSS-applied spacing is respected (vanilla).
- Calling `options()` to update settings after `init()` had no effect — it returned the existing options immediately and discarded any changes. Updates are now applied correctly (vanilla).
- The overlay transition animated every CSS property instead of just the ones that actually change. Aligned with the jQuery behaviour to only transition `width`, `height`, and `top` (vanilla).

## 3.1.0 — 2026

- Added `onProgress` callback option — fires on every `setprogress` call with the current value.
- Added ARIA support: overlay (or image in filter mode) gets `role="progressbar"` and `aria-valuenow` kept in sync automatically. Configurable via `ariaLabel` option.
- Added `animationDuration` and `animationEasing` options — animation timing is no longer hardcoded to `0.6s ease`.
- Added TypeScript declarations for both vanilla and jQuery builds — no `@types/*` install needed.
- Fixed memory leak: window resize listener is now properly removed on `destroy`.
- Vendor prefix `-webkit-filter` replaced with standard `filter`.

## 3.0 — 2026

- Dropped jQuery < 4 support; updated for jQuery 4 breaking changes (`$.inArray`, `$.removeData`, `.load()` event shorthand).
- Released pure JavaScript version as the primary no-dependency alternative.
- Replaced Grunt build with npm scripts + terser; minified files now output to `dist/`.
- Removed Bower support.
- Migrated source to ES6+: `const`/`let`, arrow functions, template literals, spread operator.
- Added ESLint (flat config), Prettier, Husky, lint-staged, and commitlint.
- Removed IE-specific code and polyfills.
- Migrated tests from browser-based Mocha to CLI-based Vitest + jsdom (`npm test`).
- Fixed bugs in `destroy` (incorrect `splice` call and wrong argument to `removeChild`), `loop`, and `stop` methods.

## 2.2.1 — 16 Apr 2017

- Code style improvements.
- `setprogress` now checks if element exists (JavaScript).
- Added Gruntfile.
- Fixed JavaScript examples.

## 2.2 — 23 Mar 2017

- Added `destroy` method.
- Added tests.
- Fixed several bugs.
- Changed default DOM template.
- Improved documentation.
- Improved JavaScript and jQuery versions.

## 2.1 — 12 Apr 2016

- Fixed bug where `lr` direction was not working in the jQuery version.
- Added examples.

## 2.0 — 02 Apr 2016

- Released pure JavaScript version (no jQuery required).
- Fixed overlay repositioning bug on window resize.

## 1.0.1 — 02 Nov 2015

- Fixed `undefined` errors with newer jQuery versions.

## 1.0 — 15 Oct 2015

- First release.
