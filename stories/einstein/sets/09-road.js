// Chapter 9 — 1997: an 84-year-old Harvey crosses America in a Buick, the brain in the trunk.
// Trick: the car does not move! The ROAD moves under it (texture offset) and the poles slide past.

import * as THREE from "three";
import { createSet } from "../../../src/world/set.js";
import { placeModel } from "../../../src/world/models.js";
import { getTexture } from "../../../src/assets/loader.js";
import { placeCharacter } from "../../../src/characters/cast.js";
import { createAmbient, createMoonlight, createHeadlights } from "../../../src/lights/lamps.js";

const SPEED = 14; // metres per second

function ground(width, length, texture) {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, length), new THREE.MeshLambertMaterial({ map: texture }));
  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true;
  return mesh;
}

export function buildRoad() {
  const set = createSet({ background: "#0a0a12", fog: [15, 80], dust: false });

  // desert and road (one road texture = 5 m, so 200 m of road = 40 repeats)
  const desert = set.add(ground(300, 300, getTexture("sand", 40, 40)));
  desert.position.y = -0.01;
  const roadTexture = getTexture("asphalt-road", 1, 40);
  set.add(ground(6, 200, roadTexture));

  // night sky far away (fog: false so the fog does not hide it) and the moon
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(300, 120), new THREE.MeshBasicMaterial({ map: getTexture("night-sky"), fog: false }));
  sky.position.set(0, 30, -85);
  set.add(sky);
  const moon = new THREE.Mesh(new THREE.SphereGeometry(4, 24, 16), new THREE.MeshBasicMaterial({ color: "#f4ecd8", fog: false }));
  moon.position.set(-30, 26, -80);
  set.add(moon);

  // telephone poles every 12.5 m
  const poles = [];
  for (let i = 0; i < 16; i++) poles.push(placeModel(set, "telephone-pole", 5, -100 + i * 12.5));

  // the car, with Michael Paterniti driving and Harvey next to him (smaller: they are sitting)
  const car = placeModel(set, "buick", 0, 0, { info: "buick" });
  car.add(createHeadlights(60));
  placeCharacter(car, "paterniti", -0.4, 0.1, { y: 0.15, scale: 0.68 });
  placeCharacter(car, "harvey-1997", 0.4, 0.1, { y: 0.15, scale: 0.68 });
  const wheels = [];
  car.traverse((part) => part.name.startsWith("wheel") && wheels.push(part));

  set.add(createAmbient(0.7, "#8090c0", "#1a1410"));
  set.add(createMoonlight({ from: [-8, 10, 6], to: [0, 0, 0], intensity: 1.6 }));

  // INTERACTION, gate "drive": steer the Buick with the arrow keys (or by holding the mouse
  // left / right). The car slides across the road, leans into the turn, and its headlights
  // (two SpotLights) sweep across the desert and the telephone poles.
  let steer = 0;
  let drift = 0;
  let driven = 0;
  set.onUpdate((time, delta, t, ctx) => {
    const k = ctx.input.keys;
    let wanted = (k.has("ArrowRight") || k.has("d") ? 1 : 0) - (k.has("ArrowLeft") || k.has("a") ? 1 : 0);
    if (!wanted && ctx.input.down) wanted = THREE.MathUtils.clamp(ctx.input.pointer.x * 2, -1, 1);
    if (ctx.gate !== "drive") wanted = Math.sin(time * 0.4) * 0.25; // autopilot outside the game
    steer += (wanted - steer) * Math.min(1, delta * 3);
    const before = drift;
    drift = THREE.MathUtils.clamp(drift + steer * delta * 2.2, -1.6, 1.6);
    // the drive camera looks toward +z, so "right on screen" is -x in the world
    car.position.x = -drift;
    car.rotation.y = -(drift - before) / Math.max(delta, 1e-3) * 0.08;
    car.rotation.z = steer * 0.03;
    if (ctx.gate === "drive") {
      if (Math.abs(wanted) > 0.1) driven += delta;
      ctx.progress(Math.min(1, driven / 5));
      if (driven >= 5) ctx.resolve("drive");
    }

    // the car faces +z (its headlights point there), so the world slides toward -z under it
    roadTexture.offset.y += (SPEED * delta) / 5;
    for (const pole of poles) {
      pole.position.z -= SPEED * delta;
      if (pole.position.z < -100) pole.position.z += 200; // far behind: send it far ahead again
    }
    for (const wheel of wheels) wheel.rotation.x += (SPEED * delta) / 0.33; // angle = distance / radius
    car.position.y = Math.abs(Math.sin(time * 9)) * 0.015; // small bumps
  });
  return set;
}
