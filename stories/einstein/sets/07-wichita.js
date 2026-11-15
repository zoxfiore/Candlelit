// Chapter 7 — Wichita, Kansas, 1978. A journalist finds the brain in a cider box under a beer cooler.

import { createSet } from "../../../src/world/set.js";
import { createRoom } from "../../../src/world/room.js";
import { placeModel, placeWindow } from "../../../src/world/models.js";
import { placeCharacter } from "../../../src/characters/cast.js";
import { createAmbient, createSpot, createMoonlight } from "../../../src/lights/lamps.js";

export function buildWichita() {
  const set = createSet({ background: "#070605" });

  set.add(createRoom({ width: 7, depth: 5, floorColor: "#7c5e44", wallColor: "#988866" }));
  placeWindow(set, -1.5, 1.9, -2.49, { glassColor: "#5a4a30" });
  placeModel(set, "desk", -0.4, -1.4);
  placeModel(set, "chair", -0.5, -2.0);
  placeModel(set, "beer-cooler", 1.6, -1.4, { info: "cooler" });
  placeModel(set, "cider-box", 1.6, -1.4, { info: "ciderBox" }); // hidden UNDER the cooler

  placeCharacter(set, "harvey-1978", 0.7, -1.2);
  placeCharacter(set, "levy", -1.4, -0.5);

  set.add(createAmbient(0.35, "#d0b890"));
  set.add(createSpot({ from: [0.5, 2.9, 0.5], to: [0.6, 0.4, -1.3], intensity: 22, angle: 0.65 }));
  // late afternoon sun through the window: warm, low, long shadows
  set.add(createMoonlight({ from: [-3, 3, -6], to: [0.5, 0, -0.5], intensity: 0.8, color: "#ffc080" }));
  return set;
}
