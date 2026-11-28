// Chapter 6 — Princeton, 1960: Harvey refuses to give the brain back and loses his job.
// His emptied office, half packed, and the corridor-room next to it.
//
// First person — task: pack the two jars into the moving box (click each one: it flies into the box).
// Then the hospital's letter, lying on the floor, can be read.

import * as THREE from "three";
import { createSet } from "../../../src/world/set.js";
import { placeModel } from "../../../src/world/models.js";
import { placeCharacter } from "../../../src/characters/cast.js";
import { createAmbient, createHangingLamp } from "../../../src/lights/lamps.js";
import { createLayout } from "../../../src/world/layout.js";
import { furnishRoom } from "../../../src/world/furnish.js";
import { createJar } from "../../../src/world/props2.js";
import { createPapers } from "../../../src/world/props.js";
import { clueObject } from "../../../src/world/evidence.js";
import { flashNote, setTask } from "../../../src/ui/task.js";

export function buildFired() {
  const set = createSet({ background: "#050404" });
  createLayout(set, {
    height: 3,
    rooms: [
      { x0: -3, x1: 3, z0: -2.25, z1: 4.5, wall: "bricks", wallColor: "#ffffff", floorColor: "#4a3224", lamp: false },
      { x0: 3, x1: 4.8, z0: -2.25, z1: 4.5, wallColor: "#7a7060", floorColor: "#4a3224", theme: "hall", furnish: furnishRoom },
      { x0: 4.8, x1: 8, z0: -2.25, z1: 1.2, wallColor: "#8a8068", floorColor: "#5a4030", theme: "office", furnish: furnishRoom },
      { x0: 4.8, x1: 8, z0: 1.2, z1: 4.5, wallColor: "#7a6a5a", floorColor: "#5a4030", theme: "dining", furnish: furnishRoom },
    ],
    doors: [{ x: 3, z: 0.5 }, { x: 4.8, z: -0.5 }, { x: 4.8, z: 2.8 }],
    windows: [{ x: 8, z: -0.5 }],
  });

  placeModel(set, "door", 1.6, -2.2); // the door: he is leaving
  const boxes = placeModel(set, "moving-boxes", -1.6, -1.2, { info: "boxes" });
  placeModel(set, "desk", 1.2, 0.9, { rotationY: Math.PI });
  const papers = createPapers(10, { seed: 61, spread: 0.6 });
  papers.position.set(0.4, 0.005, 1.6);
  set.add(papers);

  placeCharacter(set, "harvey-1960-jar", 0.2, -0.9);

  // the two jars waiting on the desk
  const target = new THREE.Vector3(-1.6, 0.9, -1.2);
  let packed = 0;
  const jars = [[0.95, 0.785, 0.95], [6.4, 0.775, 2.85]].map(([x, y, z]) => { // the 2nd one is in the meeting room
    const jar = createJar({ glow: 0.18 });
    jar.position.set(x, y, z);
    jar.add(new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.5, 0.4), new THREE.MeshBasicMaterial({ visible: false })).translateY(0.15));
    set.add(jar);
    jar.userData.fly = 0;
    jar.userData.interact = () => {
      if (jar.userData.flying) return;
      jar.userData.flying = true;
      jar.userData.from = jar.position.clone();
      packed++;
      flashNote(packed < 2 ? "One jar in the box." : "Both jars packed. Wherever he goes, they go.");
      setTask(packed < 2 ? "Pack the two jars — 1 / 2" : "Read the letter on the floor");
    };
    return jar;
  });

  set.add(createAmbient(0.28));
  const lamp = set.add(createHangingLamp({ intensity: 18, angle: 0.9 }));
  lamp.position.set(0, 3, -0.6);
  set.scene.userData.noWalk.push({ minX: 0.3, maxX: 2.1, minZ: 0.4, maxZ: 1.5 }, { minX: -2.3, maxX: -0.9, minZ: -1.9, maxZ: -0.5 });

  let letter = null;
  set.onUpdate((time, delta) => {
    for (const jar of jars) {
      if (!jar.userData.flying || jar.userData.fly >= 1) continue;
      // a little arc into the box, then it disappears inside
      jar.userData.fly = Math.min(1, jar.userData.fly + delta / 0.9);
      const k = jar.userData.fly;
      jar.position.lerpVectors(jar.userData.from, target, k);
      jar.position.y += Math.sin(k * Math.PI) * 0.4;
      if (k >= 1) jar.visible = false;
    }
    // the hospital's letter appears once both jars are packed
    letter ??= clueObject(set.scene, "fired");
    if (letter) letter.visible = packed >= 2;
    boxes.rotation.y = packed >= 2 ? Math.sin(time * 20) * 0.003 : 0;
  });
  return set;
}
