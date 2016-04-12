function scrollTo (owner, element){
  $('.nav li').removeClass('active');
  //owner.className = 'active';
  $(window).scroll(null);
  $('html, body').animate({
    scrollTop: $('#' + element).offset().top - 100
  }, 500);

  if ($('#header-collapsed').hasClass('in')) {
    $('.btn-loadgo').trigger('click');
  }
}

var cocacolaInterval, disneyInterval, supermanInterval, batmanInterval, 
    jurassicIntervalLR, jurassicIntervalRL, jurassicIntervalBT, jurassicIntervalTB,
    spidermanSepiaInterval, spidermanBlurInterval, spidermanInvertInterval, spidermanOpacityInterval, spidermanHueInterval, spidermanGrayscaleInterval;

function playDemo (_id, index, interval) {
  $('#demo-msg-' + index).animate({
    'opacity': '0'
  });
  $('#demo-progress-' + index).animate({
    'opacity': '1'
  });
  var p = 0;
  $('#' + _id).loadgo('resetprogress');
  $('#demo-progress-' + index).html('0%');
  window.setTimeout(function () {
    interval = window.setInterval(function (){
      if ($('#' + _id).loadgo('getprogress') == 100) {
        window.clearInterval(interval);
        $('#demo-msg-' + index).animate({
          'opacity': '1'
        });
        $('#demo-progress-' + index).animate({
          'opacity': '0'
        });
      }
      else {
        var prog = p*10;
        $('#' + _id).loadgo('setprogress', prog);
        $('#demo-progress-' + index).html(prog + '%');
        p++;
      }
    }, 150);
  }, 300);
}

$(window).load(function () {

  $("#cocacola").load(function() {
    // Main demo
    $('#cocacola').loadgo();
  }).each(function() {
    if(this.complete) $(this).load();
  });

  $("#disney").load(function() {
    // Example #1
    $('#disney').loadgo();
  }).each(function() {
    if(this.complete) $(this).load();
  });

  $("#superman").load(function() {
    // Example #2
    $('#superman').loadgo({
      'opacity':    0.2,
      'animated':   false,
      'bgcolor':    '#01AEF0'
    });
  }).each(function() {
    if(this.complete) $(this).load();
  });

  $("#batman").load(function() {
    // Example #3
    $('#batman').loadgo({
      'opacity':  1,
      'image':    'logos/batman-overlay.png'
    });
  }).each(function() {
    if(this.complete) $(this).load();
  });

  $("#jurassiclr").load(function() {
    // Example #4
    $('#jurassiclr').loadgo({
      'direction':    'lr'
    });
  }).each(function() {
    if(this.complete) $(this).load();
  });

  $("#jurassicrl").load(function() {
    // Example #4
    $('#jurassicrl').loadgo({
      'direction':    'rl'
    });
  }).each(function() {
    if(this.complete) $(this).load();
  });

  $("#jurassictb").load(function() {
    // Example #4
    $('#jurassictb').loadgo({
      'direction':    'tb'
    });
  }).each(function() {
    if(this.complete) $(this).load();
  });

  $("#jurassicbt").load(function() {
    // Example #4
    $('#jurassicbt').loadgo({
      'direction':    'bt'
    });
  }).each(function() {
    if(this.complete) $(this).load();
  });

  $("#spidermanSepia").load(function() {
    // Example #5
    $('#spidermanSepia').loadgo({
      'filter':    'sepia'
    });
  }).each(function() {
    if(this.complete) $(this).load();
  });

  $("#spidermanBlur").load(function() {
    // Example #5
    $('#spidermanBlur').loadgo({
      'filter':    'blur'
    });
  }).each(function() {
    if(this.complete) $(this).load();
  });

  $("#spidermanInvert").load(function() {
    // Example #5
    $('#spidermanInvert').loadgo({
      'filter':    'invert'
    });
  }).each(function() {
    if(this.complete) $(this).load();
  });

  $("#spidermanHue").load(function() {
    // Example #5
    $('#spidermanHue').loadgo({
      'filter':    'hue-rotate'
    });
  }).each(function() {
    if(this.complete) $(this).load();
  });

  $("#spidermanOpacity").load(function() {
    // Example #5
    $('#spidermanOpacity').loadgo({
      'filter':    'opacity'
    });
  }).each(function() {
    if(this.complete) $(this).load();
  });

  $("#spidermanGrayscale").load(function() {
    // Example #5
    $('#spidermanGrayscale').loadgo({
      'filter':    'grayscale'
    });
  }).each(function() {
    if(this.complete) $(this).load();
  });

});
