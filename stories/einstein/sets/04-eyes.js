// Chapter 4 — Einstein's eye doctor, Henry Abrams, in a bank vault in New York.

import { createSet } from "../../../src/world/set.js";
import { createRoom } from "../../../src/world/room.js";
import { placeModel } from "../../../src/world/models.js";
import { placeCharacter } from "../../../src/characters/cast.js";
import { createAmbient, createHangingLamp } from "../../../src/lights/lamps.js";

export function buildEyes() {
  const set = createSet({ background: "#060505" });

  set.add(createRoom({ width: 6, depth: 4.5, height: 3, floor: "checker-floor", wall: "bricks" }));
  placeModel(set, "safe-deposit-wall", 0, -2.2, { y: 0.1, info: "safe" });
  placeModel(set, "table", -1.0, -0.9, { scale: 0.75 });

  placeCharacter(set, "abrams", 0.6, -0.9);

  set.add(createAmbient(0.5, "#c0a888"));
  const lamp = set.add(createHangingLamp({ intensity: 35, angle: 0.9, color: "#ffe2b0" }));
  lamp.position.set(0.2, 3, -0.8);

  // slow swing of the lamp: the shadows move on the wall
  set.onUpdate((time) => (lamp.rotation.z = Math.sin(time * 0.9) * 0.06));
  return set;
}
