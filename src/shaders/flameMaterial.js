// Creates the ShaderMaterial of the candle flame.
// Vite lets us import the .glsl files as plain text with "?raw".

import * as THREE from "three";
import vertexShader from "./flame/vertex.glsl?raw";
import fragmentShader from "./flame/fragment.glsl?raw";

export function createFlameMaterial(seed = Math.random() * 100) {
  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      // uniforms = values we send from JavaScript to the GPU
      uTime: { value: 0 },
      uSeed: { value: seed },
      uIntensity: { value: 1 },
    },
    transparent: true,
    depthWrite: false, // the flame should not hide things behind it
    blending: THREE.AdditiveBlending, // colours are ADDED: the flame glows
  });
}
