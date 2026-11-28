// Chapter 8 — Berkeley, 1985: Marian Diamond counts the cells in Einstein's samples.
// Her lab, and the office next to it.
//
// First person — task: count the glial cells. Three cells glow on her board: click each one
// (it turns gold and the count goes up). Then the board itself can be read.

import * as THREE from "three";
import { createSet } from "../../../src/world/set.js";
import { placeModel, placeWindow } from "../../../src/world/models.js";
import { placeCharacter } from "../../../src/characters/cast.js";
import { placePicture } from "../../../src/characters/pictures.js";
import { createAmbient, createSpot, createMoonlight } from "../../../src/lights/lamps.js";
import { createLayout } from "../../../src/world/layout.js";
import { furnishRoom } from "../../../src/world/furnish.js";
import { createMicroscope, createSink } from "../../../src/world/props2.js";
import { createPapers, createBooks } from "../../../src/world/props.js";
import { clueObject } from "../../../src/world/evidence.js";
import { tick } from "../../../src/audio/synth.js";
import { flashNote, setTask } from "../../../src/ui/task.js";

export function buildDiamond() {
  const set = createSet({ background: "#060606" });
  createLayout(set, {
    rooms: [
      { x0: -3.5, x1: 3.5, z0: -2.5, z1: 5, wallColor: "#76807a", floorColor: "#6a5844", lampIntensity: 1.4 },
      { x0: -6.5, x1: -3.5, z0: -2.5, z1: 5, wallColor: "#6e7872", floor: "tiles", floorColor: "#8a8a80", theme: "lab", furnish: furnishRoom },
      { x0: 3.5, x1: 6.5, z0: -2.5, z1: 1.5, wallColor: "#7a7a6a", floorColor: "#5a4a3a", theme: "office", furnish: furnishRoom },
      { x0: 3.5, x1: 8, z0: 1.5, z1: 5, wallColor: "#6a7068", floorColor: "#5a4a3a", theme: "dining", furnish: furnishRoom },
    ],
    doors: [{ x: -3.5, z: 3.5 }, { x: 3.5, z: -0.5 }, { x: 4.5, z: 1.5 }],
    windows: [{ x: -2.0, z: -2.5 }, { x: -6.5, z: 1.0 }, { x: 8, z: 3.2 }],
  });

  placeModel(set, "bookshelf", 2.5, -2.25, { scale: 0.9 });
  placeModel(set, "table", 0.9, -0.6, { scale: 0.85 });
  placeModel(set, "lab-bench", -2.85, 1.4, { rotationY: Math.PI / 2 });
  const board = placePicture(set, "glial-board", 0.7, 1.0, -2.45, { height: 1.2, info: "glia", glow: 0.25 });
  const ms = createMicroscope();
  ms.scale.setScalar(1.5);
  ms.position.set(1.05, 0.66, -0.6);
  set.add(ms);
  const sink = createSink();
  sink.position.set(-2.72, 0, -1.5);
  sink.rotation.y = Math.PI / 2;
  set.add(sink);
  const p = createPapers(7, { seed: 81, spread: 0.2 });
  p.position.set(0.6, 0.665, -0.5);
  set.add(p);
  const books = createBooks(0.5, { seed: 83 });
  books.position.set(-2.85, 0.9, 1.0);
  books.rotation.y = Math.PI / 2;
  set.add(books);

  placeCharacter(set, "diamond", -0.6, -1.4);

  set.add(createAmbient(0.38, "#c8c0b0"));
  set.add(createSpot({ from: [0.2, 2.9, 0.6], to: [0.3, 1.2, -2.2], intensity: 20, angle: 0.6 }));
  set.add(createMoonlight({ from: [-3, 4, -6], to: [0, 0, 0], intensity: 0.4 }));
  set.scene.userData.noWalk.push({ minX: 0.2, maxX: 1.6, minZ: -1.2, maxZ: 0.0 }, { minX: -3.5, maxX: -2.3, minZ: 0.3, maxZ: 2.5 });

  // three glowing cells in front of the board
  let counted = 0;
  // three samples to count, in three different rooms: the lab bay, the office, the seminar room
  const cells = [[-5, 0.905, -1.5], [5.3, 0.79, -1.5], [5.75, 0.78, 3.25]].map(([x, y, z]) => {
    const mat = new THREE.MeshStandardMaterial({ color: "#c060ff", emissive: "#a040ff", emissiveIntensity: 0.8 });
    const cell = new THREE.Mesh(new THREE.SphereGeometry(0.03, 14, 10), mat);
    cell.position.set(x, y + 0.03, z);
    const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.015, 24, 1, true), new THREE.MeshStandardMaterial({ color: "#d8f0f0", transparent: true, opacity: 0.4, roughness: 0.05 }));
    dish.position.y = -0.022;
    cell.add(dish);
    cell.add(new THREE.Mesh(new THREE.SphereGeometry(0.11, 6, 4), new THREE.MeshBasicMaterial({ visible: false }))); // easy to click
    cell.userData.interact = () => {
      if (cell.userData.done) return;
      cell.userData.done = true;
      mat.color.set("#ffc060");
      mat.emissive.set("#ffa020");
      counted++;
      tick(0.06);
      setTask(counted < 3 ? `Count the glial cells: ${counted} / 3` : "Read Marian Diamond's board");
      if (counted === 3) flashNote("More glial cells than in the other brains she studied.");
    };
    set.add(cell);
    return cell;
  });

  let clue = null;
  set.onUpdate((time) => {
    cells.forEach((c, i) => {
      if (!c.userData.done) c.material.emissiveIntensity = 0.6 + 0.4 * Math.sin(time * 4 + i * 2);
    });
    // the board can only be read once the three cells are counted
    clue ??= clueObject(set.scene, "glia");
    if (clue) {
      if (counted < 3) clue.userData.interact ??= () => flashNote("Count the glowing cells first.");
      else delete clue.userData.interact;
    }
  });
  board.userData.info = "glia";
  return set;
}
