/** Tiny square-wave SFX for MECC / trail feel. Silent if audio blocked. */

function ctx(): AudioContext | null {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return null;
    return new Ctx();
  } catch {
    return null;
  }
}

function tone(
  frequency: number,
  durationMs: number,
  type: OscillatorType = "square",
  gain = 0.035,
  slideTo?: number,
) {
  const ac = ctx();
  if (!ac) return;
  try {
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = type;
    o.frequency.value = frequency;
    g.gain.value = gain;
    o.connect(g);
    g.connect(ac.destination);
    const t0 = ac.currentTime;
    const t1 = t0 + durationMs / 1000;
    if (slideTo != null) {
      o.frequency.linearRampToValueAtTime(slideTo, t1);
    }
    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t1);
    o.start(t0);
    o.stop(t1);
    o.onended = () => void ac.close();
  } catch {
    /* ignore */
  }
}

export function blip(freq = 440, ms = 40) {
  tone(freq, ms, "square", 0.035);
}

/** Low wooden creak / wheel grind while the wagon moves */
export function wagonCreak() {
  // Rough wooden scrape: low saw + quiet noise-ish pulse
  tone(95, 90, "sawtooth", 0.02, 70);
  window.setTimeout(() => tone(80, 70, "square", 0.012, 55), 70);
  window.setTimeout(() => tone(110, 50, "triangle", 0.01, 90), 150);
}

export function deathToll() {
  tone(180, 120, "square", 0.04, 120);
  window.setTimeout(() => tone(140, 160, "square", 0.03, 90), 140);
  window.setTimeout(() => tone(100, 220, "triangle", 0.025), 300);
}

export function tombstoneOpen() {
  tone(220, 80, "square", 0.03);
  window.setTimeout(() => tone(165, 140, "square", 0.025), 100);
}
