// Moves the camera inside a chapter.
// Each chapter gives a start shot and an end shot:  camera: { from: { pos, look }, to: { pos, look } }
// When the chapter progress t goes from 0 to 1, the camera glides from "from" to "to".
// The mouse adds a small extra movement (parallax) so the scene feels alive even without scrolling.

import * as THREE from "three";

const pos = new THREE.Vector3();
const look = new THREE.Vector3();
const a = new THREE.Vector3();
const b = new THREE.Vector3();

// smoothstep: slow start, fast middle, slow end (nicer than a straight line)
const ease = (t) => t * t * (3 - 2 * t);

export function createCameraRig(camera) {
  const mouse = { x: 0, y: 0 };
  const smoothMouse = { x: 0, y: 0 };
  window.addEventListener("pointermove", (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1; // -1 (left) .. 1 (right)
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
  });

  return {
    update(shot, t, delta) {
      const k = ease(t);
      pos.lerpVectors(a.fromArray(shot.from.pos), b.fromArray(shot.to.pos), k);
      look.lerpVectors(a.fromArray(shot.from.look), b.fromArray(shot.to.look), k);

      smoothMouse.x += (mouse.x - smoothMouse.x) * Math.min(1, delta * 3);
      smoothMouse.y += (mouse.y - smoothMouse.y) * Math.min(1, delta * 3);
      pos.x += smoothMouse.x * 0.12;
      pos.y -= smoothMouse.y * 0.06;

      camera.position.copy(pos);
      camera.lookAt(look);

      const fov = shot.fov ?? 45;
      if (camera.fov !== fov) {
        camera.fov = fov;
        camera.updateProjectionMatrix();
      }
    },
  };
}
