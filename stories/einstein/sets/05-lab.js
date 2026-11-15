// Chapter 5 — A lab in Philadelphia: the brain is cut into 240 blocks.
// The blocks appear one by one while the user scrolls (InstancedMesh.count).

import { createSet } from "../../../src/world/set.js";
import { createRoom } from "../../../src/world/room.js";
import { placeModel, placeWindow } from "../../../src/world/models.js";
import { createBrainBlocks } from "../../../src/world/brainBlocks.js";
import { placeCharacter } from "../../../src/characters/cast.js";
import { placePicture } from "../../../src/characters/pictures.js";
import { createCandle } from "../../../src/lights/candle.js";
import { createAmbient, createSpot, createMoonlight } from "../../../src/lights/lamps.js";

export function buildLab() {
  const set = createSet({ background: "#060606" });

  set.add(createRoom({ width: 7, depth: 5, floor: "tiles", floorColor: "#72726a", wallColor: "#958a7a" }));
  placeWindow(set, -2.0, 1.9, -2.49, { glassColor: "#22304a" });
  placeModel(set, "wall-shelf", 1.4, -2.3, { y: 1.5 });
  for (const x of [0.9, 1.4, 1.9]) placePicture(set, "brain-jar", x, 1.54, -2.3, { height: 0.4, info: "jar" });
  placeModel(set, "lab-bench", 0, -0.8);

  placeCharacter(set, "harvey-1955", 0.1, -1.7);
  placePicture(set, "microscope", 1.0, 0.8, -0.55, { height: 0.48, info: "microscope", faceCamera: true });

  const blocks = set.add(createBrainBlocks(240));
  blocks.position.set(-0.3, 0.8, -0.8);
  blocks.userData.info = "blocks";

  set.add(createAmbient(0.3));
  const candle = set.add(createCandle({ intensity: 2 }));
  candle.position.set(-1.15, 0.8, -0.6);
  set.add(createSpot({ from: [-0.3, 2.9, 0.2], to: [-0.3, 0.8, -0.8], intensity: 25, angle: 0.5 }));
  set.add(createMoonlight({ from: [-3, 4, -6], to: [0, 0, 0], intensity: 0.35 }));

  // 0 blocks at the start of the chapter, all 240 at 60% of it
  set.onUpdate((time, delta, t) => {
    blocks.count = Math.round(240 * Math.min(1, Math.max(0, (t - 0.1) / 0.5)));
  });
  return set;
}
