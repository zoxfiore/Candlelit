// All the other light sources of the story.
// three.js light types used here:
//   AmbientLight / HemisphereLight : light everywhere, no direction, no shadow (so nothing is pure black)
//   PointLight                      : a bulb, light in all directions (see candle.js)
//   SpotLight                       : a cone of light (ceiling lamp, headlights, museum spots)
//   DirectionalLight                : parallel rays from very far away (the moon)

import * as THREE from "three";
import { buzz } from "./flicker.js";
import { getModel } from "../assets/loader.js";

/** soft fill light: warm from above, dark brown from below */
export function createAmbient(intensity = 0.25, sky = "#c8a888", ground = "#1a120c") {
  return new THREE.HemisphereLight(sky, ground, intensity);
}

/**
 * A lamp hanging from the ceiling: the lamp model (cord + shade + bulb) + a SpotLight pointing down.
 * Place it with lamp.position.set(x, ceilingHeight, z).
 */
export function createHangingLamp({ intensity = 30, color = "#ffd9a0", angle = 0.75, shadows = true, flickers = true } = {}) {
  const lamp = getModel("hanging-lamp"); // the bulb is 0.9 m under the ceiling

  const spot = new THREE.SpotLight(color, intensity, 12, angle, 0.5, 2);
  spot.position.y = -0.85;
  spot.target.position.set(0, -10, 0); // the target is what the spot points at
  lamp.add(spot, spot.target);
  if (shadows) setupShadow(spot);

  lamp.userData.light = spot;
  lamp.userData.baseIntensity = intensity;
  if (flickers) {
    const seed = Math.random() * 10;
    lamp.userData.update = (time) => (spot.intensity = lamp.userData.baseIntensity * buzz(time, seed));
  }
  return lamp;
}

/** a SpotLight going from `from` to `to` (museum spots, desk lamps, theatre light) */
export function createSpot({ from, to, intensity = 20, color = "#ffe0b0", angle = 0.4, penumbra = 0.6, shadows = true }) {
  const spot = new THREE.SpotLight(color, intensity, 15, angle, penumbra, 2);
  spot.position.set(...from);
  spot.target.position.set(...to);
  if (shadows) setupShadow(spot);
  const group = new THREE.Group();
  group.add(spot, spot.target);
  group.userData.light = spot;
  return group;
}

/** moonlight coming through a window: cold, soft, with long shadows */
export function createMoonlight({ from = [-4, 5, -3], to = [0, 0, 0], intensity = 0.6, color = "#8aa0d0", shadows = true } = {}) {
  const moon = new THREE.DirectionalLight(color, intensity);
  moon.position.set(...from);
  moon.target.position.set(...to);
  if (shadows) {
    moon.castShadow = true;
    moon.shadow.mapSize.set(1024, 1024);
    // a directional shadow uses an orthographic camera: this box must contain the scene
    const s = 5;
    Object.assign(moon.shadow.camera, { left: -s, right: s, top: s, bottom: -s, near: 0.5, far: 20 });
    moon.shadow.bias = -0.001;
    moon.shadow.radius = 3;
  }
  const group = new THREE.Group();
  group.add(moon, moon.target);
  group.userData.light = moon;
  return group;
}

/** two headlights for the car: spot lights pointing forward (+z) */
export function createHeadlights(intensity = 40) {
  const group = new THREE.Group();
  for (const x of [-0.6, 0.6]) {
    const spot = new THREE.SpotLight("#fff0c8", intensity, 30, 0.45, 0.4, 1.5);
    spot.position.set(x, 0.55, 2.25);
    spot.target.position.set(x * 1.5, 0, 12);
    group.add(spot, spot.target);
  }
  return group;
}

function setupShadow(light) {
  light.castShadow = true;
  light.shadow.mapSize.set(1024, 1024);
  light.shadow.camera.near = 0.1;
  light.shadow.bias = -0.0015;
  light.shadow.radius = 4;
}
