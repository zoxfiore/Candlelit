// 3D people.
//
// 1) createActor(name): a rigged, animated character from a .glb file (Sketchfab / Mixamo), listed in
//    ACTORS (src/assets/manifest.js). It plays its animation clips with an AnimationMixer and
//    cross-fades between them:   actor.userData.play("Walk")
//
// 2) createFigure(look): when there is no .glb yet, a low-poly "stylised" person built from simple
//    shapes (flat shading, like a wooden figurine). Same API, animated in code:
//      - breathing and a slow weight shift (never perfectly still)
//      - the head turns a little toward a point of interest:   figure.userData.lookAt = vector
//      - poses: "idle", "raise" (holding a candle up), "lean" (bending over), "pull" (on a rope)
//    Arms and head are on pivots (shoulder, neck), like a real skeleton, so a pose is just angles.
//
// placePerson(set, name, x, z, options) uses the .glb if it exists, the figure otherwise.

import * as THREE from "three";
import { hasActor, getActor } from "../assets/loader.js";
import { createCandle } from "../lights/candle.js";

const mat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, flatShading: true, ...extra });

function part(geometry, material, y = 0) {
  const m = new THREE.Mesh(geometry, material);
  m.position.y = y;
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

/** an arm hanging from a shoulder pivot: upper arm + forearm + hand */
function createArm(sleeve, skin, length) {
  const shoulder = new THREE.Group();
  const upper = part(new THREE.CylinderGeometry(0.05, 0.045, length * 0.52, 6), sleeve, -length * 0.26);
  const elbow = new THREE.Group();
  elbow.position.y = -length * 0.52;
  const fore = part(new THREE.CylinderGeometry(0.045, 0.038, length * 0.44, 6), sleeve, -length * 0.22);
  const hand = part(new THREE.IcosahedronGeometry(0.045, 0), skin, -length * 0.48);
  elbow.add(fore, hand);
  shoulder.add(upper, elbow);
  shoulder.userData = { elbow, hand };
  return shoulder;
}

/**
 * look = { height, skin, coat, trousers, shirt, hat: "fedora"|"homburg"|"turban"|"none",
 *          robe: true (a long galabiya / dress instead of trousers), mustache, hair }
 */
export function createFigure(look = {}) {
  const {
    height = 1.75, skin = "#d9a77c", coat = "#6b5a48", trousers = "#4a3e33", shirt = "#e8e0d0",
    hat = "none", robe = false, mustache = false, hair = "#3a2a1e", bowtie = false,
  } = look;
  const s = height / 1.75; // everything below is designed for 1.75 m, then scaled
  const person = new THREE.Group();
  const body = new THREE.Group(); // moves with breathing / weight shift
  person.add(body);
  const skinM = mat(skin, { roughness: 0.7 });
  const coatM = mat(coat);

  // legs or robe
  if (robe) {
    const dress = part(new THREE.CylinderGeometry(0.17, 0.3, 0.95, 8), coatM, 0.475);
    body.add(dress);
  } else {
    const legM = mat(trousers);
    for (const x of [-0.085, 0.085]) {
      body.add(part(new THREE.CylinderGeometry(0.065, 0.055, 0.88, 6), legM, 0.44).translateX(x));
      const shoe = part(new THREE.BoxGeometry(0.1, 0.06, 0.2), mat("#1e1610"), 0.03);
      shoe.position.set(x, 0.03, 0.03);
      body.add(shoe);
    }
  }
  // torso (a coat, slightly tapered) and chest
  const torso = part(new THREE.CylinderGeometry(0.17, robe ? 0.17 : 0.15, 0.6, 7), coatM, 1.17);
  body.add(torso);
  if (!robe) {
    const front = part(new THREE.BoxGeometry(0.1, 0.34, 0.02), mat(shirt), 1.3);
    front.position.z = 0.15;
    body.add(front);
    if (bowtie) {
      const tie = part(new THREE.BoxGeometry(0.09, 0.035, 0.03), mat("#2a1a14"), 1.44);
      tie.position.z = 0.16;
      body.add(tie);
    }
  }

  // neck + head on a pivot (so it can turn)
  const neck = new THREE.Group();
  neck.position.y = 1.47;
  body.add(neck);
  neck.add(part(new THREE.CylinderGeometry(0.045, 0.05, 0.08, 6), skinM, 0.04));
  const head = part(new THREE.IcosahedronGeometry(0.115, 1), skinM, 0.17);
  head.scale.set(0.9, 1.08, 0.95);
  neck.add(head);
  const nose = part(new THREE.ConeGeometry(0.022, 0.05, 4), skinM, 0.16);
  nose.rotation.x = Math.PI / 2;
  nose.position.z = 0.11;
  neck.add(nose);
  for (const x of [-0.04, 0.04]) {
    const eye = part(new THREE.SphereGeometry(0.012, 6, 4), mat("#1a120c"), 0.19);
    eye.position.set(x, 0.19, 0.1);
    neck.add(eye);
  }
  if (mustache) {
    const m = part(new THREE.BoxGeometry(0.08, 0.018, 0.02), mat(hair), 0.125);
    m.position.z = 0.105;
    neck.add(m);
  }
  if (hat === "fedora" || hat === "homburg") {
    const hm = mat(hat === "homburg" ? "#2b231c" : "#8a7a62");
    const brim = part(new THREE.CylinderGeometry(0.19, 0.19, 0.015, 12), hm, 0.27);
    const crown = part(new THREE.CylinderGeometry(0.1, 0.12, 0.12, 10), hm, 0.33);
    neck.add(brim, crown);
  } else if (hat === "turban") {
    neck.add(part(new THREE.TorusGeometry(0.1, 0.05, 6, 10).rotateX(Math.PI / 2), mat("#ece4d4"), 0.25));
    neck.add(part(new THREE.SphereGeometry(0.1, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), mat("#ece4d4"), 0.25));
  } else {
    const cap = part(new THREE.SphereGeometry(0.118, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2.2), mat(hair), 0.19);
    neck.add(cap);
  }

  // arms on shoulder pivots
  const armLen = 0.66;
  const arms = [-1, 1].map((side) => {
    const arm = createArm(coatM, skinM, armLen);
    arm.position.set(side * 0.21, 1.42, 0);
    body.add(arm);
    return arm;
  });

  person.scale.setScalar(s);
  person.userData.parts = { body, neck, arms };
  person.userData.pose = "idle";
  person.userData.poseAmount = 0; // eased toward 1 when a pose is set
  animate(person);
  return person;
}

/** procedural animation: breathing, weight shift, head look, poses (all eased, nothing snaps) */
function animate(person) {
  const { body, neck, arms } = person.userData.parts;
  const seed = Math.random() * 10;
  const target = new THREE.Vector3();
  const local = new THREE.Vector3();
  let yaw = 0, pitch = 0, lastPose = "idle";
  person.userData.update = (time, delta = 0.016) => {
    const ud = person.userData;
    if (ud.pose !== lastPose) {
      ud.poseAmount = 0;
      ud.fromPose = lastPose;
      lastPose = ud.pose;
    }
    ud.poseAmount = Math.min(1, ud.poseAmount + delta / 0.9);
    const k = ud.poseAmount * ud.poseAmount * (3 - 2 * ud.poseAmount);

    // breathing + weight shift
    const breathe = Math.sin(time * 1.7 + seed);
    body.scale.y = 1 + breathe * 0.006;
    body.rotation.z = Math.sin(time * 0.35 + seed) * 0.015;
    body.position.x = Math.sin(time * 0.35 + seed) * 0.01;
    const jolt = ud.act?.jolt ?? 0;
    body.position.y = jolt * 0.03;

    // pose angles, blended from the previous pose
    const P = poseAngles(ud.fromPose ?? "idle", time, seed);
    const Q = poseAngles(ud.pose, time, seed);
    const lerp = (a, b) => a + (b - a) * k;
    arms[0].rotation.x = lerp(P.lx, Q.lx);
    arms[0].rotation.z = lerp(P.lz, Q.lz) - breathe * 0.01;
    arms[1].rotation.x = lerp(P.rx, Q.rx);
    arms[1].rotation.z = -lerp(P.rz, Q.rz) + breathe * 0.01;
    arms[0].userData.elbow.rotation.x = lerp(P.le, Q.le);
    arms[1].userData.elbow.rotation.x = lerp(P.re, Q.re);
    body.rotation.x = lerp(P.bend, Q.bend);

    // the head looks toward ud.lookAt (a world point), within natural limits
    let goalYaw = Math.sin(time * 0.3 + seed) * 0.12, goalPitch = 0;
    if (ud.lookAt) {
      target.copy(ud.lookAt);
      person.updateWorldMatrix(true, false);
      local.copy(target);
      person.worldToLocal(local);
      local.y -= 1.6;
      goalYaw = THREE.MathUtils.clamp(Math.atan2(local.x, local.z), -0.9, 0.9);
      goalPitch = THREE.MathUtils.clamp(-Math.atan2(local.y, Math.hypot(local.x, local.z)), -0.5, 0.5);
    }
    const e = 1 - Math.exp(-3 * delta);
    yaw += (goalYaw - yaw) * e;
    pitch += (goalPitch - pitch) * e;
    neck.rotation.set(pitch + Q.headDown * k, yaw, 0);
  };
}

function poseAngles(pose, time, seed) {
  const sway = Math.sin(time * 0.8 + seed) * 0.03;
  switch (pose) {
    case "raise": // right arm up, holding a candle in front of the face
      return { lx: sway, lz: 0.08, rx: -1.5, rz: 0.12, le: 0, re: -0.9, bend: 0.02, headDown: -0.05 };
    case "lean": // bending over something (both hands forward)
      return { lx: -0.9, lz: 0.05, rx: -0.9, rz: 0.05, le: -0.4, re: -0.4, bend: 0.38, headDown: 0.3 };
    case "pull": // pulling a rope above the head
      return { lx: -2.5 + Math.sin(time * 2) * 0.15, lz: 0.1, rx: -2.6 + Math.sin(time * 2 + 1) * 0.15, rz: 0.1, le: -0.3, re: -0.3, bend: -0.05, headDown: -0.3 };
    case "point": // pointing forward with the right arm
      return { lx: sway, lz: 0.08, rx: -1.45, rz: 0.05, le: 0, re: -0.05, bend: 0, headDown: 0 };
    case "carry": // carrying a basket / jar against the chest
      return { lx: -0.6, lz: 0.25, rx: -0.6, rz: 0.25, le: -1.2, re: -1.2, bend: 0, headDown: 0 };
    default:
      return { lx: sway, lz: 0.08, rx: -sway, rz: 0.08, le: -0.08, re: -0.08, bend: 0, headDown: 0 };
  }
}

/** a rigged .glb character with its animation clips (Mixamo, Sketchfab...) */
export function createActor(name) {
  const { scene, animations } = getActor(name);
  scene.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  const mixer = new THREE.AnimationMixer(scene);
  const actions = Object.fromEntries(animations.map((clip) => [clip.name, mixer.clipAction(clip)]));
  let current = null;
  scene.userData.play = (clipName, fade = 0.5) => {
    const next = actions[clipName] ?? Object.values(actions)[0];
    if (!next || next === current) return;
    next.reset().fadeIn(fade).play();
    current?.fadeOut(fade);
    current = next;
  };
  scene.userData.play(Object.keys(actions).find((n) => /idle/i.test(n)) ?? Object.keys(actions)[0]);
  scene.userData.update = (time, delta = 0.016) => mixer.update(delta);
  return scene;
}

/**
 * put a person in a set: the .glb actor if it exists (public/assets/actors/<name>.glb), else the figure.
 *   placePerson(set, "carter", 0.4, -1, { look: {...}, rotationY: 0.3, candle: true })
 */
export function placePerson(set, name, x, z, { look = {}, rotationY = 0, pose = "idle", candle = false, info = null } = {}) {
  const person = hasActor(name) ? createActor(name) : createFigure(look);
  person.position.set(x, 0, z);
  person.userData.isPerson = true;
  person.rotation.y = rotationY;
  person.userData.pose = pose;
  if (info) person.userData.info = info;
  if (candle && person.userData.parts) {
    // a candle in the right hand (it follows the arm, and its light moves with it)
    const c = createCandle({ height: 0.12, radius: 0.022, intensity: 1.6, distance: 6, shadows: true });
    c.position.set(0, -0.33, 0.02); // in the hand (the forearm is 0.29 m, the hand at 0.32 m)
    c.rotation.x = 0; // kept upright in update below
    person.userData.parts.arms[1].userData.elbow.add(c);
    person.userData.candle = c;
    const base = person.userData.update;
    person.userData.update = (time, delta) => {
      base(time, delta);
      // a flame always points up: undo the arm's rotation for the candle
      const arm = person.userData.parts.arms[1];
      c.rotation.x = -(arm.rotation.x + arm.userData.elbow.rotation.x + person.userData.parts.body.rotation.x);
      c.userData.update(time);
    };
  }
  set.add(person);
  return person;
}
