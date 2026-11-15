// "Billboarding": every frame, turn the cut-outs (and candle flames) toward the camera,
// so we never see them from the side, where they would be paper-thin.
// We only rotate around the vertical axis (Y), so the characters stay standing.

import * as THREE from "three";

const position = new THREE.Vector3();

export function faceCamera(scene, camera) {
  scene.traverse((object) => {
    if (object.userData.faceCamera) {
      object.getWorldPosition(position);
      object.lookAt(camera.position.x, position.y, camera.position.z); // same height = only turn around Y
    }
  });
}
