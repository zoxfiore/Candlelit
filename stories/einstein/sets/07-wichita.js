// Chapter 7 — Wichita, Kansas, 1978. A journalist finds the brain in a cider box under a beer cooler.

import * as THREE from "three";
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
  const cooler = placeModel(set, "beer-cooler", 1.6, -1.4, { info: "cooler" });
  const box = placeModel(set, "cider-box", 1.6, -1.4, { info: "ciderBox" }); // hidden UNDER the cooler

  const harvey = placeCharacter(set, "harvey-1978", 0.7, -1.2);
  const levy = placeCharacter(set, "levy", -1.4, -0.5);

  // a pale greenish light INSIDE the box: off until the box is found
  const glow = new THREE.PointLight("#c8ffb0", 0, 3, 2);
  glow.position.set(1.6, 0.35, -1.25);
  glow.castShadow = true;
  glow.shadow.mapSize.set(512, 512);
  set.add(glow);

  set.add(createAmbient(0.35, "#d0b890"));
  set.add(createSpot({ from: [0.5, 2.9, 0.5], to: [0.6, 0.4, -1.3], intensity: 22, angle: 0.65 }));
  // late afternoon sun through the window: warm, low, long shadows
  set.add(createMoonlight({ from: [-3, 3, -6], to: [0.5, 0, -0.5], intensity: 0.8, color: "#ffc080" }));

  // INTERACTION, gate "box": click the cooler (or the box) -> the cooler slides away,
  // the box rises and its glow lights Harvey and Levy from below.
  const ray = new THREE.Raycaster();
  let open = 0;
  set.onUpdate((time, delta, t, ctx) => {
    if (ctx.gate === "box" && ctx.input.clicked) {
      ray.setFromCamera(ctx.input.pointer, ctx.camera);
      if (ray.intersectObjects([cooler, box], true).length) ctx.resolve("box");
    }
    if (ctx.done("box")) open = Math.min(1, open + delta / 1.8);
    const k = open * open * (3 - 2 * open);
    cooler.position.x = 1.6 + 0.9 * k;
    cooler.rotation.y = -0.35 * k;
    box.position.z = -1.4 + 0.35 * k;
    box.position.y = Math.sin(Math.min(1, open * 1.5) * Math.PI) * 0.06;
    glow.position.z = box.position.z + 0.15;
    glow.intensity = k * (1.3 + Math.sin(time * 3) * 0.15);
    // both men flinch when the box comes out
    const jolt = Math.max(0, Math.sin(open * Math.PI)) * 0.6;
    harvey.userData.act = levy.userData.act = { jolt };
  });
  return set;
}
