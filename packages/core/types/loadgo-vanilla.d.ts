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
}

export interface LoadgoAPI {
  /** Initialise LoadGo on an `<img>` element. */
  init(element: HTMLImageElement, options?: LoadgoOptions): void
  /** Get or set options for an already-initialised element. */
  options(element: HTMLImageElement, options?: LoadgoOptions): LoadgoOptions
  /** Set progress (0–100). */
  setprogress(element: HTMLImageElement, progress: number): void
  /** Return the current progress value. */
  getprogress(element: HTMLImageElement): number
  /** Reset progress back to 0. */
  resetprogress(element: HTMLImageElement): void
  /** Start an indefinite back-and-forth animation loop. */
  loop(element: HTMLImageElement, duration: number): void
  /** Stop the loop and reveal the full image. */
  stop(element: HTMLImageElement): void
  /** Remove the overlay and restore the original DOM structure. */
  destroy(element: HTMLImageElement): void
}

export declare const Loadgo: LoadgoAPI

declare global {
  const Loadgo: LoadgoAPI
}
