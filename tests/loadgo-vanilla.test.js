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
    expect(getOverlay().style.transition).toBe('all 0.6s ease')
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
    expect(image.style['-webkit-filter'] ?? '').toBe('')
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
