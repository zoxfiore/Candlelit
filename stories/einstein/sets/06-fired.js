// Chapter 6 — Harvey refuses to give the brain back, loses his job and leaves with it.

import { createSet } from "../../../src/world/set.js";
import { createRoom } from "../../../src/world/room.js";
import { placeModel } from "../../../src/world/models.js";
import { placeCharacter } from "../../../src/characters/cast.js";
import { createAmbient, createHangingLamp } from "../../../src/lights/lamps.js";

export function buildFired() {
  const set = createSet({ background: "#050404" });

  set.add(createRoom({ width: 6, depth: 4.5, height: 3, floorColor: "#4a3224", wall: "bricks" }));
  placeModel(set, "door", 1.6, -2.2); // open door, light from the corridor
  placeModel(set, "moving-boxes", -1.6, -1.2, { info: "boxes" });

  placeCharacter(set, "harvey-1960-jar", 0.2, -0.9);

  set.add(createAmbient(0.2));
  const lamp = set.add(createHangingLamp({ intensity: 30, angle: 0.9, color: "#ffd090" }));
  lamp.position.set(0, 3, -0.6);

  // a bare bulb swinging: the shadows swing too
  set.onUpdate((time) => {
    lamp.rotation.z = Math.sin(time * 1.2) * 0.12;
    lamp.rotation.x = Math.sin(time * 0.7) * 0.05;
  });
  return set;
}
