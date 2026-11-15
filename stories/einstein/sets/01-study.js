// Chapter 1 — Einstein's study at 112 Mercer Street, Princeton. Night, one candle, moonlight.

import { createSet } from "../../../src/world/set.js";
import { createRoom } from "../../../src/world/room.js";
import { placeModel, placeWindow } from "../../../src/world/models.js";
import { placeCharacter } from "../../../src/characters/cast.js";
import { createCandle } from "../../../src/lights/candle.js";
import { createAmbient, createMoonlight } from "../../../src/lights/lamps.js";

export function buildStudy() {
  const set = createSet({ background: "#080605" });

  // the room and the furniture
  set.add(createRoom({ width: 7, depth: 5, floorColor: "#8a5a3c", wallColor: "#8a725c" }));
  placeModel(set, "bookshelf", -2.2, -2.25);
  placeModel(set, "chalkboard", 1.3, -2.3, { info: "chalkboard" });
  placeModel(set, "desk", -1.2, -0.9);
  placeModel(set, "chair", -1.0, -1.6);
  placeWindow(set, -3.48, 1.8, -0.4, { rotationY: Math.PI / 2, glassColor: "#26324a" });

  // the character
  placeCharacter(set, "einstein", 0.4, -1.1);

  // the lights
  set.add(createAmbient(0.6));
  const candle = set.add(createCandle({ intensity: 8, shadows: true }));
  candle.position.set(-1.5, 0.78, -0.9);
  set.add(createMoonlight({ from: [-6, 4, -0.4], to: [0, 0, -0.8], intensity: 1.0 }));

  return set;
}
