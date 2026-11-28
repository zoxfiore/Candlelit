// A candle = wax cylinder + flame (custom shader) + a warm PointLight that flickers.
//
//   const candle = createCandle({ height: 0.2, shadows: true })
//   candle.position.set(1, 0.78, 0)       // put it on a table
//   scene.add(candle)
//   candle.userData.update(time)           // every frame (the set does this for us)

import * as THREE from "three";
import { createFlameMaterial } from "../shaders/flameMaterial.js";
import { flicker } from "./flicker.js";

const CANDLE_COLOR = "#ffa456"; // warm orange-yellow light

export function createCandle({ height = 0.18, radius = 0.03, intensity = 2.5, distance = 8, shadows = false } = {}) {
  const candle = new THREE.Group();
  const seed = Math.random() * 100;

  // wax
  const wax = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius * 1.05, height, 16),
    new THREE.MeshStandardMaterial({ color: "#e8dcc4", roughness: 0.6, emissive: "#ff9a40", emissiveIntensity: 0.15 }),
  );
  wax.position.y = height / 2;
  wax.receiveShadow = true;
  candle.add(wax);

  // wick
  const wick = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.02, 4), new THREE.MeshBasicMaterial({ color: "#1a120c" }));
  wick.position.y = height + 0.01;
  candle.add(wick);

  // flame: a small plane with our shader, always turned toward the camera
  const flameMaterial = createFlameMaterial(seed);
  const flame = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 1, 8), flameMaterial);
  const flameSize = 0.32;
  flame.scale.set(flameSize, flameSize, flameSize);
  // the wick is at 35% of the plane height (see fragment.glsl), so move the plane up accordingly
  flame.position.y = height + flameSize * 0.15;
  flame.userData.faceCamera = true;
  flame.userData.noHover = true; // the mouse "goes through" the flame
  flame.renderOrder = 10; // draw after the rest (transparent)
  candle.add(flame);

  // the light, slightly above the wax so the candle itself doesn't block it
  const light = new THREE.PointLight(CANDLE_COLOR, intensity, distance, 2);
  light.position.y = height + 0.08;
  if (shadows) {
    light.castShadow = true;
    light.shadow.mapSize.set(512, 512);
    light.shadow.camera.near = 0.05;
    light.shadow.bias = -0.002;
    light.shadow.radius = 4; // soft shadow edge
  }
  candle.add(light);

  candle.userData.info = "candle";
  candle.userData.baseIntensity = intensity;
  candle.userData.light = light;
  candle.userData.update = (time) => {
    const f = flicker(time, seed);
    light.intensity = candle.userData.baseIntensity * f;
    // the flame sways, so the light (and every shadow it casts) dances a little on the walls
    light.position.x = 0.012 * Math.sin(time * 3.3 + seed) + 0.006 * Math.sin(time * 8.9 + seed * 2.1);
    light.position.z = 0.012 * Math.cos(time * 2.7 + seed * 1.3);
    light.position.y = height + 0.08 + 0.01 * (f - 0.85);
    flameMaterial.uniforms.uTime.value = time;
    flameMaterial.uniforms.uIntensity.value = f;
    flame.scale.y = flameSize * (0.9 + 0.15 * f); // the flame grows and shrinks a little
  };
  return candle;
}
