// The one camera of the story. Every chapter moves it (see story/cameraRig.js).

import * as THREE from "three";

export function createCamera() {
  // field of view 45°, aspect ratio of the window, near and far clipping planes
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.05, 150);
  camera.position.set(0, 1.6, 5);
  return camera;
}
