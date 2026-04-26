const BADGE = {
  'loadgo:init': 'bg-blue-100 text-blue-800',
  'loadgo:error': 'bg-red-100 text-red-800',
  'loadgo:options': 'bg-purple-100 text-purple-800',
  'loadgo:progress': 'bg-gray-100 text-gray-500',
  'loadgo:complete': 'bg-green-100 text-green-800',
  'loadgo:reset': 'bg-orange-100 text-orange-800',
  'loadgo:start': 'bg-teal-100 text-teal-800',
  'loadgo:cycle': 'bg-teal-50 text-teal-700',
  'loadgo:stop': 'bg-yellow-100 text-yellow-800',
  'loadgo:destroy': 'bg-red-100 text-red-900',
}

const ALL_EVENTS = Object.keys(BADGE)

let startTime = Date.now()
let looping = false

function logEvent(e) {
  if (e.type === 'loadgo:progress' && !document.getElementById('show-progress').checked) return

  const $log = $('#event-log')
  $log.find('.italic').remove()

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2)
  // jQuery wraps the native CustomEvent — access detail via originalEvent
  const detail = e.originalEvent?.detail !== undefined ? JSON.stringify(e.originalEvent.detail) : ''

  const entry = document.createElement('div')
  entry.className = 'flex items-baseline gap-2'
  entry.innerHTML =
    `<span class="text-gray-400 shrink-0 w-14 text-right">+${elapsed}s</span>` +
    `<span class="px-1.5 py-0.5 rounded font-medium shrink-0 ${BADGE[e.type]}">${e.type}</span>` +
    (detail ? `<span class="text-gray-500 truncate">${detail}</span>` : '')

  $log.append(entry)
  $log.scrollTop($log[0].scrollHeight)
}

$(document).ready(() => {
  const $image = $('#demo-image')
  const $progressDisplay = $('#progress-display')

  // jQuery's .on() receives native CustomEvents because it uses addEventListener internally.
  // Access event.detail via event.originalEvent.detail (jQuery wraps the native event).
  ALL_EVENTS.forEach((type) => $image.on(type, logEvent))

  $image.on('loadgo:progress', (e) => {
    $progressDisplay.text(`${e.originalEvent.detail.progress}%`)
  })
  $image.on('loadgo:reset', () => {
    $progressDisplay.text('0%')
  })
  $image.on('loadgo:stop', () => {
    $progressDisplay.text('100%')
  })
  $image.on('loadgo:destroy', () => {
    $progressDisplay.text('0%')
  })

  function init() {
    $image.loadgo()
    startTime = Date.now()
    looping = false
  }

  $image
    .on('load', () => init())
    .each((_, el) => {
      if (el.complete) init()
    })

  $('#btn-set50').on('click', () => {
    $image.loadgo('setprogress', 50)
  })
  $('#btn-set100').on('click', () => {
    $image.loadgo('setprogress', 100)
  })
  $('#btn-reset').on('click', () => {
    $image.loadgo('resetprogress')
  })

  $('#btn-loop').on('click', () => {
    if (looping) return
    looping = true
    $image.loadgo('loop', 30)
  })

  $('#btn-stop').on('click', () => {
    looping = false
    $image.loadgo('stop')
  })

  const bgColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD']
  let colorIndex = 0
  $('#btn-options').on('click', () => {
    $image.loadgo('options', { bgcolor: bgColors[colorIndex % bgColors.length] })
    colorIndex++
  })

  $('#btn-destroy').on('click', () => {
    looping = false
    $image.loadgo('destroy')
    // Re-init after a tick so loadgo:destroy lands in the log first
    setTimeout(() => init(), 50)
  })

  $('#btn-clear').on('click', () => {
    $('#event-log').html('<div class="text-gray-400 italic">Events will appear here…</div>')
    startTime = Date.now()
  })
})
