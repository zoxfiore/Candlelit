// Chapter 2 — Princeton Hospital, the morning of April 18, 1955: the autopsy room and its corridor.
//
// INTERACTION 1, gate "lamp": the hanging lamp is a real pendulum (a tiny physics simulation).
//   Hold the mouse and drag left / right to push it: its light sweeps the shadows across the room.
// INTERACTION 2, first person: Harvey locked the autopsy report in the specimen cabinet.
//   The key is on the desk of Harvey's office, at the end of the corridor (it shimmers).
//   Take it, come back, open the cabinet, read the report.

import * as THREE from "three";
import { createSet } from "../../../src/world/set.js";
import { placeModel } from "../../../src/world/models.js";
import { placeCharacter } from "../../../src/characters/cast.js";
import { createAmbient, createHangingLamp } from "../../../src/lights/lamps.js";
import { createLayout } from "../../../src/world/layout.js";
import { furnishRoom } from "../../../src/world/furnish.js";
import { canvasTexture } from "../../../src/world/procedural.js";
import { createWallClock, createSink, createLightBox, createFilingCabinet, createJar, createGlassCabinet, createBench } from "../../../src/world/props2.js";
import { createPapers } from "../../../src/world/props.js";
import { flashNote, setTask } from "../../../src/ui/task.js";

const GRAVITY_OVER_LENGTH = 9.81 / 0.9; // g / L : the lamp hangs 0.9 m under the ceiling
const FRICTION = 0.35;

/** a small paper label, pinned under the lock */
function label(text) {
  const map = canvasTexture(256, 96, (c, w, h) => {
    c.fillStyle = "#efe6d0";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#2a1e14";
    c.font = '30px "Special Elite", "Courier New", monospace';
    c.textAlign = "center";
    c.fillText(text, w / 2, 58);
  });
  return new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.075), new THREE.MeshStandardMaterial({ map, roughness: 0.9 }));
}

export function buildAutopsy() {
  const set = createSet({ background: "#040505" });
  const scene = set.scene;
  const H = 3;

  // ---- the hospital floor: autopsy room, a long corridor, the morgue and an office ----
  //   autopsy room (x -3..3) | corridor (x 3..5, full length) | morgue (x 5..9.5, back)
  //                                                           | office (x 5..9.5, front)
  const tiled = { wall: "tiles", floor: "tiles", wallColor: "#a6b0a2", floorColor: "#8a928a", trim: "#5a625a" };
  createLayout(set, {
    height: H,
    rooms: [
      { x0: -3, x1: 3, z0: -2.5, z1: 4.6, ...tiled, lamp: false },
      { x0: 3, x1: 5, z0: -2.5, z1: 4.6, wallColor: "#9aa294", floor: "tiles", floorColor: "#6e746c", lamp: false },
      { x0: 5, x1: 9.5, z0: -2.5, z1: 1.2, ...tiled, theme: "morgue", furnish: furnishRoom, lampColor: "#dff0ff", lampIntensity: 2 },
      { x0: 5, x1: 9.5, z0: 1.2, z1: 4.6, wallColor: "#8a8a78", floorColor: "#6a5a48", theme: "office", furnish: furnishRoom, lampIntensity: 1.8 },
    ],
    doors: [{ x: 3, z: 1.1, door: false }, { x: 5, z: -0.6 }, { x: 5, z: 3.0 }],
    windows: [{ x: 9.5, z: 3.0 }],
  });
  const walls = [];
  placeModel(set, "door", 4.0, -2.42); // the door at the end of the corridor
  const sign = label("PATHOLOGY");
  sign.scale.setScalar(1.6);
  sign.position.set(4.0, 2.45, -2.42);
  set.add(sign);

  // ---- the autopsy room ----
  placeModel(set, "autopsy-table", -0.4, -0.7, { info: "autopsy" });
  placeModel(set, "metal-cart", -2.0, -1.2, { info: "autopsy" });
  placeModel(set, "instrument-tray", -2.0, -1.2, { y: 0.86 });
  const sink = createSink();
  sink.position.set(-2.72, 0, 1.0);
  sink.rotation.y = Math.PI / 2;
  set.add(sink);
  const clock = createWallClock(1, 15); // stopped at the time of death
  clock.position.set(-2.92, 2.25, -0.6);
  clock.rotation.y = Math.PI / 2;
  set.add(clock);
  const xray = createLightBox();
  xray.position.set(-2.93, 1.6, 2.4);
  xray.rotation.y = Math.PI / 2;
  set.add(xray);
  const files = createFilingCabinet();
  files.position.set(0.6, 0, -2.15);
  set.add(files);
  const papers = createPapers(6, { seed: 21, spread: 0.18 });
  papers.position.set(0.6, 1.355, -2.15);
  set.add(papers);
  placeModel(set, "wall-shelf", -1.4, -2.4, { y: 1.75 });
  for (const x of [-1.75, -1.4, -1.05]) {
    const jar = createJar({ glow: 0.05 });
    jar.scale.setScalar(0.75);
    jar.position.set(x, 1.8, -2.3);
    set.add(jar);
  }

  // ---- the specimen cabinet and its combination lock (the puzzle) ----
  const cabinet = createGlassCabinet();
  cabinet.position.set(2.2, 0, -2.25);
  set.add(cabinet);
  const theJar = createJar({ glow: 0.25 });
  theJar.position.set(2.2, 1.465, -2.25);
  set.add(theJar);
  // the key hangs on a hook by the light box: take it, then open the cabinet
  let hasKey = false;
  let solved = false;
  const key = new THREE.Group();
  const brass = new THREE.MeshStandardMaterial({ color: "#d0a040", metalness: 1, roughness: 0.25, emissive: "#ffb040", emissiveIntensity: 0.25 });
  key.add(new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.008, 6, 14), brass));
  key.add(new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.09, 0.006), brass).translateY(-0.07));
  key.add(new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.012, 0.006), brass).translateY(-0.1).translateX(0.012));
  key.add(new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.24, 0.1), new THREE.MeshBasicMaterial({ visible: false }))); // easy to click
  key.position.set(7.5, 0.8, 2.15); // on the desk of the office, at the end of the corridor
  key.rotation.x = -Math.PI / 2;
  set.add(key);
  key.userData.interact = () => {
    hasKey = true;
    key.visible = false;
    flashNote("A small brass key.");
    setTask("Open the specimen cabinet");
  };
  key.userData.update = (time) => (brass.emissiveIntensity = hasKey ? 0 : 0.2 + 0.2 * Math.sin(time * 3)); // it shimmers: look here
  cabinet.userData.pane.userData.interact = () => {
    if (solved) return;
    if (!hasKey) {
      flashNote("Locked. Harvey must have left the key in his office.");
      setTask("Find the key — try the office down the corridor");
      return;
    }
    solved = true;
    cabinet.userData.open();
    flashNote("Click. The cabinet opens.");
    setTask("Take the autopsy report");
  };

  // ---- the corridor ----
  const gurney = new THREE.Group();
  const steel = new THREE.MeshStandardMaterial({ color: "#9aa0a4", metalness: 0.8, roughness: 0.35 });
  gurney.add(new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.08, 1.9), new THREE.MeshStandardMaterial({ color: "#e8ece8", roughness: 0.8 })).translateY(0.82));
  for (const [x, z] of [[-0.3, -0.85], [0.3, -0.85], [-0.3, 0.85], [0.3, 0.85]]) gurney.add(new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.8, 6), steel).translateX(x).translateY(0.4).translateZ(z));
  gurney.traverse((o) => o.isMesh && (o.castShadow = o.receiveShadow = true));
  gurney.position.set(4.0, 0, 3.2);
  set.add(gurney);
  // a buzzing ceiling tube light in the corridor
  const tube = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.05, 1.3), new THREE.MeshStandardMaterial({ color: "#f0f4f0", emissive: "#dff0ff", emissiveIntensity: 1.2 }));
  tube.position.set(4.0, H - 0.05, 1);
  set.add(tube);
  const tubeLight = new THREE.PointLight("#d8ecff", 3, 7, 1.6);
  tubeLight.position.set(4.0, H - 0.3, 1);
  set.add(tubeLight);

  // ---- Harvey ----
  const harvey = placeCharacter(set, "harvey-1955-jar", 1.3, -1.0);

  // ---- light ----
  set.add(createAmbient(0.28, "#9ab0b0", "#141818"));
  const lamp = set.add(createHangingLamp({ intensity: 15, angle: 0.8 }));
  lamp.position.set(-0.3, H, -0.7);
  lamp.userData.manual = true; // we move it ourselves (physics below)

  // ---- first person: where you can walk ----
  scene.userData.noWalk.push({ minX: -1.6, maxX: 0.8, minZ: -1.3, maxZ: -0.1 }, { minX: 3.6, maxX: 4.4, minZ: 2.2, maxZ: 4.2 });

  let angle = 0.25; // radians, 0 = straight down
  let speed = 0;
  let pushed = 0; // how much the viewer has swung it (for the gate)
  let lastX = 0;
  let knocked = false;

  set.onUpdate((time, delta, t, ctx) => {
    const x = ctx.input.pointer.x;
    const dragging = ctx.input.down && ctx.gate === "lamp";
    if (dragging) {
      // dragging: the lamp follows the mouse, and we remember its speed for when we let go
      const target = THREE.MathUtils.clamp(x * 0.7, -0.5, 0.5);
      const next = angle + (target - angle) * Math.min(1, delta * 10);
      speed = (next - angle) / Math.max(delta, 1e-3);
      pushed += Math.abs(x - lastX);
      angle = next;
    } else {
      // pendulum: acceleration = -(g / L) * sin(angle), minus a little friction
      speed += (-GRAVITY_OVER_LENGTH * Math.sin(angle) - FRICTION * speed) * delta;
      angle += speed * delta;
    }
    lastX = x;
    // when the story reaches this moment, the lamp is knocked and swings on its own
    if (ctx.done("lamp") && !knocked) {
      knocked = true;
      speed += 1.6;
    }
    lamp.rotation.z = angle;
    lamp.rotation.x = Math.sin(time * 0.7) * 0.03;
    if (ctx.gate === "lamp") {
      ctx.progress(Math.min(1, pushed / 2.5));
      if (pushed >= 2.5) ctx.resolve("lamp");
    }
    // the corridor tube buzzes and blinks now and then
    const blink = Math.sin(time * 1.7) > 0.985 ? 0.2 : 1;
    tubeLight.intensity = 3 * blink;
    tube.material.emissiveIntensity = 1.2 * blink;
    // story beat: Harvey reacts at "...and he keeps it" (the end of the chapter)
    harvey.userData.act = { jolt: THREE.MathUtils.smoothstep(t, 0.82, 0.86) * (1 - THREE.MathUtils.smoothstep(t, 0.86, 0.92)) };
  });
  return set;
}
