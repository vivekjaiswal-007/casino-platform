/**
 * RoyalBet Casino — Complete Sound System
 * All sounds generated via Web Audio API (no files needed)
 * Realistic casino-grade audio
 */

let _ctx = null

const ctx = () => {
  if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)()
  if (_ctx.state === 'suspended') _ctx.resume()
  return _ctx
}

// Sound preference
const on = () => localStorage.getItem('rb_snd') !== '0'
const VOL = 0.38

// ── Primitive builders ──────────────────────────────────

function osc(freq, dur, type = 'sine', vol = VOL, t0 = 0, freqRamp = null) {
  if (!on()) return
  try {
    const c = ctx(), o = c.createOscillator(), g = c.createGain()
    o.connect(g); g.connect(c.destination)
    o.type = type
    o.frequency.setValueAtTime(freq, c.currentTime + t0)
    if (freqRamp !== null)
      o.frequency.exponentialRampToValueAtTime(Math.max(freqRamp, 1), c.currentTime + t0 + dur)
    g.gain.setValueAtTime(0.001, c.currentTime + t0)
    g.gain.linearRampToValueAtTime(vol, c.currentTime + t0 + 0.012)
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + t0 + dur)
    o.start(c.currentTime + t0)
    o.stop(c.currentTime + t0 + dur + 0.05)
  } catch {}
}

function noise(dur, vol = 0.2, t0 = 0, loFreq = 200, hiFreq = 4000) {
  if (!on()) return
  try {
    const c = ctx()
    const sr = c.sampleRate
    const buf = c.createBuffer(1, sr * dur, sr)
    const d = buf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
    const src = c.createBufferSource()
    src.buffer = buf
    const f = c.createBiquadFilter()
    f.type = 'bandpass'
    f.frequency.value = (loFreq + hiFreq) / 2
    f.Q.value = Math.max(0.1, hiFreq / loFreq * 0.3)
    const g = c.createGain()
    src.connect(f); f.connect(g); g.connect(c.destination)
    g.gain.setValueAtTime(vol, c.currentTime + t0)
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + t0 + dur)
    src.start(c.currentTime + t0)
    src.stop(c.currentTime + t0 + dur + 0.05)
  } catch {}
}

// Play a melody (array of [freq, duration, delay_offset])
function melody(notes, baseVol = VOL, type = 'sine') {
  if (!on()) return
  let t = 0
  notes.forEach(([f, d, gap = 0]) => {
    if (f > 0) osc(f, d, type, baseVol, t)
    t += d + gap
  })
}

// ── SOUNDS LIBRARY ──────────────────────────────────────

export const sounds = {

  // ─────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────
  click() {
    osc(1400, 0.04, 'sine', 0.12)
    osc(1000, 0.03, 'sine', 0.08, 0.03)
  },

  tabSwitch() {
    osc(600, 0.05, 'sine', 0.14)
    osc(900, 0.06, 'sine', 0.1, 0.04)
  },

  hover() {
    osc(800, 0.03, 'sine', 0.08)
  },

  error() {
    osc(200, 0.12, 'square', 0.2)
    osc(160, 0.2, 'sawtooth', 0.15, 0.12)
  },

  otpSent() {
    osc(880, 0.08, 'sine', 0.22)
    osc(1100, 0.1, 'sine', 0.18, 0.09)
    osc(1320, 0.14, 'sine', 0.14, 0.2)
  },

  // ─────────────────────────────────────────
  // BET / BALANCE
  // ─────────────────────────────────────────
  betPlace() {
    // Chip toss sound
    noise(0.05, 0.2, 0, 800, 5000)
    osc(500, 0.07, 'sine', 0.2, 0.02)
    osc(700, 0.06, 'sine', 0.15, 0.06)
  },

  coinDrop() {
    // Metallic coin drop
    noise(0.06, 0.3, 0, 2000, 8000)
    osc(1200, 0.08, 'triangle', 0.22)
    osc(900, 0.12, 'sine', 0.18, 0.04)
    osc(600, 0.18, 'sine', 0.12, 0.1)
  },

  coinCollect() {
    // Multiple coins
    for (let i = 0; i < 5; i++) {
      noise(0.04, 0.2, i * 0.06, 1500, 6000)
      osc(800 + i * 120, 0.07, 'triangle', 0.18, i * 0.06)
    }
  },

  balanceAdd() {
    melody([
      [523, 0.07, 0.02], [659, 0.07, 0.02], [784, 0.07, 0.02], [1047, 0.14, 0]
    ], 0.28, 'sine')
  },

  // ─────────────────────────────────────────
  // WIN / LOSS
  // ─────────────────────────────────────────
  win() {
    // Rising coin melody
    melody([
      [523, 0.1, 0.01], [659, 0.1, 0.01], [784, 0.1, 0.01], [1047, 0.2, 0]
    ], 0.32, 'sine')
    noise(0.06, 0.15, 0.28, 1000, 5000)
  },

  bigWin() {
    // Fanfare + coins
    melody([
      [392, 0.12, 0.01], [523, 0.12, 0.01], [659, 0.12, 0.01],
      [784, 0.12, 0.01], [1047, 0.18, 0.02], [1319, 0.28, 0]
    ], 0.35, 'triangle')
    setTimeout(() => {
      melody([
        [523, 0.08, 0.01], [659, 0.08, 0.01], [784, 0.08, 0.01],
        [1047, 0.08, 0.01], [784, 0.08, 0.01], [1047, 0.08, 0.01],
        [1319, 0.22, 0]
      ], 0.3, 'sine')
      for (let i = 0; i < 8; i++) {
        noise(0.05, 0.18, i * 0.05, 1000, 6000)
        osc(600 + i * 100, 0.06, 'triangle', 0.15, i * 0.05)
      }
    }, 700)
  },

  jackpot() {
    // Slot machine jackpot — Super Mario style
    const notes = [
      [659, 0.1], [659, 0.1], [0, 0.05],
      [659, 0.1], [0, 0.05],
      [523, 0.1], [659, 0.1], [0, 0.05],
      [784, 0.2], [0, 0.15],
      [392, 0.2]
    ]
    let t = 0
    notes.forEach(([f, d]) => {
      if (f > 0) osc(f, d, 'square', 0.3, t)
      t += d + 0.02
    })
    setTimeout(() => {
      melody([
        [523, 0.1, 0.01], [659, 0.1, 0.01], [784, 0.1, 0.01],
        [1047, 0.1, 0.01], [1319, 0.3, 0]
      ], 0.35, 'triangle')
    }, 1000)
  },

  loss() {
    osc(400, 0.12, 'sawtooth', 0.22)
    osc(280, 0.2, 'sawtooth', 0.18, 0.12)
    osc(200, 0.3, 'square', 0.14, 0.28)
    noise(0.1, 0.12, 0.05, 100, 800)
  },

  cashout() {
    // Cash register ding
    noise(0.04, 0.25, 0, 2000, 8000)
    osc(1047, 0.1, 'sine', 0.32)
    osc(1319, 0.14, 'sine', 0.28, 0.09)
    osc(1568, 0.2, 'sine', 0.22, 0.2)
    // Coins spilling
    for (let i = 0; i < 4; i++) {
      noise(0.04, 0.18, 0.25 + i * 0.07, 1200, 5000)
      osc(900 + i * 80, 0.06, 'triangle', 0.14, 0.25 + i * 0.07)
    }
  },

  // ─────────────────────────────────────────
  // AVIATOR / CRASH
  // ─────────────────────────────────────────
  planeFly() {
    if (!on()) return
    try {
      const c = ctx()
      // Turbine layer
      const o1 = c.createOscillator(), g1 = c.createGain()
      o1.type = 'sawtooth'
      o1.frequency.setValueAtTime(55, c.currentTime)
      o1.frequency.linearRampToValueAtTime(140, c.currentTime + 2)
      g1.gain.setValueAtTime(0.001, c.currentTime)
      g1.gain.linearRampToValueAtTime(0.18, c.currentTime + 0.3)
      g1.gain.linearRampToValueAtTime(0.14, c.currentTime + 1.5)
      g1.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 2.2)
      o1.connect(g1); g1.connect(c.destination)
      o1.start(); o1.stop(c.currentTime + 2.3)

      // High whine
      const o2 = c.createOscillator(), g2 = c.createGain()
      o2.type = 'square'
      o2.frequency.setValueAtTime(180, c.currentTime + 0.2)
      o2.frequency.exponentialRampToValueAtTime(700, c.currentTime + 1.8)
      g2.gain.setValueAtTime(0.001, c.currentTime + 0.2)
      g2.gain.linearRampToValueAtTime(0.07, c.currentTime + 0.5)
      g2.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 2.0)
      o2.connect(g2); g2.connect(c.destination)
      o2.start(c.currentTime + 0.2); o2.stop(c.currentTime + 2.2)

      // Air rush
      noise(1.4, 0.1, 0.3, 600, 4000)
      noise(0.8, 0.14, 0.8, 1000, 6000)
    } catch {}
  },

  jetLoop() {
    if (!on()) return
    try {
      const c = ctx()
      const o = c.createOscillator(), g = c.createGain()
      o.type = 'sawtooth'
      o.frequency.setValueAtTime(75, c.currentTime)
      o.frequency.linearRampToValueAtTime(95, c.currentTime + 0.4)
      g.gain.setValueAtTime(0.001, c.currentTime)
      g.gain.linearRampToValueAtTime(0.13, c.currentTime + 0.08)
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.5)
      o.connect(g); g.connect(c.destination)
      o.start(); o.stop(c.currentTime + 0.6)
      noise(0.25, 0.08, 0.05, 500, 3000)
    } catch {}
  },

  rocketLaunch() {
    if (!on()) return
    try {
      const c = ctx()
      // Deep ignition boom
      noise(0.15, 0.45, 0, 60, 500)
      const o = c.createOscillator(), g = c.createGain()
      o.type = 'sawtooth'
      o.frequency.setValueAtTime(80, c.currentTime)
      o.frequency.exponentialRampToValueAtTime(350, c.currentTime + 1.2)
      g.gain.setValueAtTime(0.001, c.currentTime)
      g.gain.linearRampToValueAtTime(0.22, c.currentTime + 0.1)
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 1.3)
      o.connect(g); g.connect(c.destination)
      o.start(); o.stop(c.currentTime + 1.4)
      // Exhaust rush
      noise(1.1, 0.2, 0.1, 200, 3000)
      noise(0.7, 0.14, 0.4, 800, 5000)
    } catch {}
  },

  multRise(mult) {
    if (!on()) return
    // Subtle rising tick as multiplier increases
    const freq = Math.min(300 + mult * 35, 1400)
    osc(freq, 0.04, 'sine', 0.09)
  },

  crash() {
    if (!on()) return
    // Massive explosion
    noise(0.14, 0.55, 0, 40, 8000)
    osc(100, 0.5, 'square', 0.38)
    osc(70, 0.7, 'sawtooth', 0.28, 0.05)
    noise(0.5, 0.35, 0.08, 150, 2000)
    // Debris
    for (let i = 0; i < 6; i++) {
      noise(0.06, 0.18, 0.12 + i * 0.09, 300 + i * 200, 2500)
      osc(500 - i * 40, 0.08, 'sine', 0.1, 0.1 + i * 0.08)
    }
    // Descending whistle
    osc(900, 0.6, 'sine', 0.14, 0.08, 80)
  },

  // ─────────────────────────────────────────
  // ROULETTE
  // ─────────────────────────────────────────
  rouletteSpin() {
    if (!on()) return
    // Ball clacking around wheel — decelerating
    for (let i = 0; i < 18; i++) {
      const delay = i * i * 0.006 + i * 0.05
      noise(0.025, 0.22, delay, 1000, 5000)
      osc(1100 + Math.random() * 600, 0.025, 'square', 0.1, delay)
    }
    // Wheel motor hum
    osc(120, 3.0, 'sawtooth', 0.07, 0, 60)
    noise(2.0, 0.06, 0, 300, 1200)
  },

  rouletteLand() {
    // Ball drops into pocket — 3 bounces
    for (let i = 0; i < 3; i++) {
      noise(0.04, 0.28 - i * 0.06, i * 0.12, 600, 4000)
      osc(600 - i * 80, 0.1 - i * 0.02, 'sine', 0.22 - i * 0.04, i * 0.12)
    }
    // Settle
    osc(280, 0.25, 'sine', 0.15, 0.38)
  },

  // ─────────────────────────────────────────
  // CARDS
  // ─────────────────────────────────────────
  cardFlip() {
    noise(0.06, 0.25, 0, 800, 6000)
    osc(1100, 0.04, 'square', 0.12, 0.01)
    osc(700, 0.07, 'sine', 0.1, 0.03)
  },

  cardDeal() {
    noise(0.08, 0.22, 0, 600, 4000)
    osc(900, 0.05, 'sine', 0.14, 0.02)
    osc(600, 0.08, 'sine', 0.1, 0.05)
  },

  cardReveal() {
    noise(0.05, 0.2, 0, 900, 5000)
    osc(1047, 0.07, 'sine', 0.22, 0.01)
    osc(1319, 0.1, 'sine', 0.18, 0.08)
    osc(880, 0.12, 'sine', 0.14, 0.16)
  },

  cardShuffle() {
    if (!on()) return
    for (let i = 0; i < 8; i++) {
      noise(0.04, 0.18, i * 0.055, 600, 4000)
      osc(700 + Math.random() * 300, 0.03, 'square', 0.1, i * 0.055)
    }
  },

  // ─────────────────────────────────────────
  // SLOTS
  // ─────────────────────────────────────────
  slotSpin() {
    if (!on()) return
    // Reel mechanism — mechanical clicking
    for (let i = 0; i < 10; i++) {
      noise(0.035, 0.2, i * 0.065, 300, 2000)
      osc(220 + i * 22, 0.03, 'square', 0.12, i * 0.065)
    }
    // Motor hum under it
    osc(110, 0.7, 'sawtooth', 0.09, 0, 80)
    noise(0.6, 0.07, 0, 150, 600)
  },

  slotStop() {
    noise(0.07, 0.3, 0, 400, 2500)
    osc(450, 0.1, 'square', 0.2)
    osc(300, 0.14, 'sine', 0.16, 0.08)
    osc(200, 0.18, 'sine', 0.12, 0.18)
  },

  slotJackpot() {
    if (!on()) return
    sounds.jackpot()
  },

  // ─────────────────────────────────────────
  // DICE
  // ─────────────────────────────────────────
  diceRoll() {
    if (!on()) return
    // Dice tumbling on surface
    for (let i = 0; i < 7; i++) {
      noise(0.04, 0.32, i * 0.06, 500, 3500)
      osc(600 + Math.random() * 500, 0.03, 'square', 0.14, i * 0.06)
    }
    // Final impact
    noise(0.08, 0.3, 0.38, 800, 4000)
    osc(700, 0.1, 'sine', 0.18, 0.4)
  },

  diceStop() {
    noise(0.07, 0.28, 0, 700, 4000)
    osc(650, 0.1, 'sine', 0.2)
    osc(450, 0.15, 'sine', 0.15, 0.08)
  },

  // ─────────────────────────────────────────
  // MINES
  // ─────────────────────────────────────────
  gemFound() {
    if (!on()) return
    // Crystal chime
    noise(0.03, 0.12, 0, 3000, 10000)
    osc(1319, 0.1, 'sine', 0.28)
    osc(1568, 0.14, 'sine', 0.24, 0.08)
    osc(2093, 0.18, 'sine', 0.2, 0.17)
    osc(1760, 0.22, 'sine', 0.16, 0.28)
    // Sparkle
    for (let i = 0; i < 3; i++) {
      noise(0.02, 0.1, 0.35 + i * 0.07, 4000, 12000)
    }
  },

  mineExplode() {
    if (!on()) return
    // Big explosion
    noise(0.16, 0.55, 0, 30, 8000)
    osc(80, 0.5, 'square', 0.42)
    osc(55, 0.7, 'sawtooth', 0.32, 0.06)
    noise(0.45, 0.38, 0.1, 150, 2500)
    // Shockwave
    for (let i = 0; i < 5; i++) {
      noise(0.07, 0.2, 0.1 + i * 0.1, 200 + i * 150, 2000)
    }
    // Ringing
    osc(600, 0.8, 'sine', 0.1, 0.2, 200)
  },

  // ─────────────────────────────────────────
  // PLINKO
  // ─────────────────────────────────────────
  plinkoHit() {
    if (!on()) return
    const freq = 700 + Math.random() * 700
    noise(0.025, 0.18, 0, 1000, 5000)
    osc(freq, 0.06, 'sine', 0.14)
    osc(freq * 1.5, 0.04, 'sine', 0.08, 0.02)
  },

  plinkoLand() {
    if (!on()) return
    noise(0.1, 0.3, 0, 400, 3000)
    osc(400, 0.14, 'sine', 0.24)
    osc(280, 0.2, 'sine', 0.2, 0.08)
    osc(180, 0.28, 'sine', 0.14, 0.18)
  },

  // ─────────────────────────────────────────
  // WHEEL SPIN
  // ─────────────────────────────────────────
  wheelSpin() {
    if (!on()) return
    try {
      const c = ctx()
      // Spinning whoosh + decelerating ticks
      osc(280, 2.5, 'sawtooth', 0.1, 0, 50)
      noise(1.8, 0.08, 0, 300, 1500)
      // Ticking as it slows
      for (let i = 0; i < 22; i++) {
        const delay = 0.05 + i * i * 0.007 + i * 0.04
        noise(0.025, 0.2, delay, 800, 4000)
        osc(900 + Math.random() * 500, 0.025, 'square', 0.12, delay)
      }
    } catch {}
  },

  // ─────────────────────────────────────────
  // CHICKEN ROAD
  // ─────────────────────────────────────────
  chickenJump() {
    if (!on()) return
    // Bwok! chicken sound
    osc(500, 0.05, 'square', 0.18)
    osc(800, 0.06, 'square', 0.16, 0.04)
    osc(650, 0.05, 'square', 0.12, 0.08)
    osc(400, 0.08, 'sawtooth', 0.1, 0.11)
    // Flap
    noise(0.06, 0.2, 0.02, 300, 2000)
  },

  chickenBurn() {
    if (!on()) return
    // BWAAK! + sizzle
    osc(700, 0.08, 'square', 0.22)
    osc(900, 0.06, 'square', 0.18, 0.06)
    osc(500, 0.1, 'square', 0.14, 0.1)
    osc(300, 0.15, 'sawtooth', 0.12, 0.16)
    // Sizzle
    noise(0.5, 0.35, 0.05, 2000, 8000)
    noise(0.3, 0.25, 0.08, 400, 2000)
    // Truck horn
    osc(200, 0.25, 'square', 0.25, 0)
    osc(160, 0.3, 'square', 0.2, 0.05)
  },

  truckHorn() {
    // Truck/vehicle horn
    osc(220, 0.15, 'square', 0.25)
    osc(165, 0.2, 'square', 0.22, 0.05)
    osc(196, 0.12, 'square', 0.18, 0.1)
  },

  vehiclePass() {
    // Vehicle whooshing past
    noise(0.3, 0.2, 0, 200, 1000)
    osc(150, 0.3, 'sawtooth', 0.12, 0, 80)
  },

  // ─────────────────────────────────────────
  // TOWER
  // ─────────────────────────────────────────
  towerClimb() {
    osc(440, 0.06, 'sine', 0.2)
    osc(554, 0.08, 'sine', 0.17, 0.07)
    osc(659, 0.1, 'sine', 0.14, 0.16)
    noise(0.04, 0.12, 0.2, 500, 3000)
  },

  towerFall() {
    osc(500, 0.5, 'sawtooth', 0.28, 0, 80)
    noise(0.4, 0.32, 0.05, 200, 2000)
    osc(300, 0.3, 'square', 0.18, 0.1, 100)
  },

  // ─────────────────────────────────────────
  // COLOR PREDICTION
  // ─────────────────────────────────────────
  colorSpin() {
    if (!on()) return
    // Wheel spinning + anticipation
    for (let i = 0; i < 10; i++) {
      osc(300 + i * 70, 0.06, 'triangle', 0.14, i * 0.11)
      noise(0.03, 0.1, i * 0.11, 400, 2000)
    }
    // Whoosh under
    osc(200, 1.2, 'sawtooth', 0.09, 0, 80)
  },

  colorReveal() {
    melody([
      [440, 0.08, 0.01], [554, 0.08, 0.01],
      [659, 0.08, 0.01], [880, 0.18, 0]
    ], 0.3, 'sine')
    noise(0.06, 0.15, 0.3, 800, 4000)
  },

  // ─────────────────────────────────────────
  // HI-LO
  // ─────────────────────────────────────────
  hiloHigher() {
    osc(523, 0.08, 'sine', 0.22)
    osc(659, 0.1, 'sine', 0.2, 0.09)
    osc(784, 0.14, 'sine', 0.17, 0.2)
    osc(1047, 0.18, 'sine', 0.14, 0.32)
  },

  hiloLower() {
    osc(784, 0.08, 'sine', 0.22)
    osc(659, 0.1, 'sine', 0.2, 0.09)
    osc(523, 0.14, 'sine', 0.17, 0.2)
    osc(392, 0.18, 'sine', 0.14, 0.32)
  },

  // ─────────────────────────────────────────
  // SPIN & WIN
  // ─────────────────────────────────────────
  spinStart() {
    if (!on()) return
    // Arrow whoosh + spin motor
    noise(0.12, 0.22, 0, 400, 3000)
    osc(200, 1.5, 'sawtooth', 0.1, 0, 55)
    for (let i = 0; i < 6; i++) {
      osc(280 + i * 40, 0.05, 'square', 0.1, i * 0.07)
    }
  },

  // ─────────────────────────────────────────
  // SIC BO
  // ─────────────────────────────────────────
  sicBoShake() {
    if (!on()) return
    // Dice in cup shaking
    for (let i = 0; i < 10; i++) {
      noise(0.04, 0.25, i * 0.07, 400, 3000)
      osc(500 + Math.random() * 400, 0.03, 'square', 0.1, i * 0.07)
    }
    noise(0.08, 0.3, 0.65, 600, 3500)
  },

  // ─────────────────────────────────────────
  // TEEN PATTI / ANDAR BAHAR
  // ─────────────────────────────────────────
  cardFlipFast() {
    noise(0.04, 0.22, 0, 1000, 6000)
    osc(1200, 0.03, 'square', 0.13)
    osc(800, 0.05, 'sine', 0.1, 0.02)
  },

  // ─────────────────────────────────────────
  // BACCARAT / DRAGON TIGER
  // ─────────────────────────────────────────
  dealerDeal() {
    sounds.cardDeal()
    setTimeout(() => sounds.cardDeal(), 200)
    setTimeout(() => sounds.cardDeal(), 400)
  },

  // ─────────────────────────────────────────
  // LUCKY WHEEL
  // ─────────────────────────────────────────
  wheelTick() {
    noise(0.02, 0.16, 0, 800, 4000)
    osc(1000 + Math.random() * 500, 0.02, 'square', 0.1)
  },

  // ─────────────────────────────────────────
  // COUNTDOWN
  // ─────────────────────────────────────────
  tick() {
    osc(1200, 0.04, 'square', 0.13)
    osc(800, 0.03, 'sine', 0.08, 0.03)
  },

  tickFinal() {
    // Last second tick (lower, heavier)
    osc(600, 0.08, 'square', 0.22)
    osc(400, 0.1, 'sawtooth', 0.16, 0.06)
    noise(0.05, 0.15, 0.02, 300, 1500)
  },

  // ─────────────────────────────────────────
  // SOUND TOGGLE
  // ─────────────────────────────────────────
  soundOn() {
    melody([
      [440, 0.08, 0.01], [660, 0.1, 0.01], [880, 0.16, 0]
    ], 0.3, 'sine')
  },

  soundOff() {
    melody([
      [880, 0.08, 0.01], [660, 0.08, 0.01], [440, 0.12, 0]
    ], 0.25, 'sine')
  },
}

// ── Toggle ──────────────────────────────────────────────
export const toggleSound = () => {
  const nowOff = localStorage.getItem('rb_snd') === '0'
  localStorage.setItem('rb_snd', nowOff ? '1' : '0')
  if (nowOff) setTimeout(() => sounds.soundOn(), 50)
  else sounds.soundOff()
  return nowOff // returns true = now ON
}

export const getSoundState = () => localStorage.getItem('rb_snd') !== '0'

export default sounds
