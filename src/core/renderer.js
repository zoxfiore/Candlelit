// The WebGL renderer: draws the 3D scene into a <canvas>.

import * as THREE from "three";

export function createRenderer(container) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // more than 2 is too slow for little gain

  // real-time shadows (each light with castShadow = true renders a shadow map)
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // filtered = soft edges

  // colour: tone mapping turns very bright light values into nice screen colours
  // AgX: a film-like curve, bright lights roll off softly instead of turning flat yellow/white
  renderer.toneMapping = THREE.AgXToneMapping;
  renderer.toneMappingExposure = 1.75;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  container.appendChild(renderer.domElement);
  return renderer;
}
