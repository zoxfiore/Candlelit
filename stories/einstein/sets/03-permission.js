// Chapter 3 — The news breaks. Hans Albert, Einstein's son, gives permission after the fact.

import { createSet } from "../../../src/world/set.js";
import { createRoom } from "../../../src/world/room.js";
import { placeModel, placeWindow } from "../../../src/world/models.js";
import { placeCharacter } from "../../../src/characters/cast.js";
import { placePicture } from "../../../src/characters/pictures.js";
import { createCandle } from "../../../src/lights/candle.js";
import { createAmbient, createSpot } from "../../../src/lights/lamps.js";

export function buildPermission() {
  const set = createSet({ background: "#070605" });

  set.add(createRoom({ width: 6, depth: 5, floorColor: "#5a3a26", wallColor: "#646a58" }));
  placeModel(set, "bookshelf", 1.8, -2.25, { scale: 0.85 });
  placeWindow(set, -1.2, 1.8, -2.49, { glassColor: "#1c2434" });
  placeModel(set, "table", 0.8, -0.6, { scale: 0.75 });
  placeModel(set, "telephone", 1.1, -0.6, { y: 0.585, info: "telephone" });
  placePicture(set, "newspaper", 0.6, 0.585, -0.7, { height: 0.6, rotationY: 0.25, info: "newspaper" });

  placeCharacter(set, "hans-albert", -0.8, -1.2);

  set.add(createAmbient(0.3));
  const candle = set.add(createCandle({ intensity: 2.5 }));
  candle.position.set(0.35, 0.585, -0.45);
  set.add(createSpot({ from: [0.5, 2.9, 0.8], to: [-0.4, 0.8, -1], intensity: 14, angle: 0.6 }));
  return set;
}
