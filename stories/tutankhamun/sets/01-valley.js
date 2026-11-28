// Chapter 1 — The Valley of the Kings, 4 November 1922, early morning.
// Low sun, long shadows on the sand, cliffs behind. In front: the sand where the first step is hidden.
//
// INTERACTION, gate "dig": hold the mouse and brush left / right: the sand pile shrinks,
// grains fly up (a Points burst), and the stone steps appear, going down into the dark.

import * as THREE from "three";
import { createSet } from "../../../src/world/set.js";
import { createAmbient, createMoonlight } from "../../../src/lights/lamps.js";
import { placePerson } from "../../../src/characters/figure.js";
import { createRock, stoneTexture, sandTexture, warmEnvironment } from "../../../src/world/procedural.js";
import { PEOPLE } from "../people.js";

const PIT = { x: 0, z: -0.9, w: 1.7, d: 3.2 }; // the stairwell cut in the ground

export function buildValley() {
  const set = createSet({ background: "#c99567", fog: [10, 30], dust: { count: 500, color: "#ffd9a0" } });
  set.scene.environment = warmEnvironment();
  set.scene.environmentIntensity = 0.4;

  // ---- the ground, with a rectangular hole for the stairwell ----
  const shape = new THREE.Shape();
  shape.moveTo(-20, -20).lineTo(20, -20).lineTo(20, 20).lineTo(-20, 20).lineTo(-20, -20);
  const hole = new THREE.Path();
  // the shape is in x / y, then laid flat: y becomes -z
  hole.moveTo(PIT.x - PIT.w / 2, -(PIT.z + PIT.d / 2));
  hole.lineTo(PIT.x + PIT.w / 2, -(PIT.z + PIT.d / 2));
  hole.lineTo(PIT.x + PIT.w / 2, -(PIT.z - PIT.d / 2));
  hole.lineTo(PIT.x - PIT.w / 2, -(PIT.z - PIT.d / 2));
  shape.holes.push(hole);
  const groundGeo = new THREE.ShapeGeometry(shape, 1);
  groundGeo.rotateX(-Math.PI / 2);
  // UVs from the position, so the sand texture keeps its size
  const uv = groundGeo.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, groundGeo.attributes.position.getX(i) / 3, groundGeo.attributes.position.getZ(i) / 3);
  const sandMap = sandTexture();
  const ground = new THREE.Mesh(groundGeo, new THREE.MeshStandardMaterial({ map: sandMap, color: "#ffffff", roughness: 1 }));
  ground.receiveShadow = true;
  set.add(ground);

  // ---- the stairwell: rock walls and 16 steps going down (toward -z) ----
  const rockMat = new THREE.MeshStandardMaterial({ map: stoneTexture("#b88a5c", { seed: 5, repeat: [2, 1] }), roughness: 0.95 });
  const depth = 2.6;
  for (const side of [-1, 1]) {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(0.3, depth, PIT.d), rockMat);
    wall.position.set(PIT.x + side * (PIT.w / 2 + 0.15), -depth / 2, PIT.z);
    wall.receiveShadow = true;
    set.add(wall);
  }
  const back = new THREE.Mesh(new THREE.BoxGeometry(PIT.w, depth, 0.3), rockMat);
  back.position.set(PIT.x, -depth / 2, PIT.z - PIT.d / 2 - 0.15);
  set.add(back);
  const steps = new THREE.Group();
  const stepMat = new THREE.MeshStandardMaterial({ map: stoneTexture("#c99d6a", { seed: 9 }), roughness: 0.9 });
  const N = 16;
  for (let i = 0; i < N; i++) {
    const step = new THREE.Mesh(new THREE.BoxGeometry(PIT.w, 0.16, PIT.d / N + 0.02), stepMat);
    step.position.set(PIT.x, -0.08 - i * (depth - 0.2) / N, PIT.z + PIT.d / 2 - (i + 0.5) * (PIT.d / N));
    step.castShadow = step.receiveShadow = true;
    steps.add(step);
  }
  set.add(steps);
  // darkness at the bottom: a black "door" the light cannot reach
  const dark = new THREE.Mesh(new THREE.PlaneGeometry(PIT.w, 1.6), new THREE.MeshBasicMaterial({ color: "#000" }));
  dark.position.set(PIT.x, -depth + 0.8, PIT.z - PIT.d / 2 + 0.01);
  set.add(dark);

  // in first person you can't walk over the stairwell
  set.scene.userData.noWalk = [{ minX: PIT.x - PIT.w / 2 - 0.3, maxX: PIT.x + PIT.w / 2 + 0.3, minZ: PIT.z - PIT.d / 2 - 0.3, maxZ: PIT.z + PIT.d / 2 + 0.3 }];

  // ---- the sand that hides it: a big pile filling the hole (shrinks when you dig) ----
  const pileGeo = new THREE.SphereGeometry(1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  const pile = new THREE.Mesh(pileGeo, new THREE.MeshStandardMaterial({ map: sandTexture({ seed: 23, repeat: [2, 2] }), color: "#f0dcc0", roughness: 1 }));
  pile.scale.set(PIT.w * 0.72, 0.45, PIT.d * 0.62);
  pile.position.set(PIT.x, -0.05, PIT.z);
  pile.castShadow = pile.receiveShadow = true;
  set.add(pile);

  // ---- the valley: cliffs of faceted rock, rubble, old workmen's huts ----
  const cliffColors = ["#b07a4a", "#a06c40", "#bd8a57"];
  for (let i = 0; i < 16; i++) {
    const rock = createRock({ size: 2.2 + (i % 4) * 0.8, color: cliffColors[i % 3], seed: i + 1, squash: 1.3 });
    rock.position.set(-14 + i * 1.9, 0.8 + (i % 3) * 0.6, -8 - (i % 2) * 1.5);
    rock.rotation.y = i;
    set.add(rock);
  }
  for (let i = 0; i < 30; i++) {
    const stone = createRock({ size: 0.08 + Math.random() * 0.18, color: "#b68a5e", seed: 40 + i, detail: 0 });
    const a = Math.random() * Math.PI * 2, r = 1.6 + Math.random() * 3.5;
    stone.position.set(Math.cos(a) * r, 0.03, PIT.z + Math.sin(a) * r * 0.6);
    set.add(stone);
  }
  // ruins of the huts the steps were hidden under: low dry-stone walls
  const hutMat = new THREE.MeshStandardMaterial({ map: stoneTexture("#9c7650", { seed: 21, repeat: [2, 1] }), roughness: 1 });
  for (const [x, z, w, ry] of [[-2.6, -2.4, 2.2, 0.1], [-3.6, -1.2, 1.6, 1.5], [2.7, -2.6, 2.4, -0.15], [3.7, -1.3, 1.2, 1.6]]) {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(w, 0.55, 0.35), hutMat);
    wall.position.set(x, 0.27, z);
    wall.rotation.y = ry;
    wall.castShadow = wall.receiveShadow = true;
    set.add(wall);
  }
  // baskets and a pickaxe
  const basketMat = new THREE.MeshStandardMaterial({ color: "#7a5432", roughness: 1, flatShading: true });
  for (const [x, z] of [[1.5, 0.3], [1.85, 0.1], [-1.7, 0.4]]) {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.16, 0.26, 9, 1, true), basketMat);
    b.material.side = THREE.DoubleSide;
    b.position.set(x, 0.13, z);
    b.castShadow = true;
    set.add(b);
  }
  // a wooden crate (the telegram lies on it)
  const crate = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.6, 0.5), new THREE.MeshStandardMaterial({ color: "#8a6440", roughness: 0.9 }));
  crate.position.set(1.9, 0.3, 0.9);
  crate.castShadow = crate.receiveShadow = true;
  set.add(crate);

  // ---- people ----
  const carter = placePerson(set, "carter", 1.05, -0.3, { look: PEOPLE.carter, rotationY: -0.9 });
  const boy = placePerson(set, "boy", -1.25, -0.2, { look: PEOPLE.boy, rotationY: 0.8, pose: "carry" });
  const w1 = placePerson(set, "worker", -2.1, -1.6, { look: PEOPLE.worker, rotationY: 0.4, pose: "carry" });
  const w2 = placePerson(set, "worker", 2.4, -1.7, { look: PEOPLE.worker, rotationY: -0.5 });
  const pitCenter = new THREE.Vector3(PIT.x, 0, PIT.z);
  for (const p of [carter, boy, w1, w2]) p.userData.lookAt = pitCenter;

  // ---- light: a low morning sun (long shadows), warm sky light ----
  set.add(createAmbient(1.1, "#ffe0b8", "#7a5030"));
  const sun = createMoonlight({ from: [-6, 3.2, 3], to: [0, 0, -1], intensity: 2.4, color: "#ffc27a" });
  const sunLight = sun.userData.light;
  Object.assign(sunLight.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7 });
  sunLight.shadow.mapSize.set(2048, 2048);
  set.add(sun);

  // ---- digging: sand grains flying (a small Points burst, recycled) ----
  const GRAINS = 140;
  const grainGeo = new THREE.BufferGeometry();
  const gp = new Float32Array(GRAINS * 3);
  const gv = new Float32Array(GRAINS * 3);
  const life = new Float32Array(GRAINS);
  grainGeo.setAttribute("position", new THREE.BufferAttribute(gp, 3));
  const grains = new THREE.Points(grainGeo, new THREE.PointsMaterial({ color: "#e8c08a", size: 0.035, transparent: true, opacity: 0.9, depthWrite: false }));
  grains.frustumCulled = false;
  set.add(grains);
  let next = 0;
  const spray = (n) => {
    for (let k = 0; k < n; k++) {
      const i = next++ % GRAINS;
      gp.set([PIT.x + (Math.random() - 0.5) * PIT.w, 0.15, PIT.z + (Math.random() - 0.5) * PIT.d * 0.8], i * 3);
      gv.set([(Math.random() - 0.5) * 2.2, 1 + Math.random() * 1.6, (Math.random() - 0.3) * 1.2], i * 3);
      life[i] = 1;
    }
  };

  let dug = 0;
  let lastX = 0;
  set.onUpdate((time, delta, t, ctx) => {
    const digging = ctx.gate === "dig" && ctx.input.down;
    if (digging) {
      const moved = Math.abs(ctx.input.pointer.x - lastX);
      dug = Math.min(1, dug + moved * 0.55 + delta * 0.05);
      if (moved > 0.002) spray(3);
      carter.userData.pose = "point";
    }
    lastX = ctx.input.pointer.x;
    if (ctx.done("dig")) dug = Math.min(1, dug + delta * 0.5); // finish by itself
    if (ctx.gate === "dig") {
      ctx.progress(dug);
      if (dug >= 1) ctx.resolve("dig");
    }
    // the pile sinks and spreads, then disappears
    const k = dug * dug * (3 - 2 * dug);
    pile.scale.y = 0.45 * (1 - k) + 0.001;
    pile.position.y = -0.05 - k * 0.3;
    pile.visible = k < 0.999;
    if (dug >= 1 && carter.userData.pose === "point") carter.userData.pose = "idle";
    // grains: simple physics (gravity), then they fade
    for (let i = 0; i < GRAINS; i++) {
      if (life[i] <= 0) {
        gp[i * 3 + 1] = -50;
        continue;
      }
      life[i] -= delta * 0.9;
      gv[i * 3 + 1] -= 6 * delta;
      for (let a = 0; a < 3; a++) gp[i * 3 + a] += gv[i * 3 + a] * delta;
    }
    grainGeo.attributes.position.needsUpdate = true;
  });
  return set;
}
