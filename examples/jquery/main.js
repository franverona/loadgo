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
  $('#demo-msg-' + index).animate({
    'opacity': '0'
  });
  $('#demo-progress-' + index).animate({
    'opacity': '1'
  });
  var p = 0;
  $('#' + id).loadgo('resetprogress');
  $('#demo-progress-' + index).html('0%');
  window.setTimeout(function () {
    interval = window.setInterval(function (){
      if ($('#' + id).loadgo('getprogress') === 100) {
        window.clearInterval(interval);
        $('#demo-msg-' + index).animate({
          'opacity': '1'
        });
        $('#demo-progress-' + index).animate({
          'opacity': '0'
        });
        return;
      }

      var prog = p * 10;
      $('#' + id).loadgo('setprogress', prog);
      $('#demo-progress-' + index).html(prog + '%');
      p++;
    }, 150);
  }, 300);
}

$(window).load(function () {

  $("#disney").load(function() {
    // Example #1
    $('#disney').loadgo();
  }).each(function() {
    if (this.complete) {
      $(this).load();
    }
  });

  $("#superman").load(function() {
    // Example #2
    $('#superman').loadgo({
      'opacity': 0.2,
      'animated': false,
      'bgcolor': '#01AEF0'
    });
  }).each(function() {
    if (this.complete) {
      $(this).load();
    }
  });

  $("#batman").load(function() {
    // Example #3
    $('#batman').loadgo({
      'opacity': 1,
      'image': '../logos/batman-overlay.png'
    });
  }).each(function() {
    if (this.complete) {
      $(this).load();
    }
  });

  $("#jurassiclr").load(function() {
    // Example #4
    $('#jurassiclr').loadgo({
      'direction': 'lr'
    });
  }).each(function() {
    if (this.complete) {
      $(this).load();
    }
  });

  $("#jurassicrl").load(function() {
    // Example #4
    $('#jurassicrl').loadgo({
      'direction': 'rl'
    });
  }).each(function() {
    if (this.complete) {
      $(this).load();
    }
  });

  $("#jurassictb").load(function() {
    // Example #4
    $('#jurassictb').loadgo({
      'direction': 'tb'
    });
  }).each(function() {
    if (this.complete) {
      $(this).load();
    }
  });

  $("#jurassicbt").load(function() {
    // Example #4
    $('#jurassicbt').loadgo({
      'direction': 'bt'
    });
  }).each(function() {
    if (this.complete) {
      $(this).load();
    }
  });

  $("#spidermanSepia").load(function() {
    // Example #5
    $('#spidermanSepia').loadgo({
      'filter': 'sepia'
    });
  }).each(function() {
    if (this.complete) {
      $(this).load();
    }
  });

  $("#spidermanBlur").load(function() {
    // Example #5
    $('#spidermanBlur').loadgo({
      'filter': 'blur'
    });
  }).each(function() {
    if (this.complete) {
      $(this).load();
    }
  });

  $("#spidermanInvert").load(function() {
    // Example #5
    $('#spidermanInvert').loadgo({
      'filter': 'invert'
    });
  }).each(function() {
    if (this.complete) {
      $(this).load();
    }
  });

  $("#spidermanHue").load(function() {
    // Example #5
    $('#spidermanHue').loadgo({
      'filter': 'hue-rotate'
    });
  }).each(function() {
    if (this.complete) {
      $(this).load();
    }
  });

  $("#spidermanOpacity").load(function() {
    // Example #5
    $('#spidermanOpacity').loadgo({
      'filter': 'opacity'
    });
  }).each(function() {
    if (this.complete) {
      $(this).load();
    }
  });

  $("#spidermanGrayscale").load(function() {
    // Example #5
    $('#spidermanGrayscale').loadgo({
      'filter': 'grayscale'
    });
  }).each(function() {
    if (this.complete) {
      $(this).load();
    }
  });

});
