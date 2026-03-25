# LoadGo

![Batman Example](batman.gif)

**LoadGo** is a JavaScript plugin that creates a progress bar overlay using your own images.

- Perfect for logo animation while users wait for a website to load, a file to upload, a status to update, etc.
- Creates an overlay above your `img` element and simulates loading progress using dimension changes.
- Available as a jQuery plugin and a standalone pure JavaScript version.
- Tested in modern browsers (Chrome, Firefox, Safari, Edge).

## Installation

### npm (recommended)

```bash
npm install loadgo
```

**Vanilla JS:**
```js
import 'loadgo'
// window.Loadgo is now available
```

**jQuery plugin** (bring your own jQuery 4+):
```js
import 'loadgo/jquery'
// $.fn.loadgo is now available
```

### Manual

1. [Download](https://github.com/franverona/loadgo/archive/master.zip) or [clone](https://github.com/franverona/loadgo) the repository.
2. Include the script in your page:

```html
<!-- jQuery version (requires jQuery 4+) -->
<script src="path/to/loadgo.js"></script>

<!-- Pure JavaScript version (no jQuery) -->
<script src="path/to/loadgo-vanilla.js"></script>
```

You can also use the minified versions from the `dist/` folder (`dist/loadgo.min.js` / `dist/loadgo-vanilla.min.js`).

## TypeScript

Type declarations are included in the package — no `@types/*` install needed.

**Vanilla JS** — `Loadgo` is available as both a named export and a global:

```ts
import type { LoadgoOptions } from 'loadgo'

const options: LoadgoOptions = { direction: 'bt', opacity: 0.8 }
Loadgo.init(document.getElementById('logo') as HTMLImageElement, options)
```

**jQuery plugin** — importing `loadgo/jquery` augments the global `JQuery` interface automatically:

```ts
import 'loadgo/jquery'

$('#logo').loadgo({ direction: 'bt' })
$('#logo').loadgo('setprogress', 50)

const progress: number = $('#logo').loadgo('getprogress')
```

> The jQuery types require `@types/jquery` to be installed in your project.

## Quick Start

```html
<img id="logo" src="logo.png" alt="Logo" />
```

```js
// jQuery
$('#logo').loadgo();
$('#logo').loadgo('setprogress', 50);

// Pure JavaScript
Loadgo.init(document.getElementById('logo'));
Loadgo.setprogress(document.getElementById('logo'), 50);
```

## Documentation

### How it works

LoadGo wraps your `img` element in a `div` and adds an overlay inside that wrapper. Setting a progress value changes the overlay's dimensions to simulate a loading state.

This plugin does **not** manage async operations — you connect it to your own upload/load/progress events.

LoadGo only works on `img` elements referenced by a single element (by `id`). It does **not** support multi-element selectors.

### Image load timing

LoadGo needs fully loaded images to read their dimensions correctly. Use the following pattern if the image may not be loaded yet:

```js
// jQuery
$('#logo')
  .on('load', () => {
    $('#logo').loadgo()
  })
  .each((_, el) => {
    if (el.complete) $(el).trigger('load')
  })

// Pure JavaScript
const image = document.getElementById('logo')
image.onload = () => {
  Loadgo.init(image)
}
```

### Initialization

```js
// jQuery
$('#logo').loadgo();

// Pure JavaScript
Loadgo.init(document.getElementById('logo'));
```

### Options

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `bgcolor` | `String` | `#FFFFFF` | Overlay background color (hex or RGB). Disabled when `image` is set. |
| `opacity` | `Number` | `0.5` | Overlay transparency. |
| `animated` | `Boolean` | `true` | Enable CSS transitions on `setprogress`. |
| `animationDuration` | `Number` | `0.6` | CSS transition duration in seconds. Only applies when `animated` is `true`. |
| `animationEasing` | `String` | `ease` | CSS transition easing function (any valid CSS `transition-timing-function`). Only applies when `animated` is `true`. |
| `direction` | `String` | `lr` | Animation direction: `lr` (left→right), `rl` (right→left), `bt` (bottom→top), `tb` (top→bottom). |
| `image` | `String` | `null` | URL for a background image on the overlay instead of a solid color. |
| `class` | `String` | `null` | CSS class applied to the overlay. |
| `filter` | `String` | `null` | CSS image filter applied directly to the `img`. Values: `blur`, `grayscale`, `sepia`, `hue-rotate`, `invert`, `opacity`. No overlay is created when this is set. |
| `resize` | `Function` | built-in | Custom window resize handler. When provided, replaces the built-in one entirely. |
| `onProgress` | `Function` | `null` | Callback invoked after every `setprogress` call, receiving the current progress value (0–100). |
| `ariaLabel` | `String` | `Loading` | Text for the `aria-label` attribute on the progressbar element. |

### onProgress callback

Use `onProgress` to react every time the progress value changes — for example to update a separate counter:

```js
// jQuery
$('#logo').loadgo({
  onProgress: (progress) => {
    document.getElementById('counter').textContent = `${progress}%`
  },
})

// Pure JavaScript
Loadgo.init(document.getElementById('logo'), {
  onProgress: (progress) => {
    document.getElementById('counter').textContent = `${progress}%`
  },
})
```

### Custom animation timing

```js
// Slow, linear transition
$('#logo').loadgo({ animationDuration: 1.5, animationEasing: 'linear' })

// Snappy, with a bounce effect
Loadgo.init(document.getElementById('logo'), {
  animationDuration: 0.3,
  animationEasing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
})
```

### Accessibility

LoadGo automatically adds `role="progressbar"`, `aria-valuemin`, `aria-valuemax`, and `aria-valuenow` to the overlay element (or to the `img` itself when `filter` mode is used). The `aria-valuenow` attribute is kept in sync with the current progress value on every `setprogress` call.

Use `ariaLabel` to provide a meaningful label for screen readers:

```js
$('#logo').loadgo({ ariaLabel: 'File upload progress' })

Loadgo.init(document.getElementById('logo'), { ariaLabel: 'File upload progress' })
```

### Methods

#### Get / Set options
**`$element.loadgo('options', <options>)`** | **`Loadgo.options(<element>, <options>)`**

Get or set plugin options on an already-initialized element.

```js
// jQuery
$('#logo').loadgo('options');                      // get
$('#logo').loadgo('options', { direction: 'bt' }); // set

// Pure JavaScript
Loadgo.options(document.getElementById('logo'));                      // get
Loadgo.options(document.getElementById('logo'), { direction: 'bt' }); // set
```

---

#### Set progress
**`$element.loadgo('setprogress', <number>)`** | **`Loadgo.setprogress(<element>, <number>)`**

Set the progress value (0–100).

```js
// jQuery
$('#logo').loadgo('setprogress', 50);

// Pure JavaScript
Loadgo.setprogress(document.getElementById('logo'), 50);
```

---

#### Get progress
**`$element.loadgo('getprogress')`** | **`Loadgo.getprogress(<element>)`**

Returns the current progress value (0–100).

```js
// jQuery
$('#logo').loadgo('getprogress');

// Pure JavaScript
Loadgo.getprogress(document.getElementById('logo'));
```

---

#### Reset progress
**`$element.loadgo('resetprogress')`** | **`Loadgo.resetprogress(<element>)`**

Resets progress to 0. Useful when reusing the same element for multiple loading operations.

```js
// jQuery
$('#logo').loadgo('resetprogress');

// Pure JavaScript
Loadgo.resetprogress(document.getElementById('logo'));
```

---

#### Start loop
**`$element.loadgo('loop', <duration>)`** | **`Loadgo.loop(<element>, <duration>)`**

Loops the overlay animation indefinitely — useful when the total progress is unknown. `duration` is in milliseconds.

```js
// jQuery
$('#logo').loadgo('loop', 10);

// Pure JavaScript
Loadgo.loop(document.getElementById('logo'), 10);
```

---

#### Stop loop
**`$element.loadgo('stop')`** | **`Loadgo.stop(<element>)`**

Stops a running loop and reveals the full image.

```js
// jQuery
$('#logo').loadgo('stop');

// Pure JavaScript
Loadgo.stop(document.getElementById('logo'));
```

---

#### Destroy
**`$element.loadgo('destroy')`** | **`Loadgo.destroy(<element>)`**

Removes the plugin entirely, including the `loadgo-container` and `loadgo-overlay` elements, and restores the original DOM.

```js
// jQuery
$('#logo').loadgo('destroy');

// Pure JavaScript
Loadgo.destroy(document.getElementById('logo'));
```

---

## Real-world example

Using LoadGo with [Uploadify](http://www.uploadify.com/) to show upload progress on a logo:

```js
$('#logo').loadgo()

$('#uploadinput').uploadify({
  onUploadStart: () => {
    $('#logo').loadgo('resetprogress')
  },
  onUploadProgress: (event) => {
    const p = (event.bytesLoaded / event.bytesTotal) * 100
    $('#logo').loadgo('setprogress', p)
  },
  onUploadComplete: () => {
    // upload done
  },
})
```

## Examples

- `/examples` folder in this repository

## Tests

Tests run from the CLI via [Vitest](https://vitest.dev/) with a jsdom environment — no browser needed.

```bash
npm test           # run once
npm run test:watch # watch mode
```

Test files:
- `tests/loadgo-vanilla.test.js` — vanilla JS implementation
- `tests/loadgo.test.js` — jQuery implementation

> Note: Tests that depend on real browser layout (overlay pixel dimensions after `setprogress`) are not included — jsdom has no layout engine, so `getBoundingClientRect()` and `clientWidth` return 0. Those behaviours can be verified manually using the `examples/` folder.

## Breaking changes in 2.2

Since version **2.2**, LoadGo wraps the image in a `div` before adding the overlay:

```html
<div class="loadgo-container">
  <img src="logo.png" class="..." style="..." />
  <div class="loadgo-overlay" style="..." />
</div>
```

If you have CSS rules using child selectors like `div > img`, you may need to update them. The safest fix is to add a class directly to the `img` element:

```html
<img src="logo.png" class="my-image" />
```

```css
.my-image {
  margin: 0 auto;
}
```

## Changelog

**3.1.0** — 2026
- Added `onProgress` callback option — fires on every `setprogress` call with the current value.
- Added ARIA support: overlay (or image in filter mode) gets `role="progressbar"` and `aria-valuenow` kept in sync automatically. Configurable via `ariaLabel` option.
- Added `animationDuration` and `animationEasing` options — animation timing is no longer hardcoded to `0.6s ease`.
- Added TypeScript declarations for both vanilla and jQuery builds — no `@types/*` install needed.
- Fixed memory leak: window resize listener is now properly removed on `destroy`.
- Vendor prefix `-webkit-filter` replaced with standard `filter`.

**3.0** — 2026
- Dropped jQuery < 4 support; updated for jQuery 4 breaking changes (`$.inArray`, `$.removeData`, `.load()` event shorthand).
- Released pure JavaScript version as the primary no-dependency alternative.
- Replaced Grunt build with npm scripts + terser; minified files now output to `dist/`.
- Removed Bower support.
- Migrated source to ES6+: `const`/`let`, arrow functions, template literals, spread operator.
- Added ESLint (flat config), Prettier, Husky, lint-staged, and commitlint.
- Removed IE-specific code and polyfills.
- Migrated tests from browser-based Mocha to CLI-based Vitest + jsdom (`npm test`).
- Fixed bugs in `destroy` (incorrect `splice` call and wrong argument to `removeChild`), `loop`, and `stop` methods.

**2.2.1** — 16 Apr 2017
- Code style improvements.
- JavaScript: `setprogress` now checks if element exists.
- Added Gruntfile.
- Fixed JavaScript examples.

**2.2** — 23 Mar 2017
- Added `destroy` method.
- Added tests.
- Fixed several bugs.
- Changed default DOM template.
- Improved documentation.
- Improved JavaScript and jQuery versions.

**2.1** — 12 Apr 2016
- Fixed bug where `lr` direction was not working in the jQuery version.
- Added examples.

**2.0** — 02 Apr 2016
- Released pure JavaScript version (no jQuery required).
- Fixed overlay repositioning bug on window resize.

**1.0.1** — 02 Nov 2015
- Fixed `undefined` errors with newer jQuery versions.

**1.0** — 15 Oct 2015
- First release.

## License

MIT — feel free to use, modify, and adapt. If you find a bug, open an issue or send a pull request.

## Credits

**Fran Verona** — https://franverona.com
