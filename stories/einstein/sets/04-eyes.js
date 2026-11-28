// Chapter 4 — New York: Einstein's eye doctor, Henry Abrams, keeps his eyes in a safe-deposit box.
// A bank vault, and the waiting room next to it.
//
// First person — task: find box 17 among the others (its number plate shimmers) and open it.
// It slides out: inside, the receipt.

import * as THREE from "three";
import { createSet } from "../../../src/world/set.js";
import { placeModel } from "../../../src/world/models.js";
import { placeCharacter } from "../../../src/characters/cast.js";
import { createAmbient, createHangingLamp } from "../../../src/lights/lamps.js";
import { createLayout } from "../../../src/world/layout.js";
import { furnishRoom } from "../../../src/world/furnish.js";
import { canvasTexture } from "../../../src/world/procedural.js";
import { clueObject } from "../../../src/world/evidence.js";
import { tick } from "../../../src/audio/synth.js";
import { flashNote, setTask } from "../../../src/ui/task.js";

/** a wall of small numbered steel doors (on the right of the vault) */
function lockerWall(onOpen17) {
  const g = new THREE.Group();
  const steel = new THREE.MeshStandardMaterial({ color: "#9a9a90", metalness: 0.85, roughness: 0.35 });
  let n = 1;
  let box17 = null;
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 6; col++, n++) {
      const num = n;
      const plate = canvasTexture(64, 40, (c) => {
        c.fillStyle = num === 17 ? "#e8c070" : "#c8c0a8";
        c.fillRect(0, 0, 64, 40);
        c.fillStyle = "#1a1410";
        c.font = "bold 24px Georgia";
        c.textAlign = "center";
        c.fillText(String(num), 32, 29);
      });
      const door = new THREE.Group();
      door.position.set(col * 0.36, 0.5 + row * 0.3, 0);
      const front = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.28, 0.05), steel);
      front.castShadow = front.receiveShadow = true;
      const label = new THREE.Mesh(new THREE.PlaneGeometry(0.09, 0.056), new THREE.MeshStandardMaterial({ map: plate, emissive: num === 17 ? "#ffb040" : "#000", emissiveIntensity: 0 }));
      label.position.z = 0.026;
      door.add(front, label);
      if (num === 17) {
        box17 = { door, label };
        door.userData.interact = () => onOpen17(door);
      } else door.userData.interact = () => flashNote(`Box ${num}. Not this one.`);
      g.add(door);
    }
  }
  g.userData.box17 = box17;
  return g;
}

export function buildEyes() {
  const set = createSet({ background: "#060505" });
  createLayout(set, {
    height: 3,
    rooms: [
      { x0: -3, x1: 3, z0: -2.25, z1: 4.5, floor: "checker-floor", floorColor: "#ffffff", wall: "bricks", wallColor: "#ffffff", lampIntensity: 1.4 },
      { x0: -5, x1: -3, z0: -2.25, z1: 4.5, floor: "checker-floor", floorColor: "#d8d8d0", wallColor: "#8a8270", theme: "hall", furnish: furnishRoom },
      { x0: -10, x1: -5, z0: -2.25, z1: 4.5, floor: "checker-floor", floorColor: "#e0e0d8", wallColor: "#9a8a70", theme: "bank", furnish: furnishRoom },
      { x0: 3, x1: 6.5, z0: -2.25, z1: 1.5, wallColor: "#7a7262", floorColor: "#5a4636", theme: "office", furnish: furnishRoom },
    ],
    doors: [{ x: -3, z: 1.0 }, { x: -5, z: 1.0 }, { x: 3, z: -1.4 }],
    windows: [{ x: -10, z: 1.0 }],
  });

  placeModel(set, "safe-deposit-wall", 0, -2.2, { y: 0.1, info: "safe" });
  placeModel(set, "table", -1.0, -0.9, { scale: 0.75 });
  // the key of box 17 is kept at the counter, in the lobby (two rooms away)
  let hasKey = false;
  const key = new THREE.Group();
  const brass = new THREE.MeshStandardMaterial({ color: "#d0a040", metalness: 1, roughness: 0.25, emissive: "#ffb040", emissiveIntensity: 0.3 });
  key.add(new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.008, 6, 14), brass), new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.09, 0.006), brass).translateY(-0.07));
  key.add(new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.1, 0.24), new THREE.MeshBasicMaterial({ visible: false })));
  key.position.set(-7.9, 1.11, -1.45);
  key.rotation.x = -Math.PI / 2;
  set.add(key);
  key.userData.interact = () => {
    hasKey = true;
    key.visible = false;
    flashNote("A small key, tagged “17”.");
    setTask("Open box 17, in the vault");
  };
  key.userData.update = (t) => (brass.emissiveIntensity = hasKey ? 0 : 0.2 + 0.2 * Math.sin(t * 3));
  const wall = lockerWall(() => {
    if (!hasKey) {
      flashNote("Box 17 is locked. The key must be at the counter, in the lobby.");
      setTask("Find the key of box 17");
      return;
    }
    if (opened) return;
    opened = true;
    tick(0.1);
    flashNote("Box 17 slides out. Inside: a receipt.");
    setTask("Take the receipt");
  });
  wall.position.set(2.92, 0, 0.6);
  wall.rotation.y = -Math.PI / 2;
  set.add(wall);
  let opened = false;
  let out = 0;

  placeCharacter(set, "abrams", 0.6, -0.9);

  set.add(createAmbient(0.5, "#c0a888"));
  const lamp = set.add(createHangingLamp({ intensity: 20, angle: 0.9 }));
  lamp.position.set(0.2, 3, -0.8);
  set.scene.userData.noWalk.push({ minX: -1.6, maxX: -0.4, minZ: -1.5, maxZ: -0.3 });

  let receipt = null;
  set.onUpdate((time, delta) => {
    const { door, label } = wall.userData.box17;
    out += ((opened ? 1 : 0) - out) * Math.min(1, delta * 3);
    door.position.z = out * 0.35;
    label.material.emissiveIntensity = opened ? 0 : 0.25 + 0.25 * Math.sin(time * 3);
    // the receipt (the clue) only appears once the box is open
    receipt ??= clueObject(set.scene, "safe");
    if (receipt) receipt.visible = opened;
  });
  return set;
}
