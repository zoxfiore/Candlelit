// Chapter 10 — California, 1997: Harvey offers the brain to Einstein's granddaughter, Evelyn. She refuses.
// Her living room, and the dining room next to it.
//
// First person — task: Evelyn does not want it. Close the box (its lid swings shut),
// then read the note left on the coffee table.

import * as THREE from "three";
import { createSet } from "../../../src/world/set.js";
import { placeModel, placeWindow } from "../../../src/world/models.js";
import { placeCharacter } from "../../../src/characters/cast.js";
import { createCandle } from "../../../src/lights/candle.js";
import { createAmbient, createSpot } from "../../../src/lights/lamps.js";
import { createLayout } from "../../../src/world/layout.js";
import { furnishRoom } from "../../../src/world/furnish.js";
import { createRug, createStandingLamp } from "../../../src/world/props.js";
import { clueObject } from "../../../src/world/evidence.js";
import { flashNote, setTask } from "../../../src/ui/task.js";

export function buildEvelyn() {
  const set = createSet({ background: "#060505" });
  createLayout(set, {
    rooms: [
      { x0: -3.5, x1: 3.5, z0: -2.5, z1: 5, wallColor: "#76586a", floorColor: "#6a4632", lampIntensity: 1.2 },
      { x0: 3.5, x1: 7, z0: -2.5, z1: 1.5, wallColor: "#8a8a70", floor: "tiles", floorColor: "#a0a090", theme: "kitchen", furnish: furnishRoom },
      { x0: 3.5, x1: 9, z0: 1.5, z1: 5, wallColor: "#7a6a5a", floorColor: "#6a4632", theme: "dining", furnish: furnishRoom },
      { x0: -7, x1: -3.5, z0: -2.5, z1: 1.5, wallColor: "#6a6a7a", floorColor: "#6a4632", theme: "bedroom", furnish: furnishRoom },
    ],
    doors: [{ x: 3.5, z: -0.5 }, { x: 4.5, z: 1.5 }, { x: -3.5, z: -0.5 }],
    windows: [{ x: -2.4, z: -2.5 }, { x: 9, z: 3.2 }, { x: -7, z: -0.5 }],
    sky: "#c89a60",
  });

  placeModel(set, "sofa", 0.4, -2.0);
  placeModel(set, "bookshelf", 2.6, -2.25, { scale: 0.85 });
  placeModel(set, "coffee-table", 0.1, -0.9);
  const rug = createRug(3, 2.2, { base: "#4a3a5a", border: "#c8a870" });
  rug.position.set(0.1, 0, -0.7);
  set.add(rug);
  const lamp = createStandingLamp({ intensity: 1.8 });
  lamp.position.set(-2.8, 0, -2.0);
  lamp.userData.light.castShadow = false;
  set.add(lamp);

  placeCharacter(set, "evelyn", 1.1, -1.2);
  placeCharacter(set, "harvey-1997-box", -0.8, -1.0);
  placeCharacter(set, "paterniti", -2.0, -1.6);

  // the plastic box with the pieces of brain, open on the coffee table
  const box = new THREE.Group();
  const plastic = new THREE.MeshStandardMaterial({ color: "#e8eef0", transparent: true, opacity: 0.75, roughness: 0.3 });
  const tub = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.1, 0.18), plastic);
  tub.position.y = 0.05;
  const lidHinge = new THREE.Group();
  lidHinge.position.set(0, 0.1, -0.09);
  const lid = new THREE.Mesh(new THREE.BoxGeometry(0.27, 0.015, 0.19), new THREE.MeshStandardMaterial({ color: "#5a8ad0", roughness: 0.4 }));
  lid.position.z = 0.095;
  lidHinge.add(lid);
  lidHinge.rotation.x = -1.9; // open
  const pieces = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.05, 0.12), new THREE.MeshStandardMaterial({ color: "#d8b0a0", roughness: 0.9 }));
  pieces.position.y = 0.04;
  box.add(tub, pieces, lidHinge, new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.3, 0.4), new THREE.MeshBasicMaterial({ visible: false })));
  box.position.set(0.45, 0.45, -0.85);
  box.traverse((o) => o.isMesh && (o.castShadow = true));
  set.add(box);
  let closed = false;
  box.userData.interact = () => {
    if (closed) return;
    closed = true;
    flashNote("Click. She shakes her head: “I don't want it.”");
    setTask("Find the note she left — try the bedroom");
  };

  set.add(createAmbient(0.34));
  const candle = set.add(createCandle({ intensity: 2.5 }));
  candle.position.set(0.3, 0.45, -0.85);
  set.add(createSpot({ from: [0.2, 2.9, 0.8], to: [0.2, 0.9, -1.2], intensity: 18, angle: 0.7 }));
  set.scene.userData.noWalk.push({ minX: -0.6, maxX: 0.8, minZ: -1.4, maxZ: -0.4 }, { minX: -0.8, maxX: 1.6, minZ: -2.6, maxZ: -1.5 });

  let note = null;
  set.onUpdate((time, delta) => {
    lidHinge.rotation.x += ((closed ? 0 : -1.9) - lidHinge.rotation.x) * Math.min(1, delta * 5);
    note ??= clueObject(set.scene, "evelyn");
    if (note) note.visible = closed;
  });
  return set;
}
