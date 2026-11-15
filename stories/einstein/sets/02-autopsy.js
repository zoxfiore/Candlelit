// Chapter 2 — The autopsy room of Princeton Hospital. Cold tiles, one hanging lamp.

import { createSet } from "../../../src/world/set.js";
import { createRoom } from "../../../src/world/room.js";
import { placeModel } from "../../../src/world/models.js";
import { placeCharacter } from "../../../src/characters/cast.js";
import { createAmbient, createHangingLamp } from "../../../src/lights/lamps.js";

export function buildAutopsy() {
  const set = createSet({ background: "#050606" });

  set.add(createRoom({ width: 6, depth: 5, height: 3, floor: "tiles", floorColor: "#828a80", wall: "tiles", wallColor: "#a0ab9c" }));
  placeModel(set, "autopsy-table", -0.4, -0.7, { info: "autopsy" });
  placeModel(set, "metal-cart", -2.0, -1.2, { info: "autopsy" });
  placeModel(set, "instrument-tray", -2.0, -1.2, { y: 0.86 });

  placeCharacter(set, "harvey-1955-jar", 1.3, -1.0);

  set.add(createAmbient(0.25, "#9ab0b0", "#101414"));
  const lamp = set.add(createHangingLamp({ intensity: 40, angle: 0.8 }));
  lamp.position.set(0.2, 3, -0.8);
  return set;
}
