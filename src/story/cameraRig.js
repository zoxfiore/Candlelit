// Moves the camera inside a chapter.
// A chapter gives a start shot and an end shot, and can add "beat" shots in between:
//
//   camera: { from: { pos, look }, to: { pos, look },
//             shots: [ { at: 0.4, pos, look, fov }, ... ] }   // at = chapter progress 0..1
//
// Between two shots the camera glides with an ease (slow start, slow end), so every beat of
// the story gets its own framing: a wide shot, then a close-up on a face, then a reveal...
// On top of that the real camera FOLLOWS that goal with damping, so cuts never feel jerky,
// and the mouse adds a small parallax so the scene feels alive even without scrolling.

import * as THREE from "three";

const goalPos = new THREE.Vector3();
const goalLook = new THREE.Vector3();
const curPos = new THREE.Vector3(0, 1.6, 5);
const curLook = new THREE.Vector3(0, 1.2, 0);
const a = new THREE.Vector3();
const b = new THREE.Vector3();

const ease = (t) => t * t * (3 - 2 * t); // smoothstep

/** the list of key shots of a chapter, sorted by time */
function keysOf(shot) {
  if (!shot._keys) {
    shot._keys = [{ at: 0, ...shot.from }, ...(shot.shots ?? []), { at: 1, ...shot.to }].sort((x, y) => x.at - y.at);
  }
  return shot._keys;
}

export function createCameraRig(camera) {
  const mouse = { x: 0, y: 0 };
  const smoothMouse = { x: 0, y: 0 };
  let lastShot = null;
  let fov = 45;
  window.addEventListener("pointermove", (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
  });

  return {
    /** extra offset a set can add (camera shake, follow the car...) */
    offset: new THREE.Vector3(),

    update(shot, t, delta) {
      const keys = keysOf(shot);
      let i = 0;
      while (i < keys.length - 2 && t > keys[i + 1].at) i++;
      const k0 = keys[i];
      const k1 = keys[i + 1];
      const k = ease(THREE.MathUtils.clamp((t - k0.at) / Math.max(1e-4, k1.at - k0.at), 0, 1));
      goalPos.lerpVectors(a.fromArray(k0.pos), b.fromArray(k1.pos), k);
      goalLook.lerpVectors(a.fromArray(k0.look), b.fromArray(k1.look), k);
      const goalFov = THREE.MathUtils.lerp(k0.fov ?? shot.fov ?? 45, k1.fov ?? shot.fov ?? 45, k);

      // new chapter = a hard cut (the screen is black at that moment anyway)
      const damp = shot !== lastShot ? 1 : 1 - Math.exp(-6 * delta);
      lastShot = shot;
      curPos.lerp(goalPos, damp);
      curLook.lerp(goalLook, damp);
      fov += (goalFov - fov) * damp;

      smoothMouse.x += (mouse.x - smoothMouse.x) * Math.min(1, delta * 3);
      smoothMouse.y += (mouse.y - smoothMouse.y) * Math.min(1, delta * 3);

      camera.position.copy(curPos).add(this.offset);
      camera.position.x += smoothMouse.x * 0.12;
      camera.position.y -= smoothMouse.y * 0.06;
      camera.lookAt(curLook);

      if (Math.abs(camera.fov - fov) > 0.01) {
        camera.fov = fov;
        camera.updateProjectionMatrix();
      }
    },
  };
}
