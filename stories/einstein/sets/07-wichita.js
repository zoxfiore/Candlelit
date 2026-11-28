// Chapter 4 ("The Cider Box") — Wichita, Kansas, 1978. Harvey's office and its back room.
//
// INTERACTION 1, gate "box": click under the beer cooler -> it slides away, the cider box comes out
//   and a pale light from inside lights Harvey and Levy from below.
// INTERACTION 2, first person — a PUZZLE: the box is TAPED SHUT. Find something sharp:
//   the letter opener is on the desk (it shimmers). Take it, then open the box:
//   the tape splits, the flaps open, and you can look at what is inside.

import * as THREE from "three";
import { createSet } from "../../../src/world/set.js";
import { placeModel, placeWindow } from "../../../src/world/models.js";
import { placeCharacter } from "../../../src/characters/cast.js";
import { createAmbient, createSpot, createMoonlight } from "../../../src/lights/lamps.js";
import { createLayout } from "../../../src/world/layout.js";
import { furnishRoom } from "../../../src/world/furnish.js";
import { canvasTexture } from "../../../src/world/procedural.js";
import { createDrawers, createPapers, createFrame, createRug, createBooks } from "../../../src/world/props.js";
import { createFilingCabinet, createTypewriter, createWallClock } from "../../../src/world/props2.js";
import { flashNote, setTask } from "../../../src/ui/task.js";

/** a 1978 wall calendar */
function calendar() {
  return canvasTexture(240, 320, (c, w, h) => {
    c.fillStyle = "#f2ece0";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#b8452a";
    c.fillRect(0, 0, w, 70);
    c.fillStyle = "#fff";
    c.font = "bold 30px Georgia";
    c.fillText("MAY 1978", 40, 46);
    c.fillStyle = "#3a2a1c";
    c.font = "16px Georgia";
    for (let d = 1; d <= 31; d++) c.fillText(String(d), 18 + ((d + 1) % 7) * 31, 100 + Math.floor((d + 1) / 7) * 40);
  });
}

/** a framed diploma */
function diploma() {
  return canvasTexture(300, 220, (c, w, h) => {
    c.fillStyle = "#efe6cc";
    c.fillRect(0, 0, w, h);
    c.strokeStyle = "#8a6a3a";
    c.lineWidth = 6;
    c.strokeRect(12, 12, w - 24, h - 24);
    c.fillStyle = "#2a1e14";
    c.textAlign = "center";
    c.font = "italic 20px Georgia";
    c.fillText("Doctor of Medicine", w / 2, 80);
    c.font = "16px Georgia";
    c.fillText("Thomas Stoltz Harvey", w / 2, 120);
    c.fillText("Yale University", w / 2, 150);
  });
}

export function buildWichita() {
  const set = createSet({ background: "#070605" });
  const scene = set.scene;

  // ---- the floor plan: the office, a back room, a big garage-storeroom, a kitchenette ----
  createLayout(set, {
    rooms: [
      { x0: -3.5, x1: 3.5, z0: -2.5, z1: 4.8, wallColor: "#9a8a68", floorColor: "#7c5e44", trim: "#4a3624", lamp: false },
      { x0: 3.5, x1: 7.5, z0: -2.5, z1: 1.2, wallColor: "#7e7258", floorColor: "#6a5038", theme: "office", furnish: furnishRoom, lampIntensity: 1.5 },
      { x0: 3.5, x1: 10, z0: 1.2, z1: 6, wallColor: "#6e6a5e", floor: "tiles", floorColor: "#6a6a62", theme: "storage", furnish: furnishRoom, lampIntensity: 2 },
      { x0: -6.5, x1: -3.5, z0: 1.5, z1: 4.8, wallColor: "#8a8a70", floor: "tiles", floorColor: "#9a9a8a", theme: "kitchen", furnish: furnishRoom, lampIntensity: 1.5 },
    ],
    doors: [{ x: 3.5, z: 0.2 }, { x: 3.5, z: 3.0 }, { x: -3.5, z: 3.7 }, { x: 5.5, z: 1.2 }],
    windows: [{ x: -1.5, z: -2.5 }, { x: 10, z: 3.5 }],
    sky: "#c08850",
  });

  // ---- the office ----
  placeModel(set, "desk", -0.4, -1.4);
  placeModel(set, "chair", -0.5, -2.0);
  const typewriter = createTypewriter();
  typewriter.position.set(-0.7, 0.785, -1.3);
  set.add(typewriter);
  placeModel(set, "telephone", 0.1, -1.45, { y: 0.785 });
  const deskPapers = createPapers(8, { seed: 51, spread: 0.18 });
  deskPapers.position.set(-0.05, 0.786, -1.2);
  set.add(deskPapers);
  const cooler = placeModel(set, "beer-cooler", 1.6, -1.4, { info: "cooler" });
  const box = placeModel(set, "cider-box", 1.6, -1.4, { info: "ciderBox" }); // hidden UNDER the cooler
  for (const [x, z] of [[-2.9, -2.1], [-2.9, -1.45]]) {
    const f = createFilingCabinet("#5e5a48");
    f.position.set(x, 0, z);
    f.rotation.y = Math.PI / 2;
    set.add(f);
  }
  const cal = createFrame(0.3, 0.4, calendar());
  cal.position.set(0.5, 1.75, -2.42);
  set.add(cal);
  for (const [z, i] of [[0.4, 0], [1.3, 1]]) {
    const d = createFrame(0.42, 0.3, diploma());
    d.position.set(-3.42, 1.75 + i * 0.05, z);
    d.rotation.y = Math.PI / 2;
    set.add(d);
  }
  const clock = createWallClock(3, 40);
  clock.position.set(3.42, 2.2, -1.2);
  clock.rotation.y = -Math.PI / 2;
  set.add(clock);
  const rug = createRug(2.6, 1.8, { base: "#5a3a22", border: "#c89a50" });
  rug.position.set(0, 0, 0.4);
  set.add(rug);
  const cabinet = createDrawers({ rows: 3 });
  cabinet.position.set(-3.15, 0, 2.4);
  cabinet.rotation.y = Math.PI / 2;
  set.add(cabinet);

  // ---- the back room: boxes, shelves ----
  placeModel(set, "moving-boxes", 5.6, -1.8);
  placeModel(set, "moving-boxes", 6.0, 3.6, { rotationY: 0.5 });
  placeModel(set, "bookshelf", 4.9, 5.75, { rotationY: Math.PI });
  const shelfBooks = createBooks(0.9, { seed: 60 });
  shelfBooks.position.set(4.9, 1.4, 5.6);
  set.add(shelfBooks);

  // ---- the people ----
  const harvey = placeCharacter(set, "harvey-1978", 0.7, -1.2);
  const levy = placeCharacter(set, "levy", -1.4, -0.5);

  // ---- the puzzle: tape on the box, and a letter opener in a drawer ----
  box.updateMatrixWorld(true);
  const size = new THREE.Box3().setFromObject(box).getSize(new THREE.Vector3());
  const cardboard = new THREE.MeshStandardMaterial({ color: "#b8925e", roughness: 0.9 });
  const flaps = [-1, 1].map((side) => {
    const hinge = new THREE.Group();
    hinge.position.set(side * size.x * 0.5, size.y + 0.002, 0);
    const flap = new THREE.Mesh(new THREE.BoxGeometry(size.x * 0.5, 0.006, size.z * 0.96), cardboard);
    flap.position.x = -side * size.x * 0.25;
    flap.castShadow = true;
    hinge.add(flap);
    box.add(hinge);
    return { hinge, side };
  });
  const tape = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.004, size.z * 1.02), new THREE.MeshStandardMaterial({ color: "#c8b890", roughness: 0.4, transparent: true, opacity: 0.85 }));
  tape.position.set(0, size.y + 0.007, 0);
  box.add(tape);
  // two jars inside (visible when the flaps open)
  const jarMat = new THREE.MeshStandardMaterial({ color: "#d8f0e0", transparent: true, opacity: 0.35, roughness: 0.05, emissive: "#a0d080", emissiveIntensity: 0.3 });
  for (const x of [-0.08, 0.08]) {
    const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, size.y * 0.8, 16), jarMat);
    jar.position.set(x * (size.x / 0.3), size.y * 0.45, 0);
    box.add(jar);
  }
  let hasOpener = false;
  let boxOpen = 0, boxTarget = 0;
  const opener = new THREE.Group();
  const blade = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.004, 0.022), new THREE.MeshStandardMaterial({ color: "#c8ccd0", metalness: 1, roughness: 0.2 }));
  const handle = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.012, 0.026), new THREE.MeshStandardMaterial({ color: "#4a2a18", roughness: 0.4 }));
  handle.position.x = -0.14;
  opener.add(blade, handle, new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.08, 0.14), new THREE.MeshBasicMaterial({ visible: false })));
  opener.position.set(5.8, 0.79, -1.5); // on the desk of the back room
  opener.rotation.y = 0.4;
  set.add(opener);
  blade.material.emissive = new THREE.Color("#ffd080");
  opener.userData.update = (time) => (blade.material.emissiveIntensity = hasOpener ? 0 : 0.15 + 0.15 * Math.sin(time * 3));
  opener.userData.interact = () => {
    if (hasOpener) return;
    hasOpener = true;
    opener.visible = false;
    flashNote("A letter opener. Sharp enough.");
    setTask("Open the cider box");
  };
  box.userData.interact = () => {
    if (!hasOpener) {
      flashNote("Taped shut. You need something sharp.");
      setTask("Find something to cut the tape");
      return;
    }
    boxTarget = 1;
    flashNote("The tape splits. The smell of formaldehyde.");
    setTask("Look inside the box");
    delete box.userData.interact; // from now on, a click on the box inspects what is inside
  };

  // a pale greenish light INSIDE the box: off until the box is found
  const glow = new THREE.PointLight("#c8ffb0", 0, 3, 2);
  glow.position.set(1.6, 0.35, -1.25);
  glow.castShadow = true;
  glow.shadow.mapSize.set(512, 512);
  set.add(glow);

  // ---- light: warm late afternoon ----
  set.add(createAmbient(0.42, "#d0b890"));
  set.add(createSpot({ from: [0.5, 2.9, 0.5], to: [0.6, 0.4, -1.3], intensity: 22, angle: 0.65 }));
  set.add(createSpot({ from: [5, 2.9, 1], to: [5, 0, 0.5], intensity: 8, angle: 0.9, shadows: false, beam: false }));
  set.add(createMoonlight({ from: [-3, 3, -6], to: [0.5, 0, -0.5], intensity: 0.8, color: "#ffc080" }));

  // ---- first person: where you can walk ----
  scene.userData.noWalk.push({ minX: -1.3, maxX: 0.5, minZ: -2.4, maxZ: -0.9 }, { minX: -3.5, maxX: -2.5, minZ: -2.5, maxZ: -1.0 });

  // INTERACTION 1, gate "box": click the cooler (or the box) -> the cooler slides away,
  // the box rises and its glow lights Harvey and Levy from below.
  const ray = new THREE.Raycaster();
  let open = 0;
  set.onUpdate((time, delta, t, ctx) => {
    if (ctx.gate === "box" && ctx.input.clicked) {
      ray.setFromCamera(ctx.input.pointer, ctx.camera);
      if (ray.intersectObjects([cooler, box], true).length) ctx.resolve("box");
    }
    if (ctx.done("box")) open = Math.min(1, open + delta / 1.8);
    const k = open * open * (3 - 2 * open);
    cooler.position.x = 1.6 + 0.9 * k;
    cooler.rotation.y = -0.35 * k;
    box.position.z = -1.4 + 0.35 * k;
    box.position.y = Math.sin(Math.min(1, open * 1.5) * Math.PI) * 0.06;
    glow.position.z = box.position.z + 0.15;
    // the flaps open (first-person puzzle): the tape disappears, the light inside gets stronger
    boxOpen += (boxTarget - boxOpen) * Math.min(1, delta * 2);
    for (const { hinge, side } of flaps) hinge.rotation.z = -side * boxOpen * 2.2;
    tape.visible = boxOpen < 0.05;
    glow.intensity = k * (1.3 + Math.sin(time * 3) * 0.15) * (1 + boxOpen * 0.8);
    // both men flinch when the box comes out
    const jolt = Math.max(0, Math.sin(open * Math.PI)) * 0.6;
    harvey.userData.act = levy.userData.act = { jolt };
  });
  return set;
}
