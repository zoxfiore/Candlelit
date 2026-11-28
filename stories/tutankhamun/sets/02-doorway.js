// Chapter 2 — The sealed doorway, 26 November 1922.
// A narrow rock corridor under the sand. At its end, a plastered wall covered in seals.
// Behind it (built for real, not faked): the antechamber, full of gold, in total darkness.
//
// INTERACTION, gate "hole": hold the mouse button: Carter chips a hole in the top-left corner.
// The hole is a real hole: the wall's alphaMap is a canvas we paint, so pixels disappear (alphaTest).
// When it is open, Carter's candle goes up to it and the gold behind starts to glow.

import * as THREE from "three";
import { createSet } from "../../../src/world/set.js";
import { createAmbient } from "../../../src/lights/lamps.js";
import { createCandle } from "../../../src/lights/candle.js";
import { placePerson } from "../../../src/characters/figure.js";
import { createRock, stoneTexture, sealedPlasterTexture, goldMaterial, warmEnvironment } from "../../../src/world/procedural.js";
import { PEOPLE } from "../people.js";

const DOOR_Z = -2.4;
const HOLE = { u: 0.22, v: 0.8 }; // top-left corner of the doorway (in 0..1 of the wall)

export function buildDoorway() {
  const set = createSet({ background: "#030202", dust: { count: 320, size: [2.4, 2.6, 6], color: "#ffcf90", opacity: 0.2 } });
  set.scene.environment = warmEnvironment();
  set.scene.environmentIntensity = 0.25;

  // ---- the corridor: rough rock, ceiling, a floor of limestone chips ----
  const rock = new THREE.MeshStandardMaterial({ map: stoneTexture("#a88058", { seed: 2, repeat: [3, 1] }), roughness: 0.95 });
  const W = 2.2, H = 2.3, L = 6.5;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, L), new THREE.MeshStandardMaterial({ map: stoneTexture("#bfa07a", { seed: 4, repeat: [1, 3] }), roughness: 1 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.z = DOOR_Z + L / 2;
  floor.receiveShadow = true;
  set.add(floor);
  for (const side of [-1, 1]) {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(0.4, H, L), rock);
    wall.position.set(side * (W / 2 + 0.2), H / 2, DOOR_Z + L / 2);
    wall.receiveShadow = true;
    set.add(wall);
  }
  const ceiling = new THREE.Mesh(new THREE.BoxGeometry(W + 0.8, 0.3, L), rock);
  ceiling.position.set(0, H + 0.15, DOOR_Z + L / 2);
  set.add(ceiling);
  for (let i = 0; i < 26; i++) {
    const chip = createRock({ size: 0.05 + Math.random() * 0.12, color: "#c8ac84", seed: 70 + i, detail: 0 });
    chip.position.set((Math.random() - 0.5) * W * 0.9, 0.03, DOOR_Z + 0.4 + Math.random() * 3);
    set.add(chip);
  }

  // ---- the sealed doorway, with a hole we can paint into its alphaMap ----
  const holeCanvas = document.createElement("canvas");
  holeCanvas.width = 256;
  holeCanvas.height = 384;
  const hg = holeCanvas.getContext("2d");
  hg.fillStyle = "#fff";
  hg.fillRect(0, 0, 256, 384);
  const alpha = new THREE.CanvasTexture(holeCanvas);
  const doorMat = new THREE.MeshStandardMaterial({ map: sealedPlasterTexture(), alphaMap: alpha, alphaTest: 0.5, roughness: 0.95, side: THREE.DoubleSide });
  const door = new THREE.Mesh(new THREE.PlaneGeometry(W, H), doorMat);
  door.position.set(0, H / 2, DOOR_Z);
  door.castShadow = door.receiveShadow = true;
  door.customDepthMaterial = new THREE.MeshDepthMaterial({ alphaMap: alpha, alphaTest: 0.5 });
  door.customDistanceMaterial = new THREE.MeshDistanceMaterial({ alphaMap: alpha, alphaTest: 0.5 });
  set.add(door);
  const paintHole = (r) => {
    // ragged edge: many small circles around the centre
    hg.fillStyle = "#000";
    const cx = HOLE.u * 256, cy = (1 - HOLE.v) * 384;
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      const rr = r * (0.75 + 0.25 * Math.sin(i * 7.3));
      hg.beginPath();
      hg.arc(cx + Math.cos(a) * rr * 0.4, cy + Math.sin(a) * rr * 0.4, rr * 0.7, 0, 7);
      hg.fill();
    }
    alpha.needsUpdate = true;
  };
  const holeWorld = new THREE.Vector3((HOLE.u - 0.5) * W, HOLE.v * H, DOOR_Z);

  // ---- the antechamber behind it: gold in the dark ----
  const room = new THREE.Group();
  room.position.z = DOOR_Z - 0.01;
  set.add(room);
  const backRock = new THREE.MeshStandardMaterial({ color: "#6a4e34", roughness: 1, side: THREE.BackSide });
  const chamber = new THREE.Mesh(new THREE.BoxGeometry(6, H + 0.4, 3.4), backRock);
  chamber.position.set(0, H / 2, -1.7);
  room.add(chamber);
  const gold = goldMaterial();
  const darkWood = new THREE.MeshStandardMaterial({ color: "#2a1a10", roughness: 0.6 });
  // three gilded ritual couches (box beds with animal heads), chests, statues
  for (const [x, z] of [[-1.6, -1.6], [0.2, -2.2], [1.8, -1.6]]) {
    const couch = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.12, 0.5), gold);
    couch.position.set(x, 0.75, z);
    room.add(couch);
    for (const sx of [-0.65, 0.65]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.75, 0.08), gold);
      leg.position.set(x + sx, 0.37, z);
      room.add(leg);
    }
    const head = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.45, 5), gold);
    head.position.set(x - 0.75, 1.05, z);
    head.rotation.z = 0.5;
    room.add(head);
  }
  for (const [x, z, s] of [[-0.8, -0.9, 0.5], [0.9, -0.8, 0.4], [-2.2, -0.7, 0.45], [1.4, -2.5, 0.6]]) {
    const chest = new THREE.Mesh(new THREE.BoxGeometry(s, s * 0.7, s * 0.6), x > 0 ? gold : darkWood);
    chest.position.set(x, s * 0.35, z);
    room.add(chest);
    const lid = new THREE.Mesh(new THREE.BoxGeometry(s * 1.05, 0.05, s * 0.65), gold);
    lid.position.set(x, s * 0.72, z);
    room.add(lid);
  }
  // the two black-and-gold guardian statues of the king
  const black = new THREE.MeshStandardMaterial({ color: "#121010", roughness: 0.35, metalness: 0.2 });
  for (const x of [-2.4, 2.4]) {
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.22, 1.5, 8), black);
    body.position.set(x, 0.95, -3);
    const kilt = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.3, 0.4, 8), gold);
    kilt.position.set(x, 0.55, -3);
    const head = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, 0.32, 8), gold);
    head.position.set(x, 1.85, -3);
    room.add(body, kilt, head);
  }
  // right in the line of sight of the hole: a gilded shrine with a golden cow-head couch beside it
  const hx = (HOLE.u - 0.5) * W;
  const shrine = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.2, 0.6), gold);
  shrine.position.set(hx - 0.1, 0.6, -1.4);
  const roof = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.62, 3, 1, false, Math.PI / 6), gold);
  roof.rotation.x = Math.PI / 2;
  roof.position.set(hx - 0.1, 1.32, -1.4);
  const statue = new THREE.Group();
  statue.position.set(hx + 0.55, 0, -1.0);
  const sBody = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.17, 1.3, 8), black);
  sBody.position.y = 0.85;
  const sKilt = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.24, 0.35, 8), gold);
  sKilt.position.y = 0.45;
  const sHead = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.16, 0.28, 8), gold);
  sHead.position.y = 1.65;
  statue.add(sBody, sKilt, sHead);
  room.add(shrine, roof, statue);
  room.traverse((o) => o.isMesh && (o.castShadow = o.receiveShadow = true));
  // the light inside: the candle held through the hole (off until the hole is open)
  const inside = new THREE.PointLight("#ffb062", 0, 8, 1.4);
  inside.position.set(holeWorld.x + 0.1, holeWorld.y - 0.1, DOOR_Z - 0.35);
  inside.castShadow = true;
  inside.shadow.mapSize.set(1024, 1024);
  set.add(inside);

  // ---- people: Carter at the door with a candle, Carnarvon and Lady Evelyn behind ----
  const carter = placePerson(set, "carter", 0.08, DOOR_Z + 0.7, { look: PEOPLE.carter, rotationY: Math.PI, pose: "raise", candle: true });
  const carnarvon = placePerson(set, "carnarvon", 0.85, DOOR_Z + 1.6, { look: PEOPLE.carnarvon, rotationY: Math.PI * 0.92 });
  const evelyn = placePerson(set, "evelyn", -0.45, DOOR_Z + 2.2, { look: PEOPLE.evelyn, rotationY: Math.PI * 1.05 });
  carnarvon.userData.lookAt = evelyn.userData.lookAt = holeWorld;
  carter.userData.lookAt = holeWorld;

  // a lantern on the floor: the only other light
  const lantern = createCandle({ height: 0.14, intensity: 1.4, distance: 6, shadows: true });
  lantern.position.set(0.75, 0, DOOR_Z + 0.6);
  set.add(lantern);
  set.add(createAmbient(0.12, "#c89868", "#100804"));
  // a small crate (Carter's notebook lies on it)
  const crate = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.42, 0.4), new THREE.MeshStandardMaterial({ color: "#7a5838", roughness: 0.9 }));
  crate.position.set(0.75, 0.21, DOOR_Z + 2.6);
  crate.castShadow = crate.receiveShadow = true;
  set.add(crate);

  let open = 0;
  let painted = 0;
  set.onUpdate((time, delta, t, ctx) => {
    const holding = ctx.gate === "hole" && ctx.input.down;
    if (holding) open = Math.min(1, open + delta / 3);
    if (ctx.done("hole")) open = Math.min(1, open + delta / 2);
    if (ctx.gate === "hole") {
      ctx.progress(open);
      if (open >= 1) ctx.resolve("hole");
    }
    // paint the hole bigger (only when it grows: painting a canvas costs a texture upload)
    const r = open * 46;
    if (r - painted > 1.5) {
      paintHole(r);
      painted = r;
    }
    // little chips fall while working, the camera trembles
    const shake = holding ? 0.004 : 0;
    ctx.rig.offset.set((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake, 0);
    // once open, hot air makes the light behind flicker, and the gold wakes up
    const k = Math.max(0, open - 0.6) / 0.4;
    inside.intensity = k * (4 + Math.sin(time * 9) * 0.6 + Math.sin(time * 23) * 0.3);
    carter.userData.act = { jolt: holding ? 0.3 : 0 };
  });
  return set;
}

