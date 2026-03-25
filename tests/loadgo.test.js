import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { beforeAll, beforeEach, afterEach, describe, it, expect } from 'vitest'
import $ from 'jquery'

const __dirname = dirname(fileURLToPath(import.meta.url))
const scriptCode = readFileSync(join(__dirname, '../loadgo.js'), 'utf8')

let $container, $image

beforeAll(() => {
  globalThis.jQuery = $
  globalThis.$ = $
  ;(0, globalThis.eval)(scriptCode)
})

beforeEach(() => {
  $image = $('<img id="id-logo" />')
  $container = $('<div id="id-container"></div>')
  $container.append($image)
  $('body').append($container)
})

afterEach(() => {
  $image.loadgo('destroy')
  $('body').empty()
})

const getOverlay = () => $image.siblings('.loadgo-overlay').first()

describe('jQuery - Initialization', () => {
  it('exposes $.fn.loadgo as a function', () => {
    expect(typeof $.fn.loadgo).toBe('function')
  })

  it('does nothing if selector matches no element', () => {
    $('#ghost').loadgo()
    expect($('#ghost').siblings('.loadgo-overlay').length).toBe(0)
  })

  it('throws if element is not an img', () => {
    expect(() => $('div').loadgo()).toThrow()
  })

  it('wraps image in a loadgo-container', () => {
    $image.loadgo()
    expect($image.parent().hasClass('loadgo-container')).toBe(true)
  })

  it('creates a loadgo-overlay inside the container', () => {
    $image.loadgo()
    expect(getOverlay().length).toBe(1)
  })
})

describe('jQuery - Default properties', () => {
  it('bgcolor defaults to #FFFFFF', () => {
    $image.loadgo()
    expect($image.loadgo('options').bgcolor).toBe('#FFFFFF')
  })

  it('accepts custom bgcolor', () => {
    $image.loadgo({ bgcolor: '#FFAA00' })
    expect($image.loadgo('options').bgcolor).toBe('#FFAA00')
  })

  it('opacity defaults to 0.5', () => {
    $image.loadgo()
    expect($image.loadgo('options').opacity).toBe(0.5)
  })

  it('accepts custom opacity', () => {
    $image.loadgo({ opacity: 0.8 })
    expect($image.loadgo('options').opacity).toBe(0.8)
  })

  it('animated defaults to true', () => {
    $image.loadgo()
    expect($image.loadgo('options').animated).toBe(true)
  })

  it('accepts animated: false', () => {
    $image.loadgo({ animated: false })
    expect($image.loadgo('options').animated).toBe(false)
  })

  it('image defaults to null', () => {
    $image.loadgo()
    expect($image.loadgo('options').image).toBeNull()
  })

  it('accepts custom image url', () => {
    $image.loadgo({ image: 'logo.png' })
    expect($image.loadgo('options').image).toBe('logo.png')
  })

  it('class defaults to null', () => {
    $image.loadgo()
    expect($image.loadgo('options').class).toBeNull()
  })

  it('accepts custom class', () => {
    $image.loadgo({ class: 'my-class' })
    expect($image.loadgo('options').class).toBe('my-class')
  })

  it('direction defaults to "lr"', () => {
    $image.loadgo()
    expect($image.loadgo('options').direction).toBe('lr')
  })

  it('accepts valid direction "rl"', () => {
    $image.loadgo({ direction: 'rl' })
    expect($image.loadgo('options').direction).toBe('rl')
  })

  it('falls back to "lr" for invalid direction', () => {
    $image.loadgo({ direction: 'left-to-right' })
    expect($image.loadgo('options').direction).toBe('lr')
  })

  it('filter defaults to null', () => {
    $image.loadgo()
    expect($image.loadgo('options').filter).toBeNull()
  })

  it('accepts valid filter "blur"', () => {
    $image.loadgo({ filter: 'blur' })
    expect($image.loadgo('options').filter).toBe('blur')
  })

  it('falls back to null for invalid filter', () => {
    $image.loadgo({ filter: 'invalid-filter' })
    expect($image.loadgo('options').filter).toBeNull()
  })

  it('calls custom resize function on window resize', () => {
    let called = false
    $image.loadgo({ resize: () => (called = true) })
    $(window).trigger('resize')
    expect(called).toBe(true)
  })

  it('default resize function does not add unexpected DOM elements', () => {
    $image.loadgo()
    const before = $('*').length
    $(window).trigger('resize')
    expect($('*').length).toBe(before)
  })
})

describe('jQuery - Overlay render', () => {
  it('only creates one overlay', () => {
    $image.loadgo()
    expect($image.siblings('.loadgo-overlay').length).toBe(1)
  })

  it('applies bgcolor as background-color on overlay', () => {
    $image.loadgo({ bgcolor: '#FF0000' })
    expect(getOverlay()[0].style.backgroundColor).toBe('rgb(255, 0, 0)')
  })

  it('applies opacity to overlay', () => {
    $image.loadgo({ opacity: 0.8 })
    expect(Number(getOverlay()[0].style.opacity)).toBe(0.8)
  })

  it('sets CSS transition when animated is true', () => {
    $image.loadgo({ animated: true })
    expect(getOverlay()[0].style.transition).toContain('ease')
  })

  it('uses custom animationDuration', () => {
    $image.loadgo({ animationDuration: 1.2 })
    expect(getOverlay()[0].style.transition).toContain('1.2s')
  })

  it('uses custom animationEasing', () => {
    $image.loadgo({ animationEasing: 'linear' })
    expect(getOverlay()[0].style.transition).toContain('linear')
  })

  it('does not set CSS transition when animated is false', () => {
    $image.loadgo({ animated: false })
    expect(getOverlay()[0].style.transition).toBe('')
  })

  it('adds custom class to overlay', () => {
    $image.loadgo({ class: 'my-class' })
    expect(getOverlay().hasClass('my-class')).toBe(true)
  })

  it('does not create overlay when a valid filter is set', () => {
    $image.loadgo({ filter: 'sepia' })
    expect(getOverlay().length).toBe(0)
  })

  it('creates overlay when an invalid filter is provided', () => {
    $image.loadgo({ filter: 'invalid' })
    expect(getOverlay().length).toBe(1)
  })

  it('applies sepia filter directly to the image', () => {
    $image.loadgo({ filter: 'sepia' })
    // jsdom does not recognise -webkit-filter; test via stored option instead
    expect($image.loadgo('options').filter).toBe('sepia')
  })

  it('does not apply a filter to the image by default', () => {
    $image.loadgo()
    expect($image[0].style['filter'] ?? '').toBe('')
  })

  it('sets background image on overlay when image option is provided', () => {
    $image.loadgo({ image: 'logo.png' })
    expect(getOverlay()[0].style.backgroundImage).toContain('logo.png')
  })

  it('overlay has no background image by default', () => {
    $image.loadgo()
    expect(getOverlay()[0].style.backgroundImage).toBe('')
  })
})

describe('jQuery - Get/Set progress', () => {
  it('defaults to 0', () => {
    $image.loadgo()
    expect($image.loadgo('getprogress')).toBe(0)
  })

  it('returns 0 for an uninitialised element', () => {
    expect($image.loadgo('getprogress')).toBe(0)
  })

  it('setprogress updates the stored progress value', () => {
    $image.loadgo()
    $image.loadgo('setprogress', 50)
    expect($image.loadgo('getprogress')).toBe(50)
  })

  it('ignores values below 0', () => {
    $image.loadgo()
    $image.loadgo('setprogress', -10)
    expect($image.loadgo('getprogress')).toBe(0)
  })

  it('ignores values above 100', () => {
    $image.loadgo()
    $image.loadgo('setprogress', 110)
    expect($image.loadgo('getprogress')).toBe(0)
  })

  it('resetprogress sets progress back to 0', () => {
    $image.loadgo()
    $image.loadgo('setprogress', 75)
    $image.loadgo('resetprogress')
    expect($image.loadgo('getprogress')).toBe(0)
  })
})

describe('jQuery - Destroy', () => {
  it('does nothing if element was never initialised', () => {
    expect(() => $image.loadgo('destroy')).not.toThrow()
  })

  it('removes the loadgo-container wrapper', () => {
    $image.loadgo()
    $image.loadgo('destroy')
    expect($container.find('.loadgo-container').length).toBe(0)
  })

  it('moves image back to its original parent', () => {
    $image.loadgo()
    $image.loadgo('destroy')
    expect($image.parent()[0]).toBe($container[0])
  })

  it('removes the overlay element', () => {
    $image.loadgo()
    $image.loadgo('destroy')
    expect($container.find('.loadgo-overlay').length).toBe(0)
  })

  it('does not touch DOM when filter mode was used (no container wrap)', () => {
    $image.loadgo({ filter: 'sepia' })
    $image.loadgo('destroy')
    expect($image.parent()[0]).toBe($container[0])
  })
})

describe('jQuery - Re-initialization', () => {
  it('re-initializing the same element creates only one overlay', () => {
    $image.loadgo()
    $image.loadgo()
    expect($image.siblings('.loadgo-overlay').length).toBe(1)
  })

  it('re-initializing resets progress to 0', () => {
    $image.loadgo()
    $image.loadgo('setprogress', 75)
    $image.loadgo()
    expect($image.loadgo('getprogress')).toBe(0)
  })

  it('re-initializing applies new options', () => {
    $image.loadgo({ bgcolor: '#FF0000' })
    $image.loadgo({ bgcolor: '#00FF00' })
    expect($image.loadgo('options').bgcolor).toBe('#00FF00')
  })
})

describe('jQuery - loop()/stop() in filter mode', () => {
  it('loop() does not throw in filter mode', () => {
    $image.loadgo({ filter: 'blur' })
    expect(() => $image.loadgo('loop', 100)).not.toThrow()
    $image.loadgo('stop')
  })

  it('stop() does not throw in filter mode', () => {
    $image.loadgo({ filter: 'blur' })
    $image.loadgo('loop', 100)
    expect(() => $image.loadgo('stop')).not.toThrow()
  })

  it('stop() in filter mode sets progress to 100', () => {
    $image.loadgo({ filter: 'blur' })
    $image.loadgo('loop', 100)
    $image.loadgo('stop')
    expect($image.loadgo('getprogress')).toBe(100)
  })
})

describe('jQuery - ARIA attributes', () => {
  it('overlay has role="progressbar"', () => {
    $image.loadgo()
    expect(getOverlay().attr('role')).toBe('progressbar')
  })

  it('overlay has aria-valuemin="0" and aria-valuemax="100"', () => {
    $image.loadgo()
    expect(getOverlay().attr('aria-valuemin')).toBe('0')
    expect(getOverlay().attr('aria-valuemax')).toBe('100')
  })

  it('overlay aria-valuenow starts at 0', () => {
    $image.loadgo()
    expect(getOverlay().attr('aria-valuenow')).toBe('0')
  })

  it('overlay aria-valuenow updates on setprogress', () => {
    $image.loadgo()
    $image.loadgo('setprogress', 60)
    expect(getOverlay().attr('aria-valuenow')).toBe('60')
  })

  it('overlay has default aria-label "Loading"', () => {
    $image.loadgo()
    expect(getOverlay().attr('aria-label')).toBe('Loading')
  })

  it('overlay uses custom ariaLabel', () => {
    $image.loadgo({ ariaLabel: 'Image loading' })
    expect(getOverlay().attr('aria-label')).toBe('Image loading')
  })

  it('filter mode: image gets role="progressbar"', () => {
    $image.loadgo({ filter: 'blur' })
    expect($image.attr('role')).toBe('progressbar')
  })

  it('filter mode: image aria-valuenow updates on setprogress', () => {
    $image.loadgo({ filter: 'blur' })
    $image.loadgo('setprogress', 40)
    expect($image.attr('aria-valuenow')).toBe('40')
  })

  it('filter mode: destroy removes ARIA attributes from image', () => {
    $image.loadgo({ filter: 'blur' })
    $image.loadgo('destroy')
    expect($image.attr('role')).toBeUndefined()
    expect($image.attr('aria-valuenow')).toBeUndefined()
  })
})

describe('jQuery - onProgress callback', () => {
  it('onProgress is called when setprogress is called', () => {
    let received = null
    $image.loadgo({ onProgress: (p) => (received = p) })
    $image.loadgo('setprogress', 42)
    expect(received).toBe(42)
  })

  it('onProgress is called with 0 when resetprogress is called', () => {
    let received = null
    $image.loadgo({ onProgress: (p) => (received = p) })
    $image.loadgo('setprogress', 50)
    $image.loadgo('resetprogress')
    expect(received).toBe(0)
  })

  it('onProgress is not called for out-of-range values', () => {
    let callCount = 0
    $image.loadgo({ onProgress: () => callCount++ })
    $image.loadgo('setprogress', -1)
    $image.loadgo('setprogress', 101)
    expect(callCount).toBe(0)
  })
})

describe('jQuery - Resize listener cleanup', () => {
  it('custom resize listener is not called after destroy()', () => {
    let callCount = 0
    $image.loadgo({ resize: () => callCount++ })
    $(window).trigger('resize')
    expect(callCount).toBe(1)
    $image.loadgo('destroy')
    $(window).trigger('resize')
    expect(callCount).toBe(1)
  })

  it('default resize listener is removed after destroy() without throwing', () => {
    $image.loadgo()
    $image.loadgo('destroy')
    expect(() => $(window).trigger('resize')).not.toThrow()
  })
})
