// All the other light sources of the story.
// three.js light types used here:
//   AmbientLight / HemisphereLight : light everywhere, no direction, no shadow (so nothing is pure black)
//   PointLight                      : a bulb, light in all directions (see candle.js)
//   SpotLight                       : a cone of light (ceiling lamp, headlights, museum spots)
//   DirectionalLight                : parallel rays from very far away (the moon)

import * as THREE from "three";
import { buzz } from "./flicker.js";
import { getModel } from "../assets/loader.js";
import { createLightShaft } from "./shaft.js";

/** soft fill light: warm from above, dark brown from below */
export function createAmbient(intensity = 0.25, sky = "#c8a888", ground = "#1a120c") {
  return new THREE.HemisphereLight(sky, ground, intensity);
}

/**
 * A lamp hanging from the ceiling: the lamp model (cord + shade + bulb) + a SpotLight pointing down.
 * Place it with lamp.position.set(x, ceilingHeight, z).
 */
export function createHangingLamp({ intensity = 30, color = "#ffd9a0", angle = 0.75, shadows = true, flickers = true, swing = 0.06 } = {}) {
  const lamp = getModel("hanging-lamp"); // the bulb is 0.9 m under the ceiling

  const spot = new THREE.SpotLight(color, intensity, 12, angle, 0.5, 2);
  spot.position.y = -0.85;
  spot.target.position.set(0, -10, 0); // the target is what the spot points at
  lamp.add(spot, spot.target);
  if (shadows) setupShadow(spot);
  // the visible beam under the shade (it swings with the lamp, since it is its child)
  const shaft = createLightShaft({ angle: angle * 0.8, length: 2.6, color, opacity: 0.28 });
  shaft.position.y = -0.85;
  lamp.add(shaft);

  lamp.userData.light = spot;
  lamp.userData.baseIntensity = intensity;
  // the lamp hangs from the ceiling, so rotating it swings it like a pendulum,
  // and the spot light (its child) sweeps the light and the shadows across the room
  const seed = Math.random() * 10;
  lamp.userData.swing = swing; // amplitude in radians, a set can change it
  lamp.userData.update = (time) => {
    if (flickers) spot.intensity = lamp.userData.baseIntensity * buzz(time, seed);
    shaft.userData.tick(time, spot.intensity / Math.max(1e-3, lamp.userData.baseIntensity));
    if (!lamp.userData.manual) {
      lamp.rotation.z = Math.sin(time * 1.1 + seed) * lamp.userData.swing;
      lamp.rotation.x = Math.sin(time * 0.8 + seed * 2) * lamp.userData.swing * 0.4;
    }
  };
  return lamp;
}

/** a SpotLight going from `from` to `to` (museum spots, desk lamps, theatre light) */
export function createSpot({ from, to, intensity = 20, color = "#ffe0b0", angle = 0.4, penumbra = 0.6, shadows = true, beam = true }) {
  const spot = new THREE.SpotLight(color, intensity, 15, angle, penumbra, 2);
  spot.position.set(...from);
  spot.target.position.set(...to);
  if (shadows) setupShadow(spot);
  const group = new THREE.Group();
  group.add(spot, spot.target);
  group.userData.light = spot;
  if (beam) {
    // a visible beam from the spot to its target
    const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to);
    const shaft = createLightShaft({ angle: angle * 0.8, length: a.distanceTo(b), color, opacity: 0.3 });
    shaft.position.copy(a);
    // the cone points down -Y: rotate -Y onto the from→to direction
    shaft.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), b.sub(a).normalize());
    group.add(shaft);
    group.userData.update = (time) => shaft.userData.tick(time, spot.intensity / Math.max(1e-3, intensity));
  }
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
  light.shadow.mapSize.set(2048, 2048); // sharper shadow shapes
  light.shadow.camera.near = 0.1;
  light.shadow.bias = -0.0015;
  light.shadow.radius = 4;
}
