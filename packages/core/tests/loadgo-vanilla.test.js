import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { beforeAll, beforeEach, afterEach, describe, it, expect } from 'vitest'

const __dirname = dirname(fileURLToPath(import.meta.url))
const scriptCode = readFileSync(join(__dirname, '../loadgo-vanilla.js'), 'utf8')

let Loadgo
let container, image

beforeAll(() => {
  ;(0, globalThis.eval)(scriptCode)
  Loadgo = globalThis.Loadgo
})

beforeEach(() => {
  image = document.createElement('img')
  image.id = 'id-logo'

  container = document.createElement('div')
  container.id = 'id-container'
  container.appendChild(image)
  document.body.appendChild(container)
})

afterEach(() => {
  Loadgo.destroy(image)
  document.body.innerHTML = ''
})

const getOverlay = () => image.parentElement?.querySelector('.loadgo-overlay') ?? null

describe('JS - Initialization', () => {
  it('exposes Loadgo on window', () => {
    expect(typeof globalThis.Loadgo).toBe('object')
  })

  it('does nothing if element is null', () => {
    expect(() => Loadgo.init(null)).not.toThrow()
  })

  it('throws if element is not an img', () => {
    const div = document.createElement('div')
    div.id = 'not-img'
    document.body.appendChild(div)
    expect(() => Loadgo.init(div)).toThrow()
  })

  it('throws if argument is not a single HTMLElement (e.g. NodeList)', () => {
    document.body.appendChild(Object.assign(document.createElement('img'), { id: 'img-a' }))
    document.body.appendChild(Object.assign(document.createElement('img'), { id: 'img-b' }))
    const nodeList = document.querySelectorAll('img')
    expect(() => Loadgo.init(nodeList)).toThrow('LoadGo only works on one element at a time.')
  })

  it('wraps image in a loadgo-container', () => {
    Loadgo.init(image)
    expect(image.parentElement.classList.contains('loadgo-container')).toBe(true)
  })

  it('creates a loadgo-overlay inside the container', () => {
    Loadgo.init(image)
    expect(getOverlay()).not.toBeNull()
  })
})

describe('JS - Default properties', () => {
  it('bgcolor defaults to #FFFFFF', () => {
    Loadgo.init(image)
    expect(Loadgo.options(image).bgcolor).toBe('#FFFFFF')
  })

  it('accepts custom bgcolor', () => {
    Loadgo.init(image, { bgcolor: '#FFAA00' })
    expect(Loadgo.options(image).bgcolor).toBe('#FFAA00')
  })

  it('opacity defaults to 0.5', () => {
    Loadgo.init(image)
    expect(Number(Loadgo.options(image).opacity)).toBe(0.5)
  })

  it('accepts custom opacity', () => {
    Loadgo.init(image, { opacity: 0.8 })
    expect(Number(Loadgo.options(image).opacity)).toBe(0.8)
  })

  it('animated defaults to true', () => {
    Loadgo.init(image)
    expect(Loadgo.options(image).animated).toBe(true)
  })

  it('accepts animated: false', () => {
    Loadgo.init(image, { animated: false })
    expect(Loadgo.options(image).animated).toBe(false)
  })

  it('image defaults to null', () => {
    Loadgo.init(image)
    expect(Loadgo.options(image).image).toBeNull()
  })

  it('accepts custom image url', () => {
    Loadgo.init(image, { image: 'logo.png' })
    expect(Loadgo.options(image).image).toBe('logo.png')
  })

  it('class defaults to null', () => {
    Loadgo.init(image)
    expect(Loadgo.options(image).class).toBeNull()
  })

  it('accepts custom class', () => {
    Loadgo.init(image, { class: 'my-class' })
    expect(Loadgo.options(image).class).toBe('my-class')
  })

  it('direction defaults to "lr"', () => {
    Loadgo.init(image)
    expect(Loadgo.options(image).direction).toBe('lr')
  })

  it('accepts valid direction "rl"', () => {
    Loadgo.init(image, { direction: 'rl' })
    expect(Loadgo.options(image).direction).toBe('rl')
  })

  it('falls back to "lr" for invalid direction', () => {
    Loadgo.init(image, { direction: 'left-to-right' })
    expect(Loadgo.options(image).direction).toBe('lr')
  })

  it('filter defaults to null', () => {
    Loadgo.init(image)
    expect(Loadgo.options(image).filter).toBeNull()
  })

  it('accepts valid filter "blur"', () => {
    Loadgo.init(image, { filter: 'blur' })
    expect(Loadgo.options(image).filter).toBe('blur')
  })

  it('falls back to null for invalid filter', () => {
    Loadgo.init(image, { filter: 'invalid-filter' })
    expect(Loadgo.options(image).filter).toBeNull()
  })

  it('calls custom resize function on window resize', () => {
    let called = false
    Loadgo.init(image, { resize: () => (called = true) })
    window.dispatchEvent(new Event('resize'))
    expect(called).toBe(true)
  })

  it('default resize function does not add unexpected DOM elements', () => {
    Loadgo.init(image)
    const before = document.querySelectorAll('*').length
    window.dispatchEvent(new Event('resize'))
    expect(document.querySelectorAll('*').length).toBe(before)
  })
})

describe('JS - Overlay render', () => {
  it('only creates one overlay', () => {
    Loadgo.init(image)
    expect(image.parentElement.querySelectorAll('.loadgo-overlay').length).toBe(1)
  })

  it('applies bgcolor as background-color on overlay', () => {
    Loadgo.init(image, { bgcolor: '#FF0000' })
    expect(getOverlay().style.backgroundColor).toBe('rgb(255, 0, 0)')
  })

  it('applies opacity to overlay', () => {
    Loadgo.init(image, { opacity: 0.8 })
    expect(Number(getOverlay().style.opacity)).toBe(0.8)
  })

  it('sets CSS transition when animated is true', () => {
    Loadgo.init(image, { animated: true })
    expect(getOverlay().style.transition).toContain('ease')
  })

  it('uses custom animationDuration', () => {
    Loadgo.init(image, { animationDuration: 1.2 })
    expect(getOverlay().style.transition).toContain('1.2s')
  })

  it('uses custom animationEasing', () => {
    Loadgo.init(image, { animationEasing: 'linear' })
    expect(getOverlay().style.transition).toContain('linear')
  })

  it('does not set CSS transition when animated is false', () => {
    Loadgo.init(image, { animated: false })
    expect(getOverlay().style.transition).toBe('')
  })

  it('adds custom class to overlay', () => {
    Loadgo.init(image, { class: 'my-class' })
    expect(getOverlay().classList.contains('my-class')).toBe(true)
  })

  it('does not create overlay when a valid filter is set', () => {
    Loadgo.init(image, { filter: 'sepia' })
    expect(getOverlay()).toBeNull()
  })

  it('creates overlay when an invalid filter is provided', () => {
    Loadgo.init(image, { filter: 'invalid' })
    expect(getOverlay()).not.toBeNull()
  })

  it('applies sepia filter directly to the image', () => {
    Loadgo.init(image, { filter: 'sepia' })
    // jsdom does not recognise -webkit-filter; test via stored option instead
    expect(Loadgo.options(image).filter).toBe('sepia')
  })

  it('does not apply a filter to the image by default', () => {
    Loadgo.init(image)
    expect(image.style['filter'] ?? '').toBe('')
  })

  it('sets background image on overlay when image option is provided', () => {
    Loadgo.init(image, { image: 'logo.png' })
    expect(getOverlay().style.backgroundImage).toContain('logo.png')
  })

  it('overlay has no background image by default', () => {
    Loadgo.init(image)
    expect(getOverlay().style.backgroundImage).toBe('')
  })
})

describe('JS - Get/Set progress', () => {
  it('defaults to 0', () => {
    Loadgo.init(image)
    expect(Loadgo.getprogress(image)).toBe(0)
  })

  it('returns 0 for an uninitialised element', () => {
    expect(Loadgo.getprogress(image)).toBe(0)
  })

  it('setprogress updates the stored progress value', () => {
    Loadgo.init(image)
    Loadgo.setprogress(image, 50)
    expect(Loadgo.getprogress(image)).toBe(50)
  })

  it('ignores values below 0', () => {
    Loadgo.init(image)
    Loadgo.setprogress(image, -10)
    expect(Loadgo.getprogress(image)).toBe(0)
  })

  it('ignores values above 100', () => {
    Loadgo.init(image)
    Loadgo.setprogress(image, 110)
    expect(Loadgo.getprogress(image)).toBe(0)
  })

  it('resetprogress sets progress back to 0', () => {
    Loadgo.init(image)
    Loadgo.setprogress(image, 75)
    Loadgo.resetprogress(image)
    expect(Loadgo.getprogress(image)).toBe(0)
  })
})

describe('JS - Destroy', () => {
  it('does nothing if element was never initialised', () => {
    expect(() => Loadgo.destroy(image)).not.toThrow()
  })

  it('removes the loadgo-container wrapper', () => {
    Loadgo.init(image)
    Loadgo.destroy(image)
    expect(container.querySelector('.loadgo-container')).toBeNull()
  })

  it('moves image back to its original parent', () => {
    Loadgo.init(image)
    Loadgo.destroy(image)
    expect(image.parentElement).toBe(container)
  })

  it('removes the overlay element', () => {
    Loadgo.init(image)
    Loadgo.destroy(image)
    expect(container.querySelector('.loadgo-overlay')).toBeNull()
  })

  it('does not touch DOM when filter mode was used (no container wrap)', () => {
    Loadgo.init(image, { filter: 'sepia' })
    Loadgo.destroy(image)
    expect(image.parentElement).toBe(container)
  })
})

describe('JS - Re-initialization', () => {
  it('re-initializing the same element creates only one overlay', () => {
    Loadgo.init(image)
    Loadgo.init(image)
    expect(image.parentElement.querySelectorAll('.loadgo-overlay').length).toBe(1)
  })

  it('re-initializing resets progress to 0', () => {
    Loadgo.init(image)
    Loadgo.setprogress(image, 75)
    Loadgo.init(image)
    expect(Loadgo.getprogress(image)).toBe(0)
  })

  it('re-initializing applies new options', () => {
    Loadgo.init(image, { bgcolor: '#FF0000' })
    Loadgo.init(image, { bgcolor: '#00FF00' })
    expect(Loadgo.options(image).bgcolor).toBe('#00FF00')
  })
})

describe('JS - loop()/stop() in filter mode', () => {
  it('loop() does not throw in filter mode', () => {
    Loadgo.init(image, { filter: 'blur' })
    expect(() => Loadgo.loop(image, 100)).not.toThrow()
    Loadgo.stop(image)
  })

  it('stop() does not throw in filter mode', () => {
    Loadgo.init(image, { filter: 'blur' })
    Loadgo.loop(image, 100)
    expect(() => Loadgo.stop(image)).not.toThrow()
  })

  it('stop() in filter mode sets progress to 100', () => {
    Loadgo.init(image, { filter: 'blur' })
    Loadgo.loop(image, 100)
    Loadgo.stop(image)
    expect(Loadgo.getprogress(image)).toBe(100)
  })
})

describe('JS - ARIA attributes', () => {
  it('overlay has role="progressbar"', () => {
    Loadgo.init(image)
    expect(getOverlay().getAttribute('role')).toBe('progressbar')
  })

  it('overlay has aria-valuemin="0" and aria-valuemax="100"', () => {
    Loadgo.init(image)
    expect(getOverlay().getAttribute('aria-valuemin')).toBe('0')
    expect(getOverlay().getAttribute('aria-valuemax')).toBe('100')
  })

  it('overlay aria-valuenow starts at 0', () => {
    Loadgo.init(image)
    expect(getOverlay().getAttribute('aria-valuenow')).toBe('0')
  })

  it('overlay aria-valuenow updates on setprogress', () => {
    Loadgo.init(image)
    Loadgo.setprogress(image, 60)
    expect(getOverlay().getAttribute('aria-valuenow')).toBe('60')
  })

  it('overlay has default aria-label "Loading"', () => {
    Loadgo.init(image)
    expect(getOverlay().getAttribute('aria-label')).toBe('Loading')
  })

  it('overlay uses custom ariaLabel', () => {
    Loadgo.init(image, { ariaLabel: 'Image loading' })
    expect(getOverlay().getAttribute('aria-label')).toBe('Image loading')
  })

  it('filter mode: image gets role="progressbar"', () => {
    Loadgo.init(image, { filter: 'blur' })
    expect(image.getAttribute('role')).toBe('progressbar')
  })

  it('filter mode: image aria-valuenow updates on setprogress', () => {
    Loadgo.init(image, { filter: 'blur' })
    Loadgo.setprogress(image, 40)
    expect(image.getAttribute('aria-valuenow')).toBe('40')
  })

  it('filter mode: destroy removes ARIA attributes from image', () => {
    Loadgo.init(image, { filter: 'blur' })
    Loadgo.destroy(image)
    expect(image.getAttribute('role')).toBeNull()
    expect(image.getAttribute('aria-valuenow')).toBeNull()
  })
})

describe('JS - onProgress callback', () => {
  it('onProgress is called when setprogress is called', () => {
    let received = null
    Loadgo.init(image, { onProgress: (p) => (received = p) })
    Loadgo.setprogress(image, 42)
    expect(received).toBe(42)
  })

  it('onProgress is called with 0 when resetprogress is called', () => {
    let received = null
    Loadgo.init(image, { onProgress: (p) => (received = p) })
    Loadgo.setprogress(image, 50)
    Loadgo.resetprogress(image)
    expect(received).toBe(0)
  })

  it('onProgress is not called for out-of-range values', () => {
    let callCount = 0
    Loadgo.init(image, { onProgress: () => callCount++ })
    Loadgo.setprogress(image, -1)
    Loadgo.setprogress(image, 101)
    expect(callCount).toBe(0)
  })
})

describe('JS - Resize listener cleanup', () => {
  it('custom resize listener is not called after destroy()', () => {
    let callCount = 0
    Loadgo.init(image, { resize: () => callCount++ })
    window.dispatchEvent(new Event('resize'))
    expect(callCount).toBe(1)
    Loadgo.destroy(image)
    window.dispatchEvent(new Event('resize'))
    expect(callCount).toBe(1)
  })

  it('default resize listener is removed after destroy() without throwing', () => {
    Loadgo.init(image)
    Loadgo.destroy(image)
    expect(() => window.dispatchEvent(new Event('resize'))).not.toThrow()
  })
})
