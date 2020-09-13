var assert = chai.assert;

var container, image; // Javascript objects

function runSteps(fns) {
  if (!fns.length) return;

  var current = fns[0],
    rest = fns.slice(1);
  requestAnimationFrame(function () {
    current();
    runSteps(rest);
  });
}

beforeEach(() => {
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

afterEach(() => {
  // Clean test body (https://stackoverflow.com/a/3955238/552669)
  var testContainer = document.getElementById('test');
  while (testContainer.firstChild)
    testContainer.removeChild(testContainer.firstChild);

  var testResize = document.getElementById('test-resize');
  if (testResize) testResize.parentElement.removeChild(testResize);

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

  it('It should have a div with class "loadgo-overlay" on default init', (done) => {
    Loadgo.init(image, {
      on: {
        init: () => {
          try {
            let exists = false;
            const nodes = container.childNodes[0].childNodes;
            for (let i = 0, l = nodes.length; i < l; i++) {
              if (nodes[i].className.indexOf('loadgo-overlay') !== -1) {
                exists = true;
                break;
              }
            }

            assert.equal(exists, true);
          } catch (e) {
            done(e);
          }

          done();
        }
      }
    });
  });
});

describe('JS - Default properties', (done) => {
  // Background color
  it('Background color must be #FFFFFF by default', (done) => {
    Loadgo.init(image, {
      on: {
        init: () => {
          try {
            assert.equal(Loadgo.options(image).bgcolor, '#FFFFFF');
          } catch (e) {
            done(e);
          }

          done();
        }
      }
    });
  });

  it('Background color must be #FFAA00 if #FFAA00 is provided', (done) => {
    Loadgo.init(image, {
      bgcolor: '#FFAA00',
      on: {
        init: () => {
          try {
            assert.equal(Loadgo.options(image).bgcolor, '#FFAA00');
          } catch (e) {
            done(e);
          }

          done();
        }
      }
    });
  });

  // Opacity
  it('Opacity must be 0.5 by default', (done) => {
    Loadgo.init(image, {
      on: {
        init: () => {
          try {
            assert.equal(Loadgo.options(image).opacity, '0.5');
          } catch (e) {
            done(e);
          }

          done();
        }
      }
    });
  });

  it('Opacity must be 0.8 if 0.8 is provided', (done) => {
    Loadgo.init(image, {
      opacity: '0.8',
      on: {
        init: () => {
          try {
            assert.equal(Loadgo.options(image).opacity, '0.8');
          } catch (e) {
            done(e);
          }

          done();
        }
      }
    });
  });

  // Animated
  it('Animated must be TRUE by default', (done) => {
    Loadgo.init(image, {
      on: {
        init: () => {
          try {
            assert.ok(Loadgo.options(image).animated);
          } catch (e) {
            done(e);
          }

          done();
        }
      }
    });
  });

  it('Animated must be FALSE if FALSE is provided', (done) => {
    Loadgo.init(image, {
      animated: false,
      on: {
        init: () => {
          try {
            assert.ok(!Loadgo.options(image).animated);
          } catch (e) {
            done(e);
          }

          done();
        }
      }
    });
  });

  it('Animated must be TRUE if TRUE is provided', (done) => {
    Loadgo.init(image, {
      animated: true,
      on: {
        init: () => {
          try {
            assert.ok(Loadgo.options(image).animated);
          } catch (e) {
            done(e);
          }

          done();
        }
      }
    });
  });

  // Image
  it('Overlay image must be NULL by default', (done) => {
    Loadgo.init(image, {
      on: {
        init: () => {
          try {
            assert.ok(Loadgo.options(image).image === null);
          } catch (e) {
            done(e);
          }

          done();
        }
      }
    });
  });

  it('Overlay image must be "logo.png" if "logo.png" is provided', (done) => {
    Loadgo.init(image, {
      image: 'logo.png',
      on: {
        init: () => {
          try {
            assert.ok(Loadgo.options(image).image === 'logo.png');
          } catch (e) {
            done(e);
          }

          done();
        }
      }
    });
  });

  // Class
  it('Class must be NULL by default', (done) => {
    Loadgo.init(image, {
      on: {
        init: () => {
          try {
            assert.ok(Loadgo.options(image).class === null);
          } catch (e) {
            done(e);
          }

          done();
        }
      }
    });
  });

  it('Class must add "my-class" to overlay classes if "my-class" is provided', (done) => {
    Loadgo.init(image, {
      class: 'my-class',
      on: {
        init: () => {
          try {
            assert.ok(Loadgo.options(image).class === 'my-class');
          } catch (e) {
            done(e);
          }

          done();
        }
      }
    });
  });

  // Direction
  it('Direction must be "lr" by default', (done) => {
    Loadgo.init(image, {
      on: {
        init: () => {
          try {
            assert.ok(Loadgo.options(image).direction === 'lr');
          } catch (e) {
            done(e);
          }

          done();
        }
      }
    });
  });

  it('Direction must be "rl" if "rl" is provided', (done) => {
    Loadgo.init(image, {
      direction: 'rl',
      on: {
        init: () => {
          try {
            assert.ok(Loadgo.options(image).direction === 'rl');
          } catch (e) {
            done(e);
          }

          done();
        }
      }
    });
  });

  it('Direction must be set to default "lr" if provided direction is not a valid direction', (done) => {
    Loadgo.init(image, {
      direction: 'left-to-right',
      on: {
        init: () => {
          try {
            assert.ok(Loadgo.options(image).direction === 'lr');
          } catch (e) {
            done(e);
          }

          done();
        }
      }
    });
  });

  // Filter
  it('Filter must be NULL by default', (done) => {
    Loadgo.init(image, {
      on: {
        init: () => {
          try {
            assert.ok(Loadgo.options(image).filter === null);
          } catch (e) {
            done(e);
          }

          done();
        }
      }
    });
  });

  it('Filter must be "blur" if "blur" is provided', (done) => {
    Loadgo.init(image, {
      filter: 'blur',
      on: {
        init: () => {
          try {
            assert.ok(Loadgo.options(image).filter === 'blur');
          } catch (e) {
            done(e);
          }

          done();
        }
      }
    });
  });

  it('Filter must be set to default NULL if provided filter is not a valid filter', (done) => {
    Loadgo.init(image, {
      filter: 'invalid-filter',
      on: {
        init: () => {
          try {
            assert.ok(Loadgo.options(image).filter === null);
          } catch (e) {
            done(e);
          }

          done();
        }
      }
    });
  });

  // Resize
  it('Resize must execute default function by default', (done) => {
    Loadgo.init(image, {
      on: {
        init: () => {
          try {
            var preResize = document.getElementById('test-resize') !== null;

            window.dispatchEvent(new Event('resize'));

            var postResize = document.getElementById('test-resize') !== null;

            assert.ok(preResize === postResize);
          } catch (e) {
            done(e);
          }

          done();
        }
      }
    });
  });

  it('Resize must execute custom function if provided', (done) => {
    Loadgo.init(image, {
      resize: function () {
        var testResize = document.createElement('div');
        testResize.id = 'test-resize';
        document.getElementsByTagName('body')[0].appendChild(testResize);
      },
      on: {
        init: () => {
          try {
            var preResize = document.getElementById('test-resize') !== null;

            window.dispatchEvent(new Event('resize'));

            var postResize = document.getElementById('test-resize') !== null;

            assert.ok(preResize !== postResize);
          } catch (e) {
            done(e);
          }

          done();
        }
      }
    });
  });
});

describe('JS - Overlay render', () => {
  it('LoadGo only creates one overlay', (done) => {
    Loadgo.init(image, {
      on: {
        init: () => {
          try {
            let exists = 0;
            const nodes = container.childNodes[0].childNodes;
            for (let i = 0, l = nodes.length; i < l; i++) {
              if (nodes[i].className.indexOf('loadgo-overlay') !== -1) {
                exists += 1;
              }
            }

            assert.equal(exists, 1);
          } catch (e) {
            done(e);
          }

          done();
        }
      }
    });
  });

  // Dimensions
  it('Overlay and image sizes are equal', (done) => {
    Loadgo.init(image, {
      on: {
        init: () => {
          const imageWidth = parseFloat(event.target.width);
          const imageHeight = parseFloat(event.target.height);

          try {
            let overlayWidth = -1;
            let overlayHeight = -1;

            const nodes = container.childNodes[0].childNodes;
            for (let i = 0, l = nodes.length; i < l; i++) {
              if (nodes[i].className.indexOf('loadgo-overlay') !== -1) {
                overlayWidth = parseFloat(nodes[i].style.width);
                overlayHeight = parseFloat(nodes[i].style.height);
                break;
              }
            }
            assert.equal(overlayWidth, imageWidth);
            assert.equal(overlayHeight, imageHeight);
          } catch (e) {
            done(e);
          }

          done();
        }
      }
    });
  });

  it('Overlay width must be half of image width when progress is set to 50% for "left to right" direction', (done) => {
    Loadgo.init(image, {
      on: {
        init: () => {
          Loadgo.setprogress(image, 50);
        },
        setprogress: () => {
          const imageWidth = parseFloat(event.target.width);

          try {
            let overlayWidth = -1;
            let overlayHeight = -1;

            const nodes = container.childNodes[0].childNodes;
            for (let i = 0, l = nodes.length; i < l; i++) {
              if (nodes[i].className.indexOf('loadgo-overlay') !== -1) {
                overlayWidth = parseFloat(nodes[i].style.width);
                break;
              }
            }
            assert.equal(overlayWidth, imageWidth / 2);
          } catch (e) {
            done(e);
          }

          done();
        }
      }
    });
  });

  it('Overlay height will not change when progress is set to 50% for "left to right" direction', (done) => {
    Loadgo.init(image, {
      on: {
        init: () => {
          Loadgo.setprogress(image, 50);
        },
        setprogress: () => {
          const imageHeight = parseFloat(event.target.height);

          try {
            let overlayHeight = -1;

            const nodes = container.childNodes[0].childNodes;
            for (let i = 0, l = nodes.length; i < l; i++) {
              if (nodes[i].className.indexOf('loadgo-overlay') !== -1) {
                overlayHeight = parseFloat(nodes[i].style.height);
                break;
              }
            }
            assert.equal(overlayHeight, imageHeight);
          } catch (e) {
            done(e);
          }

          done();
        }
      }
    });
  });

  it('Overlay width must be half of image width when progress is set to 50% for "right to left" direction', (done) => {
    Loadgo.init(image, {
      direction: 'rl',
      on: {
        init: () => {
          Loadgo.setprogress(image, 50);
        },
        setprogress: () => {
          const imageWidth = parseFloat(event.target.width);

          try {
            let overlayWidth = -1;

            const nodes = container.childNodes[0].childNodes;
            for (let i = 0, l = nodes.length; i < l; i++) {
              if (nodes[i].className.indexOf('loadgo-overlay') !== -1) {
                overlayWidth = parseFloat(nodes[i].style.width);
                break;
              }
            }
            assert.equal(overlayWidth, imageWidth / 2);
          } catch (e) {
            done(e);
          }

          done();
        }
      }
    });
  });

  it('Overlay height will not change when progress is set to 50% for "right to left" direction', (done) => {
    Loadgo.init(image, {
      direction: 'rl',
      on: {
        init: () => {
          Loadgo.setprogress(image, 50);
        },
        setprogress: () => {
          const imageHeight = parseFloat(event.target.height);

          try {
            let overlayHeight = -1;

            const nodes = container.childNodes[0].childNodes;
            for (let i = 0, l = nodes.length; i < l; i++) {
              if (nodes[i].className.indexOf('loadgo-overlay') !== -1) {
                overlayHeight = parseFloat(nodes[i].style.height);
                break;
              }
            }
            assert.equal(overlayHeight, imageHeight);
          } catch (e) {
            done(e);
          }

          done();
        }
      }
    });
  });

  it('Overlay height must be half of image height when progress is set to 50% for "top to bottom" direction', (done) => {
    Loadgo.init(image, {
      direction: 'tb',
      on: {
        init: () => {
          Loadgo.setprogress(image, 50);
        },
        setprogress: () => {
          const imageHeight = parseFloat(event.target.height);

          try {
            let overlayHeight = -1;

            const nodes = container.childNodes[0].childNodes;
            for (let i = 0, l = nodes.length; i < l; i++) {
              if (nodes[i].className.indexOf('loadgo-overlay') !== -1) {
                overlayHeight = parseFloat(nodes[i].style.height);
                break;
              }
            }
            assert.equal(overlayHeight, imageHeight / 2);
          } catch (e) {
            done(e);
          }

          done();
        }
      }
    });
  });

  it('Overlay width will not change when progress is set to 50% for "top to bottom" direction', (done) => {
    Loadgo.init(image, {
      direction: 'tb',
      on: {
        init: () => {
          Loadgo.setprogress(image, 50);
        },
        setprogress: () => {
          const imageWidth = parseFloat(event.target.width);

          try {
            let overlayWidth = -1;

            const nodes = container.childNodes[0].childNodes;
            for (let i = 0, l = nodes.length; i < l; i++) {
              if (nodes[i].className.indexOf('loadgo-overlay') !== -1) {
                overlayWidth = parseFloat(nodes[i].style.width);
                break;
              }
            }
            assert.equal(overlayWidth, imageWidth);
          } catch (e) {
            done(e);
          }

          done();
        }
      }
    });
  });

  it('Overlay height must be half of image height when progress is set to 50% for "bottom to top" direction', (done) => {
    Loadgo.init(image, {
      direction: 'bt',
      on: {
        init: () => {
          Loadgo.setprogress(image, 50);
        },
        setprogress: () => {
          const imageHeight = parseFloat(event.target.height);

          try {
            let overlayHeight = -1;

            const nodes = container.childNodes[0].childNodes;
            for (let i = 0, l = nodes.length; i < l; i++) {
              if (nodes[i].className.indexOf('loadgo-overlay') !== -1) {
                overlayHeight = parseFloat(nodes[i].style.height);
                break;
              }
            }
            assert.equal(overlayHeight, imageHeight / 2);
          } catch (e) {
            done(e);
          }

          done();
        }
      }
    });
  });

  it('Overlay width will not change when progress is set to 50% for "bottom to top" direction', (done) => {
    Loadgo.init(image, {
      direction: 'bt',
      on: {
        init: () => {
          Loadgo.setprogress(image, 50);
        },
        setprogress: () => {
          const imageWidth = parseFloat(event.target.width);
          const imageHeight = parseFloat(event.target.height);

          try {
            let overlayWidth = -1;

            const nodes = container.childNodes[0].childNodes;
            for (let i = 0, l = nodes.length; i < l; i++) {
              if (nodes[i].className.indexOf('loadgo-overlay') !== -1) {
                overlayWidth = parseFloat(nodes[i].style.width);
                break;
              }
            }
            assert.equal(overlayWidth, imageWidth);
          } catch (e) {
            done(e);
          }

          done();
        }
      }
    });
  });

  // Animation
  it('Overlay has CSS animations by default', (done) => {
    Loadgo.init(image, {
      on: {
        init: () => {
          try {
            const nodes = container.childNodes[0].childNodes;
            for (let i = 0, l = nodes.length; i < l; i++) {
              if (nodes[i].className.indexOf('loadgo-overlay') !== -1) {
                overlay = nodes[i];
                break;
              }
            }
            assert.equal(overlay.style.transition, 'all 0.6s ease 0s');
          } catch (e) {
            done(e);
          }

          done();
        }
      }
    });
  });

  it('Overlay has CSS animations added if "animated" is set to TRUE', (done) => {
    Loadgo.init(image, {
      animated: true,
      on: {
        init: () => {
          try {
            const nodes = container.childNodes[0].childNodes;
            for (let i = 0, l = nodes.length; i < l; i++) {
              if (nodes[i].className.indexOf('loadgo-overlay') !== -1) {
                overlay = nodes[i];
                break;
              }
            }
            assert.equal(overlay.style.transition, 'all 0.6s ease 0s');
          } catch (e) {
            done(e);
          }

          done();
        }
      }
    });
  });

  it('Overlay does not have any CSS animation added if "animated" is set to FALSE', (done) => {
    Loadgo.init(image, {
      animated: false,
      on: {
        init: () => {
          try {
            const nodes = container.childNodes[0].childNodes;
            for (let i = 0, l = nodes.length; i < l; i++) {
              if (nodes[i].className.indexOf('loadgo-overlay') !== -1) {
                overlay = nodes[i];
                break;
              }
            }
            assert.equal(overlay.style.transition, '');
          } catch (e) {
            done(e);
          }

          done();
        }
      }
    });
  });

  // Background color
  it('Overlay color is "#FFFFFF" by default', (done) => {
    Loadgo.init(image, {
      on: {
        init: () => {
          try {
            const nodes = container.childNodes[0].childNodes;
            for (let i = 0, l = nodes.length; i < l; i++) {
              if (nodes[i].className.indexOf('loadgo-overlay') !== -1) {
                overlay = nodes[i];
                break;
              }
            }
            assert.equal(overlay.style.backgroundColor, 'rgb(255, 255, 255)');
          } catch (e) {
            done(e);
          }

          done();
        }
      }
    });
  });

  it('Overlay color is "#FF0000" if "bgcolor" is set to "#FF0000"', (done) => {
    Loadgo.init(image, {
      bgcolor: '#FF0000',
      on: {
        init: () => {
          try {
            const nodes = container.childNodes[0].childNodes;
            for (let i = 0, l = nodes.length; i < l; i++) {
              if (nodes[i].className.indexOf('loadgo-overlay') !== -1) {
                overlay = nodes[i];
                break;
              }
            }
            assert.equal(overlay.style.backgroundColor, 'rgb(255, 0, 0)');
          } catch (e) {
            done(e);
          }

          done();
        }
      }
    });
  });

  // Opacity
  it('Overlay opacity is "0.5" by default', (done) => {
    Loadgo.init(image, {
      on: {
        init: () => {
          try {
            const nodes = container.childNodes[0].childNodes;
            for (let i = 0, l = nodes.length; i < l; i++) {
              if (nodes[i].className.indexOf('loadgo-overlay') !== -1) {
                overlay = nodes[i];
                break;
              }
            }
            assert.equal(overlay.style.opacity, 0.5);
          } catch (e) {
            done(e);
          }

          done();
        }
      }
    });
  });

  it('Overlay opacity is "0.8" if "opacity" is set to "0.8"', (done) => {
    Loadgo.init(image, {
      opacity: 0.8,
      on: {
        init: () => {
          try {
            const nodes = container.childNodes[0].childNodes;
            for (let i = 0, l = nodes.length; i < l; i++) {
              if (nodes[i].className.indexOf('loadgo-overlay') !== -1) {
                overlay = nodes[i];
                break;
              }
            }
            assert.equal(overlay.style.opacity, 0.8);
          } catch (e) {
            done(e);
          }

          done();
        }
      }
    });
  });

  // Filters
  it('Image filter will not be applied by default', (done) => {
    Loadgo.init(image, {
      on: {
        init: () => {
          try {
            assert.equal(image.style.filter, '');
          } catch (e) {
            done(e);
          }

          done();
        }
      }
    });
  });

  it('Image filter will not be applied if an unknown filter is provided', (done) => {
    Loadgo.init(image, {
      filter: 'this-filter-does-not-exist',
      on: {
        init: () => {
          try {
            assert.equal(image.style.filter, '');
          } catch (e) {
            done(e);
          }

          done();
        }
      }
    });
  });

  it('Image filter will be "sepia" if "filter" is set to "sepia"', (done) => {
    Loadgo.init(image, {
      filter: 'sepia',
      on: {
        init: () => {
          try {
            assert.equal(image.style.filter, 'sepia(1)');
          } catch (e) {
            done(e);
          }

          done();
        }
      }
    });
  });

  it('Overlay will not be created if "filter" option is set to a valid filter', (done) => {
    Loadgo.init(image, {
      filter: 'sepia',
      on: {
        init: () => {
          try {
            let overlay;
            const nodes = container.childNodes[0].childNodes;
            for (let i = 0, l = nodes.length; i < l; i++) {
              if (nodes[i].className.indexOf('loadgo-overlay') !== -1) {
                overlay = nodes[i];
                break;
              }
            }

            assert.equal(overlay, null);
          } catch (e) {
            done(e);
          }

          done();
        }
      }
    });
  });

  it('Overlay will be created if "filter" option is set to a non valid filter', (done) => {
    Loadgo.init(image, {
      filter: 'this-filter-does-not-exist',
      on: {
        init: () => {
          try {
            let overlay;
            const nodes = container.childNodes[0].childNodes;
            for (let i = 0, l = nodes.length; i < l; i++) {
              if (nodes[i].className.indexOf('loadgo-overlay') !== -1) {
                overlay = nodes[i];
                break;
              }
            }

            assert.ok(overlay !== null);
          } catch (e) {
            done(e);
          }

          done();
        }
      }
    });
  });

  // Image
  it('Overlay does not have background image by default', (done) => {
    Loadgo.init(image, {
      on: {
        init: () => {
          try {
            let overlay;
            const nodes = container.childNodes[0].childNodes;
            for (let i = 0, l = nodes.length; i < l; i++) {
              if (nodes[i].className.indexOf('loadgo-overlay') !== -1) {
                overlay = nodes[i];
                break;
              }
            }

            assert.equal(overlay.style.backgroundImage, '');
          } catch (e) {
            done(e);
          }

          done();
        }
      }
    });
  });

  it('Overlay have "logo.png" as background image if "image" property is set to "logo.png"', (done) => {
    Loadgo.init(image, {
      image: 'logo.png',
      on: {
        init: () => {
          try {
            let overlay;
            const nodes = container.childNodes[0].childNodes;
            for (let i = 0, l = nodes.length; i < l; i++) {
              if (nodes[i].className.indexOf('loadgo-overlay') !== -1) {
                overlay = nodes[i];
                break;
              }
            }

            assert.ok(overlay.style.backgroundImage.indexOf('logo.png') > -1);
          } catch (e) {
            done(e);
          }

          done();
        }
      }
    });
  });
});

describe('JS - Get/Set progress', () => {
  it('Progress will be 0 by default', (done) => {
    Loadgo.init(image, {
      on: {
        init: () => {
          try {
            assert.equal(Loadgo.getprogress(image), 0);
          } catch (e) {
            done(e);
          }

          done();
        }
      }
    });
  });

  it('Progress will be 50 after setting it', (done) => {
    Loadgo.init(image, {
      on: {
        init: () => {
          Loadgo.setprogress(image, 50);
        },
        setprogress: () => {
          try {
            assert.equal(Loadgo.getprogress(image), 50);
          } catch (e) {
            done(e);
          }

          done();
        }
      }
    });
  });

  it('Progress will be 0 if trying to get progress for a non initialized element', () => {
    assert.equal(Loadgo.getprogress(image), 0);
  });

  it('Progress will not change if a value < 0 is provided', (done) => {
    Loadgo.init(image, {
      on: {
        init: () => {
          Loadgo.setprogress(image, -500);
        },
        setprogress: () => {
          try {
            assert.equal(Loadgo.getprogress(image), 0);
          } catch (e) {
            done(e);
          }

          done();
        }
      }
    });
  });

  it('Progress will not change if a value > 100 is provided', (done) => {
    Loadgo.init(image, {
      on: {
        init: () => {
          Loadgo.setprogress(image, 500);
        },
        setprogress: () => {
          try {
            assert.equal(Loadgo.getprogress(image), 0);
          } catch (e) {
            done(e);
          }

          done();
        }
      }
    });
  });
});
