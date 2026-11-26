// Chapter 1 — Einstein's study at 112 Mercer Street, Princeton. Night.
//
// INTERACTION: the room is dark and YOU hold a candle (it follows the mouse).
// Its PointLight casts live shadows of Einstein and the furniture on the walls as you move.
// Gate "wish": bring the candle close to the note on the desk -> Einstein's last wish is found,
// the desk candle lights up and the whole room is revealed.

import * as THREE from "three";
import { createSet } from "../../../src/world/set.js";
import { createRoom } from "../../../src/world/room.js";
import { placeModel, placeWindow } from "../../../src/world/models.js";
import { placeCharacter } from "../../../src/characters/cast.js";
import { createCandle } from "../../../src/lights/candle.js";
import { createAmbient, createMoonlight } from "../../../src/lights/lamps.js";

/** a handwritten note, drawn on a canvas and used as a texture */
function createNote() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 360;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#efe2c4";
  ctx.fillRect(0, 0, 512, 360);
  ctx.fillStyle = "#3a2a1c";
  ctx.font = "italic 44px Georgia";
  ["No grave.", "No monument.", "Burn my body,", "scatter the ashes", "in secret.   — A.E."].forEach((line, i) => ctx.fillText(line, 34, 70 + i * 62));
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.9, emissive: "#ffb060", emissiveMap: texture, emissiveIntensity: 0 });
  const note = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.24), material);
  note.receiveShadow = true;
  note.userData.info = "note";
  return note;
}

export function buildStudy() {
  const set = createSet({ background: "#050404" });

  // the room and the furniture
  set.add(createRoom({ width: 7, depth: 5, floorColor: "#8a5a3c", wallColor: "#8a725c" }));
  placeModel(set, "bookshelf", -2.2, -2.25);
  placeModel(set, "chalkboard", 1.3, -2.3, { info: "chalkboard" });
  placeModel(set, "desk", -1.2, -0.9);
  placeModel(set, "chair", -1.0, -1.6);
  placeWindow(set, -3.48, 1.8, -0.4, { rotationY: Math.PI / 2, glassColor: "#26324a" });

  const note = set.add(createNote());
  note.position.set(-1.05, 0.79, -0.75);
  note.rotation.set(-Math.PI / 2 + 0.25, 0, 0.2);

  // the character
  placeCharacter(set, "einstein", 0.4, -1.1);

  // the lights: almost nothing at the start
  const ambient = set.add(createAmbient(0.09));
  const deskCandle = set.add(createCandle({ intensity: 0, shadows: true }));
  deskCandle.position.set(-1.5, 0.78, -0.9);
  deskCandle.visible = false;
  const moon = set.add(createMoonlight({ from: [-6, 4, -0.4], to: [0, 0, -0.8], intensity: 0.35 }));

  // the candle in YOUR hand
  const hand = set.add(createCandle({ intensity: 5.5, distance: 8, shadows: true }));
  hand.userData.noHover = true;
  hand.traverse((o) => (o.userData.noHover = true));
  const ray = new THREE.Raycaster();
  const goal = new THREE.Vector3();
  const roomMin = new THREE.Vector3(-3.1, 0.85, -2.1);
  const roomMax = new THREE.Vector3(3.1, 2.3, 2.2);
  hand.position.set(0, 1.3, 0.5);

  let search = 0; // 0..1: how long the candle has been near the note
  let reveal = 0; // 0..1: the room lights up

  set.onUpdate((time, delta, t, ctx) => {
    // 1. the hand candle follows the mouse: we shoot a ray through the mouse, find the first
    //    surface it touches (desk, wall, Einstein...) and hold the candle just in front of it
    ray.setFromCamera(ctx.input.pointer, ctx.camera);
    let distance = 2.6;
    for (const hit of ray.intersectObjects(set.scene.children, true)) {
      if (hit.object.userData.noHover || hit.object.isPoints) continue;
      distance = Math.min(distance, hit.distance - 0.3);
      break;
    }
    goal.copy(ray.ray.origin).addScaledVector(ray.ray.direction, Math.max(0.8, distance)).clamp(roomMin, roomMax);
    hand.position.lerp(goal, 1 - Math.exp(-8 * delta));

    // 2. searching: the note "answers" when the light is close to it
    const found = ctx.done("wish");
    if (!found) {
      // only while the story waits for it, so the viewer really does it themselves
      const near = ctx.gate === "wish" && hand.position.distanceTo(note.position) < 0.6;
      search = THREE.MathUtils.clamp(search + (near ? delta / 1.2 : -delta / 2), 0, 1);
      if (ctx.gate === "wish") ctx.progress(search);
      note.material.emissiveIntensity = search * 0.6;
      if (search >= 1) ctx.resolve("wish");
    }

    // 3. reveal: the desk candle catches fire, the room appears
    if (found) reveal = Math.min(1, reveal + delta / 2.5);
    const k = reveal * reveal * (3 - 2 * reveal);
    deskCandle.visible = reveal > 0;
    deskCandle.userData.baseIntensity = 5 * k;
    ambient.intensity = 0.09 + 0.35 * k;
    moon.userData.light.intensity = 0.35 + 0.4 * k;
    hand.userData.baseIntensity = 5.5 * (1 - 0.6 * k);
    note.material.emissiveIntensity = found ? 0.6 * (1 - k) + 0.04 : note.material.emissiveIntensity;
  });

  return set;
}
