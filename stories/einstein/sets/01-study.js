// Chapter 1 — Einstein's house, 112 Mercer Street, Princeton. Night.
//
// A real house now: the study (where the film happens) and, through a doorway, the living room,
// with walls on every side, a ceiling, windows onto the night, and many things to look at and use.
//
// INTERACTION 1, gate "wish": the room is dark and YOU hold a candle (it follows the mouse).
//   Bring it close to the folded letter on the desk -> the letter glows, the desk candle lights up,
//   the house is revealed.
// INTERACTION 2, first person: walk around the house. Pick up the letter: it rises to your eyes,
//   unfolds, and Einstein's last wish writes itself in ink. Also: open the drawers, spin the globe,
//   write on the blackboard, turn on the radio, play the violin, switch the lamp.

import * as THREE from "three";
import { createSet } from "../../../src/world/set.js";
import { placeModel, placeWindow } from "../../../src/world/models.js";
import { placeCharacter } from "../../../src/characters/cast.js";
import { createCandle } from "../../../src/lights/candle.js";
import { flicker } from "../../../src/lights/flicker.js";
import { createAmbient, createMoonlight } from "../../../src/lights/lamps.js";
import { getImage, getTexture } from "../../../src/assets/loader.js";
import { createLayout } from "../../../src/world/layout.js";
import { furnishRoom } from "../../../src/world/furnish.js";
import { canvasTexture } from "../../../src/world/procedural.js";
import { createLetter3D } from "../../../src/world/letter3d.js";
import {
  createBooks, createPapers, createPipe, createViolin, createClock, createRadio, createGlobe,
  createDrawers, createChalkboard, createRug, createFrame, createStandingLamp, createMusicStand,
} from "../../../src/world/props.js";

const RADIO_NEWS =
  "This is the news. Professor Albert Einstein, the scientist whose theories changed our understanding of the universe, " +
  "died early this morning at Princeton Hospital. He was seventy-six.";

/** a painted landscape for a frame (sky, hills, a lake) */
function painting() {
  return canvasTexture(320, 240, (g, w, h) => {
    const sky = g.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#c89a5a");
    sky.addColorStop(0.55, "#e8c88a");
    sky.addColorStop(1, "#4a5a3a");
    g.fillStyle = sky;
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#5a6a44";
    g.beginPath();
    g.moveTo(0, 150);
    g.quadraticCurveTo(90, 100, 170, 140);
    g.quadraticCurveTo(250, 110, w, 135);
    g.lineTo(w, h);
    g.lineTo(0, h);
    g.fill();
    g.fillStyle = "#6a8a9a";
    g.fillRect(40, 175, 200, 22);
  });
}

export function buildStudy() {
  const set = createSet({ background: "#050404", dust: { count: 420, size: [12, 3, 7] } });
  const scene = set.scene;

  // ---------------- the house: 5 rooms ----------------
  //   bedroom (west) | study (where the film happens) | living room (east)
  //                                                   | hallway | kitchen      (an L around the study)
  createLayout(set, {
    rooms: [
      { x0: -3.5, x1: 3.5, z0: -2.5, z1: 5.2, wallColor: "#8a725c", floorColor: "#8a5a3c", lamp: false }, // study: candle-lit
      { x0: 3.5, x1: 9, z0: -2.5, z1: 2.0, wallColor: "#7a6a58", floorColor: "#7a5038", lampIntensity: 1.6 }, // living room
      { x0: 3.5, x1: 5.5, z0: 2.0, z1: 5.2, wallColor: "#6e6450", floorColor: "#6a4a32", theme: "hall", furnish: furnishRoom },
      { x0: 5.5, x1: 9, z0: 2.0, z1: 5.2, wallColor: "#8a8a70", floor: "tiles", floorColor: "#9a9a8a", theme: "kitchen", furnish: furnishRoom },
      { x0: -7, x1: -3.5, z0: 1.8, z1: 5.2, wallColor: "#6a6a7a", floorColor: "#7a5038", theme: "bedroom", furnish: furnishRoom, lampIntensity: 1.4 },
    ],
    doors: [{ x: 3.5, z: 1.1 }, { x: 4.5, z: 2.0 }, { x: 5.5, z: 3.6 }, { x: -3.5, z: 3.9 }],
    windows: [{ x: -3.5, z: -0.4 }, { x: 9, z: 0.5 }, { x: 9, z: 3.6 }, { x: -7, z: 3.5 }],
  });
  placeModel(set, "door", 1.6, 5.12, { rotationY: Math.PI }); // the front door

  // ---------------- the study ----------------
  placeModel(set, "bookshelf", -2.2, -2.25);
  placeModel(set, "bookshelf", -3.2, -1.6, { rotationY: Math.PI / 2 });
  placeModel(set, "desk", -1.2, -0.9);
  placeModel(set, "chair", -1.0, -1.6);
  const board = createChalkboard();
  board.position.set(1.3, 1.6, -2.4);
  set.add(board);
  placeModel(set, "wall-shelf", 2.9, -2.4, { y: 1.75 });
  const shelfBooks = createBooks(0.7, { seed: 4, maxHeight: 0.26 });
  shelfBooks.position.set(2.9, 1.8, -2.3);
  set.add(shelfBooks);
  // piles of books and papers everywhere: Einstein's study was famously untidy
  for (const [x, z, s] of [[-2.9, 0.4, 3], [-2.6, 3.6, 5], [2.9, 0.6, 7], [0.4, -2.1, 8]]) {
    const pile = createBooks(0.24, { seed: s, maxHeight: 0.22 });
    pile.rotation.set(0, s, Math.PI / 2);
    pile.position.set(x, 0.12, z);
    set.add(pile);
  }
  for (const [x, y, z, n, seed] of [[-1.6, 0.785, -1.05, 9, 1], [-0.55, 0.785, -0.65, 5, 2], [1.9, 0.005, -1.7, 6, 3], [-2.4, 0.005, 1.2, 4, 4]]) {
    const p = createPapers(n, { seed, spread: 0.2 });
    p.position.set(x, y, z);
    set.add(p);
  }
  const pipe = createPipe();
  pipe.position.set(-0.72, 0.785, -1.12);
  pipe.rotation.y = 0.6;
  set.add(pipe);
  const globe = createGlobe();
  globe.scale.setScalar(1.7);
  globe.position.set(2.7, 0, -1.4);
  set.add(globe);
  const clock = createClock();
  clock.position.set(-3.25, 0, 2.4);
  clock.rotation.y = Math.PI / 2;
  set.add(clock);
  const drawers = createDrawers();
  drawers.position.set(-3.2, 0, 1.0);
  drawers.rotation.y = Math.PI / 2;
  set.add(drawers);
  const rug = createRug(3.2, 2.3);
  rug.position.set(0, 0, 0.6);
  set.add(rug);
  const portrait = createFrame(0.5, 0.65, getImage("portrait"));
  portrait.position.set(3.42, 1.75, -1.1);
  portrait.rotation.y = -Math.PI / 2;
  set.add(portrait);

  // the letter, folded in three, on the desk
  const letter = createLetter3D({
    date: "Princeton, April 1955",
    lines: ["No grave.", "No monument.", "No place where people", "come to worship me.", "", "Burn my body,", "scatter the ashes", "in secret."],
    signature: "A. Einstein",
  });
  letter.position.set(-1.05, 0.79, -0.72);
  letter.rotation.set(-Math.PI / 2, 0, 0.25);
  letter.userData.info = "note";
  set.add(letter);

  // Einstein himself
  placeCharacter(set, "einstein", 0.4, -1.1);

  // ---------------- the living room ----------------
  placeModel(set, "sofa", 6.2, -1.9);
  placeModel(set, "coffee-table", 6.2, -0.7);
  const rug2 = createRug(3.4, 2.6, { base: "#3a3a52", border: "#b09060" });
  rug2.position.set(6.2, 0, -0.4);
  set.add(rug2);
  const cabinet = createDrawers({ rows: 2 });
  cabinet.position.set(8.6, 0, -1.4);
  cabinet.rotation.y = -Math.PI / 2;
  set.add(cabinet);
  const radio = createRadio(RADIO_NEWS);
  radio.position.set(8.55, 0.865, -1.4);
  radio.rotation.y = -Math.PI / 2;
  set.add(radio);
  const stand = createMusicStand();
  stand.position.set(4.6, 0, 0.9);
  stand.rotation.y = 0.5;
  set.add(stand);
  const violin = createViolin();
  violin.position.set(5.6, 0, 1.2);
  violin.rotation.y = -0.4;
  set.add(violin);
  const lamp = createStandingLamp({ intensity: 2.2 });
  lamp.position.set(4.2, 0, -2.0);
  lamp.userData.light.castShadow = false; // the study's lights already cast enough shadows
  set.add(lamp);
  const art = createFrame(0.9, 0.68, painting());
  art.position.set(6.2, 1.8, -2.42);
  set.add(art);
  const books2 = createBooks(0.9, { seed: 12 });
  books2.position.set(8.6, 0.88, 1.6);
  books2.rotation.y = -Math.PI / 2;
  set.add(books2);
  const cabinet2 = createDrawers({ rows: 3 });
  cabinet2.position.set(8.6, 0, 1.6);
  cabinet2.rotation.y = -Math.PI / 2;
  set.add(cabinet2);

  // first person: the plan gives the walls; we add the big furniture you cannot walk through
  scene.userData.noWalk.push(
    { minX: -2.05, maxX: -0.35, minZ: -1.5, maxZ: -0.45 }, // desk
    { minX: 5.2, maxX: 7.2, minZ: -2.5, maxZ: -1.3 }, // sofa
  );

  // ---------------- light ----------------
  const ambient = set.add(createAmbient(0.12));
  const deskCandle = set.add(createCandle({ intensity: 0, shadows: true }));
  deskCandle.position.set(-1.5, 0.78, -0.9);
  deskCandle.visible = false;
  const moon = set.add(createMoonlight({ from: [-7, 4, -0.4], to: [0, 0, -0.8], intensity: 0.35 }));

  // YOUR candle (before first person) is the candle cursor on the screen: here we only add its
  // LIGHT, a warm flickering point light that follows the mouse in the room (no floating candle)
  const hand = new THREE.PointLight("#ffa456", 5.5, 8, 2);
  hand.castShadow = true;
  hand.shadow.mapSize.set(512, 512);
  hand.shadow.bias = -0.002;
  hand.shadow.radius = 4;
  set.add(hand);
  const ray = new THREE.Raycaster();
  const goal = new THREE.Vector3();
  const roomMin = new THREE.Vector3(-3.1, 0.85, -2.1);
  const roomMax = new THREE.Vector3(3.1, 2.3, 2.2);
  hand.position.set(0, 1.3, 0.5);

  let search = 0; // 0..1: how long the candle has been near the letter
  let reveal = 0; // 0..1: the house lights up
  let camera = null;
  letter.userData.interact = () => {
    if (!camera) return;
    letter.userData.open(camera, () => {
      // the letter is in the case file: the clue is found
      const item = letter.userData.evidence;
      if (item) window.dispatchEvent(new CustomEvent("candlelit:found", { detail: item }));
    });
  };

  set.onUpdate((time, delta, t, ctx) => {
    camera = ctx.camera;
    const found = ctx.done("wish");

    // 1. the hand candle follows the mouse (until the house is lit)
    if (reveal < 1) {
      ray.setFromCamera(ctx.input.pointer, ctx.camera);
      let distance = 2.6;
      for (const hit of ray.intersectObjects(scene.children, true)) {
        if (hit.object.userData.noHover || hit.object.isPoints) continue;
        distance = Math.min(distance, hit.distance - 0.3);
        break;
      }
      goal.copy(ray.ray.origin).addScaledVector(ray.ray.direction, Math.max(0.8, distance)).clamp(roomMin, roomMax);
      hand.position.lerp(goal, 1 - Math.exp(-8 * delta));
    }

    // 2. searching: the letter "answers" when the light is close to it
    if (!found) {
      const near = ctx.gate === "wish" && hand.position.distanceTo(letter.position) < 0.6;
      search = THREE.MathUtils.clamp(search + (near ? delta / 1.2 : -delta / 2), 0, 1);
      if (ctx.gate === "wish") ctx.progress(search);
      if (search >= 1) ctx.resolve("wish");
    }

    // 3. reveal: the desk candle catches fire, the house appears, your candle goes out
    if (found) reveal = Math.min(1, reveal + delta / 2.5);
    const k = reveal * reveal * (3 - 2 * reveal);
    deskCandle.visible = reveal > 0;
    deskCandle.userData.baseIntensity = 5 * k;
    ambient.intensity = (0.12 + 0.36 * k) * 1.6;
    moon.userData.light.intensity = 0.35 + 0.4 * k;
    hand.intensity = 5.5 * (1 - k) * flicker(time, 3.7);
    hand.visible = k < 0.999;
  });

  return set;
}
