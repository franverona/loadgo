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
            resize:     (options.resize !== undefined)? options.resize : null           //  Resize functions (optional)
          };

          var _w = jQuery(_).width(), _h = jQuery(_).height(), pl = jQuery(_).parent().css('padding-left');

          $overlay = jQuery('<div class="loadgo-overlay" style="background-color:' + defaults.bgcolor +
            ';opacity:' + defaults.opacity +
            ';width:' + _w + 'px' +
            ';height:' + _h + 'px' +
            ';margin-right:' + pl +
            ';top:0;position:absolute;"></div>');

          if (defaults.animated) {
            $overlay.css({
              '-webkit-transition': 'width 0.6s ease',
              'transition':         'width 0.6s ease'
            });
          }

          if (defaults.class) {
            $overlay.addClass(defaults.class);
          }

          if (defaults.image) {
            $overlay.css({
              'background-image':         'url("' + defaults.image + '")',
              'background-repeat':        'no-repeat',
              'background-size':          'cover',
              'background-color':         'none',
              'background-position':      '100% center'
            });
          }

          jQuery(_).data('loadgo', { overlay: $overlay, width: $overlay.width(), height: $overlay.height(), progress: 0 });

          $overlay.insertAfter(_);

          // Resize event
          if (defaults.resize) {
            $(window).on('resize', defaults.resize);
          }
          else {
            $(window).on('resize', function() {
              var $element = jQuery(_), data = $element.data('loadgo');
              var $overlay = data.overlay, progress = data.progress;
              var _w = $element.width(), _h = $element.height(), pl = $element.parent().css('padding-left');
              $overlay.css({
                'width':          _w + 'px',
                'height':         _h + 'px',
                'margin-right':   pl + 'px'
              });
              $element.data('loadgo', { overlay: $overlay, width: _w, height: _h, progress: progress });
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
            $overlay = data.overlay, $width = data.width, $height = data.height;
            var _w = $width * (1 - progress / 100);
            $overlay.css('width', _w + 'px');
            $overlay.css('right', '0px');
            jQuery(this).data('loadgo', $.extend({}, data, {progress: progress}));
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
