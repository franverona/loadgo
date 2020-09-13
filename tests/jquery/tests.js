var assert = chai.assert;

var $container, $image; // jQuery objects

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
  if ($('#test').length === 0) $('body').append('<div id="test"></div>');

  $image = $('<img id="id-logo" src="logo.png" />');

  $container = $('<div id="id-container"></div>');

  $('#test').append($container);
  $('#id-container').append($image);
});

afterEach(() => {
  $image.loadgo('destroy');
  $('body > #test').empty(); // Clean test body
  $('#test-resize').remove();
});

describe('jQuery - Initialization', () => {
  it('LoadGo script adds without error ', () => {
    assert.equal(typeof $.fn.loadgo, 'function');
  });

  it('LoadGo does nothing if it can find the element', () => {
    $('#ghost').loadgo();
    assert.ok(!$('#ghost').siblings('div').hasClass('loadgo-overlay'));
  });

  it('LoadGo throws an error if it finds more than one element for provided selector', () => {
    var fn = function () {
      $('div').loadgo();
    };
    assert.throws(fn, Error);
  });

  it('LoadGo throws an error if element is not an img', () => {
    var fn = function () {
      $('div').loadgo();
    };
    assert.throws(fn, Error);
  });

  it('It should have a div with class "loadgo-overlay" on default init', (done) => {
    $image.loadgo({
      on: {
        init: () => {
          assert.ok($image.siblings('div').hasClass('loadgo-overlay'));
          done();
        }
      }
    });
  });
});

describe('jQuery - Default properties', () => {
  // Background color
  it('Background color must be #FFFFFF by default', () => {
    $image.loadgo();
    assert.equal($image.loadgo('options').bgcolor, '#FFFFFF');
  });

  it('Background color must be #FFAA00 if #FFAA00 is provided', () => {
    $image.loadgo({
      bgcolor: '#FFAA00'
    });
    assert.equal($image.loadgo('options').bgcolor, '#FFAA00');
  });

  // Opacity
  it('Opacity must be 0.5 by default', () => {
    $image.loadgo();
    assert.equal($image.loadgo('options').opacity, '0.5');
  });

  it('Opacity must be 0.8 if 0.8 is provided', () => {
    $image.loadgo({
      opacity: '0.8'
    });
    assert.equal($image.loadgo('options').opacity, '0.8');
  });

  // Animated
  it('Animated must be TRUE by default', () => {
    $image.loadgo();
    assert.ok($image.loadgo('options').animated);
  });

  it('Animated must be FALSE if FALSE is provided', () => {
    $image.loadgo({
      animated: false
    });
    assert.ok(!$image.loadgo('options').animated);
  });

  it('Animated must be TRUE if TRUE is provided', () => {
    $image.loadgo({
      animated: true
    });
    assert.ok($image.loadgo('options').animated);
  });

  // Image
  it('Overlay image must be NULL by default', () => {
    $image.loadgo();
    assert.ok($image.loadgo('options').image === null);
  });

  it('Overlay image must be "logo.png" if "logo.png" is provided', () => {
    $image.loadgo({
      image: 'logo.png'
    });
    assert.ok($image.loadgo('options').image === 'logo.png');
  });

  // Class
  it('Class must be NULL by default', () => {
    $image.loadgo();
    assert.ok($image.loadgo('options').class === null);
  });

  it('Class must add "my-class" to overlay classes if "my-class" is provided', () => {
    $image.loadgo({
      class: 'my-class'
    });
    assert.ok($image.loadgo('options').class === 'my-class');
  });

  // Direction
  it('Direction must be "lr" by default', () => {
    $image.loadgo();
    assert.ok($image.loadgo('options').direction === 'lr');
  });

  it('Direction must be "rl" if "rl" is provided', () => {
    $image.loadgo({
      direction: 'rl'
    });
    assert.ok($image.loadgo('options').direction === 'rl');
  });

  it('Direction must be set to default "lr" if provided direction is not a valid direction', () => {
    $image.loadgo({
      direction: 'left-to-right'
    });
    assert.ok($image.loadgo('options').direction === 'lr');
  });

  // Filter
  it('Filter must be NULL by default', () => {
    $image.loadgo();
    assert.ok($image.loadgo('options').filter === null);
  });

  it('Filter must be "blur" if "blur" is provided', () => {
    $image.loadgo({
      filter: 'blur'
    });
    assert.ok($image.loadgo('options').filter === 'blur');
  });

  it('Filter must be set to default NULL if provided filter is not a valid filter', () => {
    $image.loadgo({
      direction: 'invalid-filter'
    });
    assert.ok($image.loadgo('options').filter === null);
  });

  // Resize
  it('Resize must execute default function by default', (done) => {
    var preResize = $('#test-resize').length > 0;
    $image.loadgo({
      on: {
        init: () => {
          $(window).trigger('resize');
          var postResize = $('#test-resize').length > 0;
          assert.ok(preResize === postResize);
          done();
        }
      }
    });
  });

  it('Resize must execute custom function if provided', (done) => {
    var preResize = $('#test-resize').length > 0;
    $image.loadgo({
      resize: function () {
        $('body').append('<div id="test-resize"></div>');
      },
      on: {
        init: () => {
          $(window).trigger('resize');

          var postResize = $('#test-resize').length > 0;

          assert.ok(preResize !== postResize);
          done();
        }
      }
    });
  });
});

describe('jQuery - Overlay render', () => {
  it('LoadGo only creates one overlay', (done) => {
    $image.loadgo({
      on: {
        init: () => {
          assert.equal($image.siblings('.loadgo-overlay').length, 1);
          done();
        }
      }
    });
  });

  // Dimensions
  it('Overlay and image sizes are equal', (done) => {
    $image.on('load', (event) => {
      const imageWidth = event.target.clientWidth;
      const imageHeight = event.target.clientHeight;
      $image.loadgo({
        on: {
          init: () => {
            const $overlay = $image.siblings('.loadgo-overlay').first();
            const overlayWidth = $overlay.width();
            const overlayHeight = $overlay.height();

            try {
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
  });

  it('Overlay width must be half of image width when progress is set to 50% for "left to right" direction', (done) => {
    $image.on('load', (event) => {
      const imageWidth = event.target.clientWidth;
      $image.loadgo({
        direction: 'lr',
        on: {
          init: () => {
            $image.loadgo('setprogress', 50);
          },
          setprogress: () => {
            setTimeout(() => {
              const $overlay = $image.siblings('.loadgo-overlay').first();
              const overlayWidth = $overlay.width();
              try {
                assert.equal(overlayWidth, imageWidth / 2);
              } catch (e) {
                done(e);
              }

              done();
            }, 1000);
          }
        }
      });
    });
  });

  it('Overlay height will not change when progress is set to 50% for "left to right" direction', (done) => {
    $image.on('load', (event) => {
      const imageHeight = event.target.clientHeight;
      $image.loadgo({
        direction: 'lr',
        on: {
          init: () => {
            $image.loadgo('setprogress', 50);
          },
          setprogress: () => {
            setTimeout(() => {
              const $overlay = $image.siblings('.loadgo-overlay').first();
              const overlayHeight = $overlay.height();
              try {
                assert.equal(overlayHeight, imageHeight);
              } catch (e) {
                done(e);
              }

              done();
            }, 1000);
          }
        }
      });
    });
  });

  it('Overlay width must be half of image width when progress is set to 50% for "right to left" direction', (done) => {
    $image.on('load', (event) => {
      const imageWidth = event.target.clientWidth;
      $image.loadgo({
        direction: 'rl',
        on: {
          init: () => {
            $image.loadgo('setprogress', 50);
          },
          setprogress: () => {
            setTimeout(() => {
              const $overlay = $image.siblings('.loadgo-overlay').first();
              const overlayWidth = $overlay.width();
              try {
                assert.equal(overlayWidth, imageWidth / 2);
              } catch (e) {
                done(e);
              }
              done();
            }, 1000);
          }
        }
      });
    });
  });

  it('Overlay height will not change when progress is set to 50% for "right to left" direction', (done) => {
    $image.on('load', (event) => {
      const imageHeight = event.target.clientHeight;
      $image.loadgo({
        direction: 'rl',
        on: {
          init: () => {
            $image.loadgo('setprogress', 50);
          },
          setprogress: () => {
            setTimeout(() => {
              const $overlay = $image.siblings('.loadgo-overlay').first();
              const overlayHeight = $overlay.height();
              try {
                assert.equal(overlayHeight, imageHeight);
              } catch (e) {
                done(e);
              }
              done();
            }, 1000);
          }
        }
      });
    });
  });

  it('Overlay height must be half of image height when progress is set to 50% for "top to bottom" direction', (done) => {
    $image.on('load', (event) => {
      const imageHeight = event.target.clientHeight;
      $image.loadgo({
        direction: 'tb',
        on: {
          init: () => {
            $image.loadgo('setprogress', 50);
          },
          setprogress: () => {
            setTimeout(() => {
              const $overlay = $image.siblings('.loadgo-overlay').first();
              const overlayHeight = $overlay.height();
              try {
                assert.equal(overlayHeight, imageHeight / 2);
              } catch (e) {
                done(e);
              }
              done();
            }, 1000);
          }
        }
      });
    });
  });

  it('Overlay width will not change when progress is set to 50% for "top to bottom" direction', (done) => {
    $image.on('load', (event) => {
      const imageWidth = event.target.clientWidth;
      $image.loadgo({
        direction: 'tb',
        on: {
          init: () => {
            $image.loadgo('setprogress', 50);
          },
          setprogress: () => {
            setTimeout(() => {
              const $overlay = $image.siblings('.loadgo-overlay').first();
              const overlayWidth = $overlay.width();
              try {
                assert.equal(overlayWidth, imageWidth);
              } catch (e) {
                done(e);
              }
              done();
            }, 1000);
          }
        }
      });
    });
  });
  
  it('Overlay height must be half of image height when progress is set to 50% for "bottom to top" direction', (done) => {
    $image.on('load', (event) => {
      const imageHeight = event.target.clientHeight;
      $image.loadgo({
        direction: 'bt',
        on: {
          init: () => {
            $image.loadgo('setprogress', 50);
          },
          setprogress: () => {
            setTimeout(() => {
              const $overlay = $image.siblings('.loadgo-overlay').first();
              const overlayHeight = $overlay.height();
              try {
                assert.equal(overlayHeight, imageHeight / 2);
              } catch (e) {
                done(e);
              }
              done();
            }, 1000);
          }
        }
      });
    });
  });

  it('Overlay width will not change when progress is set to 50% for "bottom to top" direction', (done) => {
    $image.on('load', (event) => {
      const imageWidth = event.target.clientWidth;
      const imageHeight = event.target.clientHeight;
      $image.loadgo({
        direction: 'bt',
        on: {
          init: () => {
            $image.loadgo('setprogress', 50);
          },
          setprogress: () => {
            setTimeout(() => {
              const $overlay = $image.siblings('.loadgo-overlay').first();
              const overlayWidth = $overlay.width();
              try {
                assert.equal(overlayWidth, imageWidth);
              } catch (e) {
                done(e);
              }
              done();
            }, 1000);
          }
        }
      });
    });
  });

  // Animation
  it('Overlay has CSS animations by default', () => {
    $image.loadgo({
      on: {
        init: () => {
          const $overlay = $image.siblings('.loadgo-overlay').first();
          try {
            assert.equal(
              $overlay.css('transition'),
              'width 0.6s ease 0s, height 0.6s ease 0s, top 0.6s ease 0s'
            );
          } catch (e) {
            done(e);
          }
          done();
        }
      }
    });
  });
});

it('Overlay has CSS animations added if "animated" is set to TRUE', () => {
  $image.loadgo({
    animated: true,
    on: {
      init: () => {
        const $overlay = $image.siblings('.loadgo-overlay').first();
        try {
          assert.equal(
            $overlay.css('transition'),
            'width 0.6s ease 0s, height 0.6s ease 0s, top 0.6s ease 0s'
          );
        } catch (e) {
          done(e);
        }
        done();
      }
    }
  });
});

it('Overlay does not have any CSS animation added if "animated" is set to FALSE', () => {
  $image.loadgo({
    animated: false,
    on: {
      init: () => {
        const $overlay = $image.siblings('.loadgo-overlay').first();
        try {
          assert.equal($overlay.css('transition'), 'all 0s ease 0s');
        } catch (e) {
          done(e);
        }
        done();
      }
    }
  });
});

// Background color
it('Overlay color is "#FFFFFF" by default', () => {
  $image.loadgo({
    on: {
      init: () => {
        const $overlay = $image.siblings('.loadgo-overlay').first();
        try {
          assert.equal($overlay.css('background-color'), 'rgb(255, 255, 255)'); // jQuery CSS method returns rgb
        } catch (e) {
          done(e);
        }
        done();
      }
    }
  });
});

it('Overlay color is "#FF0000" if "color" is set to "#FF0000"', () => {
  $image.loadgo({
    bgcolor: '#FF0000',
    on: {
      init: () => {
        const $overlay = $image.siblings('.loadgo-overlay').first();
        try {
          assert.equal($overlay.css('background-color'), 'rgb(255, 0, 0)'); // jQuery CSS method returns rgb
        } catch (e) {
          done(e);
        }
        done();
      }
    }
  });
});

// Opacity
it('Overlay opacity is "0.5" by default', () => {
  $image.loadgo({
    on: {
      init: () => {
        const $overlay = $image.siblings('.loadgo-overlay').first();
        try {
          assert.equal($overlay.css('opacity'), 0.5);
        } catch (e) {
          done(e);
        }
        done();
      }
    }
  });
});

it('Overlay opacity is "0.8" if "opacity" is set to "0.8"', () => {
  $image.loadgo({
    opacity: 0.8,
    on: {
      init: () => {
        const $overlay = $image.siblings('.loadgo-overlay').first();
        try {
          assert.equal($overlay.css('opacity'), 0.8);
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
  $image.loadgo({
    on: {
      init: () => {
        try {
          assert.equal($image.css('filter'), 'none');
        } catch (e) {
          done(e);
        }
        done();
      }
    }
  });
});

it('Image filter will not be applied if an unknown filter is provided', (done) => {
  $image.loadgo({
    filter: 'this-filter-does-not-exist',
    on: {
      init: () => {
        try {
          assert.equal($image.css('filter'), 'none');
        } catch (e) {
          done(e);
        }
        done();
      }
    }
  });
});

it('Image filter will be "sepia" if "filter" is set to "sepia"', (done) => {
  $image.loadgo({
    filter: 'sepia',
    on: {
      init: () => {
        const filter = $image[0].style.filter;
        try {
          assert.equal(filter, 'sepia(1)');
        } catch (e) {
          done(e);
        }
        done();
      }
    }
  });
});

it('Overlay will not be created if "filter" option is set to a valid filter', (done) => {
  $image.loadgo({
    filter: 'sepia',
    on: {
      init: () => {
        const $overlay = $image.siblings('.loadgo-overlay').first();
        try {
          assert.equal($overlay.length, 0);
        } catch (e) {
          done(e);
        }
        done();
      }
    }
  });
});

it('Overlay will be created if "filter" option is set to a non valid filter', (done) => {
  $image.loadgo({
    filter: 'this-filter-does-not-exist',
    on: {
      init: () => {
        const $overlay = $image.siblings('.loadgo-overlay').first();

        try {
          assert.equal($overlay.length, 1);
        } catch (e) {
          done(e);
        }
        done();
      }
    }
  });
});

// Image
it('Overlay does not have background image by default', () => {
  $image.loadgo({
    on: {
      init: () => {
        const $overlay = $image.siblings('.loadgo-overlay').first();

        try {
          assert.equal($overlay.css('background-image'), 'none');
        } catch (e) {
          done(e);
        }
        done();
      }
    }
  });
});

it('Overlay have "logo.png" as background image if "image" property is set to "logo.png"', () => {
  $image.loadgo({
    image: 'logo.png',
    on: {
      init: () => {
        const $overlay = $image.siblings('.loadgo-overlay').first();

        try {
          assert.ok($overlay.css('background-image').indexOf('logo.png') > -1);
        } catch (e) {
          done(e);
        }
        done();
      }
    }
  });
});

describe('jQuery - Get/Set progress', () => {
  it('Progress will be 0 by default', () => {
    $image.loadgo();
    assert.equal($image.loadgo('getprogress'), 0);
  });

  it('Progress will be 50 after setting it', () => {
    $image.loadgo({
      on: {
        init: () => {
          $image.loadgo('setprogress', 50);

          try {
            assert.equal($image.loadgo('getprogress'), 50);
          } catch (e) {
            done(e);
          }
          done();
        }
      }
    });
  });

  it('Progress will be 0 if trying to get progress for a non initialized element', () => {
    assert.equal($image.loadgo('getprogress'), 0);
  });

  it('Progress will not change if a value < 0 or value > 100 is provided', () => {
    $image.loadgo({
      on: {
        init: () => {
          try {
            var currentProgress = $image.loadgo('getprogress');
            $image.loadgo('setprogress', -500);
            assert.equal($image.loadgo('getprogress'), currentProgress);
            $image.loadgo('setprogress', 500);
            assert.equal($image.loadgo('getprogress'), currentProgress);
          } catch (e) {
            done(e);
          }
          done();
        }
      }
    });
  });
});
