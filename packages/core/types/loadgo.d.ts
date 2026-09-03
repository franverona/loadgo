import type { LoadgoOptions, LoadgoEventMap } from './loadgo-vanilla'

declare global {
  interface JQuery {
    /**
     * Initialise LoadGo with optional options (shorthand for `'init'`).
     * @fires loadgo:init
     */
    loadgo(options?: LoadgoOptions): JQuery
    /**
     * Initialise LoadGo on the selected `<img>` element.
     * @fires loadgo:init
     * @fires loadgo:error
     */
    loadgo(method: 'init', options?: LoadgoOptions): JQuery
    /**
     * Get or set options for an already-initialised element.
     * @fires loadgo:options - Only fired when called as a setter after init.
     */
    loadgo(method: 'options', options?: LoadgoOptions): LoadgoOptions
    /**
     * Set progress (0–100).
     * @fires loadgo:progress
     * @fires loadgo:complete - Only fired when progress reaches 100% outside of a loop.
     */
    loadgo(method: 'setprogress', progress: number): JQuery
    /** Return the current progress value. */
    loadgo(method: 'getprogress'): number
    /**
     * Reset progress back to 0.
     * @fires loadgo:reset
     */
    loadgo(method: 'resetprogress'): JQuery
    /**
     * Start an indefinite back-and-forth animation loop.
     * @fires loadgo:start
     * @fires loadgo:cycle - Fired each time the loop completes one full back-and-forth.
     * @fires loadgo:error
     */
    loadgo(method: 'loop', duration: number): JQuery
    /**
     * Stop the loop and reveal the full image.
     * @fires loadgo:stop
     * @fires loadgo:error
     */
    loadgo(method: 'stop'): JQuery
    /**
     * Pause the loop, preserving the current progress and direction state.
     * No-op if the element is not currently looping.
     * @fires loadgo:pause
     */
    loadgo(method: 'pause'): JQuery
    /**
     * Resume a paused loop, continuing from where it left off.
     * No-op if the element is not paused.
     * @fires loadgo:resume
     */
    loadgo(method: 'resume'): JQuery
    /**
     * Remove the overlay and restore the original DOM structure.
     * @fires loadgo:destroy
     */
    loadgo(method: 'destroy'): JQuery

    on<K extends keyof LoadgoEventMap>(
      events: K,
      handler: (this: HTMLImageElement, ev: LoadgoEventMap[K]) => any
    ): this
    off<K extends keyof LoadgoEventMap>(
      events: K,
      handler?: (this: HTMLImageElement, ev: LoadgoEventMap[K]) => any
    ): this
  }
}

export {}
