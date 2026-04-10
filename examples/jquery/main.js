const intervals = {}

function playDemo(id, index) {
  if (intervals[id]) {
    window.clearInterval(intervals[id])
    intervals[id] = null
  }

  $(`#demo-msg-${index}`).animate({ opacity: '0' })
  $(`#demo-progress-${index}`).animate({ opacity: '1' })

  let p = 0
  $(`#${id}`).loadgo('resetprogress')
  $(`#demo-progress-${index}`).html('0%')

  window.setTimeout(() => {
    intervals[id] = window.setInterval(() => {
      if ($(`#${id}`).loadgo('getprogress') === 100) {
        window.clearInterval(intervals[id])
        intervals[id] = null
        $(`#demo-msg-${index}`).animate({ opacity: '1' })
        $(`#demo-progress-${index}`).animate({ opacity: '0' })
        return
      }

      const prog = p * 10
      $(`#${id}`).loadgo('setprogress', prog)
      $(`#demo-progress-${index}`).html(`${prog}%`)
      p++
    }, 150)
  }, 300)
}

let thresholdInterval = null

function playThresholdDemo() {
  if (thresholdInterval) {
    window.clearInterval(thresholdInterval)
    thresholdInterval = null
  }

  const demoMsg = $('#demo-msg-15')
  const demoProgress = $('#demo-progress-15')
  const statusEl = document.getElementById('threshold-status')

  demoMsg.animate({ opacity: '0' })
  demoProgress.animate({ opacity: '1' })
  statusEl.textContent = ''

  let p = 0
  $('#cocacola').loadgo('resetprogress')
  demoProgress.html('0%')

  window.setTimeout(() => {
    thresholdInterval = window.setInterval(() => {
      if ($('#cocacola').loadgo('getprogress') === 100) {
        window.clearInterval(thresholdInterval)
        thresholdInterval = null
        demoMsg.animate({ opacity: '1' })
        demoProgress.animate({ opacity: '0' })
        return
      }

      const prog = p * 10
      $('#cocacola').loadgo('setprogress', prog)
      demoProgress.html(`${prog}%`)
      p++
    }, 150)
  }, 300)
}

function pauseDemo(action) {
  const btnStart = document.getElementById('btn-loop-start')
  const btnPause = document.getElementById('btn-loop-pause')
  const btnResume = document.getElementById('btn-loop-resume')
  const btnStop = document.getElementById('btn-loop-stop')

  if (action === 'start') {
    $('#loop-pause').loadgo('loop', 10)
    btnStart.disabled = true
    btnPause.disabled = false
    btnResume.disabled = true
    btnStop.disabled = false
  } else if (action === 'pause') {
    $('#loop-pause').loadgo('pause')
    btnPause.disabled = true
    btnResume.disabled = false
  } else if (action === 'resume') {
    $('#loop-pause').loadgo('resume')
    btnPause.disabled = false
    btnResume.disabled = true
  } else if (action === 'stop') {
    $('#loop-pause').loadgo('stop')
    btnStart.disabled = false
    btnPause.disabled = true
    btnResume.disabled = true
    btnStop.disabled = true
  }
}

$(document).ready(() => {
  // Example #1
  $('#disney')
    .on('load', () => {
      $('#disney').loadgo()
    })
    .each((_, el) => {
      if (el.complete) $(el).trigger('load')
    })

  // Example #2
  $('#superman')
    .on('load', () => {
      $('#superman').loadgo({
        opacity: 0.2,
        animated: false,
        bgcolor: '#01AEF0',
      })
    })
    .each((_, el) => {
      if (el.complete) $(el).trigger('load')
    })

  // Example #3
  $('#batman')
    .on('load', () => {
      $('#batman').loadgo({
        opacity: 1,
        image: '../logos/batman-overlay.png',
      })
    })
    .each((_, el) => {
      if (el.complete) $(el).trigger('load')
    })

  // Example #4
  $('#jurassiclr')
    .on('load', () => {
      $('#jurassiclr').loadgo({ direction: 'lr' })
    })
    .each((_, el) => {
      if (el.complete) $(el).trigger('load')
    })

  $('#jurassicrl')
    .on('load', () => {
      $('#jurassicrl').loadgo({ direction: 'rl' })
    })
    .each((_, el) => {
      if (el.complete) $(el).trigger('load')
    })

  $('#jurassictb')
    .on('load', () => {
      $('#jurassictb').loadgo({ direction: 'tb' })
    })
    .each((_, el) => {
      if (el.complete) $(el).trigger('load')
    })

  $('#jurassicbt')
    .on('load', () => {
      $('#jurassicbt').loadgo({ direction: 'bt' })
    })
    .each((_, el) => {
      if (el.complete) $(el).trigger('load')
    })

  // Example #5
  $('#spidermanSepia')
    .on('load', () => {
      $('#spidermanSepia').loadgo({ filter: 'sepia' })
    })
    .each((_, el) => {
      if (el.complete) $(el).trigger('load')
    })

  $('#spidermanBlur')
    .on('load', () => {
      $('#spidermanBlur').loadgo({ filter: 'blur' })
    })
    .each((_, el) => {
      if (el.complete) $(el).trigger('load')
    })

  $('#spidermanInvert')
    .on('load', () => {
      $('#spidermanInvert').loadgo({ filter: 'invert' })
    })
    .each((_, el) => {
      if (el.complete) $(el).trigger('load')
    })

  $('#spidermanHue')
    .on('load', () => {
      $('#spidermanHue').loadgo({ filter: 'hue-rotate' })
    })
    .each((_, el) => {
      if (el.complete) $(el).trigger('load')
    })

  $('#spidermanOpacity')
    .on('load', () => {
      $('#spidermanOpacity').loadgo({ filter: 'opacity' })
    })
    .each((_, el) => {
      if (el.complete) $(el).trigger('load')
    })

  $('#spidermanGrayscale')
    .on('load', () => {
      $('#spidermanGrayscale').loadgo({ filter: 'grayscale' })
    })
    .each((_, el) => {
      if (el.complete) $(el).trigger('load')
    })

  // Example #6
  const statusEl = document.getElementById('threshold-status')
  const showStatus = (msg) => {
    statusEl.textContent = msg
  }

  $('#cocacola')
    .on('load', () => {
      $('#cocacola').loadgo({
        onThreshold: {
          50: () => showStatus('Halfway there!'),
          100: () => showStatus('Done!'),
        },
      })
    })
    .each((_, el) => {
      if (el.complete) $(el).trigger('load')
    })

  // Example #7
  $('#loop-pause')
    .on('load', () => {
      $('#loop-pause').loadgo()
    })
    .each((_, el) => {
      if (el.complete) $(el).trigger('load')
    })
})
