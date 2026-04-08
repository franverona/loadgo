/*!
 * LoadGo v3.2.0 (https://github.com/franverona/loadgo)
 * 2026 - Fran Verona
 * Licensed under MIT (https://github.com/franverona/loadgo/blob/master/LICENSE)
 */

if (typeof jQuery === 'undefined')
  throw new Error(
    'LoadGo requires jQuery. Make sure you are loading jQuery before LoadGo, or try pure Javascript version instead.',
  )
;(function ($) {
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

  const _setprogress = (element, progress, shouldEmit) => {
    if (progress < 0 || progress > 100) return

    const $element = $(element)
    const rawElement = $element[0]
    const data = $element.data('loadgo')
    if (typeof data === 'undefined') {
      dispatchCustomEvent(rawElement, 'error', {
        message:
          'Trying to set progress on a non initialized element. You have to run "init" method first.',
      })
      return
    }

    const storedData = { progress }
    const pluginOptions = $element.loadgo('options')
    const $overlay = data.overlay
    const $width = data.width
    const $height = data.height
    const direction = pluginOptions.direction

    if ($overlay) {
      let overlayWidth, overlayHeight
      if (direction === 'lr') {
        overlayWidth = $width * (1 - progress / 100)
        $overlay[0].style.width = `${overlayWidth}px`
      } else if (direction === 'rl') {
        overlayWidth = $width * (1 - progress / 100)
        $overlay[0].style.width = `${overlayWidth}px`
      } else if (direction === 'bt') {
        overlayHeight = $height * (1 - progress / 100)
        $overlay[0].style.height = `${overlayHeight}px`
      } else if (direction === 'tb') {
        overlayHeight = $height * (1 - progress / 100)
        $overlay[0].style.height = `${overlayHeight}px`
        $overlay[0].style.top = `${$height - overlayHeight}px`
      }
      $overlay[0].setAttribute('aria-valuenow', progress)
      storedData.overlay = $overlay
    } else {
      rawElement.setAttribute('aria-valuenow', progress)
      const filter = pluginOptions.filter
      let p
      switch (filter) {
        case 'blur':
          p = (100 - progress) / 10
          $element.css({ filter: `${filter}(${p}px)` })
          break
        case 'hue-rotate':
          p = (progress * 360) / 100
          $element.css({ filter: `${filter}(${p}deg)` })
          break
        case 'opacity':
          p = progress / 100
          $element.css({ filter: `${filter}(${p})` })
          break
        default:
          p = 1 - progress / 100
          $element.css({ filter: `${filter}(${p})` })
      }
    }

    $element.data('loadgo', $.extend({}, data, storedData))

    const onProgress = $element.loadgo('options').onProgress
    if (typeof onProgress === 'function') {
      onProgress(progress)
    }

    if (shouldEmit) {
      dispatchCustomEvent(rawElement, 'progress', { progress })
      if (progress === 100 && !data.interval) {
        dispatchCustomEvent(rawElement, 'complete', { progress: 100 })
      }
    }
  }

  const methods = {
    /**
     * Initialise LoadGo on the selected `<img>` element.
     * @param  {object} [userOptions]  Loadgo options
     * @fires loadgo:init
     * @fires loadgo:error
     */
    init: function (userOptions) {
      const $this = $(this)

      if ($this.length === 0) {
        return
      }

      if (!$this.is('img')) {
        const message = 'LoadGo only works on img elements.'
        dispatchCustomEvent($this[0], 'error', { message })
        throw new Error(message)
      }

      if ($this.length > 1) {
        const message = 'LoadGo only works on one element at a time. Try with a valid #id.'
        dispatchCustomEvent($this[0], 'error', { message })
        throw new Error(message)
      }

      // If already initialized, destroy first to prevent nested containers
      if (typeof $this.data('loadgo') !== 'undefined') {
        methods.destroy.call(this)
      }

      // Plugin options. We need to reset options to avoid future errors
      $this.data('loadgo-options', {})

      const pluginOptions = $this.loadgo('options', userOptions)

      const _w = $this[0].getBoundingClientRect().width
      const _h = $this[0].getBoundingClientRect().height

      const overlayTemplate =
        '<div class="loadgo-overlay" style="background-color:%bgcolor%;opacity:%opacity%;width:%width%px;height:%height%px;position:absolute;"></div>'

      const overlayWithOptions = overlayTemplate
        .replace('%bgcolor%', pluginOptions.bgcolor)
        .replace('%opacity%', pluginOptions.opacity)
        .replace('%width%', _w)
        .replace('%height%', _h)

      const $overlay = $(overlayWithOptions)

      if (pluginOptions.animated) {
        const d = pluginOptions.animationDuration
        const e = pluginOptions.animationEasing
        $overlay.css({
          transition: `width ${d}s ${e}, height ${d}s ${e}, top ${d}s ${e}`,
        })
      }

      if (pluginOptions['class']) {
        $overlay.addClass(pluginOptions['class'])
      }

      // ARIA progressbar attributes — set on the overlay in normal mode, or on the image in filter mode
      const $ariaTarget = pluginOptions.filter ? $this : $overlay
      $ariaTarget.attr({
        role: 'progressbar',
        'aria-valuemin': '0',
        'aria-valuemax': '100',
        'aria-valuenow': '0',
        'aria-label': pluginOptions.ariaLabel,
      })

      if (pluginOptions.filter) {
        if (pluginOptions.filter === 'blur') {
          $this.css({ filter: `${pluginOptions.filter}(10px)` })
        } else if (pluginOptions.filter === 'hue-rotate') {
          $this.css({ filter: `${pluginOptions.filter}(360deg)` })
        } else if (pluginOptions.filter === 'opacity') {
          $this.css({ filter: `${pluginOptions.filter}(0)` })
        } else {
          $this.css({ filter: `${pluginOptions.filter}(1)` })
        }

        if (pluginOptions.animated) {
          $this.css({
            transition: `${pluginOptions.animationDuration}s filter ${pluginOptions.animationEasing}`,
          })
        }
      }

      if (pluginOptions.image) {
        let bgposition = '100% 0%' // Left to right animation by default
        if (pluginOptions.direction === 'rl') {
          bgposition = '0% 50%' // Right to left animation
        } else if (pluginOptions.direction === 'bt') {
          bgposition = '100% 0%' // Bottom to top animation
        } else if (pluginOptions.direction === 'tb') {
          bgposition = '0% 100%' // Top to bottom animation
        }

        $overlay.css({
          'background-image': `url("${pluginOptions.image}")`,
          'background-repeat': 'no-repeat',
          'background-size': 'cover',
          'background-color': 'transparent',
          'background-position': bgposition,
        })
      }

      const pluginData = {
        progress: 0,
      }

      // Insert overlay only if "filter" option is not provided. If user sets a filter, it can be applied directly to the image logo
      if (pluginOptions.filter === null) {
        // The DOM tree will look like this:
        // <div class="loadgo-container"><element />><overlay /></div>

        $this.wrapAll('<div class="loadgo-container" style="position: relative"></div>')
        $this.parent().prepend($overlay)

        // We need to add margins and paddings to set the overlay exactly above our image
        const pl = parseFloat($this.css('padding-left'))
        const pr = parseFloat($this.css('padding-right'))
        const pt = parseFloat($this.css('padding-top'))
        const pb = parseFloat($this.css('padding-bottom'))
        const ml = parseFloat($this.css('margin-left'))
        const mr = parseFloat($this.css('margin-right'))
        const mt = parseFloat($this.css('margin-top'))
        const mb = parseFloat($this.css('margin-bottom'))

        if (pluginOptions.direction === 'lr') {
          // Left to right animation
          $overlay.css('right', `${pr + mr}px`)
          $overlay.css('top', `${pt + mt}px`)
        } else if (pluginOptions.direction === 'rl') {
          // Right to left animation
          $overlay.css('left', `${pl + ml}px`)
          $overlay.css('top', `${pt + mt}px`)
        } else if (pluginOptions.direction === 'bt') {
          // Bottom to top animation
          $overlay.css('top', `${pt + mt}px`)
          $overlay.css('left', `${pl + ml}px`)
        } else if (pluginOptions.direction === 'tb') {
          // Top to bottom animation
          $overlay.css('bottom', `${pb + mb}px`)
          $overlay.css('left', `${pl + ml}px`)
        }

        // Saves overlay element + overlay current dimensions
        pluginData.overlay = $overlay
        pluginData.width = $overlay.width()
        pluginData.height = $overlay.height()
      }

      // Resize event
      let resizeHandler
      if (pluginOptions.resize) {
        resizeHandler = pluginOptions.resize
      } else {
        let resizeTimer
        let rafPending = false
        resizeHandler = () => {
          if (rafPending) return
          rafPending = true
          requestAnimationFrame(() => {
            rafPending = false
            const $element = $this
            const data = $element.data('loadgo')

            if (typeof data === 'undefined') {
              return
            }

            const $resizeOverlay = data.overlay
            const progress = data.progress
            const $width = $element.width()
            const $height = $element.height()

            const storedData = {
              progress: data.progress,
              width: $width,
              height: $height,
            }

            if ($resizeOverlay) {
              // Disable transition while resizing to avoid janky animations
              if (pluginOptions.animated) {
                $resizeOverlay.css('transition', '')
              }

              $resizeOverlay.css({
                width: `${$width}px`,
                height: `${$height}px`,
              })

              // We need to add margins and paddings to set the overlay exactly above our image
              const pl = parseFloat($element.css('padding-left'))
              const pr = parseFloat($element.css('padding-right'))
              const pt = parseFloat($element.css('padding-top'))
              const pb = parseFloat($element.css('padding-bottom'))
              const ml = parseFloat($element.css('margin-left'))
              const mr = parseFloat($element.css('margin-right'))
              const mt = parseFloat($element.css('margin-top'))
              const mb = parseFloat($element.css('margin-bottom'))

              if (pluginOptions.direction === 'lr') {
                // Left to right animation
                $resizeOverlay.css('right', `${pr + mr}px`)
                $resizeOverlay.css('top', `${pt + mt}px`)
              } else if (pluginOptions.direction === 'rl') {
                // Right to left animation
                $resizeOverlay.css('left', `${pl + ml}px`)
                $resizeOverlay.css('top', `${pt + mt}px`)
              } else if (pluginOptions.direction === 'bt') {
                // Bottom to top animation
                $resizeOverlay.css('top', `${pt + mt}px`)
                $resizeOverlay.css('left', `${pl + ml}px`)
              } else if (pluginOptions.direction === 'tb') {
                // Top to bottom animation
                $resizeOverlay.css('bottom', `${pb + mb}px`)
                $resizeOverlay.css('left', `${pl + ml}px`)
              }

              storedData.overlay = $resizeOverlay

              // Re-enable transition once resizing stops
              if (pluginOptions.animated) {
                clearTimeout(resizeTimer)
                resizeTimer = setTimeout(() => {
                  const d = pluginOptions.animationDuration
                  const e = pluginOptions.animationEasing
                  $resizeOverlay.css(
                    'transition',
                    `width ${d}s ${e}, height ${d}s ${e}, top ${d}s ${e}`,
                  )
                }, 150)
              }
            }

            $element.data('loadgo', $.extend({}, data, storedData))

            $this.loadgo('setprogress', progress)
          })
        }
      }

      pluginData.resizeFunction = resizeHandler
      $this.data('loadgo', pluginData)
      $(window).on('resize', resizeHandler)

      dispatchCustomEvent($this[0], 'init')
    },

    /**
     * Get or set options for an already-initialised element.
     * @param  {object} [userOptions]  Loadgo options to update. Omit to use as getter.
     * @fires loadgo:options - Only fired when called as a setter after init.
     */
    options: function (userOptions) {
      const $this = $(this)
      let currentOptions = $this.data('loadgo-options')
      const options = typeof userOptions !== 'undefined' ? userOptions : {}
      const defaults = {
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
      }

      // Parse to number the 'opacity' option
      if (typeof options.opacity !== 'undefined') {
        options.opacity = parseFloat(options.opacity)
      }

      const isUpdate = Object.keys(currentOptions).length > 0 && typeof userOptions !== 'undefined'

      if (Object.keys(currentOptions).length === 0) {
        currentOptions = $.extend({}, defaults, options)
      } else {
        currentOptions = $.extend({}, currentOptions, options)
      }

      // Check for valid direction
      const validDirections = ['lr', 'rl', 'bt', 'tb']
      if (
        !currentOptions.direction ||
        !validDirections.includes(currentOptions.direction.toLowerCase())
      ) {
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
      $this.data('loadgo-options', currentOptions)

      if (isUpdate) {
        dispatchCustomEvent($this[0], 'options', { ...currentOptions })
      }

      return currentOptions
    },

    /**
     * Set progress by percentage
     * @param  {number} progress Progress value (between 0 and 100)
     * @fires loadgo:progress
     * @fires loadgo:complete - Only fired when progress reaches 100% outside of a loop.
     */
    setprogress: function (progress) {
      _setprogress(this, progress, true)
    },

    /**
     * Return the current progress value.
     */
    getprogress: function () {
      const data = $(this).data('loadgo')
      if (typeof data === 'undefined') {
        return 0
      }

      return typeof data.progress !== 'undefined' ? data.progress : 0
    },

    /**
     * Reset progress
     * @fires loadgo:reset
     * @fires loadgo:error
     */
    resetprogress: function () {
      const data = $(this).data('loadgo')
      if (typeof data === 'undefined') {
        dispatchCustomEvent(this[0], 'error', {
          message:
            'Trying to reset progress on a non initialized element. You have to run "init" method first.',
        })
        return
      }
      _setprogress(this, 0, false)
      dispatchCustomEvent(this[0], 'reset', { progress: 0 })
    },

    /**
     * Start an indefinite back-and-forth animation loop.
     * @param  {number} duration  Interval duration in ms
     * @fires loadgo:start
     * @fires loadgo:cycle - Fired each time the loop completes one full back-and-forth.
     * @fires loadgo:error
     */
    loop: function (duration) {
      const data = $(this).data('loadgo')

      if (typeof data === 'undefined') {
        const message = 'Element do not have Loadgo properties.'
        dispatchCustomEvent(this[0], 'error', { message })
        console.error(message)
        return
      }

      if (data.interval) {
        const message = 'LoadGo requires you to stop the current loop before modifying it.'
        dispatchCustomEvent(this[0], 'error', { message })
        console.error(message)
        return
      }

      dispatchCustomEvent(this[0], 'start')

      let toggle = true
      const image = this[0]

      // Store interval so we can stop it later
      data.interval = setInterval(() => {
        if (toggle) {
          data.progress += 1
          if (data.progress >= 100) {
            toggle = false
          }
        } else {
          data.progress -= 1
          if (data.progress <= 0) {
            toggle = true
            dispatchCustomEvent(image, 'cycle')
          }
        }

        // Remove transition animation
        // Can be replaced with animated: false in the initializer
        if (data.overlay) {
          data.overlay.css({
            transition: 'none',
          })
        }

        _setprogress(image, data.progress, true)
      }, duration)
    },

    /**
     * Stop the loop and reveal the full image.
     * @fires loadgo:stop
     * @fires loadgo:error
     */
    stop: function () {
      const data = $(this).data('loadgo')
      if (typeof data === 'undefined') {
        const message =
          'Trying to stop loop for a non initialized element. You have to run "init" method first.'
        dispatchCustomEvent(this[0], 'error', { message })
        console.error(message)
        return
      }

      data.interval = clearInterval(data.interval)
      _setprogress(this, 100, false)
      dispatchCustomEvent(this[0], 'stop', { progress: 100 })
    },

    /**
     * Remove the overlay and restore the original DOM structure.
     * @fires loadgo:destroy
     */
    destroy: function () {
      const $this = $(this)
      const options = $this.data('loadgo')

      if (typeof options === 'undefined') {
        return // element was never initialized
      }

      $(window).off('resize', options.resizeFunction)

      if (options.interval) {
        clearInterval(options.interval)
      }

      if (options.overlay) {
        options.overlay.remove() // Removes overlay

        $this.insertBefore($this.parent()) // Moves image element before "loadgo-container"
        $this.siblings('.loadgo-container').remove() // Removes "loadgo-container" element
      } else {
        // Filter mode — ARIA attributes were added directly to the image; clean them up
        $this.removeAttr('role aria-valuemin aria-valuemax aria-valuenow aria-label')
      }

      // Remove properties
      $this.removeData('loadgo')
      $this.removeData('loadgo-options')

      dispatchCustomEvent($this[0], 'destroy')
    },
  }

  $.fn.loadgo = function (methodOrOptions) {
    if (typeof methods[methodOrOptions] === 'undefined') {
      if (typeof methodOrOptions === 'object' || typeof methodOrOptions === 'undefined') {
        return methods.init.apply(this, arguments) // Init method by default
      }

      throw new Error(`Method ${methodOrOptions} does not exist on $.loadgo`)
    }

    return methods[methodOrOptions].apply(this, Array.prototype.slice.call(arguments, 1))
  }
})(jQuery)
