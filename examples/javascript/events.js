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

  const log = document.getElementById('event-log')
  const placeholder = log.querySelector('.italic')
  if (placeholder) placeholder.remove()

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2)
  const detail = e.detail !== undefined ? JSON.stringify(e.detail) : ''

  const entry = document.createElement('div')
  entry.className = 'flex items-baseline gap-2'
  entry.innerHTML =
    `<span class="text-gray-400 shrink-0 w-14 text-right">+${elapsed}s</span>` +
    `<span class="px-1.5 py-0.5 rounded font-medium shrink-0 ${BADGE[e.type]}">${e.type}</span>` +
    (detail ? `<span class="text-gray-500 truncate">${detail}</span>` : '')

  log.appendChild(entry)
  log.scrollTop = log.scrollHeight
}

window.onload = () => {
  const image = document.getElementById('demo-image')
  const progressDisplay = document.getElementById('progress-display')

  // Attach all event listeners once — they survive destroy/re-init cycles
  // because they're on the <img> element, not on the overlay or container.
  ALL_EVENTS.forEach((type) => image.addEventListener(type, logEvent))

  image.addEventListener('loadgo:progress', (e) => {
    progressDisplay.textContent = `${e.detail.progress}%`
  })
  image.addEventListener('loadgo:reset', () => {
    progressDisplay.textContent = '0%'
  })
  image.addEventListener('loadgo:stop', () => {
    progressDisplay.textContent = '100%'
  })
  image.addEventListener('loadgo:destroy', () => {
    progressDisplay.textContent = '0%'
  })

  function init() {
    Loadgo.init(image)
    startTime = Date.now()
    looping = false
  }

  image.onload = () => init()
  if (image.complete) init()

  document.getElementById('btn-set50').addEventListener('click', () => {
    Loadgo.setprogress(image, 50)
  })

  document.getElementById('btn-set100').addEventListener('click', () => {
    Loadgo.setprogress(image, 100)
  })

  document.getElementById('btn-reset').addEventListener('click', () => {
    Loadgo.resetprogress(image)
  })

  document.getElementById('btn-loop').addEventListener('click', () => {
    if (looping) return
    looping = true
    Loadgo.loop(image, 30)
  })

  document.getElementById('btn-stop').addEventListener('click', () => {
    looping = false
    Loadgo.stop(image)
  })

  const bgColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD']
  let colorIndex = 0
  document.getElementById('btn-options').addEventListener('click', () => {
    Loadgo.options(image, { bgcolor: bgColors[colorIndex % bgColors.length] })
    colorIndex++
  })

  document.getElementById('btn-destroy').addEventListener('click', () => {
    looping = false
    Loadgo.destroy(image)
    // Re-init after a tick so loadgo:destroy lands in the log first
    setTimeout(() => init(), 50)
  })

  document.getElementById('btn-clear').addEventListener('click', () => {
    document.getElementById('event-log').innerHTML =
      '<div class="text-gray-400 italic">Events will appear here…</div>'
    startTime = Date.now()
  })
}
