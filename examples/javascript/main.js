const intervals = {}

function playDemo(id, index) {
  const image = document.getElementById(id)
  const demoMsg = document.getElementById(`demo-msg-${index}`)
  const demoProgress = document.getElementById(`demo-progress-${index}`)

  if (intervals[id]) {
    window.clearInterval(intervals[id])
    intervals[id] = null
  }

  demoMsg.style.opacity = '0'
  demoProgress.style.opacity = '1'

  let p = 0
  Loadgo.resetprogress(image)
  demoProgress.innerHTML = '0%'

  window.setTimeout(() => {
    intervals[id] = window.setInterval(() => {
      if (Loadgo.getprogress(image) === 100) {
        window.clearInterval(intervals[id])
        intervals[id] = null
        demoMsg.style.opacity = '1'
        demoProgress.style.opacity = '0'
        return
      }

      const prog = p * 10
      Loadgo.setprogress(image, prog)
      demoProgress.innerHTML = `${prog}%`
      p++
    }, 150)
  }, 300)
}

window.onload = () => {
  // Main demo
  const disney = document.getElementById('disney')
  disney.src = '../logos/disney.png'
  disney.onload = () => {
    Loadgo.init(disney)
  }

  // Example #2
  const superman = document.getElementById('superman')
  superman.src = '../logos/superman.png'
  superman.onload = () => {
    Loadgo.init(superman, {
      opacity: 0.2,
      animated: false,
      bgcolor: '#01AEF0',
    })
  }

  // Example #3
  const batman = document.getElementById('batman')
  batman.src = '../logos/batman.png'
  batman.onload = () => {
    Loadgo.init(batman, {
      opacity: 1,
      image: '../logos/batman-overlay.png',
    })
  }

  // Example #4
  const jurassiclr = document.getElementById('jurassiclr')
  jurassiclr.src = '../logos/jurassic.png'
  jurassiclr.onload = () => {
    Loadgo.init(jurassiclr, { direction: 'lr' })
  }

  const jurassicrl = document.getElementById('jurassicrl')
  jurassicrl.src = '../logos/jurassic.png'
  jurassicrl.onload = () => {
    Loadgo.init(jurassicrl, { direction: 'rl' })
  }

  const jurassictb = document.getElementById('jurassictb')
  jurassictb.src = '../logos/jurassic.png'
  jurassictb.onload = () => {
    Loadgo.init(jurassictb, { direction: 'tb' })
  }

  const jurassicbt = document.getElementById('jurassicbt')
  jurassicbt.src = '../logos/jurassic.png'
  jurassicbt.onload = () => {
    Loadgo.init(jurassicbt, { direction: 'bt' })
  }

  // Example #5
  const spidermanSepia = document.getElementById('spidermanSepia')
  spidermanSepia.src = '../logos/spiderman.png'
  spidermanSepia.onload = () => {
    Loadgo.init(spidermanSepia, { filter: 'sepia' })
  }

  const spidermanBlur = document.getElementById('spidermanBlur')
  spidermanBlur.src = '../logos/spiderman.png'
  spidermanBlur.onload = () => {
    Loadgo.init(spidermanBlur, { filter: 'blur' })
  }

  const spidermanInvert = document.getElementById('spidermanInvert')
  spidermanInvert.src = '../logos/spiderman.png'
  spidermanInvert.onload = () => {
    Loadgo.init(spidermanInvert, { filter: 'invert' })
  }

  const spidermanHue = document.getElementById('spidermanHue')
  spidermanHue.src = '../logos/spiderman.png'
  spidermanHue.onload = () => {
    Loadgo.init(spidermanHue, { filter: 'hue-rotate' })
  }

  const spidermanOpacity = document.getElementById('spidermanOpacity')
  spidermanOpacity.onload = () => {
    Loadgo.init(spidermanOpacity, { filter: 'opacity' })
  }

  const spidermanGrayscale = document.getElementById('spidermanGrayscale')
  spidermanGrayscale.src = '../logos/spiderman.png'
  spidermanGrayscale.onload = () => {
    Loadgo.init(spidermanGrayscale, { filter: 'grayscale' })
  }
}
