// More objects made in code, for the hospital, the lab, the office and the museum,
// and the pieces of the first-person PUZZLES:
//   createCombinationLock  three dials you turn by clicking; opens a door when the code is right
//   createSlide            a glass microscope slide you can pick up
//   createMicroscope       a 3D microscope you can look into
//   createJar              a glass jar with a brain inside (transparent glass, liquid, a soft glow)

import * as THREE from "three";
import { canvasTexture } from "./procedural.js";
import { tick } from "../audio/synth.js";
import { pullOut, bob, toggleGlow, chimes } from "./interactive.js";

const std = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.6, ...extra });
function mesh(geo, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}
const steel = () => std("#8a9096", { metalness: 0.85, roughness: 0.35 });

/** a simple wall clock stopped at a given time (hours, minutes) */
export function createWallClock(hours = 1, minutes = 15) {
  const g = new THREE.Group();
  const rim = mesh(new THREE.TorusGeometry(0.17, 0.02, 8, 32), std("#2a2a2a", { metalness: 0.6 }));
  const face = mesh(new THREE.CircleGeometry(0.17, 32), std("#f0ede4", { roughness: 0.5 }), 0, 0, 0.005);
  g.add(rim, face);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    g.add(mesh(new THREE.BoxGeometry(0.008, i % 3 ? 0.02 : 0.035, 0.002), std("#222"), Math.sin(a) * 0.145, Math.cos(a) * 0.145, 0.008).rotateZ(-a));
  }
  const hand = (len, w, angle) => {
    const p = new THREE.Group();
    p.add(mesh(new THREE.BoxGeometry(w, len, 0.003), std("#111"), 0, len / 2, 0));
    p.rotation.z = -angle;
    p.position.z = 0.012;
    g.add(p);
  };
  hand(0.09, 0.012, ((hours % 12) + minutes / 60) / 12 * Math.PI * 2);
  hand(0.13, 0.008, (minutes / 60) * Math.PI * 2);
  return chimes(g);
}

/** a hospital sink with a tap */
export function createSink() {
  const g = new THREE.Group();
  const white = std("#e8ece8", { roughness: 0.3 });
  g.add(mesh(new THREE.BoxGeometry(0.6, 0.12, 0.45), white, 0, 0.85, 0));
  g.add(mesh(new THREE.BoxGeometry(0.5, 0.02, 0.35), std("#9aa4a4", { metalness: 0.6, roughness: 0.3 }), 0, 0.9, 0));
  g.add(mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.78, 10), white, 0, 0.39, -0.05));
  const tap = mesh(new THREE.TorusGeometry(0.06, 0.012, 6, 12, Math.PI), steel(), 0, 0.98, -0.18);
  g.add(tap);
  // click: the water runs (a thin shimmering stream), click again: it stops
  const water = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.012, 0.1, 8), new THREE.MeshStandardMaterial({ color: "#c8e0f0", transparent: true, opacity: 0, roughness: 0.05, emissive: "#a0c0e0", emissiveIntensity: 0.3 }));
  water.position.set(0, 0.93, -0.12);
  g.add(water);
  let on = 0, target = 0;
  g.userData.interact = () => ((target = target ? 0 : 1), tick(0.04));
  g.userData.update = (t, d = 0.016) => {
    on += (target - on) * Math.min(1, d * 6);
    water.material.opacity = on * (0.55 + 0.1 * Math.sin(t * 40));
    water.visible = on > 0.02;
  };
  return g;
}

/** an X-ray light box on the wall (it glows) with a skull film */
export function createLightBox() {
  const film = canvasTexture(256, 320, (c, w, h) => {
    c.fillStyle = "#0e1418";
    c.fillRect(0, 0, w, h);
    c.strokeStyle = "rgba(220,235,240,0.85)";
    c.lineWidth = 5;
    c.beginPath();
    c.ellipse(w / 2, h * 0.42, 85, 105, 0, 0, Math.PI * 2);
    c.stroke();
    c.lineWidth = 3;
    c.beginPath();
    c.ellipse(w / 2 - 35, h * 0.47, 20, 16, 0, 0, Math.PI * 2);
    c.ellipse(w / 2 + 35, h * 0.47, 20, 16, 0, 0, Math.PI * 2);
    c.stroke();
    c.fillStyle = "rgba(220,235,240,0.25)";
    c.fillRect(w / 2 - 50, h * 0.68, 100, 40);
  });
  const g = new THREE.Group();
  g.add(mesh(new THREE.BoxGeometry(0.62, 0.74, 0.06), std("#d8dcd8")));
  const glow = new THREE.MeshStandardMaterial({ map: film, emissive: "#cfe6ff", emissiveMap: film, emissiveIntensity: 0.9 });
  g.add(mesh(new THREE.PlaneGeometry(0.52, 0.64), glow, 0, 0, 0.032));
  return toggleGlow(g, glow); // click: the light box switches off / on
}

/** a tall metal filing cabinet */
export function createFilingCabinet(color = "#5a6458") {
  const g = new THREE.Group();
  const m = std(color, { metalness: 0.5, roughness: 0.45 });
  g.add(mesh(new THREE.BoxGeometry(0.5, 1.35, 0.6), m, 0, 0.675, 0));
  for (let i = 0; i < 4; i++) {
    const drawer = new THREE.Group();
    drawer.add(mesh(new THREE.BoxGeometry(0.44, 0.29, 0.01), m, 0, 0.2 + i * 0.32, 0.305));
    drawer.add(mesh(new THREE.BoxGeometry(0.12, 0.02, 0.03), steel(), 0, 0.3 + i * 0.32, 0.32));
    drawer.add(mesh(new THREE.BoxGeometry(0.42, 0.25, 0.5), m, 0, 0.2 + i * 0.32, 0.05)); // the drawer box behind the front
    g.add(pullOut(drawer, 0.35)); // click: the drawer slides out
  }
  return g;
}

/** a glass jar with a brain floating in liquid */
export function createJar({ glow = 0.15 } = {}) {
  const g = new THREE.Group();
  const glass = new THREE.MeshPhysicalMaterial({ color: "#d8f0e8", roughness: 0.05, transmission: 0.0, transparent: true, opacity: 0.28, metalness: 0 });
  g.add(mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.3, 24, 1, true), glass, 0, 0.15, 0));
  const liquid = new THREE.MeshStandardMaterial({ color: "#c8d890", transparent: true, opacity: 0.3, emissive: "#a8c060", emissiveIntensity: glow });
  g.add(mesh(new THREE.CylinderGeometry(0.115, 0.115, 0.26, 24), liquid, 0, 0.13, 0));
  const brainMat = std("#d8a0a0", { roughness: 0.8, emissive: "#a05050", emissiveIntensity: glow * 0.6 });
  const brain = mesh(new THREE.SphereGeometry(0.075, 18, 12), brainMat, 0, 0.13, 0);
  brain.scale.set(1.1, 0.8, 0.95);
  g.add(brain);
  g.add(mesh(new THREE.CylinderGeometry(0.125, 0.125, 0.03, 24), std("#3a3a3a", { metalness: 0.7 }), 0, 0.31, 0));
  return bob(g); // click: the jar is lifted a little and turned
}

/**
 * A combination lock: `digits` dials you turn by clicking (each click: +1, 0..9).
 * When they read `code`, onOpen() is called once.
 */
export function createCombinationLock(code = "115", onOpen) {
  const g = new THREE.Group();
  g.add(mesh(new THREE.BoxGeometry(0.11 * code.length + 0.04, 0.12, 0.04), std("#2a2420", { metalness: 0.6 })));
  const values = [...code].map(() => 0);
  let opened = false;
  const digitTextures = [...Array(10)].map((_, n) => canvasTexture(64, 64, (c) => {
    c.fillStyle = "#d8c8a0";
    c.fillRect(0, 0, 64, 64);
    c.fillStyle = "#1a1410";
    c.font = "bold 44px Georgia";
    c.textAlign = "center";
    c.fillText(String(n), 32, 48);
  }));
  [...code].forEach((_, i) => {
    const dial = mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.05, 16), std("#c89a40", { metalness: 0.9, roughness: 0.3 }));
    dial.rotation.x = Math.PI / 2;
    const x = (i - (code.length - 1) / 2) * 0.11;
    dial.position.set(x, 0, 0.03);
    const face = mesh(new THREE.PlaneGeometry(0.05, 0.05), new THREE.MeshStandardMaterial({ map: digitTextures[0], roughness: 0.5 }), x, 0, 0.057);
    g.add(dial, face);
    let spin = 0;
    const turn = () => {
      if (opened) return;
      values[i] = (values[i] + 1) % 10;
      face.material.map = digitTextures[values[i]];
      spin = 1;
      tick(0.05);
      if (values.join("") === code) {
        opened = true;
        onOpen?.();
      }
    };
    dial.userData.interact = turn;
    face.userData.interact = turn;
    dial.userData.update = (time, delta = 0.016) => {
      spin = Math.max(0, spin - delta * 5);
      dial.rotation.y = spin * 0.6;
    };
  });
  g.userData.isOpen = () => opened;
  return g;
}

/** a medical cabinet with a glass door that swings open (call cabinet.userData.open()) */
export function createGlassCabinet({ w = 0.9, h = 1.8, d = 0.4 } = {}) {
  const g = new THREE.Group();
  const white = std("#e4e8e4", { roughness: 0.4 });
  g.add(mesh(new THREE.BoxGeometry(w, h, 0.02), white, 0, h / 2, -d / 2));
  for (const x of [-w / 2, w / 2]) g.add(mesh(new THREE.BoxGeometry(0.02, h, d), white, x, h / 2, 0));
  g.add(mesh(new THREE.BoxGeometry(w, 0.02, d), white, 0, h, 0));
  g.add(mesh(new THREE.BoxGeometry(w, 0.02, d), white, 0, 0.02, 0));
  for (const y of [0.55, 1.0, 1.45]) g.add(mesh(new THREE.BoxGeometry(w - 0.04, 0.015, d - 0.04), new THREE.MeshStandardMaterial({ color: "#c8e0e0", transparent: true, opacity: 0.5, roughness: 0.1 }), 0, y, 0));
  // the door: a frame + a glass pane, on a hinge on the left
  const hinge = new THREE.Group();
  hinge.position.set(-w / 2, 0, d / 2);
  const frame = std("#e8ece8", { roughness: 0.35 });
  hinge.add(mesh(new THREE.BoxGeometry(w, 0.04, 0.03), frame, w / 2, 0.04, 0));
  hinge.add(mesh(new THREE.BoxGeometry(w, 0.04, 0.03), frame, w / 2, h - 0.04, 0));
  hinge.add(mesh(new THREE.BoxGeometry(0.04, h, 0.03), frame, 0.02, h / 2, 0));
  hinge.add(mesh(new THREE.BoxGeometry(0.04, h, 0.03), frame, w - 0.02, h / 2, 0));
  const pane = mesh(new THREE.BoxGeometry(w - 0.06, h - 0.06, 0.008), new THREE.MeshStandardMaterial({ color: "#d0e8f0", transparent: true, opacity: 0.22, roughness: 0.05 }), w / 2, h / 2, 0);
  pane.userData.blocksClicks = true;
  hinge.add(pane);
  g.add(hinge);
  let open = 0, target = 0;
  g.userData.open = () => (target = 1);
  g.userData.update = (time, delta = 0.016) => {
    open += (target - open) * Math.min(1, delta * 2.5);
    hinge.rotation.y = -open * 1.9;
    pane.visible = true;
  };
  g.userData.pane = pane;
  return g;
}

/** a glass microscope slide (pick it up: onPick()) */
export function createSlide(onPick) {
  const g = new THREE.Group();
  const glass = new THREE.MeshStandardMaterial({ color: "#e0f4f0", transparent: true, opacity: 0.6, roughness: 0.05, emissive: "#a0e0ff", emissiveIntensity: 0.25 });
  g.add(mesh(new THREE.BoxGeometry(0.075, 0.004, 0.026), glass));
  g.add(mesh(new THREE.BoxGeometry(0.018, 0.0045, 0.018), std("#c07090", { emissive: "#c07090", emissiveIntensity: 0.3 })));
  g.add(mesh(new THREE.BoxGeometry(0.02, 0.005, 0.024), std("#f0e8d8"), -0.026, 0, 0));
  // an invisible bigger zone so the tiny slide is easy to click
  g.add(new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.08, 0.14), new THREE.MeshBasicMaterial({ visible: false })));
  let picked = false;
  const seed = Math.random() * 10;
  g.userData.interact = () => {
    if (picked) return;
    picked = true;
    onPick?.();
  };
  g.userData.update = (time, delta = 0.016) => {
    if (picked) {
      g.scale.multiplyScalar(Math.max(0, 1 - delta * 6));
      g.position.y += delta * 0.6;
      if (g.scale.x < 0.02) g.visible = false;
    } else {
      glass.emissiveIntensity = 0.2 + 0.15 * Math.sin(time * 3 + seed); // a faint shimmer
    }
  };
  return g;
}

/** a 1950s microscope */
export function createMicroscope() {
  const g = new THREE.Group();
  const black = std("#1a1a1e", { roughness: 0.35, metalness: 0.3 });
  const chrome = std("#c8ccd0", { metalness: 1, roughness: 0.2 });
  g.add(mesh(new THREE.BoxGeometry(0.16, 0.03, 0.2), black, 0, 0.015, 0));
  const arm = mesh(new THREE.TorusGeometry(0.11, 0.022, 8, 16, Math.PI * 0.9), black, -0.04, 0.16, 0);
  arm.rotation.set(0, Math.PI / 2, -0.4);
  g.add(arm);
  g.add(mesh(new THREE.BoxGeometry(0.11, 0.012, 0.11), black, 0.02, 0.12, 0));
  const tube = mesh(new THREE.CylinderGeometry(0.022, 0.025, 0.2, 14), black, 0.03, 0.27, 0);
  tube.rotation.z = 0.35;
  g.add(tube);
  const eye = mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.06, 12), chrome, -0.01, 0.39, 0);
  eye.rotation.z = 0.35;
  g.add(eye);
  g.add(mesh(new THREE.CylinderGeometry(0.014, 0.012, 0.05, 10), chrome, 0.06, 0.155, 0));
  const knob = mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.02, 14), chrome, -0.06, 0.14, 0.07);
  knob.rotation.x = Math.PI / 2;
  g.add(knob);
  return g;
}

/** a typewriter */
export function createTypewriter() {
  const g = new THREE.Group();
  const body = std("#2a2a2a", { roughness: 0.35, metalness: 0.3 });
  g.add(mesh(new THREE.BoxGeometry(0.42, 0.09, 0.3), body, 0, 0.045, 0));
  const top = mesh(new THREE.BoxGeometry(0.42, 0.05, 0.14), body, 0, 0.11, -0.07);
  g.add(top);
  const roller = mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.48, 12), std("#111"), 0, 0.15, -0.1);
  roller.rotation.z = Math.PI / 2;
  g.add(roller);
  const paper = mesh(new THREE.PlaneGeometry(0.21, 0.2), std("#efe8d8", { roughness: 0.9, side: THREE.DoubleSide }), 0, 0.24, -0.11);
  paper.rotation.x = -0.15;
  g.add(paper);
  for (let r = 0; r < 3; r++) for (let k = 0; k < 9; k++) g.add(mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.01, 8), std("#d8d0c0"), -0.16 + k * 0.04 + r * 0.01, 0.095 + r * 0.008, 0.1 - r * 0.035));
  // click: a burst of key strokes, and the carriage moves along
  let typing = 0, carriage = 0;
  g.userData.interact = () => (typing = 1.2);
  g.userData.update = (time, delta = 0.016) => {
    if (typing > 0) {
      typing -= delta;
      if (Math.random() < 0.35) tick(0.04);
      carriage = (carriage + delta * 0.08) % 0.12;
    }
    roller.position.x = -carriage;
    paper.position.x = -carriage;
  };
  return g;
}

/** a museum display case: a wooden base and a glass box on top */
export function createShowcase({ w = 1.0, d = 0.6, h = 0.9, glassH = 0.5 } = {}) {
  const g = new THREE.Group();
  g.add(mesh(new THREE.BoxGeometry(w, h, d), std("#2a1a12", { roughness: 0.45 }), 0, h / 2, 0));
  g.add(mesh(new THREE.BoxGeometry(w - 0.04, 0.01, d - 0.04), std("#1a1a22", { roughness: 0.9 }), 0, h + 0.005, 0));
  const glass = new THREE.MeshStandardMaterial({ color: "#d8eef4", transparent: true, opacity: 0.14, roughness: 0.02, metalness: 0.1 });
  g.add(mesh(new THREE.BoxGeometry(w, glassH, d), glass, 0, h + glassH / 2, 0));
  g.userData.top = h + 0.012;
  return g;
}

/** a brass post + red velvet rope between posts (museum barrier) */
export function createRope(a, b) {
  const g = new THREE.Group();
  const brass = std("#b08a3a", { metalness: 0.9, roughness: 0.3 });
  for (const p of [a, b]) {
    g.add(mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.9, 10), brass, p[0], 0.45, p[1]));
    g.add(mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.03, 16), brass, p[0], 0.015, p[1]));
    g.add(mesh(new THREE.SphereGeometry(0.04, 10, 8), brass, p[0], 0.92, p[1]));
  }
  const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(a[0], 0.85, a[1]), new THREE.Vector3((a[0] + b[0]) / 2, 0.6, (a[1] + b[1]) / 2), new THREE.Vector3(b[0], 0.85, b[1]));
  g.add(mesh(new THREE.TubeGeometry(curve, 16, 0.018, 6), std("#7a1420", { roughness: 0.9 })));
  return g;
}

/** a museum bench */
export function createBench(w = 1.6) {
  const g = new THREE.Group();
  const wood = std("#4a2e1c", { roughness: 0.5 });
  g.add(mesh(new THREE.BoxGeometry(w, 0.06, 0.42), wood, 0, 0.45, 0));
  for (const x of [-w / 2 + 0.1, w / 2 - 0.1]) g.add(mesh(new THREE.BoxGeometry(0.06, 0.45, 0.38), std("#1a1a1a", { metalness: 0.6 }), x, 0.225, 0));
  return g;
}

/** a wall light switch (click to toggle; onToggle(on)) */
export function createSwitch(onToggle) {
  const g = new THREE.Group();
  g.add(mesh(new THREE.BoxGeometry(0.09, 0.13, 0.015), std("#d8d0c0", { roughness: 0.4 })));
  const lever = mesh(new THREE.BoxGeometry(0.02, 0.05, 0.025), std("#2a2420"), 0, 0.015, 0.015);
  g.add(lever);
  let on = false;
  g.userData.interact = () => {
    on = !on;
    lever.position.y = on ? -0.015 : 0.015;
    tick(0.08);
    onToggle?.(on);
  };
  return g;
}
