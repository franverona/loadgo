/**
 * @preserve LoadGo v3.0.0 (https://franverona.com/loadgo)
 * 2020 - Fran Verona
 * Licensed under MIT (https://github.com/franverona/loadgo/blob/master/LICENSE)
 */

if (typeof jQuery === 'undefined') {
  throw new Error(
    'LoadGo requires jQuery. Make sure you are loading jQuery before LoadGo, or try pure Javascript version instead.'
  );
}

(function ($) {
  const dispatchEvent = (obj, name) => {
    name = name.toLowerCase();
    const options = obj.loadgo('options');
    const data = obj.data('loadgo');
    if (options.on) {
      if (options.on[name]) {
        options.on[name]({
          ...options,
          progress: data.progress
        });
        return;
      }
    }
  };

  const methods = {
    init: function (useroptions) {
      const $this = $(this);

      if ($this.length === 0) {
        // Applying LoadGo to a non-existent element -> skip
        return;
      }

      if (!$this.is('img')) {
        throw new Error('LoadGo only works on img elements.');
      }

      if ($this.length > 1) {
        throw new Error(
          'LoadGo only works on one element at a time. Try with a valid #id.'
        );
      }

      // Plugin options. We need to reset options to avoid future errors
      $this.data('loadgo-options', {});

      const pluginOptions = $this.loadgo('options', useroptions);

      const overlayTemplate =
        '<div class="loadgo-overlay" style="background-color:%bgcolor%;opacity:%opacity%;width:%width%px;height:%height%px;position:absolute;"></div>';

      // Simulate image loading to get proper dimensions
      const img = new Image();
      img.src = $this.attr('src');
      img.onload = () => {
        const _w = $this[0].getBoundingClientRect().width;
        const _h = $this[0].getBoundingClientRect().height;

        const overlayWithOptions = overlayTemplate
          .replace('%bgcolor%', pluginOptions.bgcolor)
          .replace('%opacity%', pluginOptions.opacity)
          .replace('%width%', _w)
          .replace('%height%', _h);

        const $overlay = $(overlayWithOptions);

        if (pluginOptions.animated) {
          const overlayCSS = 'width 0.6s ease, height 0.6s ease, top 0.6s ease';
          $overlay.css({
            transition: overlayCSS,
            '-webkit-transition': overlayCSS,
            '-moz-transition': overlayCSS,
            '-ms-transition': overlayCSS,
            '-o-transition': overlayCSS
          });
        }

        if (pluginOptions['class']) {
          $overlay.addClass(pluginOptions['class']);
        }

        if (pluginOptions.filter) {
          if (pluginOptions.filter === 'blur') {
            $this.css({
              '-webkit-filter': pluginOptions.filter + '(10px)'
            });
          } else if (pluginOptions.filter === 'hue-rotate') {
            $this.css({
              '-webkit-filter': pluginOptions.filter + '(360deg)'
            });
          } else if (pluginOptions.filter === 'opacity') {
            $this.css({
              '-webkit-filter': pluginOptions.filter + '(0)'
            });
          } else {
            $this.css({
              '-webkit-filter': pluginOptions.filter + '(1)'
            });
          }

          if (pluginOptions.animated) {
            $this.css({
              transition: '0.6s filter ease',
              '-webkit-transition': '0.6s -webkit-filter ease',
              '-moz-transition': '0.6s -moz-filter ease',
              '-ms-transition': '0.6s -ms-filter ease',
              '-o-transition': '0.6s -o-filter ease'
            });
          }
        }

        if (pluginOptions.image) {
          const bgposition = '100% 0%'; // Left to right animation by default
          if (pluginOptions.direction === 'rl') {
            bgposition = '0% 50%'; // Right to left animation
          } else if (pluginOptions.direction === 'bt') {
            bgposition = '100% 0%'; // Bottom to top animation
          } else if (pluginOptions.direction === 'tb') {
            bgposition = '0% 100%'; // Top to bottom animation
          }

          $overlay.css({
            'background-image': 'url("' + pluginOptions.image + '")',
            'background-repeat': 'no-repeat',
            'background-size': 'cover',
            'background-color': 'none',
            'background-position': bgposition
          });
        }

        let pluginData = {
          progress: 0
        };

        // Insert overlay only if "filter" option is not provided. If user sets a filter, it can be applied directly to the image logo
        if (pluginOptions.filter === null) {
          // The DOM tree will look like this:
          // <div class="loadgo-container"><element />><overlay /></div>

          $this.wrapAll(
            '<div class="loadgo-container" style="position: relative"></div>'
          );
          $this.parent().prepend($overlay);

          // We need to add margins and paddings to set the overlay exactly above our image
          var pl = parseFloat($this.css('padding-left'));
          var pr = parseFloat($this.css('padding-right'));
          var pt = parseFloat($this.css('padding-top'));
          var pb = parseFloat($this.css('padding-bottom'));
          var ml = parseFloat($this.css('margin-left'));
          var mr = parseFloat($this.css('margin-right'));
          var mt = parseFloat($this.css('margin-top'));
          var mb = parseFloat($this.css('margin-bottom'));

          if (pluginOptions.direction === 'lr') {
            // Left to right animation
            $overlay.css('right', pr + mr + 'px');
          } else if (pluginOptions.direction === 'rl') {
            // Right to left animation
            $overlay.css('left', pl + ml + 'px');
          } else if (pluginOptions.direction === 'bt') {
            // Bottom to top animation
            $overlay.css('top', pt + mt + 'px');
          } else if (pluginOptions.direction === 'tb') {
            // Top to bottom animation
            $overlay.css('bottom', pb + mb + 'px');
          }

          // Saves overlay element + overlay current dimensions
          pluginData.overlay = $overlay;
          pluginData.width = $overlay.width();
          pluginData.height = $overlay.height();
        }

        $this.data('loadgo', pluginData);

        // Resize event
        if (pluginOptions.resize) {
          $(window).on('resize', pluginOptions.resize);
        } else {
          const _this = this;
          $(window).on('resize', function () {
            const $element = $this;
            const data = $element.data('loadgo');

            if (typeof data === 'undefined') {
              return;
            }

            const $overlay = data.overlay;
            const progress = data.progress;
            const $width = $element.width();
            const $height = $element.height();

            let storedData = {
              progress: data.progress,
              width: $width,
              height: $height
            };

            if ($overlay) {
              $overlay.css({
                width: $width + 'px',
                height: $height + 'px'
              });

              // We need to add margins and paddings to set the overlay exactly above our image
              const pl = parseFloat($element.css('padding-left'));
              const pr = parseFloat($element.css('padding-right'));
              const pt = parseFloat($element.css('padding-top'));
              const pb = parseFloat($element.css('padding-bottom'));
              const ml = parseFloat($element.css('margin-left'));
              const mr = parseFloat($element.css('margin-right'));
              const mt = parseFloat($element.css('margin-top'));
              const mb = parseFloat($element.css('margin-bottom'));

              if (pluginOptions.direction === 'lr') {
                // Left to right animation
                $overlay.css('right', pr + mr + 'px');
              } else if (pluginOptions.direction === 'rl') {
                // Right to left animation
                $overlay.css('left', pl + ml + 'px');
              } else if (pluginOptions.direction === 'bt') {
                // Bottom to top animation
                $overlay.css('top', pt + mt + 'px');
              } else if (pluginOptions.direction === 'tb') {
                // Top to bottom animation
                $overlay.css('bottom', pb + mb + 'px');
              }

              storedData.overlay = $overlay;
            }

            $element.data('loadgo', $.extend({}, data, storedData));

            _this.loadgo('setprogress', progress);
          });
        }

        dispatchEvent($this, 'init');
      };
    },

    options: function (useroptions) {
      const $this = $(this);
      const defaults = {
        bgcolor: '#FFFFFF', //  Overlay color
        opacity: 0.5, //  Overlay opacity
        animated: true, //  Overlay smooth animation when setting progress
        image: null, //  Overlay image
        class: null, //  Overlay CSS class
        resize: null, //  Resize functions (optional)
        direction: 'lr', //  Direction animation (optional)
        filter: null //  Image filter (optional)
      };

      let currentOptions = $this.data('loadgo-options');
      let options = useroptions || {};

      // Parse to number the 'opacity' option
      if (typeof options.opacity !== 'undefined') {
        options.opacity = parseFloat(options.opacity);
      }

      if (!currentOptions) {
        currentOptions = $.extend({}, defaults, options);
      }

      if (JSON.stringify(currentOptions) === '{}') {
        currentOptions = $.extend({}, defaults, options);
      } else {
        currentOptions = $.extend({}, currentOptions, options);
      }

      // Check for valid direction
      if (currentOptions.direction) {
        const validDirections = ['lr', 'rl', 'bt', 'tb'];
        const direction = currentOptions.direction.toLowerCase();
        if (validDirections.indexOf(direction) === -1) {
          // Invalid value for "direction" option.
          // Possible values: lr, rl, bt, tb.
          // Using default value: "lr".
          currentOptions.direction = 'lr';
        }
      }

      // Check for valid filter
      if (currentOptions.filter) {
        const validFilters = [
          'blur',
          'grayscale',
          'sepia',
          'hue-rotate',
          'invert',
          'opacity'
        ];
        const filter = currentOptions.filter.toLowerCase();
        if (validFilters.indexOf(filter) === -1) {
          // Invalid value for "filter" option.
          // Possible values: blur, grayscale, sepia, hue-rotate, invert, opacity.
          // This option will be ignored.
          currentOptions.filter = null;
        }
      }

      // Store user options with default options
      $this.data('loadgo-options', currentOptions);

      return currentOptions;
    },

    /**
     * Set progress by percentage
     * @param  {int} progress Progress in percentage
     */
    setprogress: function (progress) {
      // LoadGo expects progress number between 0 (0%) and 100 (100%).
      if (progress < 0 || progress > 100) {
        dispatchEvent($(this), 'setprogress');
        return;
      }

      let storedData = { progress: progress };
      const data = $(this).data('loadgo');
      const pluginOptions = $(this).loadgo('options');
      const $overlay = data.overlay;
      const $width = data.width;
      const $height = data.height;
      const direction = pluginOptions.direction;

      if ($overlay) {
        let overlayWidth;
        let overlayHeight;
        if (direction === 'lr') {
          // Left to right animation
          overlayWidth = $width * (1 - progress / 100);
          $overlay[0].style.width = overlayWidth + 'px';
        } else if (direction === 'rl') {
          // Right to left animation
          overlayWidth = $width * (1 - progress / 100);
          $overlay[0].style.width = overlayWidth + 'px';
        } else if (direction === 'bt') {
          // Bottom to top animation
          overlayHeight = $height * (1 - progress / 100);
          $overlay[0].style.height = overlayHeight + 'px';
        } else if (direction === 'tb') {
          // Top to bottom animation
          overlayHeight = $height * (1 - progress / 100);
          $overlay[0].style.height = overlayHeight + 'px';
        }

        storedData.overlay = $overlay;
      } else {
        const $filter = pluginOptions.filter;
        let p;
        switch ($filter) {
          case 'blur':
            p = (100 - progress) / 10;
            jQuery(this).css({
              '-webkit-filter': $filter + '(' + p + 'px)'
            });
            break;
          case 'hue-rotate':
            p = (progress * 360) / 100;
            jQuery(this).css({
              '-webkit-filter': $filter + '(' + p + 'deg)'
            });
            break;
          case 'opacity':
            p = progress / 100;
            jQuery(this).css({
              '-webkit-filter': $filter + '(' + p + ')'
            });
            break;
          default:
            p = 1 - progress / 100;
            $(this).css({
              '-webkit-filter': $filter + '(' + p + ')'
            });
        }
      }

      $(this).data('loadgo', $.extend({}, data, storedData));

      dispatchEvent($(this), 'setprogress');
    },

    getprogress: function () {
      const data = $(this).data('loadgo');
      if (typeof data === 'undefined') {
        return 0;
      }

      return typeof data.progress !== 'undefined' ? data.progress : 0;
    },

    resetprogress: function () {
      $(this).loadgo('setprogress', 0);
      dispatchEvent($(this), 'resetprogress');
    },

    // Overlay loops back and forth
    loop: function (duration) {
      const data = $(this).data('loadgo');

      // LoadGo requires you to stop the current loop before modifying it.
      if (data.interval) {
        return false;
      }

      let toggle = true;
      const $this = this;

      // Store interval so we can stop it later
      data.interval = setInterval(function () {
        if (toggle) {
          data.progress += 1;
          if (data.progress >= 100) {
            toggle = false;
            dispatchEvent($this, 'loopend');
          }
        } else {
          data.progress -= 1;
          if (data.progress <= 0) {
            toggle = true;
            dispatchEvent($this, 'loopstart');
          }
        }

        // Remove transition animation
        // Can be replaced with animated: false in the initializer
        data.overlay.css({
          transition: 'none',
          '-webkit-transition': 'none',
          '-moz-transition': 'none',
          '-ms-transition': 'none',
          '-o-transition': 'none'
        });

        $this.loadgo('setprogress', data.progress);
      }, duration);
    },

    // Stops the loop interval and shows image
    stop: function () {
      let data = $(this).data('loadgo');
      data.interval = clearInterval(data.interval);
      this.loadgo('setprogress', 100);
      dispatchEvent(this, 'stop');
    },

    // Remove all plugin properties
    destroy: function () {
      const $this = $(this);
      const options = $this.data('loadgo');

      if (typeof options === 'undefined') {
        return; // element was never initialized
      }

      if (options.overlay) {
        options.overlay.remove(); // Removes overlay

        $this.insertBefore($this.parent()); // Moves image element before "loadgo-container"
        $this.siblings('.loadgo-container').remove(); // Removes "loadgo-container" element
      }

      dispatchEvent($this, 'destroy');

      // Remove properties
      $.removeData($this, 'loadgo');
      $.removeData($this, 'loadgo-options');
    }
  };

  $.fn.loadgo = function (methodOrOptions) {
    if (typeof methods[methodOrOptions] === 'undefined') {
      if (
        typeof methodOrOptions === 'object' ||
        typeof methodOrOptions === 'undefined'
      ) {
        return methods.init.apply(this, arguments); // Init method by default
      }

      throw new Error(
        'Method ' + methodOrOptions + ' does not exist on $.loadgo'
      );
    }

    return methods[methodOrOptions].apply(
      this,
      Array.prototype.slice.call(arguments, 1)
    );
  };
})(jQuery);
