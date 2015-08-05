if (typeof jQuery === 'undefined') { throw new Error('LoadGo requires jQuery'); }

  if (jQuery) (
    function (jQuery) {

      var methods = {
        init : function (useroptions) {

          var _ = this;

          if ($(_).length > 1) {
            throw new Error('LoadGo selector must be an id. Please, set a valid DOM id; also check if you have more than one DOM element with the same id.');
          }

          // Default options
          var options = (typeof(useroptions) !== 'undefined')? useroptions : {};
          var defaults = {
            bgcolor:    (options.bgcolor)? options.bgcolor : '#FFFFFF',                 //  Overlay color
            opacity:    (options.opacity)? options.opacity : '0.5',                     //  Overlay opacity
            animated:   (options.animated !== undefined)? options.animated : true,      //  Overlay smooth animation when setting progress
            image:      (options.image !== undefined)? options.image : null,            //  Overlay image
            class:      (options.class !== undefined)? options.class : null,            //  Overlay CSS class
            resize:     (options.resize !== undefined)? options.resize : null,          //  Resize functions (optional)
            direction:  (options.direction !== undefined)? options.direction : 'lr'     //  Direction animation (optional)
          };

          // Check for valid direction
          var validDirections = ['lr', 'rl', 'bt', 'tb'];
          if (validDirections.indexOf(defaults.direction.toLowerCase()) === -1) {
            console.warn('LoadGo requires a valid direction. "' + defaults.direction + '" provided. Using default value: "lr".');
            defaults.direction = 'lr';
          }

          var _w = jQuery(_)[0].getBoundingClientRect().width, _h = jQuery(_)[0].getBoundingClientRect().height, pl = jQuery(_).parent().css('padding-left');

          $overlay = jQuery('<div class="loadgo-overlay" style="background-color:' + defaults.bgcolor +
            ';opacity:' + defaults.opacity +
            ';width:' + _w + 'px' +
            ';height:' + _h + 'px' +
            ';margin-right:' + pl +
            ';top:0;position:absolute;"></div>');

          if (defaults.animated) {
            $overlay.css({
              '-webkit-transition': 'width 0.6s ease, height 0.6s ease, top 0.6s ease',
              'transition':         'width 0.6s ease, height 0.6s ease, top 0.6 ease'
            });
          }

          if (defaults.class) {
            $overlay.addClass(defaults.class);
          }

          if (defaults.image) {

            var bgposition;
            switch (defaults.direction) {
              case 'lr':
                bgposition = '100% 0%';
                break;
              case 'rl':
                // Right to left animation
                bgposition = '0% 50%';
                break;
              case 'bt':
                // Bottom to top animation
                bgposition = '100% 0%';
                break;
              case 'tb':
                // Top to bottom animation
                bgposition = '0% 100%';
                break;
              default:
                // Left to right animation
                bgposition = '100% 50%';
                break;
            }

            $overlay.css({
              'background-image':         'url("' + defaults.image + '")',
              'background-repeat':        'no-repeat',
              'background-size':          'cover',
              'background-color':         'none',
              'background-position':      bgposition
            });
          }

          jQuery(_).data('loadgo', { overlay: $overlay, width: $overlay.width(), height: $overlay.height(), progress: 0, direction: defaults.direction });

          $overlay.insertAfter(_);

          // Resize event
          if (defaults.resize) {
            $(window).on('resize', defaults.resize);
          }
          else {
            $(window).on('resize', function() {
              var $element = jQuery(_), data = $element.data('loadgo');
              var $overlay = data.overlay, progress = data.progress, direction = data.direction;
              var _w = $element.width(), _h = $element.height(), pl = $element.parent().css('padding-left');
              $overlay.css({
                'width':          _w + 'px',
                'height':         _h + 'px',
                'margin-right':   pl + 'px'
              });
              $element.data('loadgo', { overlay: $overlay, width: _w, height: _h, progress: progress, direction: direction });
              _.loadgo('setprogress', progress);
            });
          }

        },
        /**
         * Set progress by percentage
         * @param  {int} progress Progress in percentage
         */
        setprogress : function (progress) {
          if (progress < 0 || progress > 100)
            console.warn('LoadGo expects progress number between 0 (0%) and 100 (100%).');
          else {
            var data = jQuery(this).data('loadgo'),
            $overlay = data.overlay, $width = data.width, $height = data.height, $direction = data.direction;

            var _w, _h;
            switch ($direction) {
              case 'lr':
                // Left to right animation
                _w = $width * (1 - progress / 100);
                $overlay.css('width', _w + 'px');
                $overlay.css('right', '0px');
                jQuery(this).data('loadgo', $.extend({}, data, {progress: progress}));
                break;
              case 'rl':
                // Right to left animation
                _w = $width * (1 - progress / 100);
                $overlay.css('width', _w + 'px');
                jQuery(this).data('loadgo', $.extend({}, data, {progress: progress}));
                break;
              case 'bt':
                // Bottom to top animation
                _h = $height * (1 - progress / 100);
                $overlay.css('height', _h + 'px');
                jQuery(this).data('loadgo', $.extend({}, data, {progress: progress}));
                break;
              case 'tb':
                // Top to bottom animation
                _h = $height * (1 - progress / 100);
                $overlay.css('height', _h + 'px');
                $overlay.css('top', ($height - _h) + 'px');
                jQuery(this).data('loadgo', $.extend({}, data, {progress: progress}));
                break;
              default:
                // Left to right animation
                _w = $width * (1 - progress / 100);
                $overlay.css('width', _w + 'px');
                $overlay.css('right', '0px');
                jQuery(this).data('loadgo', $.extend({}, data, {progress: progress}));
                break;
            }
          }
        },

        getprogress : function () {
          var data = jQuery(this).data('loadgo');
          return (data.progress)? data.progress : 0;
        },

        resetprogress : function () {
          jQuery(this).loadgo('setprogress', 0);
        },

        // Overlay loops back and forth
        loop : function (duration) {
          var data = jQuery(this).data('loadgo');
          var toggle = true;
          var image = this;

          if (data.interval) {
            console.warn('LoadGo requires you to stop the current loop before modifying it.');
            return false;
          }

          // Store interval so we can stop it later
          data.interval = setInterval(function(){
            if(toggle) {
              data.progress += 1;
              if (data.progress >= 100) {
                toggle = false;
              }
            }
            else {
              data.progress -= 1;
              if(data.progress <= 0) {
                toggle = true;
              }
            }
            // Remove transition animation
            // Can be replaced with animated: false in the initializer
            data.overlay.css({
              '-webkit-transition': 'none',
              'transition':         'none'
            });

            image.loadgo('setprogress', data.progress);
          }, duration);
        },

        // Stops the loop interval and shows image
        stop: function () {
          var data = jQuery(this).data('loadgo');
          data.interval = clearInterval(data.interval);
          this.loadgo('setprogress', 100);
        }
      };

      $.fn.loadgo = function (methodOrOptions) {
        if ( methods[methodOrOptions] ) {
          return methods[ methodOrOptions ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof methodOrOptions === 'object' || ! methodOrOptions ) {
        // Default to "init"
        return methods.init.apply( this, arguments );
      } else {
        $.error( 'Method ' +  methodOrOptions + ' does not exist on jQuery.loadgo' );
      }
    };

  })(jQuery);
