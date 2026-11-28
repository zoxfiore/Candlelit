// Chapter 11 — Princeton Hospital, 1998: after 43 years Harvey gives the brain back, to Dr. Elliot Krauss.
// A hospital office, and the records room next to it.
//
// First person — task: take the pen from the desk, then sign the receipt.
// (Your signature writes itself on the paper; then you can read it.)

import * as THREE from "three";
import { createSet } from "../../../src/world/set.js";
import { placeModel, placeWindow } from "../../../src/world/models.js";
import { placeCharacter } from "../../../src/characters/cast.js";
import { createAmbient, createMoonlight, createSpot } from "../../../src/lights/lamps.js";
import { createLayout } from "../../../src/world/layout.js";
import { furnishRoom } from "../../../src/world/furnish.js";
import { createJar, createFilingCabinet } from "../../../src/world/props2.js";
import { createPapers } from "../../../src/world/props.js";
import { clueObject } from "../../../src/world/evidence.js";
import { rustle } from "../../../src/audio/synth.js";
import { flashNote, setTask } from "../../../src/ui/task.js";

export function buildReturn() {
  const set = createSet({ background: "#060606" });
  createLayout(set, {
    rooms: [
      { x0: -3.5, x1: 3.5, z0: -2.5, z1: 5, floor: "tiles", floorColor: "#94948a", wallColor: "#989888", lampIntensity: 1.4 },
      { x0: 3.5, x1: 7, z0: -2.5, z1: 5, floor: "tiles", floorColor: "#8a8a80", wallColor: "#8a8a7a", theme: "storage", furnish: furnishRoom },
      { x0: -6, x1: -3.5, z0: -2.5, z1: 5, floor: "tiles", floorColor: "#80807a", wallColor: "#9a9a8a", theme: "hall", furnish: furnishRoom },
    ],
    doors: [{ x: 3.5, z: 1.0 }, { x: -3.5, z: 1.0 }],
    windows: [{ x: -1.8, z: -2.5 }, { x: 7, z: 3.0 }],
    sky: "#8aa0c0",
  });

  placeModel(set, "wall-shelf", 1.6, -2.3, { y: 1.5 });
  for (const x of [1.3, 1.9]) {
    const jar = createJar({ glow: 0.12 });
    jar.scale.setScalar(0.8);
    jar.position.set(x, 1.54, -2.2);
    set.add(jar);
  }
  placeModel(set, "desk", 1.6, -1.6);
  const files = createFilingCabinet("#6a7068");
  files.position.set(-2.9, 0, -1.6);
  files.rotation.y = Math.PI / 2;
  set.add(files);
  const papers = createPapers(5, { seed: 111 });
  papers.position.set(1.9, 0.786, -1.75);
  set.add(papers);

  placeCharacter(set, "harvey-1997-jar", -0.6, -1.0);
  placeCharacter(set, "krauss", 0.7, -1.1);

  // the pen, on the desk (it shimmers)
  const pen = new THREE.Group();
  const penMat = new THREE.MeshStandardMaterial({ color: "#1a1a2a", metalness: 0.5, roughness: 0.3, emissive: "#ffd080", emissiveIntensity: 0.2 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.14, 8), penMat);
  body.rotation.z = Math.PI / 2;
  pen.add(body, new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.08, 0.12), new THREE.MeshBasicMaterial({ visible: false })));
  pen.position.set(6.45, 0.87, -2.05); // on the chest of drawers, in the records room
  pen.rotation.y = 0.6;
  set.add(pen);
  let hasPen = false, signed = false;
  pen.userData.interact = () => {
    hasPen = true;
    pen.visible = false;
    flashNote("A fountain pen.");
    setTask("Sign the receipt");
  };

  set.add(createAmbient(0.45, "#d0c8b8"));
  set.add(createMoonlight({ from: [-3, 4, -6], to: [0, 0, 0], intensity: 0.4 }));
  set.add(createSpot({ from: [0, 2.9, 1], to: [0, 1, -1], intensity: 10, angle: 0.7, shadows: false }));
  set.scene.userData.noWalk.push({ minX: 0.8, maxX: 2.4, minZ: -2.3, maxZ: -1.0 });

  let receipt = null;
  set.onUpdate((time) => {
    penMat.emissiveIntensity = hasPen ? 0 : 0.15 + 0.15 * Math.sin(time * 3);
    receipt ??= clueObject(set.scene, "return");
    if (!receipt || signed) return;
    // before the pen: "you need a pen". With it: the click signs (then the next click reads it)
    receipt.userData.interact = () => {
      if (!hasPen) {
        flashNote("You need something to sign with.");
        return;
      }
      signed = true;
      rustle();
      flashNote("Signed. After 43 years, the brain is back.");
      setTask("Read the receipt");
      delete receipt.userData.interact;
    };
  });
  return set;
}
