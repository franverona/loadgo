/*!
 * LoadGo v3.1.0 (https://github.com/franverona/loadgo)
 * 2026 - Fran Verona
 * Licensed under MIT (https://github.com/franverona/loadgo/blob/master/LICENSE)
 */

if (typeof jQuery === 'undefined')
  throw new Error(
    'LoadGo requires jQuery. Make sure you are loading jQuery before LoadGo, or try pure Javascript version instead.',
  )
;(function ($) {
  const methods = {
    init: function (userOptions) {
      const $this = $(this)

      if ($this.length === 0) {
        return
      }

      if (!$this.is('img')) {
        throw new Error('LoadGo only works on img elements.')
      }

      if ($this.length > 1) {
        throw new Error('LoadGo only works on one element at a time. Try with a valid #id.')
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
    },

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

      if (JSON.stringify(currentOptions) === '{}') {
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

      return currentOptions
    },

    /**
     * Set progress by percentage
     * @param  {number} progress Progress value (between 0 and 100)
     */
    setprogress: function (progress) {
      // LoadGo expects progress number between 0 (0%) and 100 (100%).
      if (progress < 0 || progress > 100) {
        return
      }

      const data = $(this).data('loadgo')
      if (typeof data === 'undefined') {
        return
      }

      const storedData = { progress: progress }
      const pluginOptions = $(this).loadgo('options')
      const $overlay = data.overlay
      const $width = data.width
      const $height = data.height
      const direction = pluginOptions.direction

      if ($overlay) {
        let overlayWidth, overlayHeight
        if (direction === 'lr') {
          // Left to right animation
          overlayWidth = $width * (1 - progress / 100)
          $overlay[0].style.width = `${overlayWidth}px`
        } else if (direction === 'rl') {
          // Right to left animation
          overlayWidth = $width * (1 - progress / 100)
          $overlay[0].style.width = `${overlayWidth}px`
        } else if (direction === 'bt') {
          // Bottom to top animation
          overlayHeight = $height * (1 - progress / 100)
          $overlay[0].style.height = `${overlayHeight}px`
        } else if (direction === 'tb') {
          // Top to bottom animation
          overlayHeight = $height * (1 - progress / 100)
          $overlay[0].style.height = `${overlayHeight}px`
          $overlay[0].style.top = `${$height - overlayHeight}px`
        }

        $overlay[0].setAttribute('aria-valuenow', progress)
        storedData.overlay = $overlay
      } else {
        $(this)[0].setAttribute('aria-valuenow', progress)
        const $filter = pluginOptions.filter
        let p
        switch ($filter) {
          case 'blur':
            p = (100 - progress) / 10 // maps 0–100% progress to 10px–0px blur radius
            jQuery(this).css({ filter: `${$filter}(${p}px)` })
            break
          case 'hue-rotate':
            p = (progress * 360) / 100
            jQuery(this).css({ filter: `${$filter}(${p}deg)` })
            break
          case 'opacity':
            p = progress / 100
            jQuery(this).css({ filter: `${$filter}(${p})` })
            break
          default:
            p = 1 - progress / 100
            $(this).css({ filter: `${$filter}(${p})` })
        }
      }

      $(this).data('loadgo', $.extend({}, data, storedData))

      const onProgress = $(this).loadgo('options').onProgress
      if (typeof onProgress === 'function') {
        onProgress(progress)
      }
    },

    /**
     * Return current progress
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
     */
    resetprogress: function () {
      $(this).loadgo('setprogress', 0)
    },

    /**
     * Overlay loops back and forth
     * @param  {number} duration Interval duration in ms
     */
    loop: function (duration) {
      const data = $(this).data('loadgo')

      if (typeof data === 'undefined') {
        console.error('Element do not have Loadgo properties.')
        return
      }

      if (data.interval) {
        console.error('LoadGo requires you to stop the current loop before modifying it.')
        return
      }

      let toggle = true
      const image = this

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
          }
        }

        // Remove transition animation
        // Can be replaced with animated: false in the initializer
        data.overlay.css({
          transition: 'none',
        })

        $(image).loadgo('setprogress', data.progress)
      }, duration)
    },

    /**
     * Stops the loop interval and shows image
     */
    stop: function () {
      const data = $(this).data('loadgo')
      if (typeof data === 'undefined') {
        console.error(
          'Trying to stop loop for a non initialized element. You have to run "init" method first.',
        )
        return
      }

      data.interval = clearInterval(data.interval)
      $(this).loadgo('setprogress', 100)
    },

    /**
     * Remove all plugin properties
     */
    destroy: function () {
      const $this = $(this)
      const options = $this.data('loadgo')

      if (typeof options === 'undefined') {
        return // element was never initialized
      }

      $(window).off('resize', options.resizeFunction)

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
