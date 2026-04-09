import { beforeAll, beforeEach, afterEach, describe, it, expect, vi } from 'vitest'
import $ from 'jquery'

let $container, $image

beforeAll(async () => {
  globalThis.jQuery = $
  globalThis.$ = $
  await import('../loadgo.js')
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

const captureEvent = (el, type) => {
  const events = []
  const handler = (e) => events.push(e)
  el.addEventListener(type, handler)
  return { events, off: () => el.removeEventListener(type, handler) }
}

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

describe('jQuery - setprogress: direction bt', () => {
  it('setprogress with direction bt does not throw', () => {
    $image.loadgo({ direction: 'bt' })
    expect(() => $image.loadgo('setprogress', 50)).not.toThrow()
  })

  it('setprogress with direction bt stores progress', () => {
    $image.loadgo({ direction: 'bt' })
    $image.loadgo('setprogress', 50)
    expect($image.loadgo('getprogress')).toBe(50)
  })

  it('setprogress with direction bt sets overlay height proportionally', () => {
    $image.loadgo({ direction: 'bt', animated: false })
    // Patch stored height since jsdom has no layout engine
    const data = $image.data('loadgo')
    data.height = 200
    $image.data('loadgo', data)
    $image.loadgo('setprogress', 25)
    expect(getOverlay()[0].style.height).toBe('150px')
  })

  it('setprogress with direction bt does not modify overlay width', () => {
    $image.loadgo({ direction: 'bt', animated: false })
    const widthBefore = getOverlay()[0].style.width
    $image.loadgo('setprogress', 50)
    expect(getOverlay()[0].style.width).toBe(widthBefore)
  })
})

describe('jQuery - setprogress: direction tb', () => {
  it('setprogress with direction tb does not throw', () => {
    $image.loadgo({ direction: 'tb' })
    expect(() => $image.loadgo('setprogress', 50)).not.toThrow()
  })

  it('setprogress with direction tb stores progress', () => {
    $image.loadgo({ direction: 'tb' })
    $image.loadgo('setprogress', 50)
    expect($image.loadgo('getprogress')).toBe(50)
  })

  it('setprogress with direction tb sets overlay height and top', () => {
    $image.loadgo({ direction: 'tb', animated: false })
    const data = $image.data('loadgo')
    data.height = 200
    $image.data('loadgo', data)
    $image.loadgo('setprogress', 25)
    expect(getOverlay()[0].style.height).toBe('150px')
    expect(getOverlay()[0].style.top).toBe('50px')
  })
})

describe('jQuery - setprogress: boundary values', () => {
  it('setprogress(0) stores 0', () => {
    $image.loadgo()
    $image.loadgo('setprogress', 0)
    expect($image.loadgo('getprogress')).toBe(0)
  })

  it('setprogress(100) stores 100', () => {
    $image.loadgo()
    $image.loadgo('setprogress', 100)
    expect($image.loadgo('getprogress')).toBe(100)
  })

  it('setprogress(0) sets overlay width to full width', () => {
    $image.loadgo({ animated: false })
    const data = $image.data('loadgo')
    data.width = 100
    $image.data('loadgo', data)
    $image.loadgo('setprogress', 0)
    expect(getOverlay()[0].style.width).toBe('100px')
  })

  it('setprogress(100) sets overlay width to 0', () => {
    $image.loadgo({ animated: false })
    const data = $image.data('loadgo')
    data.width = 100
    $image.data('loadgo', data)
    $image.loadgo('setprogress', 100)
    expect(getOverlay()[0].style.width).toBe('0px')
  })
})

describe('jQuery - loop restart after stop', () => {
  it('loop() can be called again after stop() without error', () => {
    $image.loadgo()
    $image.loadgo('loop', 1000)
    $image.loadgo('stop')
    expect(() => {
      $image.loadgo('loop', 1000)
      $image.loadgo('stop')
    }).not.toThrow()
  })
})

describe('jQuery - onProgress during loop', () => {
  it('onProgress is called on each loop tick', () => {
    vi.useFakeTimers()
    try {
      let callCount = 0
      $image.loadgo({ onProgress: () => callCount++ })
      $image.loadgo('loop', 100)
      vi.advanceTimersByTime(350) // fires at 100ms, 200ms, 300ms → 3 ticks
      $image.loadgo('stop')
      expect(callCount).toBeGreaterThanOrEqual(3)
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('jQuery - destroy/init lifecycle', () => {
  it('destroy then re-init resets progress and restores DOM structure', () => {
    $image.loadgo()
    $image.loadgo('setprogress', 75)
    $image.loadgo('destroy')
    $image.loadgo()
    expect($image.loadgo('getprogress')).toBe(0)
    expect($image.parent().hasClass('loadgo-container')).toBe(true)
    expect($image.siblings('.loadgo-overlay').length).toBe(1)
  })

  it('custom resize listener from before destroy is not called after re-init', () => {
    let count = 0
    $image.loadgo({ resize: () => count++ })
    $(window).trigger('resize')
    expect(count).toBe(1)
    $image.loadgo('destroy')
    $image.loadgo() // fresh init without custom resize
    $(window).trigger('resize')
    expect(count).toBe(1) // original custom resize not re-attached
  })
})

describe('jQuery - Multiple elements', () => {
  it('setprogress on one element does not affect another', () => {
    const $image2 = $('<img id="id-logo-2" />')
    $('body').append($image2)
    $image.loadgo()
    $image2.loadgo()
    $image.loadgo('setprogress', 60)
    expect($image2.loadgo('getprogress')).toBe(0)
    $image2.loadgo('destroy')
  })
})

describe('jQuery - options() before init()', () => {
  it('options() called before init() throws because internal data is not set', () => {
    const $fresh = $('<img id="fresh-img" />')
    $('body').append($fresh)
    expect(() => $fresh.loadgo('options')).toThrow()
    $fresh.remove()
  })
})

describe('jQuery - Unknown method', () => {
  it('throws for an unknown method name', () => {
    $image.loadgo()
    expect(() => $image.loadgo('unknownMethod')).toThrow(/does not exist/)
  })
})

describe('jQuery - Multiple img selector', () => {
  it('throws if selector matches multiple img elements', () => {
    const $img2 = $('<img id="img-b" />')
    $('body').append($img2)
    expect(() => $('img').loadgo()).toThrow()
    $img2.remove()
  })
})

describe('jQuery - Filter init CSS', () => {
  it('hue-rotate filter sets hue-rotate(360deg) on image', () => {
    $image.loadgo({ filter: 'hue-rotate' })
    expect($image[0].style.filter).toBe('hue-rotate(360deg)')
  })

  it('opacity filter sets opacity(0) on image', () => {
    $image.loadgo({ filter: 'opacity' })
    expect($image[0].style.filter).toBe('opacity(0)')
  })

  it('grayscale filter sets grayscale(1) on image', () => {
    $image.loadgo({ filter: 'grayscale' })
    expect($image[0].style.filter).toBe('grayscale(1)')
  })

  it('filter with animated: true sets transition on image', () => {
    $image.loadgo({ filter: 'blur', animated: true })
    expect($image[0].style.transition).toContain('filter')
  })
})

describe('jQuery - setprogress in filter mode', () => {
  it('hue-rotate at 50% sets hue-rotate(180deg)', () => {
    $image.loadgo({ filter: 'hue-rotate' })
    $image.loadgo('setprogress', 50)
    expect($image[0].style.filter).toBe('hue-rotate(180deg)')
  })

  it('opacity at 50% sets opacity(0.5)', () => {
    $image.loadgo({ filter: 'opacity' })
    $image.loadgo('setprogress', 50)
    expect($image[0].style.filter).toBe('opacity(0.5)')
  })

  it('grayscale at 50% sets grayscale(0.5)', () => {
    $image.loadgo({ filter: 'grayscale' })
    $image.loadgo('setprogress', 50)
    expect($image[0].style.filter).toBe('grayscale(0.5)')
  })
})

describe('jQuery - setprogress: direction rl', () => {
  it('setprogress with direction rl stores progress', () => {
    $image.loadgo({ direction: 'rl' })
    $image.loadgo('setprogress', 50)
    expect($image.loadgo('getprogress')).toBe(50)
  })

  it('setprogress with direction rl sets overlay width proportionally', () => {
    $image.loadgo({ direction: 'rl', animated: false })
    const data = $image.data('loadgo')
    data.width = 100
    $image.data('loadgo', data)
    $image.loadgo('setprogress', 25)
    expect(getOverlay()[0].style.width).toBe('75px')
  })
})

describe('jQuery - image option background position', () => {
  it('image + lr direction uses 100% 0% background-position', () => {
    $image.loadgo({ image: 'logo.png', direction: 'lr' })
    expect(getOverlay()[0].style.backgroundPosition).toBe('100% 0%')
  })

  it('image + rl direction uses 0% 50% background-position', () => {
    $image.loadgo({ image: 'logo.png', direction: 'rl' })
    expect(getOverlay()[0].style.backgroundPosition).toBe('0% 50%')
  })

  it('image + bt direction uses 100% 0% background-position', () => {
    $image.loadgo({ image: 'logo.png', direction: 'bt' })
    expect(getOverlay()[0].style.backgroundPosition).toBe('100% 0%')
  })

  it('image + tb direction uses 0% 100% background-position', () => {
    $image.loadgo({ image: 'logo.png', direction: 'tb' })
    expect(getOverlay()[0].style.backgroundPosition).toBe('0% 100%')
  })
})

describe('jQuery - loop/stop edge cases', () => {
  it('loop() on uninitialized element does not throw', () => {
    expect(() => $image.loadgo('loop', 1000)).not.toThrow()
  })

  it('loop() while already looping does not throw', () => {
    $image.loadgo()
    $image.loadgo('loop', 1000)
    expect(() => $image.loadgo('loop', 1000)).not.toThrow()
    $image.loadgo('stop')
  })

  it('stop() on uninitialized element does not throw', () => {
    expect(() => $image.loadgo('stop')).not.toThrow()
  })

  it('destroy() while looping stops the interval', () => {
    vi.useFakeTimers()
    try {
      let callCount = 0
      $image.loadgo({ onProgress: () => callCount++ })
      $image.loadgo('loop', 100)
      vi.advanceTimersByTime(300)
      const countBeforeDestroy = callCount
      $image.loadgo('destroy')
      vi.advanceTimersByTime(300)
      expect(callCount).toBe(countBeforeDestroy)
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('jQuery - Custom events: loadgo:init', () => {
  it('fires on init()', () => {
    const { events, off } = captureEvent($image[0], 'loadgo:init')
    $image.loadgo()
    off()
    expect(events.length).toBe(1)
  })

  it('fires again on re-init', () => {
    $image.loadgo()
    const { events, off } = captureEvent($image[0], 'loadgo:init')
    $image.loadgo()
    off()
    expect(events.length).toBe(1)
  })
})

describe('jQuery - Custom events: loadgo:error', () => {
  it('fires when element is not an img', () => {
    const div = document.createElement('div')
    div.id = 'not-img-error'
    document.body.appendChild(div)
    const { events, off } = captureEvent(div, 'loadgo:error')
    try {
      $(div).loadgo()
      // eslint-disable-next-line no-unused-vars
    } catch (_) {
      //
    }
    off()
    expect(events.length).toBe(1)
    expect(events[0].detail.message).toMatch(/img/)
  })

  it('fires on loop() when element is not initialized', () => {
    const { events, off } = captureEvent($image[0], 'loadgo:error')
    $image.loadgo('loop', 1000)
    off()
    expect(events.length).toBe(1)
  })

  it('fires on loop() when already looping', () => {
    $image.loadgo()
    $image.loadgo('loop', 1000)
    const { events, off } = captureEvent($image[0], 'loadgo:error')
    $image.loadgo('loop', 1000)
    off()
    $image.loadgo('stop')
    expect(events.length).toBe(1)
  })

  it('fires on stop() when element is not initialized', () => {
    const { events, off } = captureEvent($image[0], 'loadgo:error')
    $image.loadgo('stop')
    off()
    expect(events.length).toBe(1)
  })

  it('fires on setprogress() when element is not initialized', () => {
    const { events, off } = captureEvent($image[0], 'loadgo:error')
    $image.loadgo('setprogress', 50)
    off()
    expect(events.length).toBe(1)
    expect(events[0].detail.message).toMatch(/set progress/)
  })

  it('fires on resetprogress() when element is not initialized', () => {
    const { events, off } = captureEvent($image[0], 'loadgo:error')
    $image.loadgo('resetprogress')
    off()
    expect(events.length).toBe(1)
    expect(events[0].detail.message).toMatch(/reset progress/)
  })

  it('does not fire loadgo:reset when element is not initialized', () => {
    const { events, off } = captureEvent($image[0], 'loadgo:reset')
    $image.loadgo('resetprogress')
    off()
    expect(events.length).toBe(0)
  })
})

describe('jQuery - Custom events: loadgo:options', () => {
  it('fires when options() is called as a setter after init', () => {
    $image.loadgo()
    const { events, off } = captureEvent($image[0], 'loadgo:options')
    $image.loadgo('options', { bgcolor: '#FF0000' })
    off()
    expect(events.length).toBe(1)
  })

  it('detail contains the merged options', () => {
    $image.loadgo()
    const { events, off } = captureEvent($image[0], 'loadgo:options')
    $image.loadgo('options', { bgcolor: '#FF0000' })
    off()
    expect(events[0].detail.bgcolor).toBe('#FF0000')
  })

  it('does not fire during init()', () => {
    const { events, off } = captureEvent($image[0], 'loadgo:options')
    $image.loadgo()
    off()
    expect(events.length).toBe(0)
  })

  it('does not fire when options() is used as a getter', () => {
    $image.loadgo()
    const { events, off } = captureEvent($image[0], 'loadgo:options')
    $image.loadgo('options')
    off()
    expect(events.length).toBe(0)
  })
})

describe('jQuery - Custom events: loadgo:progress', () => {
  it('fires on setprogress() with correct detail', () => {
    $image.loadgo()
    const { events, off } = captureEvent($image[0], 'loadgo:progress')
    $image.loadgo('setprogress', 50)
    off()
    expect(events.length).toBe(1)
    expect(events[0].detail.progress).toBe(50)
  })

  it('does not fire on resetprogress()', () => {
    $image.loadgo()
    $image.loadgo('setprogress', 50)
    const { events, off } = captureEvent($image[0], 'loadgo:progress')
    $image.loadgo('resetprogress')
    off()
    expect(events.length).toBe(0)
  })

  it('does not fire on stop()', () => {
    $image.loadgo()
    $image.loadgo('loop', 1000)
    const { events, off } = captureEvent($image[0], 'loadgo:progress')
    $image.loadgo('stop')
    off()
    expect(events.length).toBe(0)
  })
})

describe('jQuery - Custom events: loadgo:complete', () => {
  it('fires when setprogress reaches 100 outside a loop', () => {
    $image.loadgo()
    const { events, off } = captureEvent($image[0], 'loadgo:complete')
    $image.loadgo('setprogress', 100)
    off()
    expect(events.length).toBe(1)
    expect(events[0].detail.progress).toBe(100)
  })

  it('does not fire for values below 100', () => {
    $image.loadgo()
    const { events, off } = captureEvent($image[0], 'loadgo:complete')
    $image.loadgo('setprogress', 99)
    off()
    expect(events.length).toBe(0)
  })

  it('does not fire when progress reaches 100 inside a loop', () => {
    vi.useFakeTimers()
    try {
      $image.loadgo()
      const { events, off } = captureEvent($image[0], 'loadgo:complete')
      $image.loadgo('loop', 1)
      vi.advanceTimersByTime(105) // enough ticks to pass 100
      off()
      $image.loadgo('stop')
      expect(events.length).toBe(0)
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('jQuery - Custom events: loadgo:reset', () => {
  it('fires on resetprogress() with progress 0', () => {
    $image.loadgo()
    $image.loadgo('setprogress', 50)
    const { events, off } = captureEvent($image[0], 'loadgo:reset')
    $image.loadgo('resetprogress')
    off()
    expect(events.length).toBe(1)
    expect(events[0].detail.progress).toBe(0)
  })
})

describe('jQuery - Custom events: loadgo:start', () => {
  it('fires on loop()', () => {
    $image.loadgo()
    const { events, off } = captureEvent($image[0], 'loadgo:start')
    $image.loadgo('loop', 1000)
    off()
    $image.loadgo('stop')
    expect(events.length).toBe(1)
  })
})

describe('jQuery - Custom events: loadgo:cycle', () => {
  it('fires when the loop completes one full back-and-forth', () => {
    vi.useFakeTimers()
    try {
      $image.loadgo()
      const { events, off } = captureEvent($image[0], 'loadgo:cycle')
      $image.loadgo('loop', 1)
      vi.advanceTimersByTime(200) // 100 ticks up + 100 ticks down
      off()
      $image.loadgo('stop')
      expect(events.length).toBe(1)
    } finally {
      vi.useRealTimers()
    }
  })

  it('fires multiple times across multiple cycles', () => {
    vi.useFakeTimers()
    try {
      $image.loadgo()
      const { events, off } = captureEvent($image[0], 'loadgo:cycle')
      $image.loadgo('loop', 1)
      vi.advanceTimersByTime(400) // ~2 full cycles
      off()
      $image.loadgo('stop')
      expect(events.length).toBe(2)
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('jQuery - Custom events: loadgo:stop', () => {
  it('fires on stop() with progress 100', () => {
    $image.loadgo()
    $image.loadgo('loop', 1000)
    const { events, off } = captureEvent($image[0], 'loadgo:stop')
    $image.loadgo('stop')
    off()
    expect(events.length).toBe(1)
    expect(events[0].detail.progress).toBe(100)
  })
})

describe('jQuery - Custom events: loadgo:destroy', () => {
  it('fires on destroy()', () => {
    $image.loadgo()
    const { events, off } = captureEvent($image[0], 'loadgo:destroy')
    $image.loadgo('destroy')
    off()
    expect(events.length).toBe(1)
  })
})

describe('jQuery - autoStop option', () => {
  it('calls stop() automatically when setprogress reaches 100', () => {
    $image.loadgo({ autoStop: true })
    const { events, off } = captureEvent($image[0], 'loadgo:stop')
    $image.loadgo('setprogress', 100)
    off()
    expect(events.length).toBe(1)
    expect(events[0].detail.progress).toBe(100)
  })

  it('does not call stop() when progress is below 100', () => {
    $image.loadgo({ autoStop: true })
    const { events, off } = captureEvent($image[0], 'loadgo:stop')
    $image.loadgo('setprogress', 99)
    off()
    expect(events.length).toBe(0)
  })

  it('does not call stop() when looping, even if progress hits 100', () => {
    vi.useFakeTimers()
    try {
      $image.loadgo({ autoStop: true })
      const { events, off } = captureEvent($image[0], 'loadgo:stop')
      $image.loadgo('loop', 1)
      vi.advanceTimersByTime(105) // enough ticks to pass 100
      $image.loadgo('stop')
      off()
      expect(events.length).toBe(1) // only from the explicit stop() call
    } finally {
      vi.useRealTimers()
    }
  })

  it('fires loadgo:complete before loadgo:stop when autoStop triggers', () => {
    $image.loadgo({ autoStop: true })
    const order = []
    $image[0].addEventListener('loadgo:complete', () => order.push('complete'))
    $image[0].addEventListener('loadgo:stop', () => order.push('stop'))
    $image.loadgo('setprogress', 100)
    expect(order).toEqual(['complete', 'stop'])
  })

  it('does not call stop() when autoStop is false (default)', () => {
    $image.loadgo()
    const { events, off } = captureEvent($image[0], 'loadgo:stop')
    $image.loadgo('setprogress', 100)
    off()
    expect(events.length).toBe(0)
  })
})

describe('jQuery - Custom events: bubbling', () => {
  it('events bubble up to the parent element', () => {
    $image.loadgo()
    const { events, off } = captureEvent($container[0], 'loadgo:progress')
    $image.loadgo('setprogress', 40)
    off()
    expect(events.length).toBe(1)
  })
})
