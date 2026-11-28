// Moves the camera inside a chapter.
// A chapter gives a start shot and an end shot, and can add "beat" shots in between:
//
//   camera: { from: { pos, look }, to: { pos, look },
//             shots: [ { at: 0.4, pos, look, fov }, ... ] }   // at = chapter progress 0..1
//
// The camera flies along a SMOOTH CURVE through all the shots (a Catmull-Rom spline: it passes
// through every point and bends softly between them), so it never stops and restarts at each shot
// like a robot. Only the very start and the very end of the chapter ease in / out.
// On top of that the real camera FOLLOWS that goal with damping, so cuts never feel jerky,
// and the mouse adds a small parallax so the scene feels alive even without scrolling.

import * as THREE from "three";

const goalPos = new THREE.Vector3();
const goalLook = new THREE.Vector3();
const curPos = new THREE.Vector3(0, 1.6, 5);
const curLook = new THREE.Vector3(0, 1.2, 0);

const ease = (t) => t * t * (3 - 2 * t); // smoothstep: slow start, slow end
const easeIn = (t) => t * t * (2 - t); // slow start, keeps its speed at the end (no stop mid-chapter)
const easeOut = (t) => t + t * t - t * t * t; // keeps its speed at the start, slow end


/** the key shots of a chapter sorted by time, + the curves through their positions and targets */
function keysOf(shot) {
  if (!shot._keys) {
    const keys = [{ at: 0, ...shot.from }, ...(shot.shots ?? []), { at: 1, ...shot.to }].sort((x, y) => x.at - y.at);
    shot._keys = keys;
    shot._posCurve = new THREE.CatmullRomCurve3(keys.map((k) => new THREE.Vector3(...k.pos)), false, "centripetal");
    shot._lookCurve = new THREE.CatmullRomCurve3(keys.map((k) => new THREE.Vector3(...k.look)), false, "centripetal");
  }
  return shot._keys;
}

/** the pose at the very start of a chapter (used to show the next chapter during a transition) */
export function startPose(shot) {
  const k = keysOf(shot)[0];
  return { pos: new THREE.Vector3(...k.pos), look: new THREE.Vector3(...k.look), fov: k.fov ?? shot.fov ?? 45 };
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

    /** put another camera where a chapter STARTS (same mouse parallax), to film the next chapter in a transition */
    place(cam, shot) {
      const p = startPose(shot);
      cam.position.copy(p.pos);
      cam.position.x += smoothMouse.x * 0.12;
      cam.position.y -= smoothMouse.y * 0.06;
      cam.lookAt(p.look);
      if (cam.fov !== p.fov) {
        cam.fov = p.fov;
        cam.updateProjectionMatrix();
      }
      cam.updateMatrixWorld();
    },

    update(shot, t, delta) {
      const keys = keysOf(shot);
      let i = 0;
      while (i < keys.length - 2 && t > keys[i + 1].at) i++;
      const k0 = keys[i];
      const k1 = keys[i + 1];
      const local = THREE.MathUtils.clamp((t - k0.at) / Math.max(1e-4, k1.at - k0.at), 0, 1);
      // position on the curve: segment i of (n - 1), eased only on the first and last segments
      const first = i === 0, last = i === keys.length - 2;
      const k = first && last ? ease(local) : first ? easeIn(local) : last ? easeOut(local) : local;
      const u = (i + k) / (keys.length - 1);
      shot._posCurve.getPoint(u, goalPos);
      shot._lookCurve.getPoint(u, goalLook);
      const goalFov = THREE.MathUtils.lerp(k0.fov ?? shot.fov ?? 45, k1.fov ?? shot.fov ?? 45, ease(local));

      // new chapter = a hard cut (the screen is black at that moment anyway)
      const damp = shot !== lastShot ? 1 : 1 - Math.exp(-4 * delta);
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
