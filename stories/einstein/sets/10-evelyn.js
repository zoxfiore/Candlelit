// Chapter 10 — Berkeley, 1997. The road trip ends at Evelyn Einstein's house.

import { createSet } from "../../../src/world/set.js";
import { createRoom } from "../../../src/world/room.js";
import { placeModel, placeWindow } from "../../../src/world/models.js";
import { placeCharacter } from "../../../src/characters/cast.js";
import { createCandle } from "../../../src/lights/candle.js";
import { createAmbient, createSpot } from "../../../src/lights/lamps.js";

export function buildEvelyn() {
  const set = createSet({ background: "#070506" });

  set.add(createRoom({ width: 7, depth: 5, floorColor: "#6a4632", wallColor: "#76586a" }));
  placeModel(set, "sofa", 0.4, -2.0);
  placeWindow(set, -1.6, 1.9, -2.49, { glassColor: "#2a2a3a" });
  placeModel(set, "bookshelf", 2.6, -2.25, { scale: 0.85 });
  placeModel(set, "coffee-table", 0.1, -0.9);

  placeCharacter(set, "evelyn", 1.1, -1.2);
  placeCharacter(set, "harvey-1997-box", -0.8, -1.0);
  placeCharacter(set, "paterniti", -2.0, -1.6);

  set.add(createAmbient(0.3));
  const candle = set.add(createCandle({ intensity: 2.5 }));
  candle.position.set(0.3, 0.45, -0.85);
  set.add(createSpot({ from: [0.2, 2.9, 0.8], to: [0.2, 0.9, -1.2], intensity: 18, angle: 0.7 }));
  return set;
}
