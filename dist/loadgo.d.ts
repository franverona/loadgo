import type { LoadgoOptions } from './loadgo-vanilla'

declare global {
  interface JQuery {
    /** Initialise LoadGo with optional options (shorthand for `'init'`). */
    loadgo(options?: LoadgoOptions): JQuery
    /** Initialise LoadGo on the selected `<img>` element. */
    loadgo(method: 'init', options?: LoadgoOptions): JQuery
    /** Get or set options for an already-initialised element. */
    loadgo(method: 'options', options?: LoadgoOptions): LoadgoOptions
    /** Set progress (0–100). */
    loadgo(method: 'setprogress', progress: number): JQuery
    /** Return the current progress value. */
    loadgo(method: 'getprogress'): number
    /** Reset progress back to 0. */
    loadgo(method: 'resetprogress'): JQuery
    /** Start an indefinite back-and-forth animation loop. */
    loadgo(method: 'loop', duration: number): JQuery
    /** Stop the loop and reveal the full image. */
    loadgo(method: 'stop'): JQuery
    /** Remove the overlay and restore the original DOM structure. */
    loadgo(method: 'destroy'): JQuery
  }
}

export {}
