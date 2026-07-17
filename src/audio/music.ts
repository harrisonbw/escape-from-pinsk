/**
 * 8-bit style loop: traditional Hava Nagila melody (public-domain folk tune)
 * rendered as square-wave chiptune. No external audio files.
 */

type Step = { f: number; beats: number };

// Approximate freygish / minor chiptune arrangement (Hz)
const N = {
  r: 0,
  D3: 146.83,
  E3: 164.81,
  F3: 174.61,
  G3: 196.0,
  A3: 220.0,
  Bb3: 233.08,
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  Fs4: 369.99,
  G4: 392.0,
  A4: 440.0,
  Bb4: 466.16,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
};

/** Main phrases of Hava Nagila — simplified for 8-bit loop */
const MELODY: Step[] = [
  // Hava nagila, hava nagila, hava nagila ve-nismecha
  { f: N.D4, beats: 1 },
  { f: N.E4, beats: 1 },
  { f: N.F4, beats: 1 },
  { f: N.G4, beats: 1 },
  { f: N.A4, beats: 2 },
  { f: N.A4, beats: 1 },
  { f: N.Bb4, beats: 1 },
  { f: N.A4, beats: 1 },
  { f: N.G4, beats: 1 },
  { f: N.F4, beats: 1 },
  { f: N.E4, beats: 1 },
  { f: N.D4, beats: 2 },

  { f: N.D4, beats: 1 },
  { f: N.E4, beats: 1 },
  { f: N.F4, beats: 1 },
  { f: N.G4, beats: 1 },
  { f: N.A4, beats: 2 },
  { f: N.A4, beats: 1 },
  { f: N.Bb4, beats: 1 },
  { f: N.A4, beats: 1 },
  { f: N.G4, beats: 1 },
  { f: N.F4, beats: 1 },
  { f: N.E4, beats: 1 },
  { f: N.D4, beats: 2 },

  // Uru achim…
  { f: N.A4, beats: 1 },
  { f: N.A4, beats: 1 },
  { f: N.A4, beats: 1 },
  { f: N.Bb4, beats: 1 },
  { f: N.C5, beats: 2 },
  { f: N.C5, beats: 1 },
  { f: N.D5, beats: 1 },
  { f: N.C5, beats: 1 },
  { f: N.Bb4, beats: 1 },
  { f: N.A4, beats: 1 },
  { f: N.G4, beats: 1 },
  { f: N.A4, beats: 2 },

  { f: N.A4, beats: 1 },
  { f: N.A4, beats: 1 },
  { f: N.A4, beats: 1 },
  { f: N.Bb4, beats: 1 },
  { f: N.C5, beats: 2 },
  { f: N.C5, beats: 1 },
  { f: N.D5, beats: 1 },
  { f: N.C5, beats: 1 },
  { f: N.Bb4, beats: 1 },
  { f: N.A4, beats: 1 },
  { f: N.G4, beats: 1 },
  { f: N.A4, beats: 2 },

  // Faster dance-ish close
  { f: N.D4, beats: 0.5 },
  { f: N.E4, beats: 0.5 },
  { f: N.F4, beats: 0.5 },
  { f: N.G4, beats: 0.5 },
  { f: N.A4, beats: 1 },
  { f: N.A4, beats: 0.5 },
  { f: N.Bb4, beats: 0.5 },
  { f: N.A4, beats: 0.5 },
  { f: N.G4, beats: 0.5 },
  { f: N.F4, beats: 0.5 },
  { f: N.E4, beats: 0.5 },
  { f: N.D4, beats: 1 },
  { f: N.r, beats: 1 },
];

// Quiet bass under melody
const BASS: Step[] = [
  { f: N.D3, beats: 4 },
  { f: N.A3, beats: 4 },
  { f: N.D3, beats: 4 },
  { f: N.A3, beats: 4 },
  { f: N.F3, beats: 4 },
  { f: N.C4, beats: 4 },
  { f: N.F3, beats: 4 },
  { f: N.C4, beats: 4 },
  { f: N.D3, beats: 4 },
  { f: N.A3, beats: 4 },
  { f: N.D3, beats: 2 },
  { f: N.r, beats: 2 },
];

const BPM = 128;
const BEAT = 60 / BPM; // quarter note seconds — we treat "beats" as eighths → half
const EIGHTH = BEAT / 2;

let audioCtx: AudioContext | null = null;
let master: GainNode | null = null;
let timer: number | null = null;
let stepIndex = 0;
let bassIndex = 0;
let bassRemain = 0;
let muted = false;
let started = false;
let melodyRemain = 0;
let nextNoteAt = 0;
let bassFreq = 0;

function ensureCtx(): AudioContext | null {
  if (audioCtx) return audioCtx;
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return null;
    audioCtx = new Ctx();
    master = audioCtx.createGain();
    master.gain.value = muted ? 0 : 0.045;
    master.connect(audioCtx.destination);
    return audioCtx;
  } catch {
    return null;
  }
}

function playNote(
  ac: AudioContext,
  freq: number,
  when: number,
  dur: number,
  type: OscillatorType,
  gainLevel: number,
) {
  if (!master || freq <= 0 || muted) return;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, when);
  g.gain.setValueAtTime(0.0001, when);
  g.gain.exponentialRampToValueAtTime(gainLevel, when + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, when + Math.max(0.03, dur - 0.02));
  o.connect(g);
  g.connect(master);
  o.start(when);
  o.stop(when + dur + 0.02);
}

function scheduleSlice() {
  const ac = audioCtx;
  if (!ac || !master || !started) return;

  const now = ac.currentTime;
  // Schedule ~0.4s ahead
  const horizon = now + 0.45;

  while (nextNoteAt < horizon) {
    if (melodyRemain <= 0) {
      const step = MELODY[stepIndex % MELODY.length];
      stepIndex++;
      melodyRemain = step.beats;
      const dur = step.beats * EIGHTH * 0.92;
      playNote(ac, step.f, nextNoteAt, dur, "square", 0.07);
      // quiet harmony a fifth up for chiptune color
      if (step.f > 0) {
        playNote(ac, step.f * 1.5, nextNoteAt, dur * 0.85, "square", 0.018);
      }
    }

    if (bassRemain <= 0) {
      const b = BASS[bassIndex % BASS.length];
      bassIndex++;
      bassRemain = b.beats;
      bassFreq = b.f;
    }

    const slice = Math.min(melodyRemain, bassRemain, 0.5);
    const sliceSec = slice * EIGHTH;
    if (bassFreq > 0) {
      playNote(ac, bassFreq, nextNoteAt, sliceSec * 0.9, "triangle", 0.04);
    }

    nextNoteAt += sliceSec;
    melodyRemain -= slice;
    bassRemain -= slice;
  }
}

function tick() {
  if (!started) return;
  scheduleSlice();
  timer = window.setTimeout(tick, 120);
}

/** Call from first user gesture (e.g. PLAY). */
export async function startMusic(): Promise<void> {
  const ac = ensureCtx();
  if (!ac) return;
  if (ac.state === "suspended") {
    try {
      await ac.resume();
    } catch {
      /* ignore */
    }
  }
  if (started) return;
  started = true;
  stepIndex = 0;
  bassIndex = 0;
  bassRemain = 0;
  melodyRemain = 0;
  nextNoteAt = ac.currentTime + 0.05;
  if (master) master.gain.value = muted ? 0 : 0.045;
  tick();
}

export function stopMusic() {
  started = false;
  if (timer != null) {
    window.clearTimeout(timer);
    timer = null;
  }
}

export function setMusicMuted(m: boolean) {
  muted = m;
  if (master && audioCtx) {
    master.gain.setTargetAtTime(m ? 0 : 0.045, audioCtx.currentTime, 0.02);
  }
  try {
    localStorage.setItem("efp-music-muted", m ? "1" : "0");
  } catch {
    /* ignore */
  }
}

export function isMusicMuted(): boolean {
  try {
    return localStorage.getItem("efp-music-muted") === "1";
  } catch {
    return false;
  }
}

export function isMusicStarted(): boolean {
  return started;
}
