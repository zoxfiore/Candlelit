// Little sounds made in code with the Web Audio API (no audio file):
//   violin(notes)  a sawtooth through a "body" filter, with vibrato and a slow bow attack
//   radio()        static noise through a narrow band-pass, like an old valve radio, + a voice
//   tick()         a clock tick (a very short filtered click)
// The AudioContext is created on the first sound (browsers allow it only after a click).

let ctx = null;
const audio = () => (ctx ??= new (window.AudioContext || window.webkitAudioContext)());

export function isMuted() {
  return document.getElementById("mute")?.textContent === "🔇";
}

/** play a short phrase on a synthetic violin. notes = [[midi, beats], ...] */
export function violin(notes = [[67, 1], [72, 1], [76, 1.5], [74, 0.5], [72, 1], [71, 1], [72, 2]], tempo = 92) {
  if (isMuted()) return;
  const a = audio();
  const out = a.createGain();
  out.gain.value = 0.18;
  // the wooden body of a violin = a few resonances
  const body = a.createBiquadFilter();
  body.type = "peaking";
  body.frequency.value = 2800;
  body.Q.value = 1.2;
  body.gain.value = 6;
  const low = a.createBiquadFilter();
  low.type = "lowpass";
  low.frequency.value = 4200;
  out.connect(body).connect(low).connect(a.destination);
  let t = a.currentTime + 0.05;
  const beat = 60 / tempo;
  for (const [midi, beats] of notes) {
    const dur = beats * beat;
    const osc = a.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.value = 440 * 2 ** ((midi - 69) / 12);
    const vib = a.createOscillator(); // vibrato: the finger rocks on the string
    vib.frequency.value = 5.5;
    const vibAmount = a.createGain();
    vibAmount.gain.value = osc.frequency.value * 0.006;
    vib.connect(vibAmount).connect(osc.frequency);
    const env = a.createGain(); // the bow: slow attack, sustain, soft release
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(1, t + 0.12);
    env.gain.setValueAtTime(0.85, t + dur - 0.08);
    env.gain.linearRampToValueAtTime(0, t + dur + 0.05);
    osc.connect(env).connect(out);
    osc.start(t);
    vib.start(t);
    osc.stop(t + dur + 0.1);
    vib.stop(t + dur + 0.1);
    t += dur;
  }
}

/** an old radio: static, then a news bulletin read by the speech synthesis. Returns stop() */
export function radio(text) {
  const a = audio();
  const noise = a.createBufferSource();
  const buffer = a.createBuffer(1, a.sampleRate * 2, a.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  noise.buffer = buffer;
  noise.loop = true;
  const band = a.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = 1400;
  band.Q.value = 0.8;
  const gain = a.createGain();
  gain.gain.value = isMuted() ? 0 : 0.05;
  noise.connect(band).connect(gain).connect(a.destination);
  noise.start();
  // tuning: the static fades down when the station comes in
  gain.gain.setValueAtTime(gain.gain.value, a.currentTime + 0.8);
  gain.gain.linearRampToValueAtTime(isMuted() ? 0 : 0.012, a.currentTime + 1.6);
  let spoken = null;
  if (text && window.speechSynthesis && !isMuted()) {
    spoken = new SpeechSynthesisUtterance(text);
    spoken.rate = 1.02;
    spoken.pitch = 0.75;
    spoken.lang = "en-US";
    setTimeout(() => window.speechSynthesis.speak(spoken), 1300);
  }
  return () => {
    noise.stop();
    if (spoken) window.speechSynthesis.cancel();
  };
}

/** a soft clock tick */
export function tick(loud = 0.05) {
  if (isMuted() || !ctx) return; // ticks only once the sound is unlocked by another sound
  const a = audio();
  const osc = a.createOscillator();
  osc.type = "square";
  osc.frequency.value = 2200;
  const env = a.createGain();
  env.gain.setValueAtTime(loud, a.currentTime);
  env.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + 0.03);
  osc.connect(env).connect(a.destination);
  osc.start();
  osc.stop(a.currentTime + 0.04);
}

/** a paper rustle (picking up the letter) */
export function rustle() {
  if (isMuted()) return;
  const a = audio();
  const src = a.createBufferSource();
  const len = a.sampleRate * 0.5;
  const buffer = a.createBuffer(1, len, a.sampleRate);
  const d = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2) * (0.5 + 0.5 * Math.sin(i / 300));
  src.buffer = buffer;
  const hp = a.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 2500;
  const g = a.createGain();
  g.gain.value = 0.12;
  src.connect(hp).connect(g).connect(a.destination);
  src.start();
}

/** paper catching fire: a crackle (sparse clicks) over a soft roar (low-passed noise) */
export function burnSound() {
  if (isMuted()) return;
  const a = audio();
  const len = a.sampleRate * 3.5;
  const buffer = a.createBuffer(1, len, a.sampleRate);
  const d = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) {
    const env = Math.min(1, i / (a.sampleRate * 0.4)) * Math.pow(1 - i / len, 1.5);
    d[i] = ((Math.random() * 2 - 1) * 0.25 + (Math.random() < 0.002 ? (Math.random() * 2 - 1) * 3 : 0)) * env;
  }
  const src = a.createBufferSource();
  src.buffer = buffer;
  const lp = a.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 2600;
  const g = a.createGain();
  g.gain.value = 0.25;
  src.connect(lp).connect(g).connect(a.destination);
  src.start();
}

/** an old telephone bell: two short rings. Returns nothing; call it again to ring again */
export function ring() {
  if (isMuted()) return;
  const a = audio();
  const t0 = a.currentTime;
  for (const start of [0, 0.5]) {
    const o = a.createOscillator();
    o.type = "square";
    o.frequency.value = 880;
    const trem = a.createOscillator(); // the hammer hitting the two bells, ~20 times a second
    trem.frequency.value = 20;
    const tremGain = a.createGain();
    tremGain.gain.value = 0.5;
    const g = a.createGain();
    g.gain.value = 0;
    g.gain.setValueAtTime(0.05, t0 + start);
    g.gain.setValueAtTime(0, t0 + start + 0.4);
    trem.connect(tremGain).connect(g.gain);
    const lp = a.createBiquadFilter();
    lp.type = "bandpass";
    lp.frequency.value = 1600;
    o.connect(lp).connect(g).connect(a.destination);
    o.start(t0 + start);
    trem.start(t0 + start);
    o.stop(t0 + start + 0.45);
    trem.stop(t0 + start + 0.45);
  }
}

/** a clock chime: four soft bell notes (Westminster-like) */
export function chime() {
  if (isMuted()) return;
  const a = audio();
  [[64, 0], [62, 0.55], [60, 1.1], [55, 1.65]].forEach(([m, at]) => {
    const t = a.currentTime + at;
    const o = a.createOscillator();
    o.type = "sine";
    o.frequency.value = 440 * 2 ** ((m + 12 - 69) / 12);
    const g = a.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.12, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
    o.connect(g).connect(a.destination);
    o.start(t);
    o.stop(t + 1.7);
  });
}
