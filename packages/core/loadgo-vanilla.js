/*!
 * LoadGo v3.2.0 (https://github.com/franverona/loadgo)
 * 2026 - Fran Verona
 * Licensed under MIT (https://github.com/franverona/loadgo/blob/master/LICENSE)
 */

;(function () {
  // Combine obj2 with obj1. If properties are equal, obj2 wins.
  const extend = (obj1, obj2) => {
    if (typeof obj1 === 'undefined') return Object.assign({}, obj2)
    if (typeof obj2 === 'undefined') return Object.assign({}, obj1)
    return Object.assign({}, obj1, obj2)
  }

  // Get Loadgo properties for element
  const getProperties = (elementId) => {
    const entry = domElements.find((el) => el.id === elementId)
    return entry ? entry.properties : null
  }

  // Get array index on domElements array
  const getIndex = (elementId) => domElements.findIndex((el) => el.id === elementId)

  // Returns true if element is valid; false otherwise
  const elementIsValid = (element) => {
    if (typeof element === 'undefined' || element === null) {
      return false
    }

    if (!(element instanceof HTMLElement)) {
      const message = 'LoadGo only works on one element at a time. Try with a valid #id.'
      if (element instanceof EventTarget) {
        dispatchCustomEvent(element, 'error', { message })
      }
      throw new Error(message)
    }

    if (element.nodeName !== 'IMG') {
      const message = 'LoadGo only works on img elements.'
      if (element instanceof EventTarget) {
        dispatchCustomEvent(element, 'error', { message })
      }
      throw new Error(message)
    }

    return true
  }

  // Parse padding and margin properties to return a valid number (uses computed styles)
  const parseOffset = (element, property) => {
    const measure = getComputedStyle(element)[property]
    return parseFloat(measure) || 0
  }

  const CUSTOM_EVENTS = {
    complete: 'loadgo:complete',
    cycle: 'loadgo:cycle',
    destroy: 'loadgo:destroy',
    error: 'loadgo:error',
    init: 'loadgo:init',
    options: 'loadgo:options',
    progress: 'loadgo:progress',
    reset: 'loadgo:reset',
    start: 'loadgo:start',
    stop: 'loadgo:stop',
  }

  const dispatchCustomEvent = (element, type, detail) => {
    const eventType = CUSTOM_EVENTS[type] ?? null
    if (!eventType) {
      throw new Error(`Unable to dispatch unknown event type: ${type}`)
    }

    element.dispatchEvent(new CustomEvent(eventType, { detail, bubbles: true }))
  }

  const _setprogress = function (element, progress, shouldEmit = true) {
    if (!elementIsValid(element)) {
      return
    }

    // LoadGo expects progress number between 0 (0%) and 100 (100%).
    if (progress < 0 || progress > 100) {
      return
    }

    // Element exists?
    const domElementsIndex = getIndex(element.id)
    if (domElementsIndex === -1) {
      dispatchCustomEvent(element, 'error', {
        message:
          'Trying to set progress on a non initialized element. You have to run "init" method first.',
      })
      return
    }

    const data = getProperties(element.id)

    if (data !== null) {
      const overlay = document.getElementById(data.overlay)
      const w = data.width
      const h = data.height

      if (overlay) {
        const direction = data.direction
        if (direction === 'lr') {
          // Left to right animation
          overlay.style.width = `${w * (1 - progress / 100)}px`
        } else if (direction === 'rl') {
          // Right to left animation
          overlay.style.width = `${w * (1 - progress / 100)}px`
        } else if (direction === 'bt') {
          // Bottom to top animation
          overlay.style.height = `${h * (1 - progress / 100)}px`
        } else if (direction === 'tb') {
          // Top to bottom animation
          const _h = h * (1 - progress / 100)
          overlay.style.height = `${_h}px`
          overlay.style.top = `${h - _h}px`
        }
        overlay.setAttribute('aria-valuenow', progress)
      } else {
        element.setAttribute('aria-valuenow', progress)
        const filter = data.filter
        let p
        switch (filter) {
          case 'blur':
            p = (100 - progress) / 10 // maps 0–100% progress to 10px–0px blur radius
            element.style.filter = `${filter}(${p}px)`
            break
          case 'hue-rotate':
            p = (progress * 360) / 100
            element.style.filter = `${filter}(${p}deg)`
            break
          case 'opacity':
            p = progress / 100
            element.style.filter = `${filter}(${p})`
            break
          default:
            p = 1 - progress / 100
            element.style.filter = `${filter}(${p})`
        }
      }
    }

    domElements[domElementsIndex].properties.progress = progress

    const onProgress = getProperties(element.id)?.onProgress
    if (typeof onProgress === 'function') {
      onProgress(progress)
    }

    if (shouldEmit) {
      dispatchCustomEvent(element, 'progress', { progress })
      // Only fire complete if it hits 100 AND we aren't currently looping
      if (progress === 100 && (!data || !data.interval)) {
        dispatchCustomEvent(element, 'complete', { progress: 100 })
        if (data.autoStop) {
          Loadgo.stop(element)
        }
      }
    }
  }

  let _idCounter = 0
  const uniqueId = () => `loadgo-${++_idCounter}`

  // Array to store all Loadgo elements
  const domElements = []

  // Loadgo default options
  const defaultOptions = {
    bgcolor: '#FFFFFF', //  Overlay color
    opacity: 0.5, //  Overlay opacity
    animated: true, //  Overlay smooth animation when setting progress
    image: null, //  Overlay image
    class: null, //  Overlay CSS class
    resize: null, //  Resize functions (optional)
    direction: 'lr', //  Direction animation (optional)
    filter: null, //  Image filter (optional)
    onProgress: null, //  Callback fired on every setprogress call
    ariaLabel: 'Loading', //  Value for aria-label on the progressbar
    animationDuration: 0.6, //  CSS transition duration in seconds
    animationEasing: 'ease', //  CSS transition easing function
    autoStop: false, // calls `stop()` when `setprogress(100)` is reached
  }

  const Loadgo = window.Loadgo || {}

  /**
   * Initialise LoadGo on an `<img>` element.
   * @param  {HTMLImageElement} element  DOM element using document.getElementById
   * @param  {object} [userOptions]  Loadgo options
   * @fires loadgo:init
   * @fires loadgo:error
   */
  Loadgo.init = function (element, userOptions) {
    if (!elementIsValid(element)) {
      return
    }

    // Assign a generated id to elements that have none, to prevent empty-string key collisions
    if (!element.id) {
      element.id = uniqueId()
    }

    // If already initialized, destroy first to prevent nested containers and listener leaks
    if (getIndex(element.id) !== -1) {
      Loadgo.destroy(element)
    }

    domElements.push({
      id: element.id,
      properties: {},
    })
    const domElementsIndex = domElements.length - 1

    const pluginOptions = Loadgo.options(element, userOptions)

    const overlay = document.createElement('div')
    overlay.id = uniqueId() // We need to set a unique id so we can retrieve it later when needed

    // Overlay classes
    const overlayClasses = ['loadgo-overlay']
    if (pluginOptions['class']) {
      overlayClasses.push(pluginOptions['class'])
    }
    overlay.className = overlayClasses.join(' ')

    // Overlay background color
    overlay.style.backgroundColor = pluginOptions.bgcolor

    // Overlay opacity
    overlay.style.opacity = pluginOptions.opacity

    // Overlay width
    const gbc = element.getBoundingClientRect()
    if (gbc.width) {
      overlay.style.width = `${gbc.width}px` // for modern browsers
    } else {
      overlay.style.width = `${element.offsetWidth}px` // for oldIE
    }

    // Overlay height
    if (gbc.height) {
      overlay.style.height = `${gbc.height}px` // for modern browsers
    } else {
      overlay.style.height = `${element.offsetHeight}px` // for oldIE
    }

    // Overlay will be positioned absolute
    overlay.style.position = 'absolute'

    // CSS animation
    if (pluginOptions.animated) {
      const d = pluginOptions.animationDuration
      const e = pluginOptions.animationEasing
      overlay.style.transition = `width ${d}s ${e}, height ${d}s ${e}, top ${d}s ${e}`
    }

    // ARIA progressbar attributes — set on the overlay in normal mode, or on the image in filter mode
    const ariaTarget = pluginOptions.filter ? element : overlay
    ariaTarget.setAttribute('role', 'progressbar')
    ariaTarget.setAttribute('aria-valuemin', '0')
    ariaTarget.setAttribute('aria-valuemax', '100')
    ariaTarget.setAttribute('aria-valuenow', '0')
    ariaTarget.setAttribute('aria-label', pluginOptions.ariaLabel)

    // Filters
    if (pluginOptions.filter) {
      if (pluginOptions.filter === 'blur') {
        element.style.filter = `${pluginOptions.filter}(10px)`
      } else if (pluginOptions.filter === 'hue-rotate') {
        element.style.filter = `${pluginOptions.filter}(360deg)`
      } else if (pluginOptions.filter === 'opacity') {
        element.style.filter = `${pluginOptions.filter}(0)`
      } else {
        element.style.filter = `${pluginOptions.filter}(1)`
      }

      if (pluginOptions.animated) {
        element.style.transition = `${pluginOptions.animationDuration}s filter ${pluginOptions.animationEasing}`
      }
    }

    // Background image
    if (pluginOptions.image) {
      let bgposition = '100% 0%' // Left to right animation by default
      if (pluginOptions.direction === 'rl') {
        bgposition = '0% 50%' // Right to left animation
      } else if (pluginOptions.direction === 'bt') {
        bgposition = '100% 0%' // Bottom to top animation
      } else if (pluginOptions.direction === 'tb') {
        bgposition = '0% 100%' // Top to bottom animation
      }

      overlay.style.backgroundImage = `url("${pluginOptions.image}")`
      overlay.style.backgroundRepeat = 'no-repeat'
      overlay.style.backgroundSize = 'cover'
      overlay.style.backgroundColor = 'transparent'
      overlay.style.backgroundPosition = bgposition
    }

    const pluginData = {
      progress: 0,
    }

    // Insert overlay only if "filter" option is not provided. If user sets a filter, it can be applied directly to the image logo
    if (pluginOptions.filter === null) {
      // The DOM tree will look like this:
      // <div class="loadgo-container"><element />><overlay /></div>

      // Simulates a jQuery 'wrapAll' behaviour in pure JS
      const container = document.createElement('div')
      container.className = 'loadgo-container'
      container.style.position = 'relative'
      element.before(container)
      container.appendChild(element)

      container.appendChild(overlay)

      // We need to add margins and paddings to set the overlay exactly above our image
      const pl = parseOffset(element, 'paddingLeft')
      const pr = parseOffset(element, 'paddingRight')
      const pt = parseOffset(element, 'paddingTop')
      const pb = parseOffset(element, 'paddingBottom')
      const ml = parseOffset(element, 'marginLeft')
      const mr = parseOffset(element, 'marginRight')
      const mt = parseOffset(element, 'marginTop')
      const mb = parseOffset(element, 'marginBottom')

      if (pluginOptions.direction === 'lr') {
        // Left to right animation
        overlay.style.right = `${pr + mr}px`
        overlay.style.top = `${pt + mt}px`
      } else if (pluginOptions.direction === 'rl') {
        // Right to left animation
        overlay.style.left = `${pl + ml}px`
        overlay.style.top = `${pt + mt}px`
      } else if (pluginOptions.direction === 'bt') {
        // Bottom to top animation
        overlay.style.top = `${pt + mt}px`
        overlay.style.left = `${pl + ml}px`
      } else if (pluginOptions.direction === 'tb') {
        // Top to bottom animation
        overlay.style.bottom = `${pb + mb}px`
        overlay.style.left = `${pl + ml}px`
      }

      // Saves overlay element + overlay current dimensions
      pluginData.overlay = overlay.id
      pluginData.width = overlay.clientWidth
      pluginData.height = overlay.clientHeight
    }

    // Store overlay + progress into element properties
    domElements[domElementsIndex].properties = extend(pluginOptions, pluginData)

    // Resize event
    let resizeFunction
    if (pluginOptions.resize) {
      resizeFunction = pluginOptions.resize
    } else {
      let resizeTimer
      let rafPending = false
      resizeFunction = () => {
        if (rafPending) return
        rafPending = true
        requestAnimationFrame(() => {
          rafPending = false
          const data = getProperties(element.id)
          const elementIndex = getIndex(element.id)
          if (data !== null) {
            const resizeOverlay = document.getElementById(data.overlay)
            const resizeGbc = element.getBoundingClientRect()

            if (resizeOverlay) {
              // Disable transition while resizing to avoid janky animations
              if (pluginOptions.animated) {
                resizeOverlay.style.transition = ''
              }

              // Overlay width
              if (resizeGbc.width) {
                resizeOverlay.style.width = `${resizeGbc.width}px` // for modern browsers
              } else {
                resizeOverlay.style.width = `${element.offsetWidth}px` // for oldIE
              }

              // Overlay height
              if (resizeGbc.height) {
                resizeOverlay.style.height = `${resizeGbc.height}px` // for modern browsers
              } else {
                resizeOverlay.style.height = `${element.offsetHeight}px` // for oldIE
              }

              // We need to add margins and paddings to set the overlay exactly above our image
              const pl = parseOffset(element, 'paddingLeft')
              const pr = parseOffset(element, 'paddingRight')
              const pt = parseOffset(element, 'paddingTop')
              const pb = parseOffset(element, 'paddingBottom')
              const ml = parseOffset(element, 'marginLeft')
              const mr = parseOffset(element, 'marginRight')
              const mt = parseOffset(element, 'marginTop')
              const mb = parseOffset(element, 'marginBottom')

              if (pluginOptions.direction === 'lr') {
                // Left to right animation
                resizeOverlay.style.right = `${pr + mr}px`
                resizeOverlay.style.top = `${pt + mt}px`
              } else if (pluginOptions.direction === 'rl') {
                // Right to left animation
                resizeOverlay.style.left = `${pl + ml}px`
                resizeOverlay.style.top = `${pt + mt}px`
              } else if (pluginOptions.direction === 'bt') {
                // Bottom to top animation
                resizeOverlay.style.top = `${pt + mt}px`
                resizeOverlay.style.left = `${pl + ml}px`
              } else if (pluginOptions.direction === 'tb') {
                // Top to bottom animation
                resizeOverlay.style.bottom = `${pb + mb}px`
                resizeOverlay.style.left = `${pl + ml}px`
              }

              // Saves overlay element + overlay current dimensions
              domElements[elementIndex].properties.width = parseFloat(resizeOverlay.style.width)
              domElements[elementIndex].properties.height = parseFloat(resizeOverlay.style.height)

              _setprogress(element, data.progress, false)

              // Re-enable transition once resizing stops
              if (pluginOptions.animated) {
                clearTimeout(resizeTimer)
                resizeTimer = setTimeout(() => {
                  const d = pluginOptions.animationDuration
                  const e = pluginOptions.animationEasing
                  resizeOverlay.style.transition = `width ${d}s ${e}, height ${d}s ${e}, top ${d}s ${e}`
                }, 150)
              }
            }
          }
        })
      }
    }

    window.addEventListener('resize', resizeFunction)
    domElements[domElementsIndex].properties.resizeFunction = resizeFunction

    dispatchCustomEvent(element, 'init')
  }

  /**
   * Get or set options for an already-initialised element.
   * @param  {DOM} element  DOM element using document.getElementById
   * @param  {object} [userOptions]  Loadgo options to update. Omit to use as getter.
   * @fires loadgo:options - Only fired when called as a setter after init.
   */
  Loadgo.options = function (element, userOptions) {
    if (!elementIsValid(element)) {
      return
    }

    // Store Loadgo properties
    const domElementsIndex = getIndex(element.id)
    if (domElementsIndex === -1) {
      return
    }

    let currentOptions = domElements[domElementsIndex].properties

    // Parse to number the 'opacity' option if provided
    if (typeof userOptions !== 'undefined' && typeof userOptions.opacity !== 'undefined') {
      userOptions.opacity = parseFloat(userOptions.opacity)
    }

    const isUpdate = Object.keys(currentOptions).length > 0 && typeof userOptions !== 'undefined'

    if (Object.keys(currentOptions).length === 0) {
      // First-time init: apply defaults then overlay user options
      currentOptions = extend(defaultOptions, userOptions)
    } else if (typeof userOptions === 'undefined') {
      // Getter: no options provided, return current options as-is
      return currentOptions
    } else {
      // Update: merge new options into existing
      currentOptions = extend(currentOptions, userOptions)
    }

    // Check for valid direction
    const validDirections = ['lr', 'rl', 'bt', 'tb']
    if (!validDirections.includes(currentOptions.direction.toLowerCase())) {
      // Invalid value for "direction" option. Possible values: blur, grayscale, sepia, hue-rotate, invert, opacity. Using default value: "lr".
      currentOptions.direction = 'lr'
    }

    // Check for valid filter
    if (currentOptions.filter) {
      const validFilters = ['blur', 'grayscale', 'sepia', 'hue-rotate', 'invert', 'opacity']
      if (!validFilters.includes(currentOptions.filter.toLowerCase())) {
        // Invalid value for "filter" option. Possible values: blur, grayscale, sepia, hue-rotate, invert, opacity. This option will be ignored.
        currentOptions.filter = null
      }
    }

    // Store user options with default options
    domElements[domElementsIndex].properties = currentOptions

    if (isUpdate) {
      dispatchCustomEvent(element, 'options', { ...currentOptions })
    }

    return currentOptions
  }

  /**
   * Set progress (0–100).
   * @param  {HTMLImageElement} element  DOM element using document.getElementById
   * @param  {number} progress  Progress value (between 0 and 100)
   * @fires loadgo:progress
   * @fires loadgo:complete - Only fired when progress reaches 100% outside of a loop.
   */
  Loadgo.setprogress = function (element, progress) {
    _setprogress(element, progress, true)
  }

  /**
   * Return the current progress value.
   * @param  {HTMLImageElement} element  DOM element using document.getElementById
   */
  Loadgo.getprogress = (element) => {
    if (!elementIsValid(element)) {
      return 0
    }

    const properties = getProperties(element.id)
    return properties !== null ? properties.progress : 0
  }

  /**
   * Reset progress back to 0.
   * @param  {HTMLImageElement} element  DOM element using document.getElementById
   * @fires loadgo:reset
   * @fires loadgo:error
   */
  Loadgo.resetprogress = (element) => {
    if (getIndex(element.id) === -1) {
      dispatchCustomEvent(element, 'error', {
        message:
          'Trying to reset progress on a non initialized element. You have to run "init" method first.',
      })
      return
    }
    _setprogress(element, 0, false)
    dispatchCustomEvent(element, 'reset', { progress: 0 })
  }

  /**
   * Start an indefinite back-and-forth animation loop.
   * @param  {HTMLImageElement} element  DOM element using document.getElementById
   * @param  {number} duration  Interval duration in ms
   * @fires loadgo:start
   * @fires loadgo:cycle - Fired each time the loop completes one full back-and-forth.
   * @fires loadgo:error
   */
  Loadgo.loop = function (element, duration) {
    if (!elementIsValid(element)) {
      return
    }

    if (getIndex(element.id) === -1) {
      const message =
        'Trying to loop a non initialized element. You have to run "init" method first.'
      dispatchCustomEvent(element, 'error', { message })
      console.error(message)
      return
    }

    const data = getProperties(element.id)
    if (data === null) {
      const message = 'Element do not have Loadgo properties.'
      dispatchCustomEvent(element, 'error', { message })
      console.error(message)
      return
    }

    if (data.interval) {
      const message = 'LoadGo requires you to stop the current loop before modifying it.'
      dispatchCustomEvent(element, 'error', { message })
      console.error(message)
      return
    }

    dispatchCustomEvent(element, 'start')

    // Store interval so we can stop it later
    let toggle = true
    const domIndex = getIndex(element.id)
    domElements[domIndex].properties.interval = setInterval(() => {
      if (toggle) {
        domElements[domIndex].properties.progress += 1
        if (domElements[domIndex].properties.progress >= 100) {
          toggle = false
        }
      } else {
        domElements[domIndex].properties.progress -= 1
        if (domElements[domIndex].properties.progress <= 0) {
          toggle = true
          dispatchCustomEvent(element, 'cycle')
        }
      }
      // Remove transition animation
      // Can be replaced with animated: false in the initializer
      const loopOverlay = document.getElementById(domElements[domIndex].properties.overlay)
      if (loopOverlay) {
        loopOverlay.style.transition = 'none'
      }

      const progress = domElements[domIndex].properties.progress
      _setprogress(element, progress, true)
    }, duration)
  }

  /**
   * Stop the loop and reveal the full image.
   * @param  {HTMLImageElement} element  DOM element using document.getElementById
   * @fires loadgo:stop
   * @fires loadgo:error
   */
  Loadgo.stop = function (element) {
    if (!elementIsValid(element)) {
      return
    }

    if (getIndex(element.id) === -1) {
      const message =
        'Trying to stop loop for a non initialized element. You have to run "init" method first.'
      dispatchCustomEvent(element, 'error', { message })
      console.error(message)
      return
    }

    const idx = getIndex(element.id)
    clearInterval(domElements[idx].properties.interval)
    domElements[idx].properties.interval = null
    _setprogress(element, 100, false)
    dispatchCustomEvent(element, 'stop', { progress: 100 })
  }

  /**
   * Remove the overlay and restore the original DOM structure.
   * @param  {HTMLImageElement} element  DOM element using document.getElementById
   * @fires loadgo:destroy
   */
  Loadgo.destroy = function (element) {
    const domElementsIndex = getIndex(element.id)
    if (domElementsIndex === -1) {
      return // element was never initialized
    }

    const opt = Loadgo.options(element)
    window.removeEventListener('resize', opt.resizeFunction)
    if (opt.interval) {
      clearInterval(opt.interval)
    }
    domElements.splice(domElementsIndex, 1)

    const loadgoContainer = element.parentNode
    if (loadgoContainer && loadgoContainer.classList.contains('loadgo-container')) {
      const parent = loadgoContainer.parentNode
      const overlay = document.getElementById(opt.overlay)
      if (overlay && overlay.parentNode) {
        overlay.parentNode.removeChild(overlay) // Removes overlay
      }
      if (parent) {
        loadgoContainer.before(element) // Moves image back to its original position
        parent.removeChild(loadgoContainer) // Removes "loadgo-container" element
      }
    } else {
      // Filter mode — ARIA attributes were added directly to the image; clean them up
      element.removeAttribute('role')
      element.removeAttribute('aria-valuemin')
      element.removeAttribute('aria-valuemax')
      element.removeAttribute('aria-valuenow')
      element.removeAttribute('aria-label')
    }

    dispatchCustomEvent(element, 'destroy')
  }

  window.Loadgo = Loadgo
})()
