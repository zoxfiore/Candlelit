// Chapter 11 — Princeton, 1998. After 43 years, Harvey brings the brain back.

import { createSet } from "../../../src/world/set.js";
import { createRoom } from "../../../src/world/room.js";
import { placeModel, placeWindow } from "../../../src/world/models.js";
import { placeCharacter } from "../../../src/characters/cast.js";
import { placePicture } from "../../../src/characters/pictures.js";
import { createAmbient, createMoonlight, createSpot } from "../../../src/lights/lamps.js";

export function buildReturn() {
  const set = createSet({ background: "#080706" });

  set.add(createRoom({ width: 7, depth: 5, floor: "tiles", floorColor: "#94948a", wallColor: "#989888" }));
  placeWindow(set, -1.6, 1.8, -2.49, { glassColor: "#8a9aaa", scale: 1.2 });
  placeModel(set, "wall-shelf", 1.6, -2.3, { y: 1.5 });
  for (const x of [1.3, 1.9]) placePicture(set, "brain-jar", x, 1.54, -2.3, { height: 0.4, info: "jar" });
  placeModel(set, "desk", 1.6, -1.6);

  placeCharacter(set, "harvey-1997-jar", -0.6, -1.0);
  placeCharacter(set, "krauss", 0.7, -1.1);

  set.add(createAmbient(0.4, "#d0c8b8"));
  // morning sun through the window
  set.add(createMoonlight({ from: [-4, 5, -8], to: [0, 0, 0], intensity: 1.2, color: "#ffe0b0" }));
  set.add(createSpot({ from: [0, 2.9, 1], to: [0, 1, -1], intensity: 10, angle: 0.7, shadows: false }));
  return set;
}
