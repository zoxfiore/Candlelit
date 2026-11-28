// Chapter 3 ("240 Pieces") — a laboratory at the University of Pennsylvania, Philadelphia, 1955.
// The lab and, through a doorway, its storage room.
//
// INTERACTION 1, gate "cut": hold the mouse button and the brain splits into 240 blocks that fly
//   onto the bench (InstancedMesh: 240 matrices updated every frame, one draw call).
// INTERACTION 2, first person: take the two glass slides lying on the benches (they shimmer),
//   then look into the microscope and turn the focus until the cells are sharp.

import * as THREE from "three";
import { createSet } from "../../../src/world/set.js";
import { placeModel, placeWindow } from "../../../src/world/models.js";
import { createBrainBlocks } from "../../../src/world/brainBlocks.js";
import { placeCharacter } from "../../../src/characters/cast.js";
import { createCandle } from "../../../src/lights/candle.js";
import { createAmbient, createSpot, createMoonlight } from "../../../src/lights/lamps.js";
import { createLayout } from "../../../src/world/layout.js";
import { furnishRoom } from "../../../src/world/furnish.js";
import { canvasTexture } from "../../../src/world/procedural.js";
import { createDrawers, createBooks, createPapers, createFrame } from "../../../src/world/props.js";
import { createJar, createSlide, createMicroscope, createSink, createFilingCabinet } from "../../../src/world/props2.js";
import { openMicroscope } from "../../../src/ui/microscope.js";
import { flashNote, setTask } from "../../../src/ui/task.js";

/** glassware: a few beakers and flasks */
function glassware() {
  const g = new THREE.Group();
  const glass = new THREE.MeshStandardMaterial({ color: "#d8f0f0", transparent: true, opacity: 0.3, roughness: 0.05 });
  const liquid = (c) => new THREE.MeshStandardMaterial({ color: c, transparent: true, opacity: 0.55, emissive: c, emissiveIntensity: 0.15 });
  [["#a0d060", 0], ["#d06080", 0.18], ["#60a0d0", 0.36], ["#d0b060", 0.54]].forEach(([c, x], i) => {
    const h = 0.12 + (i % 2) * 0.08;
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.045, h, 14, 1, true), glass).translateX(x).translateY(h / 2));
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.043, h * 0.55, 14), liquid(c)).translateX(x).translateY(h * 0.28));
  });
  return g;
}

/** a periodic table poster */
function poster() {
  return canvasTexture(420, 260, (c, w, h) => {
    c.fillStyle = "#e8e0c8";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#2a2018";
    c.font = "bold 16px Georgia";
    c.fillText("PERIODIC TABLE OF THE ELEMENTS", 70, 24);
    const colors = ["#c8a070", "#a0b890", "#90a8c0", "#d0c090", "#c09090"];
    for (let r = 0; r < 7; r++) for (let k = 0; k < 18; k++) {
      if (r === 0 && k > 0 && k < 17) continue;
      if ((r === 1 || r === 2) && k > 1 && k < 12) continue;
      c.fillStyle = colors[(r + k) % colors.length];
      c.fillRect(12 + k * 22, 40 + r * 30, 20, 27);
    }
  });
}

export function buildLab() {
  const set = createSet({ background: "#060606" });
  const scene = set.scene;

  // ---- the floor plan: the lab, a storage room, a darkroom (red light), an office ----
  createLayout(set, {
    rooms: [
      { x0: -3.5, x1: 3.5, z0: -2.5, z1: 4.5, wallColor: "#a09684", floor: "tiles", floorColor: "#7a7a72", trim: "#4a463e", lamp: false },
      { x0: 3.5, x1: 6.5, z0: -2.5, z1: 1.0, wallColor: "#8a8070", floor: "tiles", floorColor: "#6a665e", lampIntensity: 1.4 },
      { x0: 3.5, x1: 6.5, z0: 1.0, z1: 4.5, wallColor: "#5a4a48", floorColor: "#3a3030", theme: "darkroom", furnish: furnishRoom, lamp: false },
      { x0: -6.5, x1: -3.5, z0: -2.5, z1: 1.5, wallColor: "#8a8270", floorColor: "#6a4a34", theme: "office", furnish: furnishRoom, lampIntensity: 1.4 },
    ],
    doors: [{ x: 3.5, z: -0.8 }, { x: 3.5, z: 2.8 }, { x: -3.5, z: -0.45, width: 1.0 }],
    windows: [{ x: -2.0, z: -2.5 }, { x: -6.5, z: -0.5 }],
  });

  // ---- the lab ----
  placeModel(set, "lab-bench", 0, -0.8);
  placeModel(set, "lab-bench", -2.85, 1.2, { rotationY: Math.PI / 2 });
  const glass1 = glassware();
  glass1.position.set(-2.85, 0.9, 0.85);
  glass1.rotation.y = Math.PI / 2;
  set.add(glass1);
  placeModel(set, "wall-shelf", 1.4, -2.4, { y: 1.6 });
  for (const x of [0.95, 1.4, 1.85]) {
    const jar = createJar({ glow: 0.08 });
    jar.scale.setScalar(0.85);
    jar.position.set(x, 1.65, -2.3);
    set.add(jar);
  }
  const sink = createSink();
  sink.position.set(2.9, 0, -1.9);
  sink.rotation.y = -Math.PI / 2;
  set.add(sink);
  const periodic = createFrame(0.84, 0.52, poster());
  periodic.position.set(3.42, 1.7, 0.2);
  periodic.rotation.y = -Math.PI / 2;
  set.add(periodic);
  const drawers = createDrawers({ rows: 3 });
  drawers.position.set(-3.15, 0, -1.4);
  drawers.rotation.y = Math.PI / 2;
  set.add(drawers);
  const papers = createPapers(7, { seed: 31, spread: 0.2 });
  papers.position.set(0.55, 0.905, -0.55);
  set.add(papers);

  // the brain on the bench, and the microscope next to it
  const blocks = set.add(createBrainBlocks(240));
  blocks.position.set(-0.3, 0.8, -0.8);
  blocks.userData.info = "blocks";
  const microscope = createMicroscope();
  microscope.scale.setScalar(1.6);
  microscope.position.set(1.0, 0.905, -0.75);
  microscope.rotation.y = -0.5;
  microscope.userData.info = "microscope";
  set.add(microscope);

  placeCharacter(set, "harvey-1955", 0.1, -1.7);

  // ---- the storage room ----
  placeModel(set, "bookshelf", 5.0, -2.25);
  placeModel(set, "moving-boxes", 6.0, 3.6, { rotationY: -0.4 });
  const cabinet = createFilingCabinet("#4a5450");
  cabinet.position.set(6.15, 0, 0.4);
  cabinet.rotation.y = -Math.PI / 2;
  set.add(cabinet);
  const boxes = createBooks(0.9, { seed: 40, maxHeight: 0.3 });
  boxes.position.set(5.0, 1.42, -2.25);
  set.add(boxes);

  // ---- the three slides (the puzzle) ----
  let found = 0;
  const pick = () => {
    found++;
    setTask(found < 2 ? `Find the two slides — ${found} / 2` : "Look into the microscope");
    flashNote(found < 2 ? "A glass slide. Numbered by hand." : "Both slides. Now, the microscope.");
  };
  const s1 = createSlide(pick); // on the side bench, next to the glassware
  s1.position.set(-4.8, 0.79, -1.5); // on the desk of the little office
  set.add(s1);
  const s2 = createSlide(pick); // on the main bench, by the papers
  s2.position.set(5.2, 0.905, 1.35); // in the darkroom, under the red light
  s2.rotation.y = 0.5;
  set.add(s2);
  microscope.userData.interact = () => {
    if (found < 2) {
      flashNote(`No slide under the lens. ${2 - found} still missing.`);
      return;
    }
    openMicroscope(() => {
      const item = microscope.userData.evidence;
      if (item) window.dispatchEvent(new CustomEvent("candlelit:found", { detail: item }));
    });
  };

  // ---- light ----
  set.add(createAmbient(0.32));
  const candle = set.add(createCandle({ intensity: 2 }));
  candle.position.set(-1.15, 0.8, -0.6);
  const spotLamp = set.add(createSpot({ from: [-0.3, 2.9, 0.2], to: [-0.3, 0.8, -0.8], intensity: 25, angle: 0.5 }));
  set.add(createSpot({ from: [5, 2.9, 0.8], to: [5.3, 0, -0.5], intensity: 10, angle: 0.8, shadows: false, beam: false }));
  set.add(createMoonlight({ from: [-3, 4, -6], to: [0, 0, 0], intensity: 0.35 }));

  // ---- first person: where you can walk ----
  scene.userData.noWalk.push({ minX: -1.3, maxX: 1.3, minZ: -1.4, maxZ: -0.2 }, { minX: -3.5, maxX: -2.4, minZ: 0.1, maxZ: 2.3 });

  // INTERACTION 1, gate "cut": hold the mouse button and the brain splits into 240 blocks.
  // While you hold, the spot light buzzes brighter and the camera trembles a little.
  const spot = spotLamp.userData.light;
  const spotBase = spot.intensity;
  let cut = 0;
  set.onUpdate((time, delta, t, ctx) => {
    const holding = ctx.gate === "cut" && ctx.input.down;
    if (holding) cut = Math.min(1, cut + delta / 3.5);
    if (ctx.done("cut")) cut = Math.min(1, cut + delta / 2); // finish the animation by itself
    blocks.userData.setProgress(cut);
    if (ctx.gate === "cut") {
      ctx.progress(cut);
      if (cut >= 1) ctx.resolve("cut");
    }
    const shake = holding ? 0.006 : 0;
    ctx.rig.offset.set((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake, 0);
    spot.intensity = spotBase * (holding ? 1.25 + Math.sin(time * 40) * 0.1 : 1);
  });
  return set;
}
