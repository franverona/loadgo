// Default example
var disneyInterval;

// Example with some options
var supermanInterval;

// Example with overlay
var batmanInterval;

// Examples with directions
var jurassicIntervalLR;
var jurassicIntervalRL;
var jurassicIntervalBT;
var jurassicIntervalTB;

// Examples with filters
var spidermanSepiaInterval;
var spidermanBlurInterval;
var spidermanInvertInterval;
var spidermanOpacityInterval;
var spidermanHueInterval;
var spidermanGrayscaleInterval;

function playDemo (id, index, interval) {
  var image = document.getElementById(id);
  var demoMsg = document.getElementById('demo-msg-' + index);
  var demoProgress = document.getElementById('demo-progress-' + index);
  
  demoMsg.style.opacity = '0';
  demoProgress.style.opacity = '1';

  var p = 0;
  Loadgo.resetprogress(image);
  demoProgress.innerHTML = '0%';

  window.setTimeout(function () {
    interval = window.setInterval(function (){
      if (Loadgo.getprogress(image) === 100) {
        window.clearInterval(interval);
        demoMsg.style.opacity = '1';
        demoProgress.style.opacity = '0';
        return;
      }
      
      var prog = p * 10;
      Loadgo.setprogress(image, prog);
      demoProgress.innerHTML = prog + '%';
      p++;
    }, 150);
  }, 300);
}

window.onload = function () {

  // Main demo
  var disney = document.getElementById('disney');
  disney.src = '../logos/disney.png';
  disney.onload = function () {
    Loadgo.init(disney);
  };

  // Example #2
  var superman = document.getElementById('superman');
  superman.src = '../logos/superman.png';
  superman.onload = function () {
    Loadgo.init(superman, {
      'opacity': 0.2,
      'animated': false,
      'bgcolor': '#01AEF0'
    });
  };

  // Example #3
  var batman = document.getElementById('batman');
  batman.src = '../logos/batman.png';
  batman.onload = function () {
    Loadgo.init(batman, {
      'opacity': 1,
      'image': '../logos/batman-overlay.png'
    });
  };

  // Example #4
  var jurassiclr = document.getElementById('jurassiclr');
  jurassiclr.src = '../logos/jurassic.png';
  jurassiclr.onload = function () {
    Loadgo.init(jurassiclr, {
      'direction': 'lr'
    });
  };

  // Example #4
  var jurassicrl = document.getElementById('jurassicrl');
  jurassicrl.src = '../logos/jurassic.png';
  jurassicrl.onload = function () {
    Loadgo.init(jurassicrl, {
      'direction': 'rl'
    });
  };

  // Example #4
  var jurassictb = document.getElementById('jurassictb');
  jurassictb.src = '../logos/jurassic.png';
  jurassictb.onload = function () {
    Loadgo.init(jurassictb, {
      'direction': 'tb'
    });
  };

  // Example #4
  var jurassicbt = document.getElementById('jurassicbt');
  jurassicbt.src = '../logos/jurassic.png';
  jurassicbt.onload = function () {
    Loadgo.init(jurassicbt, {
      'direction': 'bt'
    });
  };

  // Example #5
  var spidermanSepia = document.getElementById('spidermanSepia');
  spidermanSepia.src = '../logos/spiderman.png';
  spidermanSepia.onload = function () {
    Loadgo.init(spidermanSepia, {
      'filter': 'sepia'
    });
  };

  // Example #5
  var spidermanBlur = document.getElementById('spidermanBlur');
  spidermanBlur.src = '../logos/spiderman.png';
  spidermanBlur.onload = function () {
    Loadgo.init(spidermanBlur, {
      'filter': 'blur'
    });
  };

  // Example #5
  var spidermanInvert = document.getElementById('spidermanInvert');
  spidermanInvert.src = '../logos/spiderman.png';
  spidermanInvert.onload = function () {
    Loadgo.init(spidermanInvert, {
      'filter': 'invert'
    });
  };

  // Example #5
  var spidermanHue = document.getElementById('spidermanHue');
  spidermanHue.src = '../logos/spiderman.png';
  spidermanHue.onload = function () {
    Loadgo.init(spidermanHue, {
      'filter': 'hue-rotate'
    });
  };

  // Example #5
  var spidermanOpacity = document.getElementById('spidermanOpacity');
  spidermanOpacity.onload = function () {
    Loadgo.init(spidermanOpacity, {
      'filter': 'opacity'
    });
  };

  // Example #5
  var spidermanGrayscale = document.getElementById('spidermanGrayscale');
  spidermanGrayscale.src = '../logos/spiderman.png';
  spidermanGrayscale.onload = function () {
    Loadgo.init(spidermanGrayscale, {
      'filter': 'grayscale'
    });
  };

};
