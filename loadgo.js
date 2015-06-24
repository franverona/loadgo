if (typeof jQuery === 'undefined') { throw new Error('LoadGo requires jQuery'); }

  if (jQuery) (
    function (jQuery) {

      var methods = {
        init : function (useroptions) {

          if ($(this).length > 1) {
            throw new Error('LoadGo select must be an id. Please, set a valid DOM id; also check if you have more than one DOM element with the same id.')
          }

          // Default options
          var options = (typeof(useroptions) !== 'undefined')? useroptions : {};
          var defaults = {
            bgcolor:    (options.bgcolor)? options.bgcolor : '#FFFFFF',            //  Overlay color
            opacity:    (options.opacity)? options.opacity : '0.5',                //  Overlay opacity
            animated:   (options.animated != null)? options.animated : true,       //  Overlay smooth animation when setting progress
            image:      (options.image != null)? options.image : null,             //  Overlay image
            class:      (options.class != null)? options.class : null              //  Overlay CSS class
          };

          var _w = jQuery(this).width(), _h = jQuery(this).height(), pl = jQuery(this).parent().css('padding-left');

          $overlay = jQuery('<div style="background-color:' + defaults.bgcolor +
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

          jQuery(this).data('loadgo', { overlay: $overlay, width: $overlay.width(), height: $overlay.height(), progress: 0 });

          $overlay.insertAfter(this);

        },
        /**
         * Set progress by percentage
         * @param  {int} progress Progress in percentage
         */
        setprogress : function (progress) {
          if (progress > 100)
            console.warn('LoadGo expects maximum progress of 100 (100%). ' + progress + '% sent.');
          else {
            var data = jQuery(this).data('loadgo'),
            $overlay = data.overlay, $width = data.width, $height = data.height;
            var _w = $width * (1 - progress / 100);
            $overlay.css('width', _w + 'px');
            $overlay.css('right', '0px');
            jQuery(this).data('loadgo', $.extend({}, data, {progress: progress}))
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