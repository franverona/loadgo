var assert = chai.assert;

var container, image;   // Javascript objects

function runSteps(fns) {
  if (!fns.length) return;

  var current = fns[0], rest = fns.slice(1);
  requestAnimationFrame(function () {
    current();
    runSteps(rest);
  });
}

beforeEach( () => {

  // Add test div: all tests which involve DOM addition must be inside this div
  var testContainer = document.getElementById('test');
  if (typeof testContainer === 'undefined' || testContainer === null) {
    testContainer = document.createElement('div');
    testContainer.id = 'test';
    document.getElementsByTagName('body')[0].appendChild(testContainer);
  }

  image = document.createElement('img');
  image.id = 'id-logo';
  image.src = 'logo.png';

  container = document.createElement('div');
  container.id = 'id-container';
  container.appendChild(image);

  document.getElementById('test').appendChild(container);

});

afterEach( () => {
  // Clean test body (https://stackoverflow.com/a/3955238/552669)
  var testContainer = document.getElementById('test');
  while (testContainer.firstChild) 
    testContainer.removeChild(testContainer.firstChild);

  var testResize = document.getElementById('test-resize');
  if (testResize)
    testResize.parentElement.removeChild(testResize);

  // Clear Loadgo elements store
  Loadgo.destroy(image);
});

describe('JS - Initialization', () => {

  it('LoadGo script adds without error ', () => {
    assert.equal(typeof window.Loadgo, 'object');
  });

  it('LoadGo throws an error if it finds more than one element for provided selector', () => {
    var fn = function () {
      Loadgo.init(document.getElementsByTagName(div));
    };
    assert.throws(fn, Error);
  });

  it('LoadGo throws an error if element is not an img', () => {
    var fn = function () {
      Loadgo.init(document.getElementsByTagName(div));
    };
    assert.throws(fn, Error);
  });

  it('It should have a div with class "loadgo-overlay" on default init', () => {
    Loadgo.init(image);
    var exists = false;
    for (var i = 0, l = container.childNodes[0].childNodes.length; i < l; i++) {
      if (container.childNodes[0].childNodes[i].className.indexOf('loadgo-overlay') !== -1) {
        exists = true;
        break;
      }
    }
    assert.equal( exists, true );
  });

});

describe('JS - Default properties', () => {

  // Background color
  it('Background color must be #FFFFFF by default', () => {
    Loadgo.init(image);
    assert.equal( Loadgo.options(image).bgcolor, '#FFFFFF' );
  });

  it('Background color must be #FFAA00 if #FFAA00 is provided', () => {
    Loadgo.init(image, {
      bgcolor: '#FFAA00'
    });
    assert.equal( Loadgo.options(image).bgcolor, '#FFAA00' );
  });

  // Opacity
  it('Opacity must be 0.5 by default', () => {
    Loadgo.init(image);
    assert.equal( Loadgo.options(image).opacity, '0.5' );
  });

  it('Opacity must be 0.8 if 0.8 is provided', () => {
    Loadgo.init(image, {
      opacity: "0.8"
    });
    assert.equal( Loadgo.options(image).opacity, '0.8' );
  });

  // Animated
  it('Animated must be TRUE by default', () => {
    Loadgo.init(image);
    assert.ok( Loadgo.options(image).animated );
  });

  it('Animated must be FALSE if FALSE is provided', () => {
    Loadgo.init(image, {
      animated:   false
    });
    assert.ok( !Loadgo.options(image).animated );
  });

  it('Animated must be TRUE if TRUE is provided', () => {
    Loadgo.init(image, {
      animated:   true
    });
    assert.ok( Loadgo.options(image).animated );
  });

  // Image
  it('Overlay image must be NULL by default', () => {
    Loadgo.init(image);
    assert.ok( Loadgo.options(image).image === null );
  });

  it('Overlay image must be "logo.png" if "logo.png" is provided', () => {
    Loadgo.init(image, {
      image:  'logo.png'
    });
    assert.ok( Loadgo.options(image).image === 'logo.png' );
  });

  // Class 
  it('Class must be NULL by default', () => {
    Loadgo.init(image);
    assert.ok( Loadgo.options(image).class === null );
  });

  it('Class must add "my-class" to overlay classes if "my-class" is provided', () => {
    Loadgo.init(image, {
      class:  'my-class'
    });
    assert.ok( Loadgo.options(image).class === 'my-class' );
  });

  // Direction
  it('Direction must be "lr" by default', () => {
    Loadgo.init(image);
    assert.ok( Loadgo.options(image).direction === 'lr' );
  });

  it('Direction must be "rl" if "rl" is provided', () => {
    Loadgo.init(image, {
      direction:  'rl'
    });
    assert.ok( Loadgo.options(image).direction === 'rl' );
  });

  it('Direction must be set to default "lr" if provided direction is not a valid direction', () => {
    Loadgo.init(image, {
      direction:  'left-to-right'
    });
    assert.ok( Loadgo.options(image).direction === 'lr' );
  });

  // Filter
  it('Filter must be NULL by default', () => {
    Loadgo.init(image);
    assert.ok( Loadgo.options(image).filter === null );
  });

  it('Filter must be "blur" if "blur" is provided', () => {
    Loadgo.init(image, {
      filter: 'blur'
    });
    assert.ok( Loadgo.options(image).filter === 'blur' );
  });

  it('Filter must be set to default NULL if provided filter is not a valid filter', () => {
    Loadgo.init(image, {
      filter: 'invalid-filter'
    });
    assert.ok( Loadgo.options(image).filter === null );
  });

  // Resize
  it('Resize must execute default function by default', () => {
    Loadgo.init(image);

    var preResize = document.getElementById('test-resize') !== null;

    window.dispatchEvent(new Event('resize'));

    var postResize = document.getElementById('test-resize') !== null;

    assert.ok( preResize === postResize );
  });

  it('Resize must execute custom function if provided', () => {
    Loadgo.init(image, {
      resize: function () {
        var testResize = document.createElement('div');
        testResize.id = 'test-resize';
        document.getElementsByTagName('body')[0].appendChild(testResize);
      }
    });

    var preResize = document.getElementById('test-resize') !== null;

    window.dispatchEvent(new Event('resize'));

    var postResize = document.getElementById('test-resize') !== null;

    console.log(preResize, postResize)

    assert.ok( preResize !== postResize );
  });

});

describe('JS - Overlay render', () => {

  it('LoadGo only creates one overlay', () => {
    Loadgo.init(image);
    var exists = 0;
    for (var i = 0, l = container.childNodes[0].childNodes.length; i < l; i++) 
      if (container.childNodes[0].childNodes[i].className.indexOf('loadgo-overlay') !== -1) 
        exists++;
    
    assert.equal( exists, 1 );
  });

  // Dimensions
  it('Overlay and image sizes are equal', ( done ) => {
    image.onload = function () {
      var imageWidth = parseFloat(this.width), imageHeight = parseFloat(this.height);
      Loadgo.init(image);
      var overlayWidth = -1, overlayHeight = -1;
      for (var i = 0, l = container.childNodes[0].childNodes.length; i < l; i++) {
        if (container.childNodes[0].childNodes[i].className.indexOf('loadgo-overlay') !== -1) {
          overlayWidth = parseFloat(container.childNodes[0].childNodes[i].style.width);
          overlayHeight = parseFloat(container.childNodes[0].childNodes[i].style.height);
          break;
        }
      }
      assert.equal( overlayWidth, imageWidth );
      assert.equal( overlayHeight, imageHeight );
      done();
    };
  });

  it('Overlay width must be half of image width when progress is set to 50% for "left to right" direction', ( done ) => {
    image.onload = function () {
      var imageWidth = parseFloat(this.width);
      Loadgo.init(image);
      Loadgo.setprogress(image, 50);
      var overlayWidth = -1;
      for (var i = 0, l = container.childNodes[0].childNodes.length; i < l; i++) {
        if (container.childNodes[0].childNodes[i].className.indexOf('loadgo-overlay') !== -1) {
          overlayWidth = parseFloat(container.childNodes[0].childNodes[i].style.width);
          break;
        }
      }
      assert.equal( overlayWidth, imageWidth / 2 );
      done();
    };
  });

  it('Overlay height will not change when progress is set to 50% for "left to right" direction', ( done ) => {
    image.onload = function () {
      var imageHeight = parseFloat(this.height);
      Loadgo.init(image);
      Loadgo.setprogress(image, 50);
      var overlayHeight = -1;
      for (var i = 0, l = container.childNodes[0].childNodes.length; i < l; i++) {
        if (container.childNodes[0].childNodes[i].className.indexOf('loadgo-overlay') !== -1) {
          overlayHeight = parseFloat(container.childNodes[0].childNodes[i].style.height);
          break;
        }
      }
      assert.equal( overlayHeight, imageHeight );
      done();
    };
  });

  it('Overlay width must be half of image width when progress is set to 50% for "right to left" direction', ( done ) => {
    image.onload = function () {
      var imageWidth = parseFloat(this.width);
      Loadgo.init(image, {
        direction: 'rl'
      });
      Loadgo.setprogress(image, 50);
      var overlayWidth = -1;
      for (var i = 0, l = container.childNodes[0].childNodes.length; i < l; i++) {
        if (container.childNodes[0].childNodes[i].className.indexOf('loadgo-overlay') !== -1) {
          overlayWidth = parseFloat(container.childNodes[0].childNodes[i].style.width);
          break;
        }
      }
      assert.equal( overlayWidth, imageWidth / 2 );
      done();
    };
  });

  it('Overlay height will not change when progress is set to 50% for "right to left" direction', ( done ) => {
    image.onload = function () {
      var imageHeight = parseFloat(this.height);
      Loadgo.init(image, {
        direction: 'rl'
      });
      Loadgo.setprogress(image, 50);
      var overlayHeight = -1;
      for (var i = 0, l = container.childNodes[0].childNodes.length; i < l; i++) {
        if (container.childNodes[0].childNodes[i].className.indexOf('loadgo-overlay') !== -1) {
          overlayHeight = parseFloat(container.childNodes[0].childNodes[i].style.height);
          break;
        }
      }
      assert.equal( overlayHeight, imageHeight );
      done();
    };
  });

  it('Overlay height must be half of image height when progress is set to 50% for "top to bottom" direction', ( done ) => {
    image.onload = function () {
      var imageHeight = parseFloat(this.height);
      Loadgo.init(image, {
        direction: 'tb'
      });
      Loadgo.setprogress(image, 50);
      var overlayHeight = -1;
      for (var i = 0, l = container.childNodes[0].childNodes.length; i < l; i++) {
        if (container.childNodes[0].childNodes[i].className.indexOf('loadgo-overlay') !== -1) {
          overlayHeight = parseFloat(container.childNodes[0].childNodes[i].style.height);
          break;
        }
      }
      assert.equal( overlayHeight, imageHeight / 2 );   // rounded
      done();
    };
  });

  it('Overlay width will not change when progress is set to 50% for "top to bottom" direction', ( done ) => {
    image.onload = function () {
      var imageWidth = parseFloat(this.width);
      Loadgo.init(image, {
        direction: 'tb'
      });
      Loadgo.setprogress(image, 50);
      var overlayWidth = -1;
      for (var i = 0, l = container.childNodes[0].childNodes.length; i < l; i++) {
        if (container.childNodes[0].childNodes[i].className.indexOf('loadgo-overlay') !== -1) {
          overlayWidth = parseFloat(container.childNodes[0].childNodes[i].style.width);
          break;
        }
      }
      assert.equal( overlayWidth, imageWidth );
      done();
    };
  });

  it('Overlay height must be half of image height when progress is set to 50% for "bottom to top" direction', ( done ) => {
    image.onload = function () {
      var imageHeight = parseFloat(this.height);
      Loadgo.init(image, {
        direction: 'bt'
      });
      Loadgo.setprogress(image, 50);
      var overlayHeight = -1;
      for (var i = 0, l = container.childNodes[0].childNodes.length; i < l; i++) {
        if (container.childNodes[0].childNodes[i].className.indexOf('loadgo-overlay') !== -1) {
          overlayHeight = parseFloat(container.childNodes[0].childNodes[i].style.height);
          break;
        }
      }
      assert.equal( overlayHeight, imageHeight / 2 );
      done();
    };
  });

  it('Overlay width will not change when progress is set to 50% for "bottom to top" direction', ( done ) => {
    image.onload = function () {
      var imageWidth = parseFloat(this.width);
      Loadgo.init(image, {
        direction: 'bt'
      });
      Loadgo.setprogress(image, 50);
      var overlayWidth = -1;
      for (var i = 0, l = container.childNodes[0].childNodes.length; i < l; i++) {
        if (container.childNodes[0].childNodes[i].className.indexOf('loadgo-overlay') !== -1) {
          overlayWidth = parseFloat(container.childNodes[0].childNodes[i].style.width);
          break;
        }
      }
      assert.equal( overlayWidth, imageWidth );
      done();
    };
  });

  // Animation
  it('Overlay has CSS animations by default', () => {
    Loadgo.init(image);
    var overlay;
    for (var i = 0, l = container.childNodes[0].childNodes.length; i < l; i++) {
      if (container.childNodes[0].childNodes[i].className.indexOf('loadgo-overlay') !== -1) {
        overlay = container.childNodes[0].childNodes[i];
        break;
      }
    }
    assert.equal( overlay.style.transition, 'all 0.6s ease' );
  });

  it('Overlay has CSS animations added if "animated" is set to TRUE', () => {
    Loadgo.init(image, {
      animated:   true
    });
    var overlay;
    for (var i = 0, l = container.childNodes[0].childNodes.length; i < l; i++) {
      if (container.childNodes[0].childNodes[i].className.indexOf('loadgo-overlay') !== -1) {
        overlay = container.childNodes[0].childNodes[i];
        break;
      }
    }
    assert.equal( overlay.style.transition, 'all 0.6s ease' );
  });

  it('Overlay does not have any CSS animation added if "animated" is set to FALSE', () => {
    Loadgo.init(image, {
      animated:   false
    });
    var overlay;
    for (var i = 0, l = container.childNodes[0].childNodes.length; i < l; i++) {
      if (container.childNodes[0].childNodes[i].className.indexOf('loadgo-overlay') !== -1) {
        overlay = container.childNodes[0].childNodes[i];
        break;
      }
    }
    assert.equal( overlay.style.transition, '' );
  });

  // Background color
  it('Overlay color is "#FFFFFF" by default', () => {
    Loadgo.init(image);
    var overlay;
    for (var i = 0, l = container.childNodes[0].childNodes.length; i < l; i++) {
      if (container.childNodes[0].childNodes[i].className.indexOf('loadgo-overlay') !== -1) {
        overlay = container.childNodes[0].childNodes[i];
        break;
      }
    }
    assert.equal( overlay.style.backgroundColor, 'rgb(255, 255, 255)' );
  });

  it('Overlay color is "#FF0000" if "bgcolor" is set to "#FF0000"', () => {
    Loadgo.init(image, {
      bgcolor: '#FF0000'
    });
    var overlay;
    for (var i = 0, l = container.childNodes[0].childNodes.length; i < l; i++) {
      if (container.childNodes[0].childNodes[i].className.indexOf('loadgo-overlay') !== -1) {
        overlay = container.childNodes[0].childNodes[i];
        break;
      }
    }
    assert.equal( overlay.style.backgroundColor, 'rgb(255, 0, 0)' );
  });

  // Opacity
  it('Overlay opacity is "0.5" by default', () => {
    Loadgo.init(image);
    var overlay;
    for (var i = 0, l = container.childNodes[0].childNodes.length; i < l; i++) {
      if (container.childNodes[0].childNodes[i].className.indexOf('loadgo-overlay') !== -1) {
        overlay = container.childNodes[0].childNodes[i];
        break;
      }
    }
    assert.equal( overlay.style.opacity, 0.5 );
  });

  it('Overlay opacity is "0.8" if "opacity" is set to "0.8"', () => {
    Loadgo.init(image, {
      opacity: 0.8
    });
    var overlay;
    for (var i = 0, l = container.childNodes[0].childNodes.length; i < l; i++) {
      if (container.childNodes[0].childNodes[i].className.indexOf('loadgo-overlay') !== -1) {
        overlay = container.childNodes[0].childNodes[i];
        break;
      }
    }
    assert.equal( overlay.style.opacity, 0.8 );
  });

  // Filters
  it('Image filter will not be applied by default', () => {
    Loadgo.init(image);
    assert.equal( image.style.filter, '' );
  });

  it('Image filter will not be applied if an unknown filter is provided', () => {
    Loadgo.init(image, {
      filter: 'this-filter-does-not-exist'
    });
    assert.equal( image.style.filter, '' );
  });

  it('Image filter will be "sepia" if "filter" is set to "sepia"', () => {
    Loadgo.init(image, {
      filter: 'sepia'
    });
    assert.equal( image.style.filter, 'sepia(1)' );
  });

  it('Overlay will not be created if "filter" option is set to a valid filter', () => {
    Loadgo.init(image, {
      filter: 'sepia'
    });
    var overlay;
    for (var i = 0, l = container.childNodes[0].childNodes.length; i < l; i++) {
      if (container.childNodes[0].childNodes[i].className.indexOf('loadgo-overlay') !== -1) {
        overlay = container.childNodes[0].childNodes[i];
        break;
      }
    }
    assert.equal( overlay, null );
  });

  it('Overlay will be created if "filter" option is set to a non valid filter', () => {
    Loadgo.init(image, {
      filter: 'this-filter-does-not-exist'
    });
    var overlay;
    for (var i = 0, l = container.childNodes[0].childNodes.length; i < l; i++) {
      if (container.childNodes[0].childNodes[i].className.indexOf('loadgo-overlay') !== -1) {
        overlay = container.childNodes[0].childNodes[i];
        break;
      }
    }
    assert.ok( overlay !== null );
  });

  // Image
  it('Overlay does not have background image by default', () => {
    Loadgo.init(image);
    var overlay;
    for (var i = 0, l = container.childNodes[0].childNodes.length; i < l; i++) {
      if (container.childNodes[0].childNodes[i].className.indexOf('loadgo-overlay') !== -1) {
        overlay = container.childNodes[0].childNodes[i];
        break;
      }
    }
    assert.equal( overlay.style.backgroundImage, '' );
  });

  it('Overlay have "logo.png" as background image if "image" property is set to "logo.png"', () => {
    Loadgo.init(image, {
      image:  'logo.png'
    });
    var overlay;
    for (var i = 0, l = container.childNodes[0].childNodes.length; i < l; i++) {
      if (container.childNodes[0].childNodes[i].className.indexOf('loadgo-overlay') !== -1) {
        overlay = container.childNodes[0].childNodes[i];
        break;
      }
    }
    assert.ok( overlay.style.backgroundImage.indexOf('logo.png') > -1 );
  });

});

describe('JS - Get/Set progress', () => {

  it('Progress will be 0 by default', () => {
    Loadgo.init(image);
    assert.equal(Loadgo.getprogress(image), 0);
  });

  it('Progress will be 50 after setting it', () => {
    Loadgo.init(image);
    Loadgo.setprogress(image, 50);
    assert.equal(Loadgo.getprogress(image), 50);
  });

  it('Progress will be 0 if trying to get progress for a non initialized element', () => {
    assert.equal(Loadgo.getprogress(image), 0);
  });

  it('Progress will not change if a value < 0 or value > 100 is provided', () => {
    Loadgo.init(image);
    var currentProgress = Loadgo.getprogress(image);
    Loadgo.setprogress(image, -500);
    Loadgo.setprogress(image, 500);
    assert.equal(Loadgo.getprogress(image), currentProgress);
  });

});
