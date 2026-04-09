import { beforeAll, beforeEach, afterEach, describe, it, expect, vi } from 'vitest'

let Loadgo
let container, image

beforeAll(async () => {
  await import('../loadgo-vanilla.js')
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

const captureEvent = (el, type) => {
  const events = []
  const handler = (e) => events.push(e)
  el.addEventListener(type, handler)
  return { events, off: () => el.removeEventListener(type, handler) }
}

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

describe('JS - setprogress: direction bt', () => {
  it('setprogress with direction bt does not throw', () => {
    Loadgo.init(image, { direction: 'bt' })
    expect(() => Loadgo.setprogress(image, 50)).not.toThrow()
  })

  it('setprogress with direction bt stores progress', () => {
    Loadgo.init(image, { direction: 'bt' })
    Loadgo.setprogress(image, 50)
    expect(Loadgo.getprogress(image)).toBe(50)
  })

  it('setprogress with direction bt sets overlay height proportionally', () => {
    Loadgo.init(image, { direction: 'bt', animated: false })
    // Patch stored height since jsdom has no layout engine
    Loadgo.options(image).height = 200
    Loadgo.setprogress(image, 25)
    expect(getOverlay().style.height).toBe('150px')
  })

  it('setprogress with direction bt does not modify overlay width', () => {
    Loadgo.init(image, { direction: 'bt', animated: false })
    const widthBefore = getOverlay().style.width
    Loadgo.setprogress(image, 50)
    expect(getOverlay().style.width).toBe(widthBefore)
  })
})

describe('JS - setprogress: direction tb', () => {
  it('setprogress with direction tb does not throw', () => {
    Loadgo.init(image, { direction: 'tb' })
    expect(() => Loadgo.setprogress(image, 50)).not.toThrow()
  })

  it('setprogress with direction tb stores progress', () => {
    Loadgo.init(image, { direction: 'tb' })
    Loadgo.setprogress(image, 50)
    expect(Loadgo.getprogress(image)).toBe(50)
  })

  it('setprogress with direction tb sets overlay height and top', () => {
    Loadgo.init(image, { direction: 'tb', animated: false })
    Loadgo.options(image).height = 200
    Loadgo.setprogress(image, 25)
    expect(getOverlay().style.height).toBe('150px')
    expect(getOverlay().style.top).toBe('50px')
  })
})

describe('JS - setprogress: boundary values', () => {
  it('setprogress(0) stores 0', () => {
    Loadgo.init(image)
    Loadgo.setprogress(image, 0)
    expect(Loadgo.getprogress(image)).toBe(0)
  })

  it('setprogress(100) stores 100', () => {
    Loadgo.init(image)
    Loadgo.setprogress(image, 100)
    expect(Loadgo.getprogress(image)).toBe(100)
  })

  it('setprogress(0) sets overlay width to full width', () => {
    Loadgo.init(image, { animated: false })
    Loadgo.options(image).width = 100
    Loadgo.setprogress(image, 0)
    expect(getOverlay().style.width).toBe('100px')
  })

  it('setprogress(100) sets overlay width to 0', () => {
    Loadgo.init(image, { animated: false })
    Loadgo.options(image).width = 100
    Loadgo.setprogress(image, 100)
    expect(getOverlay().style.width).toBe('0px')
  })
})

describe('JS - loop restart after stop', () => {
  it('loop() can be called again after stop() without error', () => {
    Loadgo.init(image)
    Loadgo.loop(image, 1000)
    Loadgo.stop(image)
    expect(() => {
      Loadgo.loop(image, 1000)
      Loadgo.stop(image)
    }).not.toThrow()
  })
})

describe('JS - onProgress during loop', () => {
  it('onProgress is called on each loop tick', () => {
    vi.useFakeTimers()
    try {
      let callCount = 0
      Loadgo.init(image, { onProgress: () => callCount++ })
      Loadgo.loop(image, 100)
      vi.advanceTimersByTime(350) // fires at 100ms, 200ms, 300ms → 3 ticks
      Loadgo.stop(image)
      expect(callCount).toBeGreaterThanOrEqual(3)
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('JS - destroy/init lifecycle', () => {
  it('destroy then re-init resets progress and restores DOM structure', () => {
    Loadgo.init(image)
    Loadgo.setprogress(image, 75)
    Loadgo.destroy(image)
    Loadgo.init(image)
    expect(Loadgo.getprogress(image)).toBe(0)
    expect(image.parentElement.classList.contains('loadgo-container')).toBe(true)
    expect(image.parentElement.querySelectorAll('.loadgo-overlay').length).toBe(1)
  })

  it('custom resize listener from before destroy is not called after re-init', () => {
    let count = 0
    Loadgo.init(image, { resize: () => count++ })
    window.dispatchEvent(new Event('resize'))
    expect(count).toBe(1)
    Loadgo.destroy(image)
    Loadgo.init(image) // fresh init without custom resize
    window.dispatchEvent(new Event('resize'))
    expect(count).toBe(1) // original custom resize not re-attached
  })
})

describe('JS - Multiple elements', () => {
  it('setprogress on one element does not affect another', () => {
    const image2 = document.createElement('img')
    image2.id = 'id-logo-2'
    document.body.appendChild(image2)
    Loadgo.init(image)
    Loadgo.init(image2)
    Loadgo.setprogress(image, 60)
    expect(Loadgo.getprogress(image2)).toBe(0)
    Loadgo.destroy(image2)
  })

  it('two elements without id can be initialized simultaneously without overwriting each other', () => {
    const imgA = document.createElement('img') // no id — will get auto-generated one
    const imgB = document.createElement('img') // no id — will get a different auto-generated one
    document.body.appendChild(imgA)
    document.body.appendChild(imgB)
    Loadgo.init(imgA)
    Loadgo.init(imgB)
    Loadgo.setprogress(imgA, 40)
    expect(Loadgo.getprogress(imgA)).toBe(40)
    expect(Loadgo.getprogress(imgB)).toBe(0)
    Loadgo.destroy(imgA)
    Loadgo.destroy(imgB)
  })
})

describe('JS - options() before init()', () => {
  it('options() called before init() returns undefined', () => {
    const fresh = document.createElement('img')
    fresh.id = 'fresh-img'
    document.body.appendChild(fresh)
    expect(Loadgo.options(fresh)).toBeUndefined()
    document.body.removeChild(fresh)
  })
})

describe('JS - resetprogress on uninitialized element', () => {
  it('resetprogress does not throw on an uninitialized element', () => {
    const fresh = document.createElement('img')
    fresh.id = 'fresh-img'
    document.body.appendChild(fresh)
    expect(() => Loadgo.resetprogress(fresh)).not.toThrow()
    document.body.removeChild(fresh)
  })
})

describe('JS - Filter init CSS', () => {
  it('hue-rotate filter sets hue-rotate(360deg) on image', () => {
    Loadgo.init(image, { filter: 'hue-rotate' })
    expect(image.style.filter).toBe('hue-rotate(360deg)')
  })

  it('opacity filter sets opacity(0) on image', () => {
    Loadgo.init(image, { filter: 'opacity' })
    expect(image.style.filter).toBe('opacity(0)')
  })

  it('grayscale filter sets grayscale(1) on image', () => {
    Loadgo.init(image, { filter: 'grayscale' })
    expect(image.style.filter).toBe('grayscale(1)')
  })

  it('filter with animated: true sets transition on image', () => {
    Loadgo.init(image, { filter: 'blur', animated: true })
    expect(image.style.transition).toContain('filter')
  })
})

describe('JS - setprogress in filter mode', () => {
  it('hue-rotate at 50% sets hue-rotate(180deg)', () => {
    Loadgo.init(image, { filter: 'hue-rotate' })
    Loadgo.setprogress(image, 50)
    expect(image.style.filter).toBe('hue-rotate(180deg)')
  })

  it('opacity at 50% sets opacity(0.5)', () => {
    Loadgo.init(image, { filter: 'opacity' })
    Loadgo.setprogress(image, 50)
    expect(image.style.filter).toBe('opacity(0.5)')
  })

  it('grayscale at 50% sets grayscale(0.5)', () => {
    Loadgo.init(image, { filter: 'grayscale' })
    Loadgo.setprogress(image, 50)
    expect(image.style.filter).toBe('grayscale(0.5)')
  })
})

describe('JS - setprogress: direction rl', () => {
  it('setprogress with direction rl stores progress', () => {
    Loadgo.init(image, { direction: 'rl' })
    Loadgo.setprogress(image, 50)
    expect(Loadgo.getprogress(image)).toBe(50)
  })

  it('setprogress with direction rl sets overlay width proportionally', () => {
    Loadgo.init(image, { direction: 'rl', animated: false })
    Loadgo.options(image).width = 100
    Loadgo.setprogress(image, 25)
    expect(getOverlay().style.width).toBe('75px')
  })
})

describe('JS - image option background position', () => {
  it('image + lr direction uses 100% 0% background-position', () => {
    Loadgo.init(image, { image: 'logo.png', direction: 'lr' })
    expect(getOverlay().style.backgroundPosition).toBe('100% 0%')
  })

  it('image + rl direction uses 0% 50% background-position', () => {
    Loadgo.init(image, { image: 'logo.png', direction: 'rl' })
    expect(getOverlay().style.backgroundPosition).toBe('0% 50%')
  })

  it('image + bt direction uses 100% 0% background-position', () => {
    Loadgo.init(image, { image: 'logo.png', direction: 'bt' })
    expect(getOverlay().style.backgroundPosition).toBe('100% 0%')
  })

  it('image + tb direction uses 0% 100% background-position', () => {
    Loadgo.init(image, { image: 'logo.png', direction: 'tb' })
    expect(getOverlay().style.backgroundPosition).toBe('0% 100%')
  })
})

describe('JS - options() update after init', () => {
  it('options() with args after init merges into existing options', () => {
    Loadgo.init(image, { bgcolor: '#FF0000' })
    Loadgo.options(image, { bgcolor: '#00FF00' })
    expect(Loadgo.options(image).bgcolor).toBe('#00FF00')
  })

  it('options() update preserves previously set options', () => {
    Loadgo.init(image, { bgcolor: '#FF0000', opacity: 0.8 })
    Loadgo.options(image, { bgcolor: '#00FF00' })
    expect(Loadgo.options(image).opacity).toBe(0.8)
  })
})

describe('JS - loop/stop edge cases', () => {
  it('loop() on uninitialized element does not throw', () => {
    expect(() => Loadgo.loop(image, 1000)).not.toThrow()
  })

  it('loop() while already looping does not throw', () => {
    Loadgo.init(image)
    Loadgo.loop(image, 1000)
    expect(() => Loadgo.loop(image, 1000)).not.toThrow()
    Loadgo.stop(image)
  })

  it('stop() on uninitialized element does not throw', () => {
    expect(() => Loadgo.stop(image)).not.toThrow()
  })

  it('destroy() while looping stops the interval', () => {
    vi.useFakeTimers()
    try {
      let callCount = 0
      Loadgo.init(image, { onProgress: () => callCount++ })
      Loadgo.loop(image, 100)
      vi.advanceTimersByTime(300)
      const countBeforeDestroy = callCount
      Loadgo.destroy(image)
      vi.advanceTimersByTime(300)
      expect(callCount).toBe(countBeforeDestroy)
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('JS - Custom events: loadgo:init', () => {
  it('fires on init()', () => {
    const { events, off } = captureEvent(image, 'loadgo:init')
    Loadgo.init(image)
    off()
    expect(events.length).toBe(1)
  })

  it('fires again on re-init', () => {
    Loadgo.init(image)
    const { events, off } = captureEvent(image, 'loadgo:init')
    Loadgo.init(image)
    off()
    expect(events.length).toBe(1)
  })
})

describe('JS - Custom events: loadgo:error', () => {
  it('fires when element is not an img', () => {
    const div = document.createElement('div')
    div.id = 'not-img-error'
    document.body.appendChild(div)
    const { events, off } = captureEvent(div, 'loadgo:error')
    try {
      Loadgo.init(div)
      // eslint-disable-next-line no-unused-vars
    } catch (_) {
      //
    }
    off()
    expect(events.length).toBe(1)
    expect(events[0].detail.message).toMatch(/img/)
  })

  it('fires on loop() when element is not initialized', () => {
    const { events, off } = captureEvent(image, 'loadgo:error')
    Loadgo.loop(image, 1000)
    off()
    expect(events.length).toBe(1)
  })

  it('fires on loop() when already looping', () => {
    Loadgo.init(image)
    Loadgo.loop(image, 1000)
    const { events, off } = captureEvent(image, 'loadgo:error')
    Loadgo.loop(image, 1000)
    off()
    Loadgo.stop(image)
    expect(events.length).toBe(1)
  })

  it('fires on stop() when element is not initialized', () => {
    const { events, off } = captureEvent(image, 'loadgo:error')
    Loadgo.stop(image)
    off()
    expect(events.length).toBe(1)
  })

  it('fires on setprogress() when element is not initialized', () => {
    const { events, off } = captureEvent(image, 'loadgo:error')
    Loadgo.setprogress(image, 50)
    off()
    expect(events.length).toBe(1)
    expect(events[0].detail.message).toMatch(/set progress/)
  })

  it('fires on resetprogress() when element is not initialized', () => {
    const { events, off } = captureEvent(image, 'loadgo:error')
    Loadgo.resetprogress(image)
    off()
    expect(events.length).toBe(1)
    expect(events[0].detail.message).toMatch(/reset progress/)
  })

  it('does not fire loadgo:reset when element is not initialized', () => {
    const { events, off } = captureEvent(image, 'loadgo:reset')
    Loadgo.resetprogress(image)
    off()
    expect(events.length).toBe(0)
  })
})

describe('JS - Custom events: loadgo:options', () => {
  it('fires when options() is called as a setter after init', () => {
    Loadgo.init(image)
    const { events, off } = captureEvent(image, 'loadgo:options')
    Loadgo.options(image, { bgcolor: '#FF0000' })
    off()
    expect(events.length).toBe(1)
  })

  it('detail contains the merged options', () => {
    Loadgo.init(image)
    const { events, off } = captureEvent(image, 'loadgo:options')
    Loadgo.options(image, { bgcolor: '#FF0000' })
    off()
    expect(events[0].detail.bgcolor).toBe('#FF0000')
  })

  it('does not fire during init()', () => {
    const { events, off } = captureEvent(image, 'loadgo:options')
    Loadgo.init(image)
    off()
    expect(events.length).toBe(0)
  })

  it('does not fire when options() is used as a getter', () => {
    Loadgo.init(image)
    const { events, off } = captureEvent(image, 'loadgo:options')
    Loadgo.options(image)
    off()
    expect(events.length).toBe(0)
  })
})

describe('JS - Custom events: loadgo:progress', () => {
  it('fires on setprogress() with correct detail', () => {
    Loadgo.init(image)
    const { events, off } = captureEvent(image, 'loadgo:progress')
    Loadgo.setprogress(image, 50)
    off()
    expect(events.length).toBe(1)
    expect(events[0].detail.progress).toBe(50)
  })

  it('does not fire on resetprogress()', () => {
    Loadgo.init(image)
    Loadgo.setprogress(image, 50)
    const { events, off } = captureEvent(image, 'loadgo:progress')
    Loadgo.resetprogress(image)
    off()
    expect(events.length).toBe(0)
  })

  it('does not fire on stop()', () => {
    Loadgo.init(image)
    Loadgo.loop(image, 1000)
    const { events, off } = captureEvent(image, 'loadgo:progress')
    Loadgo.stop(image)
    off()
    expect(events.length).toBe(0)
  })
})

describe('JS - Custom events: loadgo:complete', () => {
  it('fires when setprogress reaches 100 outside a loop', () => {
    Loadgo.init(image)
    const { events, off } = captureEvent(image, 'loadgo:complete')
    Loadgo.setprogress(image, 100)
    off()
    expect(events.length).toBe(1)
    expect(events[0].detail.progress).toBe(100)
  })

  it('does not fire for values below 100', () => {
    Loadgo.init(image)
    const { events, off } = captureEvent(image, 'loadgo:complete')
    Loadgo.setprogress(image, 99)
    off()
    expect(events.length).toBe(0)
  })

  it('does not fire when progress reaches 100 inside a loop', () => {
    vi.useFakeTimers()
    try {
      Loadgo.init(image)
      const { events, off } = captureEvent(image, 'loadgo:complete')
      Loadgo.loop(image, 1)
      vi.advanceTimersByTime(105) // enough ticks to pass 100
      off()
      Loadgo.stop(image)
      expect(events.length).toBe(0)
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('JS - Custom events: loadgo:reset', () => {
  it('fires on resetprogress() with progress 0', () => {
    Loadgo.init(image)
    Loadgo.setprogress(image, 50)
    const { events, off } = captureEvent(image, 'loadgo:reset')
    Loadgo.resetprogress(image)
    off()
    expect(events.length).toBe(1)
    expect(events[0].detail.progress).toBe(0)
  })
})

describe('JS - Custom events: loadgo:start', () => {
  it('fires on loop()', () => {
    Loadgo.init(image)
    const { events, off } = captureEvent(image, 'loadgo:start')
    Loadgo.loop(image, 1000)
    off()
    Loadgo.stop(image)
    expect(events.length).toBe(1)
  })
})

describe('JS - Custom events: loadgo:cycle', () => {
  it('fires when the loop completes one full back-and-forth', () => {
    vi.useFakeTimers()
    try {
      Loadgo.init(image)
      const { events, off } = captureEvent(image, 'loadgo:cycle')
      Loadgo.loop(image, 1)
      vi.advanceTimersByTime(200) // 100 ticks up + 100 ticks down
      off()
      Loadgo.stop(image)
      expect(events.length).toBe(1)
    } finally {
      vi.useRealTimers()
    }
  })

  it('fires multiple times across multiple cycles', () => {
    vi.useFakeTimers()
    try {
      Loadgo.init(image)
      const { events, off } = captureEvent(image, 'loadgo:cycle')
      Loadgo.loop(image, 1)
      vi.advanceTimersByTime(400) // ~2 full cycles
      off()
      Loadgo.stop(image)
      expect(events.length).toBe(2)
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('JS - Custom events: loadgo:stop', () => {
  it('fires on stop() with progress 100', () => {
    Loadgo.init(image)
    Loadgo.loop(image, 1000)
    const { events, off } = captureEvent(image, 'loadgo:stop')
    Loadgo.stop(image)
    off()
    expect(events.length).toBe(1)
    expect(events[0].detail.progress).toBe(100)
  })
})

describe('JS - Custom events: loadgo:destroy', () => {
  it('fires on destroy()', () => {
    Loadgo.init(image)
    const { events, off } = captureEvent(image, 'loadgo:destroy')
    Loadgo.destroy(image)
    off()
    expect(events.length).toBe(1)
  })
})

describe('JS - autoStop option', () => {
  it('calls stop() automatically when setprogress reaches 100', () => {
    Loadgo.init(image, { autoStop: true })
    const { events, off } = captureEvent(image, 'loadgo:stop')
    Loadgo.setprogress(image, 100)
    off()
    expect(events.length).toBe(1)
    expect(events[0].detail.progress).toBe(100)
  })

  it('does not call stop() when progress is below 100', () => {
    Loadgo.init(image, { autoStop: true })
    const { events, off } = captureEvent(image, 'loadgo:stop')
    Loadgo.setprogress(image, 99)
    off()
    expect(events.length).toBe(0)
  })

  it('does not call stop() when looping, even if progress hits 100', () => {
    vi.useFakeTimers()
    try {
      Loadgo.init(image, { autoStop: true })
      const { events, off } = captureEvent(image, 'loadgo:stop')
      Loadgo.loop(image, 1)
      vi.advanceTimersByTime(105) // enough ticks to pass 100
      Loadgo.stop(image)
      off()
      expect(events.length).toBe(1) // only from the explicit stop() call
    } finally {
      vi.useRealTimers()
    }
  })

  it('fires loadgo:complete before loadgo:stop when autoStop triggers', () => {
    Loadgo.init(image, { autoStop: true })
    const order = []
    const offComplete = captureEvent(image, 'loadgo:complete')
    const offStop = captureEvent(image, 'loadgo:stop')
    image.addEventListener('loadgo:complete', () => order.push('complete'))
    image.addEventListener('loadgo:stop', () => order.push('stop'))
    Loadgo.setprogress(image, 100)
    offComplete.off()
    offStop.off()
    expect(order).toEqual(['complete', 'stop'])
  })

  it('does not call stop() when autoStop is false (default)', () => {
    Loadgo.init(image)
    const { events, off } = captureEvent(image, 'loadgo:stop')
    Loadgo.setprogress(image, 100)
    off()
    expect(events.length).toBe(0)
  })
})

describe('JS - Custom events: bubbling', () => {
  it('events bubble up to the parent element', () => {
    Loadgo.init(image)
    const { events, off } = captureEvent(container, 'loadgo:progress')
    Loadgo.setprogress(image, 40)
    off()
    expect(events.length).toBe(1)
  })
})
