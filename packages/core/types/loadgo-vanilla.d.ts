export interface LoadgoOptions {
  /** Overlay background color. Default: `'#FFFFFF'` */
  bgcolor?: string
  /** Overlay opacity (0–1). Default: `0.5` */
  opacity?: number
  /** Enable smooth CSS transition when setting progress. Default: `true` */
  animated?: boolean
  /** URL of an image to use as the overlay background. Default: `null` */
  image?: string | null
  /** Extra CSS class to add to the overlay element. Default: `null` */
  class?: string | null
  /** Custom window resize handler. When provided, replaces the built-in one. Default: `null` */
  resize?: (() => void) | null
  /** Direction the overlay shrinks as progress increases. Default: `'lr'` */
  direction?: 'lr' | 'rl' | 'bt' | 'tb'
  /** CSS filter applied directly to the image instead of using an overlay. Default: `null` */
  filter?: 'blur' | 'grayscale' | 'sepia' | 'hue-rotate' | 'invert' | 'opacity' | null
  /** Callback invoked after every `setprogress` call, receiving the new progress value (0–100). Default: `null` */
  onProgress?: ((progress: number) => void) | null
  /** Text for the `aria-label` attribute on the progressbar element. Default: `'Loading'` */
  ariaLabel?: string
  /** CSS transition duration in seconds. Default: `0.6` */
  animationDuration?: number
  /** CSS transition easing function. Default: `'ease'` */
  animationEasing?: string
  /**
   * Automatically call `stop()` when `setprogress(100)` is reached outside of a loop.
   * Removes the need to manually call `stop()` after setting progress to 100.
   * Has no effect when a loop is running. Default: `false`
   */
  autoStop?: boolean
}

export interface LoadgoAPI {
  /**
   * Initialise LoadGo on an `<img>` element.
   * @fires loadgo:init
   * @fires loadgo:error
   */
  init(element: HTMLImageElement, options?: LoadgoOptions): void
  /**
   * Get or set options for an already-initialised element.
   * @fires loadgo:options - Only fired when called as a setter after init.
   */
  options(element: HTMLImageElement, options?: LoadgoOptions): LoadgoOptions
  /** 
   * Set progress (0–100). 
   * @fires loadgo:progress
   * @fires loadgo:complete - Only fired when progress reaches 100% outside of a loop.
   */
  setprogress(element: HTMLImageElement, progress: number): void
  /** Return the current progress value. */
  getprogress(element: HTMLImageElement): number
  /** 
   * Reset progress back to 0. 
   * @fires loadgo:reset
   */
  resetprogress(element: HTMLImageElement): void
  /**
   * Start an indefinite back-and-forth animation loop.
   * @fires loadgo:start
   * @fires loadgo:cycle - Fired each time the loop completes one full back-and-forth.
   * @fires loadgo:error
   */
  loop(element: HTMLImageElement, duration: number): void
  /**
   * Stop the loop and reveal the full image.
   * @fires loadgo:stop
   * @fires loadgo:error
   */
  stop(element: HTMLImageElement): void
  /**
   * Remove the overlay and restore the original DOM structure.
   * @fires loadgo:destroy
   */
  destroy(element: HTMLImageElement): void
}

export declare const Loadgo: LoadgoAPI

export interface LoadgoDetail {
  progress: number
}

export interface LoadgoEventMap {
  'loadgo:complete': CustomEvent<LoadgoDetail>
  'loadgo:cycle': CustomEvent<null>
  'loadgo:destroy': CustomEvent<null>
  'loadgo:error': CustomEvent<{ message: string }>
  'loadgo:init': CustomEvent<null>
  'loadgo:options': CustomEvent<LoadgoOptions>
  'loadgo:progress': CustomEvent<LoadgoDetail>
  'loadgo:reset': CustomEvent<LoadgoDetail>
  'loadgo:start': CustomEvent<null>
  'loadgo:stop': CustomEvent<LoadgoDetail>
}

declare global {
  const Loadgo: LoadgoAPI

  interface HTMLImageElementEventMap extends LoadgoEventMap {}

  interface HTMLImageElement {
    addEventListener<K extends keyof LoadgoEventMap>(
      type: K,
      listener: (this: HTMLImageElement, ev: LoadgoEventMap[K]) => any,
      options?: boolean | AddEventListenerOptions
    ): void
    removeEventListener<K extends keyof LoadgoEventMap>(
      type: K,
      listener: (this: HTMLImageElement, ev: LoadgoEventMap[K]) => any,
      options?: boolean | EventListenerOptions
    ): void
  }
}
