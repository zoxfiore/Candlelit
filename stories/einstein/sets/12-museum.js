// Chapter 5 ("Still Arguing") — the Mütter Museum, Philadelphia, today. After closing time.
// One large hall: the central case with the slides of the brain, other cases around it.
//
// First person — the last PUZZLE and the ending:
//   1. The museum is dark. Turn on the lights (the switch is by the doorway).
//   2. Read what is in the central case: the slides of Einstein's brain, on display.
//   3. On the bench, a folded letter: Einstein's last wish, again. Read it.
//      When you put it down, it catches fire and burns away in your hands.
//      ("No grave, no monument, no shrine." He got one anyway.)

import * as THREE from "three";
import { createSet } from "../../../src/world/set.js";
import { placeModel } from "../../../src/world/models.js";
import { placePicture } from "../../../src/characters/pictures.js";
import { createAmbient, createSpot } from "../../../src/lights/lamps.js";
import { getImage } from "../../../src/assets/loader.js";
import { createLayout } from "../../../src/world/layout.js";
import { furnishRoom } from "../../../src/world/furnish.js";
import { createFrame } from "../../../src/world/props.js";
import { createShowcase, createRope, createBench, createSwitch, createJar, createTypewriter, createMicroscope } from "../../../src/world/props2.js";
import { createLetter3D } from "../../../src/world/letter3d.js";
import { flashNote, setTask } from "../../../src/ui/task.js";

export function buildMuseum() {
  const set = createSet({ background: "#040303" });
  const scene = set.scene;
  const H = 3.8;

  // ---- the floor plan: the great hall, two side galleries and an entrance vestibule (a cross) ----
  createLayout(set, {
    height: H,
    rooms: [
      { x0: -5, x1: 5, z0: -2.5, z1: 5.2, wallColor: "#5a2a22", floor: "checker-floor", floorColor: "#ffffff", trim: "#2a1410", lamp: false },
      { x0: -9, x1: -5, z0: -2.5, z1: 2.5, wallColor: "#3a3050", floor: "checker-floor", floorColor: "#d8d8d8", trim: "#1a1420", theme: "gallery", furnish: furnishRoom, lampIntensity: 1.2 },
      { x0: 5, x1: 9, z0: -2.5, z1: 2.5, wallColor: "#2a4038", floor: "checker-floor", floorColor: "#d8d8d8", trim: "#14201a", theme: "gallery", furnish: furnishRoom, lampIntensity: 1.2 },
      { x0: -1.5, x1: 1.5, z0: 5.2, z1: 8.5, wallColor: "#4a2a22", floor: "checker-floor", floorColor: "#c8c8c8", theme: "hall", furnish: furnishRoom, lamp: false },
    ],
    doors: [{ x: -5, z: -1.4, width: 1.4, door: false }, { x: 5, z: -1.4, width: 1.4, door: false }, { x: 0, z: 5.2, width: 1.6, door: false }],
  });
  const walls = [];
  // the dark entrance beyond the doorway, with a green EXIT sign
  const exit = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.15, 0.03), new THREE.MeshStandardMaterial({ color: "#20a050", emissive: "#30ff80", emissiveIntensity: 1.4 }));
  exit.position.set(0, 2.75, 5.1);
  set.add(exit);
  const exitLight = new THREE.PointLight("#40ff90", 0.6, 4, 2);
  exitLight.position.set(0, 2.5, 4.8);
  set.add(exitLight);

  // ---- the central case: the slides ----
  placePicture(set, "portrait", 0, 1.3, -2.42, { height: 1.3, info: "portrait", glow: 0.05 });
  const centralCase = placeModel(set, "display-case", 0, -0.8, { info: "slides" });
  placePicture(set, "museum-plaque", 0, 0.5, -0.49, { height: 0.22, info: "slides" });
  set.add(createRope([-1.1, 0.1], [1.1, 0.1]));

  // ---- the side cases ----
  const sideCases = [];
  const addCase = (x, z, object, y = 0) => {
    const sc = createShowcase();
    sc.position.set(x, 0, z);
    set.add(sc);
    object.position.set(x, sc.userData.top + y, z);
    set.add(object);
    sideCases.push(sc);
  };
  addCase(-3.2, -1.4, createJar({ glow: 0.2 }));
  const tw = createTypewriter();
  addCase(3.2, -1.4, tw);
  const ms = createMicroscope();
  ms.scale.setScalar(1.4);
  addCase(-3.2, 1.6, ms);
  const cider = placeModel(set, "cider-box", 0, 0, { scale: 0.55 });
  addCase(3.2, 1.6, cider);
  // photographs on the walls
  const photos = [["harvey-1955", -4.93, 0.2], ["harvey-1978", -4.93, 2.8], ["harvey-1997", 4.93, 0.2], ["levy", 4.93, 2.8]];
  for (const [name, x, z] of photos) {
    const img = getImage(name);
    const f = createFrame(0.5, 0.5 * (img.image.height / img.image.width), img);
    f.position.set(x, 1.7, z);
    f.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2;
    set.add(f);
  }

  // ---- the bench, and the letter on it ----
  const bench = createBench(1.8);
  bench.position.set(0, 0, 2.3);
  set.add(bench);
  const letter = createLetter3D({
    date: "Princeton, April 1955",
    lines: ["No grave.", "No monument.", "No place where people", "come to worship me.", "", "Burn my body,", "scatter the ashes", "in secret."],
    signature: "A. Einstein",
    ending: "burn",
  });
  letter.position.set(0.3, 0.485, 2.3);
  letter.rotation.set(-Math.PI / 2, 0, -0.4);
  letter.userData.info = "letter2";
  set.add(letter);

  // ---- light: a dim night light, and spotlights that are OFF until you find the switches ----
  const ambient = set.add(createAmbient(0.16));
  const spots = {
    left: [set.add(createSpot({ from: [-3.2, 3.6, -0.5], to: [-3.2, 0.9, -1.4], intensity: 22, angle: 0.4 })), set.add(createSpot({ from: [-3.2, 3.6, 2.5], to: [-3.2, 0.9, 1.6], intensity: 22, angle: 0.4, shadows: false }))],
    right: [set.add(createSpot({ from: [3.2, 3.6, -0.5], to: [3.2, 0.9, -1.4], intensity: 22, angle: 0.4 })), set.add(createSpot({ from: [3.2, 3.6, 2.5], to: [3.2, 0.9, 1.6], intensity: 22, angle: 0.4, shadows: false }))],
    center: [set.add(createSpot({ from: [0, 3.6, 0.4], to: [0, 0.9, -0.8], intensity: 30, angle: 0.35, penumbra: 0.5 })), set.add(createSpot({ from: [0, 3.6, -1.0], to: [0, 1.9, -2.45], intensity: 18, angle: 0.35, shadows: false }))],
  };
  const level = { left: 0, right: 0, center: 0 };
  const target = { left: 0, right: 0, center: 0 };
  const base = new Map();
  for (const group of Object.values(spots)) for (const s of group) base.set(s, s.userData.light.intensity);

  // one light switch, on the wall next to the doorway (its plate shimmers a little)
  const sw = createSwitch((on) => {
    for (const key of Object.keys(target)) target[key] = on ? 1 : 0;
    if (on) {
      flashNote("The lights come on, one by one.");
      setTask("Read what is in the central case");
    }
  });
  sw.position.set(-0.9, 1.3, 8.42); // at the far end of the entrance vestibule
  sw.rotation.y = Math.PI;
  set.add(sw);

  // reading the central case: only when it is lit
  let plaqueRead = false;
  const tooDark = () => {
    if (level.center < 0.5) flashNote("Too dark to read anything. The lights must be somewhere.");
  };
  centralCase.userData.interact = tooDark;
  window.addEventListener("candlelit:found", (e) => {
    if (e.detail?.id === "plaque") {
      plaqueRead = true;
      setTask("Einstein's letter, on the bench");
    }
  });
  window.addEventListener("candlelit:inspected", (e) => {
    if (e.detail?.id === "plaque") {
      plaqueRead = true;
      setTask("Einstein's letter, on the bench");
    }
  });

  let camera = null;
  letter.userData.interact = () => {
    if (!plaqueRead) {
      flashNote("A folded letter. First, find out what they did with him.");
      return;
    }
    letter.userData.open(camera, () => {
      const item = letter.userData.evidence;
      if (item) window.dispatchEvent(new CustomEvent("candlelit:found", { detail: item }));
    });
  };

  // ---- first person ----
  scene.userData.noWalk.push(
    { minX: -1.2, maxX: 1.2, minZ: -1.4, maxZ: 0.25 }, // central case + rope
    ...[[-3.2, -1.4], [3.2, -1.4], [-3.2, 1.6], [3.2, 1.6]].map(([x, z]) => ({ minX: x - 0.75, maxX: x + 0.75, minZ: z - 0.55, maxZ: z + 0.55 })),
    { minX: -1.1, maxX: 1.1, minZ: 2.0, maxZ: 2.6 }, // bench
  );

  set.onUpdate((time, delta, t, ctx) => {
    camera = ctx.camera;
    // the film (before first person): the central case is lit, like the old version
    const film = !document.body.classList.contains("first-person") && !ctx.done(`explore-5`);
    for (const key of Object.keys(level)) {
      const goal = film ? (key === "center" ? 1 : 0.35) : target[key];
      level[key] += (goal - level[key]) * Math.min(1, delta * 2.5);
      for (const s of spots[key]) s.userData.light.intensity = base.get(s) * level[key];
    }
    if (level.center > 0.5 && centralCase.userData.interact === tooDark) delete centralCase.userData.interact;
    if (level.center < 0.5 && !centralCase.userData.interact) centralCase.userData.interact = tooDark;
    ambient.intensity = (film ? 0.16 : 0.1) * 1.6;
  });
  return set;
}
