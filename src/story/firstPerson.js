// First-person investigation: at the end of a chapter the film stops, the camera becomes YOUR eyes,
// and you walk around the room with a candle in your hand to find the hidden clue.
// When you have read the clue, the camera glides back into the film and the scroll is free again.
//
//   move      W A S D / Z Q S D (physical keys, so both keyboards work) or the arrow keys, Shift = faster
//   look      mouse (pointer lock after a click), or drag on touch screens
//   inspect   aim the small dot at a glowing clue and click
//
// Everything is smoothed so nothing feels robotic:
//   - movement has acceleration and friction (velocity damped toward the wanted speed)
//   - the view follows the mouse with a little lag (yaw/pitch eased toward their targets)
//   - the head bobs gently while walking
//   - the candle is held in the hand: it lags behind the view and sways, so the light and the
//     shadows it throws swing around the room as you turn
//   - entering and leaving blend the camera between the film shot and your eyes (no cut)

import * as THREE from "three";
import { createCandle } from "../lights/candle.js";

const EYE = 1.55; // eye height in metres
const WALK = 1.5; // m/s
const RUN = 2.8;
const HAND = new THREE.Vector3(0.17, -0.2, -0.45); // where the candle is held, in camera space

const ease = (t) => t * t * (3 - 2 * t);

export function createFirstPerson({ camera, canvas }) {
  const keys = new Set();
  const pos = new THREE.Vector3();
  const vel = new THREE.Vector3();
  const bounds = new THREE.Box3();
  let yaw = 0, pitch = 0, goalYaw = 0, goalPitch = 0;
  let bob = 0;
  let active = false;
  let blend = 0; // 0 = film camera, 1 = your eyes
  let scene = null;
  let onDone = null;
  let item = null;
  let dragging = false;
  const dimmed = [];

  // the candle in your hand
  const candle = createCandle({ height: 0.16, intensity: 1.4, distance: 6, shadows: true });
  candle.scale.setScalar(0.45); // a hand-held candle: small, and so close that its flame must not fill the screen
  const candlePos = new THREE.Vector3();
  const candleQuat = new THREE.Quaternion();

  const crosshair = document.getElementById("crosshair");
  const hint = document.getElementById("fp-hint");

  // ---- input ----
  window.addEventListener("keydown", (e) => active && keys.add(e.code));
  window.addEventListener("keyup", (e) => keys.delete(e.code));
  window.addEventListener("blur", () => keys.clear());
  window.addEventListener("pointerdown", (e) => {
    if (!active || e.target.closest("button, #inspect")) return;
    dragging = true;
    if (e.pointerType === "mouse" && document.pointerLockElement !== canvas) {
      // some browsers / embedded views refuse the lock: then you look by dragging instead
      try {
        canvas.requestPointerLock?.()?.catch?.(() => {});
      } catch {}
    }
  });
  window.addEventListener("pointerup", () => (dragging = false));
  window.addEventListener("mousemove", (e) => {
    if (!active) return;
    const locked = document.pointerLockElement === canvas;
    if (!locked && !dragging) return;
    goalYaw -= e.movementX * 0.0022;
    goalPitch = THREE.MathUtils.clamp(goalPitch - e.movementY * 0.0022, -1.1, 1.1);
  });
  window.addEventListener("touchmove", (e) => {
    if (!active || !e.touches[0]) return;
    const t = e.touches[0];
    if (lastTouch) {
      goalYaw -= (t.clientX - lastTouch.x) * 0.005;
      goalPitch = THREE.MathUtils.clamp(goalPitch - (t.clientY - lastTouch.y) * 0.005, -1.1, 1.1);
    }
    lastTouch = { x: t.clientX, y: t.clientY };
  }, { passive: true });
  let lastTouch = null;
  window.addEventListener("touchend", () => (lastTouch = null));
  document.addEventListener("pointerlockchange", () => {
    document.body.classList.toggle("fp-locked", document.pointerLockElement === canvas);
  });

  let withCandle = true;
  /** options.candle = false: you walk as yourself, no candle, the room keeps its lights */
  function enter(set, clue, done, { candle: holdCandle = true } = {}) {
    withCandle = holdCandle;
    scene = set.scene;
    item = clue;
    onDone = done;
    active = true;
    // start exactly where the film camera is, looking where it looks
    pos.set(camera.position.x, EYE, camera.position.z);
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    yaw = goalYaw = Math.atan2(-dir.x, -dir.z);
    pitch = goalPitch = THREE.MathUtils.clamp(Math.asin(dir.y), -0.6, 0.6);
    vel.set(0, 0, 0);
    // where you may walk: the room around the start, minus a margin from the walls
    const room = new THREE.Box3();
    scene.traverse((o) => {
      if (o.isMesh && !o.userData.noHover && o.geometry) room.expandByObject(o);
    });
    if (scene.userData.walkBounds) {
      bounds.copy(scene.userData.walkBounds); // a set with real rooms says where you can walk
    } else {
      bounds.set(new THREE.Vector3(pos.x - 3.2, 0, pos.z - 3.2), new THREE.Vector3(pos.x + 3.2, 3, pos.z + 3.2));
      if (!room.isEmpty()) bounds.intersect(room);
      bounds.expandByVector(new THREE.Vector3(-0.35, 0, -0.35));
    }
    bounds.expandByPoint(pos); // never start outside it
    // the room gets darker: your candle becomes the main light (only when you hold one)
    scene.traverse((o) => {
      if (withCandle && o.isLight && !o.userData.fpKeep) {
        dimmed.push([o, o.intensity]);
      }
    });
    candlePos.copy(camera.position);
    candleQuat.copy(camera.quaternion);
    if (withCandle) scene.add(candle);
    document.body.classList.add("first-person");
    hint.classList.add("visible");
  }

  function exit() {
    active = false;
    keys.clear();
    document.exitPointerLock?.();
    document.body.classList.remove("first-person");
    hint.classList.remove("visible");
    const done = onDone;
    onDone = null;
    done?.();
  }

  candle.traverse((o) => (o.userData.fpKeep = true));
  // ?dev: a handle for testing / rehearsing (teleport and turn the first-person player)
  if (new URLSearchParams(location.search).has("dev")) {
    window.candlelitDev = Object.assign(window.candlelitDev ?? {}, { place(x, z, yawDeg = 0, pitchDeg = 0) { pos.set(x, 0, z); yaw = goalYaw = (yawDeg * Math.PI) / 180; pitch = goalPitch = (pitchDeg * Math.PI) / 180; }, get pos() { return pos; } });
  }

  return {
    get active() {
      return active;
    },
    get blending() {
      return blend > 0;
    },
    enter,
    /** release the mouse (while reading a document) */
    release() {
      document.exitPointerLock?.();
    },

    /** every frame, AFTER the film camera rig: takes the camera over (or blends back to the film) */
    update(time, delta) {
      blend = THREE.MathUtils.clamp(blend + (active ? delta : -delta) / 0.9, 0, 1);
      if (blend === 0) {
        if (!active) {
          candle.parent?.remove(candle);
          for (const [l, i] of dimmed) l.intensity = i;
          dimmed.length = 0;
        }
        return;
      }

      const reading = document.body.classList.contains("inspecting"); // reading a letter, looking in a microscope...
      if (active && !reading) {
        // ---- walk ----
        const f = (keys.has("KeyW") || keys.has("ArrowUp") ? 1 : 0) - (keys.has("KeyS") || keys.has("ArrowDown") ? 1 : 0);
        const s = (keys.has("KeyD") || keys.has("ArrowRight") ? 1 : 0) - (keys.has("KeyA") || keys.has("ArrowLeft") ? 1 : 0);
        const speed = keys.has("ShiftLeft") || keys.has("ShiftRight") ? RUN : WALK;
        const wish = new THREE.Vector3(s, 0, -f);
        if (wish.lengthSq() > 0) wish.normalize().multiplyScalar(speed).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
        vel.lerp(wish, 1 - Math.exp(-8 * delta)); // acceleration + friction
        pos.addScaledVector(vel, delta);
        pos.x = THREE.MathUtils.clamp(pos.x, bounds.min.x, bounds.max.x);
        pos.z = THREE.MathUtils.clamp(pos.z, bounds.min.z, bounds.max.z);
        // places you cannot walk into (a stairwell, a sarcophagus...): a set lists them as
        // scene.userData.noWalk = [{ minX, maxX, minZ, maxZ }]; we push you out the shortest way
        for (const b of scene.userData.noWalk ?? []) {
          if (pos.x > b.minX && pos.x < b.maxX && pos.z > b.minZ && pos.z < b.maxZ) {
            const out = [[b.minX - pos.x, 0], [b.maxX - pos.x, 0], [0, b.minZ - pos.z], [0, b.maxZ - pos.z]];
            out.sort((u, v) => Math.abs(u[0] + u[1]) - Math.abs(v[0] + v[1]));
            pos.x += out[0][0];
            pos.z += out[0][1];
          }
        }
        // ---- look ----
        const k = 1 - Math.exp(-14 * delta);
        yaw += (goalYaw - yaw) * k;
        pitch += (goalPitch - pitch) * k;
        bob += vel.length() * delta * 5.5;
        // the found clue has been read: the task is done
        if (item?.found && !document.body.classList.contains("inspecting")) exit();
      }

      // your eyes
      const eye = new THREE.Vector3(pos.x, EYE + Math.sin(bob) * 0.025, pos.z);
      const look = new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch, yaw, Math.sin(bob * 0.5) * 0.006, "YXZ"));

      // blend between the film camera (already placed by the rig) and your eyes
      const b = ease(blend);
      camera.position.lerp(eye, b);
      camera.quaternion.slerp(look, b);
      camera.updateMatrixWorld();

      // the candle in your hand: lags behind the view, sways with the steps
      const hand = HAND.clone();
      hand.x += Math.cos(bob * 0.5) * 0.012;
      hand.y += Math.abs(Math.sin(bob * 0.5)) * 0.015;
      const goal = hand.applyQuaternion(camera.quaternion).add(camera.position);
      candlePos.lerp(goal, 1 - Math.exp(-18 * delta));
      candleQuat.slerp(camera.quaternion, 1 - Math.exp(-10 * delta));
      candle.position.copy(candlePos);
      // keep the candle upright (a flame points up), only turn it around the vertical axis
      const e = new THREE.Euler().setFromQuaternion(candleQuat, "YXZ");
      candle.rotation.set(0, e.y, 0);
      candle.userData.update(time);

      // the room darkens while the candle is the light
      const dim = 1 - 0.65 * b;
      for (const [l, i] of dimmed) if (!l.userData.update) l.intensity = i * dim;
    },
  };
}
