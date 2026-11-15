// Chapter 8 — Berkeley, 1985. Marian Diamond counts the cells of four small pieces.

import { createSet } from "../../../src/world/set.js";
import { createRoom } from "../../../src/world/room.js";
import { placeModel, placeWindow } from "../../../src/world/models.js";
import { placeCharacter } from "../../../src/characters/cast.js";
import { placePicture } from "../../../src/characters/pictures.js";
import { createAmbient, createSpot, createMoonlight } from "../../../src/lights/lamps.js";

export function buildDiamond() {
  const set = createSet({ background: "#060606" });

  set.add(createRoom({ width: 7, depth: 5, floorColor: "#6a5844", wallColor: "#76807a" }));
  placeWindow(set, -2.4, 1.8, -2.49, { glassColor: "#4a5a6a" });
  placeModel(set, "bookshelf", 2.5, -2.25, { scale: 0.9 });
  placeModel(set, "table", 0.9, -0.6, { scale: 0.85 });
  // the chalk diagram hangs on the back wall
  placePicture(set, "glial-board", 0.7, 1.0, -2.45, { height: 1.2, info: "glia", glow: 0.25 });
  placePicture(set, "microscope", 1.1, 0.66, -0.6, { height: 0.48, info: "microscope", faceCamera: true });

  placeCharacter(set, "diamond", -0.6, -1.4);

  set.add(createAmbient(0.35, "#c8c0b0"));
  set.add(createSpot({ from: [0.2, 2.9, 0.6], to: [0.3, 1.2, -2.2], intensity: 20, angle: 0.6 }));
  set.add(createMoonlight({ from: [-5, 4, -4], to: [0, 0, -1], intensity: 0.6, color: "#c8d0e0" }));
  return set;
}
