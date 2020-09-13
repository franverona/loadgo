// Default example
let disneyInterval;

// Example with some options
let supermanInterval;

// Example with overlay
let batmanInterval;

// Examples with directions
let jurassicIntervalLR;
let jurassicIntervalRL;
let jurassicIntervalBT;
let jurassicIntervalTB;

// Examples with filters
let spidermanSepiaInterval;
let spidermanBlurInterval;
let spidermanInvertInterval;
let spidermanOpacityInterval;
let spidermanHueInterval;
let spidermanGrayscaleInterval;

function playDemo(id, index, interval) {
  $('#demo-msg-' + index).animate({
    opacity: '0'
  });
  $('#demo-progress-' + index).animate({
    opacity: '1'
  });
  let p = 0;
  $('#' + id).loadgo('resetprogress');
  $('#demo-progress-' + index).html('0%');
  window.setTimeout(function () {
    interval = window.setInterval(function () {
      if ($('#' + id).loadgo('getprogress') === 100) {
        window.clearInterval(interval);
        $('#demo-msg-' + index).animate({
          opacity: '1'
        });
        $('#demo-progress-' + index).animate({
          opacity: '0'
        });
        return;
      }

      const prog = p * 10;
      $('#' + id).loadgo('setprogress', prog);
      $('#demo-progress-' + index).html(prog + '%');
      p += 1;
    }, 150);
  }, 300);
}

window.onload = function () {
  const loadAndInit = (id, cb) => {
    const img = new Image();
    img.src = $(id).attr('src');
    img.onload = cb;
  };

  loadAndInit('#disney', () => {
    // Example #1
    $('#disney').loadgo();
  });

  loadAndInit('#superman', () => {
    // Example #2
    $('#superman').loadgo({
      opacity: 0.2,
      animated: false,
      bgcolor: '#01AEF0'
    });
  });

  loadAndInit('#batman', () => {
    // Example #3
    $('#batman').loadgo({
      opacity: 1,
      image: '../logos/batman-overlay.png'
    });
  });

  loadAndInit('#jurassiclr', () => {
    // Example #4
    $('#jurassiclr').loadgo({
      direction: 'lr'
    });
  });

  loadAndInit('#jurassicrl', () => {
    // Example #4
    $('#jurassicrl').loadgo({
      direction: 'rl'
    });
  });

  loadAndInit('#jurassictb', () => {
    // Example #4
    $('#jurassictb').loadgo({
      direction: 'tb'
    });
  });

  loadAndInit('#jurassicbt', () => {
    // Example #4
    $('#jurassicbt').loadgo({
      direction: 'bt'
    });
  });

  loadAndInit('#spidermanSepia', () => {
    // Example #5
    $('#spidermanSepia').loadgo({
      filter: 'sepia'
    });
  });

  loadAndInit('#spidermanBlur', () => {
    // Example #5
    $('#spidermanBlur').loadgo({
      filter: 'blur'
    });
  });

  loadAndInit('#spidermanInvert', () => {
    // Example #5
    $('#spidermanInvert').loadgo({
      filter: 'invert'
    });
  });

  loadAndInit('#spidermanHue', () => {
    // Example #5
    $('#spidermanHue').loadgo({
      filter: 'hue'
    });
  });

  loadAndInit('#spidermanOpacity', () => {
    // Example #5
    $('#spidermanOpacity').loadgo({
      filter: 'opacity'
    });
  });

  loadAndInit('#spidermanGrayscale', () => {
    // Example #5
    $('#spidermanGrayscale').loadgo({
      filter: 'grayscale'
    });
  });
};
