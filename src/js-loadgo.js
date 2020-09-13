/**
 * @preserve LoadGo v3.0.0 (https://franverona.com/loadgo)
 * 2020 - Fran Verona
 * Licensed under MIT (https://github.com/franverona/loadgo/blob/master/LICENSE)
 */

(function () {
  const dispatchEvent = (obj, name) => {
    name = name.toLowerCase();
    const options = Loadgo.options(obj);
    if (options.on) {
      if (options.on[name]) {
        options.on[name]({
          ...options,
          progress: Loadgo.getprogress(obj)
        });
        return;
      }
    }
  };
  // Combine obj2 with obj1. If properties are equal, it will be overwritten.
  // For example: obj1.direction = obj2.direction
  const extend = (obj1, obj2) => {
    let result = {};
    let obj1Clone;
    let obj2Clone;
    if (typeof obj1 === 'undefined') {
      obj2Clone = JSON.parse(JSON.stringify(obj2));
      if (obj2.resize) {
        obj2Clone.resize = obj2.resize; // Functions won't be serialized, so we need to do it manually
      }
      if (obj2.on) {
        obj2Clone.on = obj2.on;
      }
      result = obj2Clone;
    } else if (typeof obj2 === 'undefined') {
      obj1Clone = JSON.parse(JSON.stringify(obj1));
      if (obj1.resize) {
        obj1Clone.resize = obj1.resize; // Functions won't be serialized, so we need to do it manually
      }
      if (obj1.on) {
        obj1Clone.on = obj1.on;
      }
      result = obj1Clone;
    } else {
      obj1Clone = JSON.parse(JSON.stringify(obj1));
      if (obj1.resize) {
        obj1Clone.resize = obj1.resize; // Functions won't be serialized, so we need to do it manually
      }
      if (obj1.on) {
        obj1Clone.on = obj1.on;
      }
      obj1 = obj1Clone;

      obj2Clone = JSON.parse(JSON.stringify(obj2));
      if (obj2.resize) {
        obj2Clone.resize = obj2.resize; // Functions won't be serialized, so we need to do it manually
      }
      if (obj2.on) {
        obj2Clone.on = obj2.on;
      }
      obj2 = obj2Clone;

      result = obj1;
      for (const prop in obj2) {
        result[prop] = obj2[prop];
      }
    }

    return result;
  };

  // Get Loadgo properties for element
  const getProperties = (elementId) => {
    for (let i = 0, l = domElements.length; i < l; i++) {
      if (domElements[i].id === elementId) {
        return domElements[i].properties;
      }
    }
    return null;
  };

  // Get array index on domElements array
  const getIndex = (elementId) => {
    for (let i = 0, l = domElements.length; i < l; i++) {
      if (domElements[i].id === elementId) {
        return i;
      }
    }
    return -1;
  };

  // Returns true if element is valid; false otherwise
  const elementIsValid = (element) => {
    if (typeof element === 'undefined' || element === null) {
      return false;
    }

    if (element.nodeName !== 'IMG') {
      throw new Error('LoadGo only works on img elements.');
    }

    if (element.length > 1) {
      throw new Error(
        'LoadGo only works on one element at a time. Try with a valid #id.'
      );
    }

    return true;
  };

  // Parse padding and margin properties to return a valid number
  const parseOffset = (element, property) => {
    const measure = element.style[property];
    if (measure === 'auto') {
      const p = property.toLowerCase();
      if (p.indexOf('left') !== -1 || p.indexOf('right') !== -1) {
        return parseFloat(element.offsetLeft);
      }

      if (p.indexOf('top') !== -1 || p.indexOf('bottom') !== -1) {
        return parseFloat(element.offsetTop);
      }
    }

    if (measure.indexOf('px') !== -1) {
      return parseFloat(measure);
    }

    return 0;
  };

  const randomId = () => {
    return new Date().getTime().toString();
  };

  // Array to store all Loadgo elements
  const domElements = [];

  // Loadgo default options
  const defaultOptions = {
    bgcolor: '#FFFFFF', //  Overlay color
    opacity: '0.5', //  Overlay opacity
    animated: true, //  Overlay smooth animation when setting progress
    image: null, //  Overlay image
    class: null, //  Overlay CSS class
    resize: null, //  Resize functions (optional)
    direction: 'lr', //  Direction animation (optional)
    filter: null //  Image filter (optional)
  };

  Loadgo = window.Loadgo || {};

  /**
   * Init Loadgo in an specific element
   * @param  {DOM} element  DOM element using document.getElementById
   * @param  {JSON} useroptions Loadgo options
   */
  Loadgo.init = function (element, useroptions) {
    if (!elementIsValid(element)) {
      return;
    }

    var _this = this;

    element.onload = () => {
      let domElementsIndex = getIndex(element.id);
      if (domElementsIndex === -1) {
        domElements.push({
          id: element.id,
          properties: {}
        });
        domElementsIndex = domElements.length - 1;
      } else {
        // Plugin options. We need to reset options to avoid future errors
        domElements[domElementsIndex].properties = {};
      }

      const pluginOptions = Loadgo.options(element, useroptions);

      let overlay = document.createElement('div');
      overlay.id = 'loadgo-' + randomId(); // We need to set a random id so we can retrieve it later when need it

      // Overlay classes
      overlay.className = ['loadgo-overlay', pluginOptions['class'] || ''].join(
        ' '
      );

      // Overlay background color
      overlay.style.backgroundColor = pluginOptions.bgcolor;

      // Overlay opacity
      overlay.style.opacity = pluginOptions.opacity;

      // Overlay width
      const gbc = element.getBoundingClientRect();
      if (gbc.width) {
        overlay.style.width = gbc.width + 'px'; // for modern browsers
      } else {
        overlay.style.width = element.offsetWidth; // for oldIE
      }

      // Overlay height
      if (gbc.height) {
        overlay.style.height = gbc.height + 'px'; // for modern browsers
      } else {
        overlay.style.height = element.offsetWidth; // for oldIE
      }

      // Overlay will be positioned absolute
      overlay.style.position = 'absolute';

      // CSS animation
      if (pluginOptions.animated) {
        overlay.style['transition'] = 'all 0.6s ease';
        overlay.style['-webkit-transition'] = 'all 0.6s ease';
        overlay.style['-moz-transition'] = 'all 0.6s ease';
        overlay.style['-ms-transition'] = 'all 0.6s ease';
        overlay.style['-o-transition'] = 'all 0.6s ease';
      }

      // Filters
      if (pluginOptions.filter) {
        if (pluginOptions.filter === 'blur') {
          element.style['-webkit-filter'] = pluginOptions.filter + '(10px)';
        } else if (pluginOptions.filter === 'hue-rotate') {
          element.style['-webkit-filter'] = pluginOptions.filter + '(360deg)';
        } else if (pluginOptions.filter === 'opacity') {
          element.style['-webkit-filter'] = pluginOptions.filter + '(0)';
        } else {
          element.style['-webkit-filter'] = pluginOptions.filter + '(1)';
        }

        if (pluginOptions.animated) {
          element.style['transition'] = '0.6s filter ease';
          element.style['-webkit-transition'] = '0.6s -webkit-filter ease';
          element.style['-moz-transition'] = '0.6s -moz-filter ease';
          element.style['-ms-transition'] = '0.6s -ms-filter ease';
          element.style['-o-transition'] = '0.6s -o-filter ease';
        }
      }

      // Background image
      if (pluginOptions.image) {
        let bgposition = '100% 0%'; // Left to right animation by default
        if (pluginOptions.direction === 'rl') {
          bgposition = '0% 50%'; // Right to left animation
        } else if (pluginOptions.direction === 'bt') {
          bgposition = '100% 0%'; // Bottom to top animation
        } else if (pluginOptions.direction === 'tb') {
          bgposition = '0% 100%'; // Top to bottom animation
        }

        overlay.style['background-image'] =
          'url("' + pluginOptions.image + '")';
        overlay.style['background-repeat'] = 'no-repeat';
        overlay.style['background-size'] = 'cover';
        overlay.style['background-color'] = 'transparent';
        overlay.style['background-position'] = bgposition;
      }

      let pluginData = {
        progress: 0
      };

      // Insert overlay only if "filter" option is not provided. If user sets a filter, it can be applied directly to the image logo
      if (pluginOptions.filter === null) {
        // The DOM tree will look like this:
        // <div class="loadgo-container">
        //    <element />
        //    <overlay />
        // </div>

        // Simulates a jQuery 'wrapAll' behaviour in pure JS
        let container = document.createElement('div');
        container.className = 'loadgo-container';
        container.style.position = 'relative';
        element.before(container);
        container.appendChild(element);

        container.appendChild(overlay);

        // We need to add margins and paddings to set the overlay exactly above our image
        const pl = parseOffset(element, 'paddingLeft');
        const pr = parseOffset(element, 'paddingRight');
        const pt = parseOffset(element, 'paddingTop');
        const pb = parseOffset(element, 'paddingBottom');
        const ml = parseOffset(element, 'marginLeft');
        const mr = parseOffset(element, 'marginRight');
        const mt = parseOffset(element, 'marginTop');
        const mb = parseOffset(element, 'marginBottom');

        if (pluginOptions.direction === 'lr') {
          // Left to right animation
          overlay.style.right = pr + mr + 'px';
          overlay.style.top = pt + mt + 'px';
        } else if (pluginOptions.direction === 'rl') {
          // Right to left animation
          overlay.style.left = pl + ml + 'px';
          overlay.style.top = pt + mt + 'px';
        } else if (pluginOptions.direction === 'bt') {
          // Bottom to top animation
          overlay.style.top = pt + mt + 'px';
          overlay.style.left = pl + ml + 'px';
        } else if (pluginOptions.direction === 'tb') {
          // Top to bottom animation
          overlay.style.bottom = pb + mb + 'px';
          overlay.style.left = pl + ml + 'px';
        }

        // Saves overlay element + overlay current dimensions
        pluginData.overlay = overlay.id;
        pluginData.width = overlay.clientWidth;
        pluginData.height = overlay.clientHeight;
      }

      // Store overlay + progress into element properties
      domElements[domElementsIndex].properties = extend(
        pluginOptions,
        pluginData
      );

      // Resize event
      const resizeFunction = pluginOptions.resize
        ? pluginOptions.resize
        : () => {
            const data = getProperties(element.id);
            if (!data) {
              return;
            }

            let overlay = document.getElementById(data.overlay);
            if (!overlay) {
              return;
            }

            const elementIndex = getIndex(element.id);
            const gbc = element.getBoundingClientRect();

            // Overlay width
            if (gbc.width) {
              overlay.style.width = gbc.width + 'px'; // for modern browsers
            } else {
              overlay.style.width = element.offsetWidth; // for oldIE
            }

            // Overlay height
            if (gbc.height) {
              overlay.style.height = gbc.height + 'px'; // for modern browsers
            } else {
              overlay.style.height = element.offsetWidth; // for oldIE
            }

            // We need to add margins and paddings to set the overlay exactly above our image
            const pl = parseOffset(element, 'paddingLeft');
            const pr = parseOffset(element, 'paddingRight');
            const pt = parseOffset(element, 'paddingTop');
            const pb = parseOffset(element, 'paddingBottom');
            const ml = parseOffset(element, 'marginLeft');
            const mr = parseOffset(element, 'marginRight');
            const mt = parseOffset(element, 'marginTop');
            const mb = parseOffset(element, 'marginBottom');

            if (pluginOptions.direction === 'lr') {
              // Left to right animation
              overlay.style.right = pr + mr + 'px';
              overlay.style.top = pt + mt + 'px';
            } else if (pluginOptions.direction === 'rl') {
              // Right to left animation
              overlay.style.left = pl + ml + 'px';
              overlay.style.top = pt + mt + 'px';
            } else if (pluginOptions.direction === 'bt') {
              // Bottom to top animation
              overlay.style.top = pt + mt + 'px';
              overlay.style.left = pl + ml + 'px';
            } else if (pluginOptions.direction === 'tb') {
              // Top to bottom animation
              overlay.style.bottom = pb + mb + 'px';
              overlay.style.left = pl + ml + 'px';
            }

            // Saves overlay element + overlay current dimensions
            domElements[elementIndex].properties.width = parseFloat(
              overlay.style.width
            );
            domElements[elementIndex].properties.height = parseFloat(
              overlay.style.height
            );

            Loadgo.setprogress(element, data.progress);
          };

      if (window.addEventListener) {
        window.addEventListener('resize', resizeFunction, false);
      } else {
        window.attachEvent('onresize', resizeFunction);
      }

      dispatchEvent(element, 'init');
    };
  };

  Loadgo.options = function (element, useroptions) {
    if (!elementIsValid(element)) {
      return;
    }

    // Store Loadgo properties
    const domElementsIndex = getIndex(element.id);
    if (domElementsIndex === -1) {
      return;
    }

    let currentOptions = domElements[domElementsIndex].properties;

    // If no param is provided, then is a 'get'
    if (JSON.stringify(currentOptions) !== '{}') {
      return currentOptions;
    }

    if (typeof useroptions !== 'undefined') {
      // Parse to number the 'opacity' option
      if (typeof useroptions.opacity !== 'undefined') {
        useroptions.opacity = parseFloat(useroptions.opacity);
      }
    }

    if (JSON.stringify(currentOptions) === '{}') {
      currentOptions = extend(defaultOptions, useroptions);
    } else {
      currentOptions = extend(currentOptions, useroptions);
    }

    // Check for valid direction
    if (currentOptions.direction) {
      const direction = currentOptions.direction.toLowerCase();
      if (['lr', 'rl', 'bt', 'tb'].indexOf(direction) === -1) {
        // Invalid value for "direction" option.
        // Possible values: lr, rl, bt, tb.
        // Using default value: "lr".
        currentOptions.direction = 'lr';
      }
    }

    // Check for valid filter
    if (currentOptions.filter) {
      const filter = currentOptions.filter.toLowerCase();
      if (
        [
          'blur',
          'grayscale',
          'sepia',
          'hue-rotate',
          'invert',
          'opacity'
        ].indexOf(filter) === -1
      ) {
        // Invalid value for "filter" option.
        // Possible values: blur, grayscale, sepia, hue-rotate, invert, opacity.
        // This option will be ignored.
        currentOptions.filter = null;
      }
    }

    // Store user options with default options
    domElements[domElementsIndex].properties = currentOptions;

    return currentOptions;
  };

  /**
   * Set progress to specific value
   * @param  {DOM} element  DOM element using document.getElementById
   * @param  {Number} progress Progress value (has to be between 0 and 100)
   */
  Loadgo.setprogress = function (element, progress) {
    if (!elementIsValid(element)) {
      return;
    }

    // LoadGo expects progress number between 0 (0%) and 100 (100%).
    if (progress < 0 || progress > 100) {
      dispatchEvent(element, 'setprogress');
      return;
    }

    // Element exists?
    const domElementsIndex = getIndex(element.id);
    if (domElementsIndex === -1) {
      dispatchEvent(element, 'setprogress');
      return;
    }

    const data = getProperties(element.id);
    if (!data) {
      dispatchEvent(element, 'setprogress');
      return;
    }

    var overlay = document.getElementById(data.overlay);
    var w = data.width;
    var h = data.height;

    if (overlay) {
      let _w;
      let _h;
      const { direction } = data;
      if (direction === 'lr') {
        // Left to right animation
        _w = w * (1 - progress / 100);
        overlay.style.width = _w + 'px';
      } else if (direction === 'rl') {
        // Right to left animation
        _w = w * (1 - progress / 100);
        overlay.style.width = _w + 'px';
      } else if (direction === 'bt') {
        // Bottom to top animation
        _h = h * (1 - progress / 100);
        overlay.style.height = _h + 'px';
      } else if (direction === 'tb') {
        // Top to bottom animation
        _h = h * (1 - progress / 100);
        overlay.style.height = _h + 'px';
        overlay.style.top = h - _h + 'px';
      }
    } else {
      let p;
      const { filter } = data;
      switch (filter) {
        case 'blur':
          p = (100 - progress) / 10;
          element.style['-webkit-filter'] = filter + '(' + p + 'px)';
          break;
        case 'hue-rotate':
          p = (progress * 360) / 100;
          element.style['-webkit-filter'] = filter + '(' + p + 'deg)';
          break;
        case 'opacity':
          p = progress / 100;
          element.style['-webkit-filter'] = filter + '(' + p + ')';
          break;
        default:
          p = 1 - progress / 100;
          element.style['-webkit-filter'] = filter + '(' + p + ')';
      }
    }

    domElements[domElementsIndex].properties.progress = progress;

    dispatchEvent(element, 'setprogress');
  };

  /**
   * Return current progress
   * @param  {DOM} element  DOM element using document.getElementById
   */
  Loadgo.getprogress = function (element) {
    if (!elementIsValid(element)) {
      return;
    }

    const properties = getProperties(element.id);
    return properties !== null ? properties.progress : 0;
  };

  /**
   * Reset progress
   * @param  {DOM} element  DOM element using document.getElementById
   */
  Loadgo.resetprogress = function (element) {
    Loadgo.setprogress(element, 0);
    dispatchEvent(element, 'resetprogress');
  };

  /**
   * Overlay loops back and forth
   * @param  {DOM} element  DOM element using document.getElementById
   * @param  {Number} duration Interval duration in ms
   */
  Loadgo.loop = function (element, duration) {
    if (!elementIsValid(element)) {
      return;
    }

    if (getIndex(element.id) === -1) {
      console.error(
        'Trying to loop a non initialized element. You have to run "init" method first.'
      );
      return;
    }

    const data = getProperties(element.id);
    if (!data) {
      console.warn(
        'Element do not have Loadgo properties. Maybe it is uninitialized.'
      );
      return;
    }

    if (data.interval) {
      console.warn(
        'LoadGo requires you to stop the current loop before modifying it.'
      );
      return;
    }

    // Store interval so we can stop it later
    let toggle = true;
    const domIndex = getIndex(element.id);
    domElements[domIndex].properties.interval = setInterval(function () {
      if (toggle) {
        domElements[domIndex].properties.progress += 1;
        if (domElements[domIndex].properties.progress >= 100) {
          toggle = false;
          dispatchEvent(element, 'loopend');
        }
      } else {
        domElements[domIndex].properties.progress -= 1;
        if (domElements[domIndex].properties.progress <= 0) {
          toggle = true;
          dispatchEvent(element, 'loopstart');
        }
      }
      // Remove transition animation
      // Can be replaced with animated: false in the initializer
      let overlay = document.getElementById(
        domElements[domIndex].properties.overlay
      );
      if (overlay) {
        overlay.style['transition'] = 'none';
        overlay.style['-webkit-transition'] = 'none';
        overlay.style['-moz-transition'] = 'none';
        overlay.style['-ms-transition'] = 'none';
        overlay.style['-o-transition'] = 'none';
      }

      Loadgo.setprogress(element, domElements[domIndex].properties.progress);
    }, duration);
  };

  // Stops the loop interval and shows image
  Loadgo.stop = function (element) {
    if (!elementIsValid(element)) {
      return;
    }

    if (getIndex(element.id) === -1) {
      console.error(
        'Trying to stop loop for a non initialized element. You have to run "init" method first.'
      );
      return;
    }

    clearInterval(domElements[getIndex(element.id)].properties.interval);
    Loadgo.setprogress(element, 100);

    dispatchEvent(element, 'stop');
  };

  /**
   * Remove all plugin properties
   * @param  {DOM} element  DOM element using document.getElementById
   */
  Loadgo.destroy = function (element) {
    const domElementsIndex = getIndex(element.id);
    if (domElementsIndex === -1) {
      return; // element was never initialized
    }

    dispatchEvent(element, 'destroy');

    const opt = Loadgo.options(element);
    domElements.splice(domElementsIndex);

    const container = element.parentNode;
    const parent = container.parentNode;
    const overlay = document.getElementById(opt.overlay);
    if (overlay) {
      if (overlay.parentNode) {
        container.removeChild(opt.overlay); // Removes overlay
      }
    }

    if (parent) {
      parent.appendChild(element); // Moves image to "loadgo-container" parent
      parent.removeChild(container); // Removes "loadgo-container" element
    }
  };

  window.Loadgo = Loadgo;
}.call(this));
