// Chapter 12 — Today. Slides of the brain in a glass case at the Mütter Museum, Philadelphia.

import { createSet } from "../../../src/world/set.js";
import { createRoom } from "../../../src/world/room.js";
import { placeModel } from "../../../src/world/models.js";
import { placePicture } from "../../../src/characters/pictures.js";
import { createAmbient, createSpot } from "../../../src/lights/lamps.js";

export function buildMuseum() {
  const set = createSet({ background: "#040303" });

  set.add(createRoom({ width: 7, depth: 5, height: 3.5, floor: "checker-floor", wallColor: "#56241e" }));
  placePicture(set, "portrait", 0, 1.3, -2.45, { height: 1.3, info: "portrait", glow: 0.05 });
  placeModel(set, "display-case", 0, -0.8, { info: "slides" });
  placePicture(set, "museum-plaque", 0, 0.5, -0.49, { height: 0.22, info: "slides" });

  set.add(createAmbient(0.12));
  set.add(createSpot({ from: [0, 3.4, 0.4], to: [0, 0.9, -0.8], intensity: 30, angle: 0.35, penumbra: 0.5 }));
  set.add(createSpot({ from: [0, 3.4, -1.0], to: [0, 1.9, -2.45], intensity: 18, angle: 0.35, shadows: false }));
  return set;
}
