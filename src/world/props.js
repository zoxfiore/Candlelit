// Small objects made in code, to fill the rooms: books, papers, a pipe, a violin, a radio, a clock...
// Some of them can be used in first person: they have userData.interact = (hit) => { ... }
// (the click handler in ui/inspect.js calls it when you click them with the aiming dot).
// The chalkboard also has userData.draw = (uv, down) => { ... }: you can write on it.

import * as THREE from "three";
import { canvasTexture } from "./procedural.js";
import { violin, radio, tick } from "../audio/synth.js";
import { pullOut, flutter, tilt, chimes } from "./interactive.js";

const std = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.7, ...extra });
function mesh(geo, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}
const rnd = (seed) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

/** a row of books, `width` metres long (spines of different colours, heights and thicknesses) */
export function createBooks(width = 0.8, { seed = 1, maxHeight = 0.3 } = {}) {
  const r = rnd(seed * 31 + 7);
  const colors = ["#5a1e18", "#1e3a2a", "#2a2e4a", "#6a4a20", "#3a1e2e", "#7a6a4a", "#2a2018", "#8a3a20"];
  const g = new THREE.Group();
  let x = -width / 2;
  while (x < width / 2 - 0.03) {
    const t = 0.025 + r() * 0.035, h = maxHeight * (0.65 + r() * 0.35), d = 0.16 + r() * 0.06;
    const book = mesh(new THREE.BoxGeometry(t, h, d), std(colors[Math.floor(r() * colors.length)], { roughness: 0.8 }), x + t / 2, h / 2, 0);
    if (r() < 0.08) book.rotation.z = 0.25; // a leaning book
    else pullOut(book, 0.1); // click a book: it slides out of the row
    g.add(book);
    x += t + 0.002;
  }
  return g;
}

/** a messy pile of papers */
export function createPapers(n = 8, { seed = 2, spread = 0.12 } = {}) {
  const r = rnd(seed * 17 + 3);
  const g = new THREE.Group();
  const mat = std("#e8dcc0", { roughness: 0.95 });
  for (let i = 0; i < n; i++) {
    const p = mesh(new THREE.BoxGeometry(0.21, 0.002, 0.29), mat, (r() - 0.5) * spread, i * 0.003, (r() - 0.5) * spread);
    p.rotation.y = (r() - 0.5) * 0.8;
    g.add(p);
  }
  return flutter(g); // click: the papers lift and settle
}

/** Einstein's pipe */
export function createPipe() {
  const g = new THREE.Group();
  const wood = std("#4a2a18", { roughness: 0.4 });
  const bowl = mesh(new THREE.CylinderGeometry(0.022, 0.018, 0.045, 12), wood, 0, 0.022, 0);
  const stem = mesh(new THREE.CylinderGeometry(0.005, 0.006, 0.13, 8), std("#111", { roughness: 0.3 }), 0.065, 0.012, 0);
  stem.rotation.z = Math.PI / 2 - 0.15;
  g.add(bowl, stem);
  return g;
}

/** a violin lying in its open case. Click it: a few notes */
export function createViolin() {
  const g = new THREE.Group();
  const caseMat = std("#2a1a12", { roughness: 0.8 });
  const velvet = std("#5a1220", { roughness: 1 });
  g.add(mesh(new THREE.BoxGeometry(0.8, 0.08, 0.26), caseMat, 0, 0.04, 0));
  g.add(mesh(new THREE.BoxGeometry(0.76, 0.01, 0.22), velvet, 0, 0.082, 0));
  // the body: a figure-8 outline extruded
  const s = new THREE.Shape();
  s.moveTo(0, -0.1);
  s.bezierCurveTo(0.11, -0.1, 0.11, -0.02, 0.07, 0);
  s.bezierCurveTo(0.1, 0.02, 0.1, 0.09, 0, 0.09);
  s.bezierCurveTo(-0.1, 0.09, -0.1, 0.02, -0.07, 0);
  s.bezierCurveTo(-0.11, -0.02, -0.11, -0.1, 0, -0.1);
  const bodyGeo = new THREE.ExtrudeGeometry(s, { depth: 0.035, bevelEnabled: true, bevelSize: 0.006, bevelThickness: 0.006, bevelSegments: 2, curveSegments: 16 });
  const varnish = std("#8a3a14", { roughness: 0.25, metalness: 0.05 });
  const body = mesh(bodyGeo, varnish);
  body.rotation.set(-Math.PI / 2, 0, -Math.PI / 2);
  body.position.set(-0.12, 0.09, 0);
  const neck = mesh(new THREE.BoxGeometry(0.26, 0.018, 0.03), std("#1a1210", { roughness: 0.3 }), 0.17, 0.115, 0);
  const scroll = mesh(new THREE.TorusGeometry(0.014, 0.006, 6, 10), varnish, 0.31, 0.12, 0);
  g.add(body, neck, scroll);
  const bow = mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.7, 5), std("#3a2418"), 0, 0.095, 0.09);
  bow.rotation.z = Math.PI / 2;
  g.add(bow);
  g.userData.interact = () => {
    violin();
    // the bow lifts a little while it "plays"
    bow.userData.playUntil = performance.now() + 4500;
  };
  g.userData.update = () => {
    const playing = (bow.userData.playUntil ?? 0) > performance.now();
    bow.position.y += ((playing ? 0.12 : 0.095) - bow.position.y) * 0.1;
    bow.position.x = playing ? Math.sin(performance.now() / 300) * 0.12 : bow.position.x * 0.9;
  };
  return g;
}

/** a grandfather clock with a swinging pendulum (and a tick at each swing) */
export function createClock() {
  const g = new THREE.Group();
  const wood = std("#3a2214", { roughness: 0.5 });
  g.add(mesh(new THREE.BoxGeometry(0.5, 2.0, 0.3), wood, 0, 1.0, 0));
  const face = mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.02, 24), std("#e8dcc0", { roughness: 0.6 }), 0, 1.68, 0.16);
  face.rotation.x = Math.PI / 2;
  g.add(face);
  const hands = new THREE.Group();
  hands.position.set(0, 1.68, 0.175);
  const hm = std("#111");
  const hour = mesh(new THREE.BoxGeometry(0.012, 0.09, 0.004), hm, 0, 0.045, 0);
  const minute = mesh(new THREE.BoxGeometry(0.008, 0.13, 0.004), hm, 0, 0.065, 0);
  const hourPivot = new THREE.Group(), minPivot = new THREE.Group();
  hourPivot.add(hour);
  minPivot.add(minute);
  hourPivot.rotation.z = -(1.25 / 12) * Math.PI * 2; // 1:15 in the morning
  minPivot.rotation.z = -(15 / 60) * Math.PI * 2;
  hands.add(hourPivot, minPivot);
  g.add(hands);
  // the glass door and the pendulum behind it
  g.add(mesh(new THREE.BoxGeometry(0.34, 0.9, 0.01), new THREE.MeshStandardMaterial({ color: "#a0b0c0", transparent: true, opacity: 0.18, roughness: 0.05 }), 0, 0.85, 0.156));
  const pivot = new THREE.Group();
  pivot.position.set(0, 1.35, 0.1);
  const rod = mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.6, 5), std("#b08a3a", { metalness: 1, roughness: 0.3 }), 0, -0.3, 0);
  const bob = mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.015, 20), std("#c89a40", { metalness: 1, roughness: 0.25 }), 0, -0.62, 0);
  bob.rotation.x = Math.PI / 2;
  pivot.add(rod, bob);
  g.add(pivot);
  let lastSide = 1;
  g.userData.update = (time) => {
    const a = Math.sin(time * Math.PI) * 0.12; // one swing per second
    pivot.rotation.z = a;
    const side = Math.sign(Math.cos(time * Math.PI));
    if (side !== lastSide) tick(0.02);
    lastSide = side;
  };
  return chimes(g); // click: it chimes
}

/** a 1950s valve radio. Click: static, then the news of the night. Click again: off */
export function createRadio(text) {
  const g = new THREE.Group();
  g.add(mesh(new THREE.BoxGeometry(0.42, 0.26, 0.2), std("#5a3420", { roughness: 0.35 }), 0, 0.13, 0));
  const cloth = mesh(new THREE.BoxGeometry(0.2, 0.16, 0.01), std("#c8b080", { roughness: 1 }), -0.08, 0.14, 0.101);
  const dialMat = new THREE.MeshStandardMaterial({ color: "#e8d8a0", emissive: "#ffb040", emissiveIntensity: 0, roughness: 0.4 });
  const dial = mesh(new THREE.CircleGeometry(0.045, 20), dialMat, 0.11, 0.16, 0.102);
  const knob = mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.02, 12), std("#1a1210"), 0.11, 0.06, 0.11);
  knob.rotation.x = Math.PI / 2;
  g.add(cloth, dial, knob);
  const glow = new THREE.PointLight("#ffb040", 0, 1.5, 2);
  glow.position.set(0.11, 0.16, 0.2);
  g.add(glow);
  let stop = null;
  let on = 0;
  g.userData.interact = () => {
    if (stop) {
      stop();
      stop = null;
    } else stop = radio(text);
  };
  g.userData.update = (time, delta = 0.016) => {
    on += ((stop ? 1 : 0) - on) * Math.min(1, delta * 3);
    dialMat.emissiveIntensity = on * 1.4;
    glow.intensity = on * 0.6;
    knob.rotation.y = on * 2;
  };
  return g;
}

/** a globe on a stand. Click: it spins */
export function createGlobe() {
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(0.02, 0.09, 0.08, 12), std("#3a2414", { roughness: 0.4 }), 0, 0.04, 0));
  g.add(mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.18, 8), std("#b08a3a", { metalness: 1, roughness: 0.3 }), 0, 0.15, 0));
  const map = canvasTexture(256, 128, (c, w, h) => {
    c.fillStyle = "#2a5a6a";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#c8a870";
    const r = rnd(5);
    for (let i = 0; i < 26; i++) {
      c.beginPath();
      c.ellipse(r() * w, 20 + r() * (h - 40), 6 + r() * 26, 4 + r() * 16, r() * 3, 0, 7);
      c.fill();
    }
  });
  const ball = mesh(new THREE.SphereGeometry(0.13, 28, 18), new THREE.MeshStandardMaterial({ map, roughness: 0.4 }), 0, 0.36, 0);
  ball.rotation.z = 0.41; // the Earth's tilt
  g.add(ball);
  let spin = 0;
  g.userData.interact = () => (spin += 9);
  g.userData.update = (time, delta = 0.016) => {
    ball.rotateY(spin * delta + 0.05 * delta);
    spin *= Math.exp(-0.9 * delta);
  };
  return g;
}

/** a chest of drawers. Click a drawer: it slides open (click again: closes) */
export function createDrawers({ rows = 3 } = {}) {
  const g = new THREE.Group();
  const wood = std("#4a2c1a", { roughness: 0.5 });
  const W = 0.8, D = 0.45, H = 0.85;
  g.add(mesh(new THREE.BoxGeometry(W, 0.03, D), wood, 0, H, 0));
  for (const x of [-W / 2 + 0.015, W / 2 - 0.015]) g.add(mesh(new THREE.BoxGeometry(0.03, H, D), wood, x, H / 2, 0));
  g.add(mesh(new THREE.BoxGeometry(W, H, 0.02), wood, 0, H / 2, -D / 2 + 0.01));
  const brass = std("#c89a40", { metalness: 1, roughness: 0.3 });
  const h = (H - 0.08) / rows;
  for (let i = 0; i < rows; i++) {
    const drawer = new THREE.Group();
    drawer.position.set(0, 0.05 + h * i + h / 2, 0);
    drawer.add(mesh(new THREE.BoxGeometry(W - 0.07, h - 0.02, 0.02), wood, 0, 0, D / 2 - 0.01));
    drawer.add(mesh(new THREE.BoxGeometry(W - 0.09, 0.015, D - 0.05), wood, 0, -h / 2 + 0.02, 0));
    drawer.add(mesh(new THREE.BoxGeometry(0.12, 0.02, 0.025), brass, 0, 0, D / 2 + 0.01));
    // something inside each drawer
    const inside = i === 1 ? createPapers(4, { seed: 9 + i, spread: 0.05 }) : createPipe();
    inside.position.set(0.05, -h / 2 + 0.03, 0);
    drawer.add(inside);
    let open = 0, target = 0;
    drawer.userData.interact = () => (target = target ? 0 : 1);
    drawer.userData.update = (time, delta = 0.016) => {
      open += (target - open) * Math.min(1, delta * 6);
      drawer.position.z = open * 0.3;
    };
    g.add(drawer);
  }
  return g;
}

/**
 * Einstein's blackboard: equations in chalk, and you can write on it (hold the click and move).
 * The board is a canvas texture: we draw on the canvas, then tell three.js to re-upload it.
 */
export function createChalkboard() {
  const g = new THREE.Group();
  const W = 2.0, H = 1.2;
  const frame = std("#5a3a22", { roughness: 0.6 });
  g.add(mesh(new THREE.BoxGeometry(W + 0.12, H + 0.12, 0.05), frame, 0, 0, -0.02));
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 614;
  const c = canvas.getContext("2d");
  c.fillStyle = "#1e2a24";
  c.fillRect(0, 0, 1024, 614);
  // old smudges of erased chalk
  for (let i = 0; i < 40; i++) {
    c.fillStyle = `rgba(220,230,220,${0.02 + Math.random() * 0.03})`;
    c.beginPath();
    c.ellipse(Math.random() * 1024, Math.random() * 614, 40 + Math.random() * 120, 10 + Math.random() * 30, Math.random(), 0, 7);
    c.fill();
  }
  c.fillStyle = "rgba(236,240,230,0.9)";
  c.font = "italic 64px Georgia";
  c.fillText("E = mc²", 70, 130);
  c.font = "italic 46px Georgia";
  c.fillText("Gμν + Λgμν = (8πG / c⁴) Tμν", 70, 250);
  c.fillText("Δt' = Δt / √(1 − v²/c²)", 70, 350);
  c.font = "italic 38px Georgia";
  c.fillText("unified field: ?", 600, 470);
  c.fillText("?", 900, 540);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const board = mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshStandardMaterial({ map: texture, roughness: 0.9 }), 0, 0, 0.006);
  g.add(board);
  g.add(mesh(new THREE.BoxGeometry(W, 0.03, 0.08), frame, 0, -H / 2 - 0.05, 0.04)); // chalk tray
  let last = null;
  board.userData.draw = (uv, down) => {
    if (!down) {
      last = null;
      return;
    }
    const p = { x: uv.x * 1024, y: (1 - uv.y) * 614 };
    c.strokeStyle = "rgba(240,244,236,0.85)";
    c.lineWidth = 5;
    c.lineCap = "round";
    c.beginPath();
    c.moveTo((last ?? p).x, (last ?? p).y);
    c.lineTo(p.x, p.y);
    c.stroke();
    last = p;
    texture.needsUpdate = true;
  };
  return g;
}

/** a rug with a simple patterned border */
export function createRug(w = 2.4, d = 1.6, { base = "#6a2a1a", border = "#c8a060" } = {}) {
  const map = canvasTexture(512, 340, (c, cw, ch) => {
    c.fillStyle = base;
    c.fillRect(0, 0, cw, ch);
    c.strokeStyle = border;
    c.lineWidth = 14;
    c.strokeRect(24, 24, cw - 48, ch - 48);
    c.lineWidth = 4;
    c.strokeRect(50, 50, cw - 100, ch - 100);
    c.fillStyle = border;
    for (let i = 0; i < 5; i++) {
      c.beginPath();
      c.ellipse(cw / 2, ch / 2, 40 + i * 22, 22 + i * 14, 0, 0, 7);
      c.globalAlpha = 0.25;
      c.fill();
    }
    c.globalAlpha = 1;
  });
  // a real rug has a thickness: a thin box (1.5 cm) sitting ON the floor, so it never flickers into
  // it (z-fighting), with soft rounded-looking edges from its own darker border colour
  const edge = new THREE.MeshStandardMaterial({ color: border, roughness: 1 });
  const top = new THREE.MeshStandardMaterial({ map, roughness: 1 });
  const geo = new THREE.BoxGeometry(w, 0.015, d).translate(0, 0.0075, 0); // its bottom on the floor, wherever it is placed
  const rug = mesh(geo, [edge, edge, top, edge, edge, edge]);
  rug.castShadow = false;
  // a fringe on the two short sides
  const fringeMat = new THREE.MeshStandardMaterial({ color: "#e8dcc0", roughness: 1 });
  for (const side of [-1, 1]) {
    const fringe = mesh(new THREE.BoxGeometry(0.06, 0.004, d * 0.96), fringeMat, side * (w / 2 + 0.03), 0.004, 0);
    fringe.castShadow = false;
    rug.add(fringe);
  }
  return rug;
}

/** a framed picture on a wall (texture = any image texture) */
export function createFrame(w, h, texture) {
  const g = new THREE.Group();
  g.add(mesh(new THREE.BoxGeometry(w + 0.08, h + 0.08, 0.04), std("#2a1a10", { roughness: 0.4 })));
  const pic = mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: texture, roughness: 0.7 }), 0, 0, 0.021);
  g.add(pic);
  return tilt(g); // click: it hangs crooked (click again: straight)
}

/** a standing lamp with a fabric shade and a warm light (can be switched on / off by clicking) */
export function createStandingLamp({ on = true, intensity = 3 } = {}) {
  const g = new THREE.Group();
  const brass = std("#a07a3a", { metalness: 0.9, roughness: 0.35 });
  g.add(mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.03, 20), brass, 0, 0.015, 0));
  g.add(mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.45, 8), brass, 0, 0.74, 0));
  const shadeMat = new THREE.MeshStandardMaterial({ color: "#e8cfa0", emissive: "#ffb060", emissiveIntensity: on ? 0.8 : 0, roughness: 0.9, side: THREE.DoubleSide });
  g.add(mesh(new THREE.CylinderGeometry(0.14, 0.24, 0.3, 20, 1, true), shadeMat, 0, 1.5, 0));
  const light = new THREE.PointLight("#ffc07a", on ? intensity : 0, 7, 1.8);
  light.position.y = 1.45;
  light.castShadow = true;
  light.shadow.mapSize.set(512, 512);
  light.shadow.bias = -0.003;
  g.add(light);
  let level = on ? 1 : 0, target = level;
  g.userData.interact = () => (target = target ? 0 : 1);
  g.userData.update = (time, delta = 0.016) => {
    level += (target - level) * Math.min(1, delta * 8);
    light.intensity = intensity * level;
    shadeMat.emissiveIntensity = 0.8 * level;
  };
  g.userData.light = light;
  return g;
}

/** a music stand with a sheet of music */
export function createMusicStand() {
  const g = new THREE.Group();
  const metal = std("#222", { metalness: 0.8, roughness: 0.4 });
  g.add(mesh(new THREE.CylinderGeometry(0.01, 0.01, 1.1, 6), metal, 0, 0.55, 0));
  for (let i = 0; i < 3; i++) {
    const leg = mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.35, 5), metal, Math.cos(i * 2.1) * 0.12, 0.12, Math.sin(i * 2.1) * 0.12);
    leg.rotation.set(Math.sin(i * 2.1) * 0.7, 0, -Math.cos(i * 2.1) * 0.7);
    g.add(leg);
  }
  const sheetMap = canvasTexture(256, 340, (c, w, h) => {
    c.fillStyle = "#efe4c8";
    c.fillRect(0, 0, w, h);
    c.strokeStyle = "#3a2a1c";
    for (let staff = 0; staff < 7; staff++) {
      for (let l = 0; l < 5; l++) {
        c.beginPath();
        c.moveTo(14, 30 + staff * 44 + l * 5);
        c.lineTo(w - 14, 30 + staff * 44 + l * 5);
        c.stroke();
      }
      for (let n = 0; n < 9; n++) {
        c.beginPath();
        c.ellipse(30 + n * 24, 30 + staff * 44 + ((n * 7) % 5) * 5, 3.5, 2.5, -0.4, 0, 7);
        c.fillStyle = "#2a1a10";
        c.fill();
      }
    }
    c.font = "italic 14px Georgia";
    c.fillText("Mozart — Sonata in E minor", 40, 18);
  });
  const desk = mesh(new THREE.BoxGeometry(0.5, 0.36, 0.01), metal, 0, 1.15, 0);
  desk.rotation.x = -0.35;
  const sheet = mesh(new THREE.PlaneGeometry(0.42, 0.3), new THREE.MeshStandardMaterial({ map: sheetMap, roughness: 0.9 }), 0, 1.16, 0.012);
  sheet.rotation.x = -0.35;
  g.add(desk, sheet);
  return g;
}
