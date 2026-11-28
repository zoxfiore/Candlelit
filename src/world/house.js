// Real rooms (not a theatre stage): walls on every side, with doorways and windows cut in them,
// a ceiling, skirting boards and a dado rail. Lets the viewer walk from one room to the next.
//
//   const mats = houseMaterials({ wall: "#8a725c", floor: "#8a5a3c" })
//   addWall(set, [-4, -2.5], [4, -2.5], { mats, openings: [{ at: 2, width: 1, height: 2.1 }] })
//   addFloor(set, -4, 8, -2.5, 5.5, mats)        // x0, x1, z0, z1
//
// A wall is built from boxes AROUND its openings (left part, right part, part above, part below a
// window), so a doorway is a real hole the camera and the light can go through.

import * as THREE from "three";
import { getTexture } from "../assets/loader.js";

const T = 0.14; // wall thickness

export function houseMaterials({ wall = "#8a725c", floor = "#8a5a3c", trim = "#3a2618", ceiling = "#2a1e18", wallTexture = "plaster", floorTexture = "wood-planks", wallSize = 2.3, floorSize = 2.4 } = {}) {
  // wallSize / floorSize: how many metres ONE copy of the texture covers (tiles: small, planks: big)
  return {
    wall: (len, h) => new THREE.MeshStandardMaterial({ map: getTexture(wallTexture, len / wallSize, h / (wallSize * 1.4)), color: wall, roughness: 0.95 }),
    floor: (w, d) => new THREE.MeshStandardMaterial({ map: getTexture(floorTexture, w / floorSize, d / floorSize), color: floor, roughness: 0.7 }),
    trim: new THREE.MeshStandardMaterial({ color: trim, roughness: 0.55 }),
    ceiling: new THREE.MeshStandardMaterial({ color: ceiling, roughness: 1 }),
  };
}

function box(set, w, h, d, x, y, z, material, rotY = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  m.position.set(x, y, z);
  m.rotation.y = rotY;
  m.castShadow = true;
  m.receiveShadow = true;
  set.add(m);
  return m;
}

/**
 * a straight wall from a = [x, z] to b = [x, z].
 * openings: [{ at: distance from a to the opening's centre, width, height, bottom = 0 }]
 * (bottom > 0 = a window). Returns the list of "no walk" rectangles of its solid parts.
 */
export function addWall(set, a, b, { height = 3.2, mats, openings = [], dado = true } = {}) {
  const ax = a[0], az = a[1];
  const dx = b[0] - ax, dz = b[1] - az;
  const len = Math.hypot(dx, dz);
  const ux = dx / len, uz = dz / len;
  const rot = -Math.atan2(dz, dx);
  const material = mats.wall(len, height);
  const at = (s, y, w, h) => box(set, w, h, T, ax + ux * s, y, az + uz * s, material, rot);
  const noWalk = [];
  const solid = (s0, s1) => {
    const x0 = ax + ux * s0, z0 = az + uz * s0, x1 = ax + ux * s1, z1 = az + uz * s1;
    // the "no walk" band: 25 cm on each FACE of the wall (you cannot touch it with your nose),
    // but only 5 cm past its ENDS, so doorways stay wide enough to walk through
    const alongX = Math.abs(z1 - z0) < 1e-6;
    const ex = alongX ? 0.05 : 0.25, ez = alongX ? 0.25 : 0.05;
    noWalk.push({ minX: Math.min(x0, x1) - ex, maxX: Math.max(x0, x1) + ex, minZ: Math.min(z0, z1) - ez, maxZ: Math.max(z0, z1) + ez });
    // skirting board and dado rail along this solid part (on both faces: a bit thicker than the wall)
    const m = (s0 + s1) / 2;
    box(set, s1 - s0, 0.12, T + 0.03, ax + ux * m, 0.06, az + uz * m, mats.trim, rot);
    if (dado) box(set, s1 - s0, 0.04, T + 0.025, ax + ux * m, 0.95, az + uz * m, mats.trim, rot);
  };

  const holes = [...openings].sort((p, q) => p.at - q.at);
  let s = 0;
  for (const o of holes) {
    const s0 = o.at - o.width / 2, s1 = o.at + o.width / 2;
    if (s0 > s) {
      at((s + s0) / 2, height / 2, s0 - s, height);
      solid(s, s0);
    }
    const bottom = o.bottom ?? 0;
    const top = bottom + o.height;
    if (top < height) at(o.at, (top + height) / 2, o.width, height - top); // above
    if (bottom > 0) {
      at(o.at, bottom / 2, o.width, bottom); // under a window
      solid(s0, s1);
    }
    // a wooden frame around the opening
    const fx = ax + ux * o.at, fz = az + uz * o.at;
    box(set, o.width + 0.12, 0.08, T + 0.04, fx, top + 0.04, fz, mats.trim, rot);
    for (const side of [-1, 1]) box(set, 0.06, o.height, T + 0.04, fx + ux * side * (o.width / 2 + 0.03), bottom + o.height / 2, fz + uz * side * (o.width / 2 + 0.03), mats.trim, rot);
    s = s1;
  }
  if (s < len) {
    at((s + len) / 2, height / 2, len - s, height);
    solid(s, len);
  }
  return noWalk;
}

export function addFloor(set, x0, x1, z0, z1, mats, { ceilingHeight = 3.2 } = {}) {
  const w = x1 - x0, d = z1 - z0;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mats.floor(w, d));
  floor.rotation.x = -Math.PI / 2;
  floor.position.set((x0 + x1) / 2, 0, (z0 + z1) / 2);
  floor.receiveShadow = true;
  set.add(floor);
  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mats.ceiling);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set((x0 + x1) / 2, ceilingHeight, (z0 + z1) / 2);
  set.add(ceiling);
  // ceiling beams: they catch the light and give the ceiling depth
  for (let x = x0 + 1; x < x1 - 0.5; x += 1.6) box(set, 0.16, 0.18, d, x, ceilingHeight - 0.09, (z0 + z1) / 2, mats.trim);
  return floor;
}

/**
 * A "suite": the stage room of a chapter turned into a real, closed room (4 walls, ceiling),
 * with a doorway into a second room on its side, already furnished so there is space to explore.
 * Replaces createRoom() in a set:
 *
 *   createSuite(set, { width: 7, depth: 5, floor: "tiles", floorColor: "#94948a", wallColor: "#989888", theme: "office" })
 *
 * The back wall stays at z = -depth / 2 (where the old stage was), the front wall goes behind the
 * film camera (z = front). Sets scene.userData.walkBounds / noWalk for the first person.
 */
export function createSuite(set, {
  width = 7, depth = 5, height = 3.2, front = 4.8,
  floor = "wood-planks", floorColor = "#8a5a3c", wall = "plaster", wallColor = "#8a725c",
  side = "right", sideWidth = 3.4, theme = "home", windowAt = null, furnish = null,
}) {
  const tile = (t) => (t === "tiles" || t === "checker-floor" ? 1.2 : t === "bricks" ? 2 : 2.3);
  const mats = houseMaterials({ wall: wallColor, floor: floorColor, wallTexture: wall, floorTexture: floor, wallSize: tile(wall), floorSize: tile(floor) });
  const dim = (hex, k) => "#" + new THREE.Color(hex).multiplyScalar(k).getHexString();
  const sideMats = houseMaterials({ wall: dim(wallColor, 0.88), floor: dim(floorColor, 0.9), wallTexture: wall, floorTexture: floor, wallSize: tile(wall), floorSize: tile(floor) });
  const x0 = -width / 2, x1 = width / 2, z0 = -depth / 2, z1 = front;
  const sx0 = side === "right" ? x1 : x0 - sideWidth, sx1 = side === "right" ? x1 + sideWidth : x0;
  const doorAt = (z1 - z0) * 0.55; // the doorway, along the side wall
  addFloor(set, Math.min(x0, sx0), Math.max(x1, sx1), z0, z1, mats, { ceilingHeight: height });
  const shared = side === "right" ? x1 : x0;
  const outer = side === "right" ? x0 : x1;
  const sideOuter = side === "right" ? sx1 : sx0;
  const noWalk = [
    ...addWall(set, [x0, z0], [x1, z0], { mats, height, openings: windowAt != null ? [{ at: windowAt + width / 2, width: 1.25, height: 1.45, bottom: 1.05 }] : [] }),
    ...addWall(set, [sx0, z0], [sx1, z0], { mats: sideMats, height }),
    ...addWall(set, [outer, z1], [outer, z0], { mats, height }),
    ...addWall(set, [shared, z0], [shared, z1], { mats, height, openings: [{ at: doorAt, width: 1.2, height: 2.2 }] }),
    ...addWall(set, [sideOuter, z0], [sideOuter, z1], { mats: sideMats, height }),
    ...addWall(set, [Math.min(x0, sx0), z1], [Math.max(x1, sx1), z1], { mats, height }),
  ];
  if (windowAt != null) {
    // the night behind the window
    const sky = new THREE.Mesh(new THREE.PlaneGeometry(16, 8), new THREE.MeshBasicMaterial({ color: "#141c2c" }));
    sky.position.set(0, 2, z0 - 4);
    set.add(sky);
  }
  // the side room: a lamp so it is visible through the doorway, and whatever the theme brings
  const cx = (sx0 + sx1) / 2;
  furnish?.(set, { cx, x0: sx0, x1: sx1, z0, z1, theme });
  const glow = new THREE.PointLight("#ffd0a0", 2.2, 7, 1.6);
  glow.position.set(cx, height - 0.5, (z0 + z1) / 2);
  set.add(glow);
  const scene = set.scene;
  scene.userData.walkBounds = new THREE.Box3(new THREE.Vector3(Math.min(x0, sx0) + 0.3, 0, z0 + 0.3), new THREE.Vector3(Math.max(x1, sx1) - 0.3, height, z1 - 0.3));
  scene.userData.noWalk = [...(scene.userData.noWalk ?? []), ...noWalk];
  return { x0, x1, z0, z1, sx0, sx1, noWalk };
}
