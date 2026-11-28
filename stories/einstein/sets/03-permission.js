// Chapter 3 — Princeton, April 1955: Einstein's son, Hans Albert, learns the truth from the newspapers.
// A sitting room, and the hallway beyond it.
//
// First person — task: the telephone is RINGING (it is Harvey, asking for permission).
// Answer it, then read the morning paper on the table.

import * as THREE from "three";
import { createSet } from "../../../src/world/set.js";
import { placeModel } from "../../../src/world/models.js";
import { placeCharacter } from "../../../src/characters/cast.js";
import { placePicture } from "../../../src/characters/pictures.js";
import { createCandle } from "../../../src/lights/candle.js";
import { createAmbient, createSpot } from "../../../src/lights/lamps.js";
import { createLayout } from "../../../src/world/layout.js";
import { furnishRoom } from "../../../src/world/furnish.js";
import { createRug, createClock, createStandingLamp } from "../../../src/world/props.js";
import { ring } from "../../../src/audio/synth.js";
import { clueObject } from "../../../src/world/evidence.js";
import { flashNote, setTask } from "../../../src/ui/task.js";

export function buildPermission() {
  const set = createSet({ background: "#050505" });
  createLayout(set, {
    rooms: [
      { x0: -3, x1: 3, z0: -2.5, z1: 4.8, wallColor: "#646a58", floorColor: "#5a3a26", lampIntensity: 1.2 },
      { x0: 3, x1: 7, z0: -2.5, z1: 1.5, wallColor: "#5e5a48", floorColor: "#5a3a26", theme: "dining", furnish: furnishRoom },
      { x0: 3, x1: 5, z0: 1.5, z1: 4.8, wallColor: "#585446", floorColor: "#4a3222", theme: "hall", furnish: furnishRoom },
      { x0: -6.5, x1: -3, z0: -2.5, z1: 1.5, wallColor: "#5a5e6a", floorColor: "#5a3a26", theme: "home", furnish: furnishRoom },
    ],
    doors: [{ x: 3, z: -0.5 }, { x: 4, z: 1.5 }, { x: -3, z: 0.0 }],
    windows: [{ x: -1.6, z: -2.5 }, { x: 7, z: -0.5 }, { x: -6.5, z: -0.5 }],
  });

  placeModel(set, "bookshelf", 1.8, -2.25, { scale: 0.85 });
  placeModel(set, "table", 0.8, -0.6, { scale: 0.75 });
  placeModel(set, "telephone", 1.1, -0.6, { y: 0.585 }); // (in the film)
  placePicture(set, "newspaper", 0.6, 0.585, -0.7, { height: 0.6, rotationY: 0.25, info: "newspaperFilm" });
  // first person: the phone that rings is in the hall, the paper to read is on the dining table
  const phone = placeModel(set, "telephone", 4.7, 3.15, { y: 0.82, rotationY: -Math.PI / 2, info: "telephone" });
  placePicture(set, "newspaper", 5.1, 0.775, -0.5, { height: 0.5, rotationY: -0.3, info: "newspaper" });
  placeModel(set, "sofa", -1.6, 1.8, { rotationY: Math.PI / 2 });
  const rug = createRug(2.4, 1.8);
  rug.position.set(0, 0, 0.6);
  set.add(rug);
  const clock = createClock();
  clock.position.set(-2.75, 0, -1.4);
  clock.rotation.y = Math.PI / 2;
  set.add(clock);
  const lamp = createStandingLamp({ intensity: 1.6 });
  lamp.position.set(-2.4, 0, 3.2);
  lamp.userData.light.castShadow = false;
  set.add(lamp);

  placeCharacter(set, "hans-albert", -0.8, -1.2);

  set.add(createAmbient(0.32));
  const candle = set.add(createCandle({ intensity: 2.5 }));
  candle.position.set(0.35, 0.585, -0.45);
  set.add(createSpot({ from: [0.5, 2.9, 0.8], to: [-0.4, 0.8, -1], intensity: 14, angle: 0.6 }));
  set.scene.userData.noWalk.push({ minX: 0.2, maxX: 1.4, minZ: -1.1, maxZ: -0.1 });

  // the task: the phone rings until you answer it; the newspaper can be read after
  let answered = false;
  let nextRing = 0;
  phone.userData.interact = () => {
    if (answered) return;
    answered = true;
    flashNote("“Dr. Harvey speaking... about your father's brain.”");
    setTask("Read the morning paper");
  };
  let paper = null;
  set.onUpdate((time, delta, t, ctx) => {
    const fp = document.body.classList.contains("first-person");
    if (fp && !answered && time > nextRing) {
      ring();
      nextRing = time + 3;
    }
    // the phone shakes a little while it rings
    phone.rotation.z = fp && !answered && (time % 3) < 1 ? Math.sin(time * 60) * 0.02 : 0;
    // the newspaper can only be read once the phone is answered
    paper ??= clueObject(set.scene, "newspaper");
    if (paper) {
      if (!answered) paper.userData.interact ??= () => flashNote("The telephone is ringing...");
      else delete paper.userData.interact;
    }
  });
  return set;
}

