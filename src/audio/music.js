// The music: a dark, slow ambient theme generated live with the Web Audio API (no audio file).
// It starts with the story and never stops between chapters (the voice-over plays on top of it).
//
//   - a low drone: two slightly detuned sawtooth waves through a low-pass filter that "breathes"
//   - a string pad: minor chords (D minor → B flat → G minor → A) that change every 9 seconds
//   - now and then a lonely piano-like note high above, with a long echo
//   - everything goes through a generated reverb (a convolver fed with decaying noise)

let started = false;

export function startMusic() {
  if (started) return;
  started = true;
  const a = new (window.AudioContext || window.webkitAudioContext)();
  const master = a.createGain();
  master.gain.value = 0;
  master.gain.linearRampToValueAtTime(isMuted() ? 0 : 0.16, a.currentTime + 6); // fades in slowly

  // reverb: an impulse response made of noise that fades out over 4 s
  const reverb = a.createConvolver();
  const len = a.sampleRate * 4;
  const ir = a.createBuffer(2, len, a.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = ir.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
  }
  reverb.buffer = ir;
  const wet = a.createGain();
  wet.gain.value = 0.7;
  const dry = a.createGain();
  dry.gain.value = 0.45;
  reverb.connect(wet).connect(master);
  dry.connect(master);
  master.connect(a.destination);
  const send = (node) => {
    node.connect(dry);
    node.connect(reverb);
  };

  // ---- the drone ----
  const drone = a.createBiquadFilter();
  drone.type = "lowpass";
  drone.frequency.value = 220;
  drone.Q.value = 2;
  const droneGain = a.createGain();
  droneGain.gain.value = 0.35;
  drone.connect(droneGain);
  send(droneGain);
  for (const detune of [-7, 6]) {
    const o = a.createOscillator();
    o.type = "sawtooth";
    o.frequency.value = 36.71; // D1
    o.detune.value = detune;
    o.connect(drone);
    o.start();
  }
  const lfo = a.createOscillator(); // the filter slowly opens and closes: the drone breathes
  lfo.frequency.value = 0.05;
  const lfoAmount = a.createGain();
  lfoAmount.gain.value = 120;
  lfo.connect(lfoAmount).connect(drone.frequency);
  lfo.start();

  // ---- the pad: minor chords ----
  const CHORDS = [
    [50, 53, 57, 62], // D minor
    [46, 50, 53, 58], // B flat
    [43, 46, 50, 55], // G minor
    [45, 49, 52, 57], // A (the dark turn back to D)
  ];
  const freq = (m) => 440 * 2 ** ((m - 69) / 12);
  const padFilter = a.createBiquadFilter();
  padFilter.type = "lowpass";
  padFilter.frequency.value = 900;
  const padGain = a.createGain();
  padGain.gain.value = 0.11;
  padFilter.connect(padGain);
  send(padGain);
  const voices = [0, 1, 2, 3].map(() => {
    const o = a.createOscillator();
    o.type = "triangle";
    const o2 = a.createOscillator();
    o2.type = "sawtooth";
    o2.detune.value = 9;
    const g = a.createGain();
    g.gain.value = 0.5;
    const g2 = a.createGain();
    g2.gain.value = 0.12;
    o.connect(g).connect(padFilter);
    o2.connect(g2).connect(padFilter);
    o.start();
    o2.start();
    return [o, o2];
  });
  let chord = 0;
  const nextChord = () => {
    const t = a.currentTime;
    CHORDS[chord % CHORDS.length].forEach((m, i) => {
      for (const o of voices[i]) o.frequency.setTargetAtTime(freq(m), t, 1.4); // slow glide between chords
    });
    chord++;
  };
  nextChord();
  setInterval(nextChord, 9000);

  // ---- a lonely high note now and then ----
  const SCALE = [74, 77, 79, 81, 84, 86]; // D minor pentatonic, high
  const bell = () => {
    const t = a.currentTime;
    const o = a.createOscillator();
    o.type = "sine";
    o.frequency.value = freq(SCALE[Math.floor(Math.random() * SCALE.length)]);
    const g = a.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.06, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 4);
    o.connect(g);
    send(g);
    o.start(t);
    o.stop(t + 4.2);
    setTimeout(bell, 5000 + Math.random() * 9000);
  };
  setTimeout(bell, 7000);

  // the mute button also silences the music
  document.getElementById("mute")?.addEventListener("click", () => {
    master.gain.setTargetAtTime(isMuted() ? 0 : 0.16, a.currentTime, 0.4);
  });
}

function isMuted() {
  return document.getElementById("mute")?.textContent === "🔇";
}
