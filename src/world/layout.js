// Build a whole floor plan from a list of rooms (rectangles), like an architect's plan:
//
//   createLayout(set, {
//     height: 3.2,
//     rooms: [
//       { x0: -4, x1: 4, z0: -2.5, z1: 5, wallColor: "#8a725c", floorColor: "#8a5a3c", theme: "home" },
//       { x0: 4, x1: 9, z0: -2.5, z1: 1, floor: "tiles", theme: "kitchen" },   // touches the first room
//       { x0: 4, x1: 6, z0: 1, z1: 5 },                                         // a corridor -> an L shape
//     ],
//     doors: [{ x: 4, z: -0.6 }, { x: 5, z: 1 }],        // a point on the wall between two rooms
//     windows: [{ x: -4, z: 1 }],                        // a point on an outside wall
//   })
//
// - every wall is built ONCE, even where two rooms touch (no double walls, no flickering)
// - the walls are cut around doors and windows (real holes, see house.js addWall)
// - each door gets a real wooden door on a hinge: click it to open / close (a closed door blocks you)
// - each room can get a ceiling lamp and a light switch by its first door (click: on / off)
// - first person: you can walk in all the rooms, never through a wall

import * as THREE from "three";
import { houseMaterials, addWall, addFloor } from "./house.js";
import { tick } from "../audio/synth.js";

const EPS = 0.01;
const tile = (t) => (t === "tiles" || t === "checker-floor" ? 1.2 : t === "bricks" ? 2 : 2.3);

function roomMats(r) {
  return houseMaterials({
    wall: r.wallColor ?? "#8a725c", floor: r.floorColor ?? "#8a5a3c", trim: r.trim ?? "#3a2618",
    wallTexture: r.wall ?? "plaster", floorTexture: r.floor ?? "wood-planks",
    wallSize: tile(r.wall ?? "plaster"), floorSize: tile(r.floor ?? "wood-planks"),
  });
}

/** the four sides of a room as segments on a line */
function sides(r) {
  return [
    { dir: "n", fixed: "z", at: r.z0, from: r.x0, to: r.x1, out: [0, -1] },
    { dir: "s", fixed: "z", at: r.z1, from: r.x0, to: r.x1, out: [0, 1] },
    { dir: "w", fixed: "x", at: r.x0, from: r.z0, to: r.z1, out: [-1, 0] },
    { dir: "e", fixed: "x", at: r.x1, from: r.z0, to: r.z1, out: [1, 0] },
  ];
}
const OPPOSITE = { n: "s", s: "n", w: "e", e: "w" };

/** a wooden door on a hinge; click to open / close. Returns { group, noWalk } */
function createDoorLeaf({ x, z, width, along, open = true, scene }) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = along === "x" ? 0 : Math.PI / 2;
  const hinge = new THREE.Group();
  hinge.position.x = -width / 2 + 0.03;
  g.add(hinge);
  const wood = new THREE.MeshStandardMaterial({ color: "#5a3a22", roughness: 0.55 });
  const leaf = new THREE.Mesh(new THREE.BoxGeometry(width - 0.06, 2.12, 0.045), wood);
  leaf.position.set((width - 0.06) / 2, 1.06, 0);
  leaf.castShadow = leaf.receiveShadow = true;
  // two raised panels and a brass knob
  for (const y of [0.55, 1.5]) {
    const panel = new THREE.Mesh(new THREE.BoxGeometry(width - 0.3, 0.7, 0.06), new THREE.MeshStandardMaterial({ color: "#4a2e1a", roughness: 0.6 }));
    panel.position.set((width - 0.06) / 2, y, 0);
    hinge.add(panel);
  }
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), new THREE.MeshStandardMaterial({ color: "#c89a40", metalness: 1, roughness: 0.3 }));
  knob.position.set(width - 0.16, 1.0, 0.05);
  hinge.add(leaf, knob);
  let angle = open ? 1 : 0, target = angle;
  const block = along === "x"
    ? { minX: x - width / 2, maxX: x + width / 2, minZ: z - 0.25, maxZ: z + 0.25 }
    : { minX: x - 0.25, maxX: x + 0.25, minZ: z - width / 2, maxZ: z + width / 2 };
  const setBlocking = (closed) => {
    const list = (scene.userData.noWalk ??= []);
    const i = list.indexOf(block);
    if (closed && i < 0) list.push(block);
    if (!closed && i >= 0) list.splice(i, 1);
  };
  setBlocking(!open);
  g.userData.interact = () => {
    target = target ? 0 : 1;
    tick(0.05);
    setBlocking(target === 0);
  };
  g.userData.update = (time, delta = 0.016) => {
    angle += (target - angle) * Math.min(1, delta * 4);
    hinge.rotation.y = -angle * 1.55;
  };
  return g;
}

/** a ceiling lamp (a glass globe) + its light; returns the group with userData.setOn(on) */
function createCeilingLamp(color = "#ffd8a8", intensity = 2.4) {
  const g = new THREE.Group();
  const glassMat = new THREE.MeshStandardMaterial({ color: "#fff4e0", emissive: color, emissiveIntensity: 1.2, roughness: 0.3 });
  const globe = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 10), glassMat);
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.4, 6), new THREE.MeshStandardMaterial({ color: "#2a2018", metalness: 0.6 }));
  rod.position.y = 0.3;
  g.add(globe, rod);
  const light = new THREE.PointLight(color, intensity, 9, 1.6);
  g.add(light);
  let level = 1, target = 1;
  g.userData.setOn = (on) => (target = on ? 1 : 0);
  g.userData.isOn = () => target === 1;
  g.userData.update = (time, delta = 0.016) => {
    level += (target - level) * Math.min(1, delta * 7);
    light.intensity = intensity * level;
    glassMat.emissiveIntensity = 1.2 * level;
  };
  return g;
}

/** a light switch plate (click: toggles the lamps given) */
function createSwitchFor(lamps) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.13, 0.015), new THREE.MeshStandardMaterial({ color: "#e0d8c8", roughness: 0.4 })));
  const lever = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.05, 0.025), new THREE.MeshStandardMaterial({ color: "#2a2420" }));
  lever.position.set(0, 0.015, 0.015);
  g.add(lever);
  g.add(new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.26, 0.08), new THREE.MeshBasicMaterial({ visible: false }))); // easy to click
  g.userData.interact = () => {
    const on = !lamps[0].userData.isOn();
    for (const l of lamps) l.userData.setOn(on);
    lever.position.y = on ? 0.015 : -0.015;
    tick(0.08);
  };
  return g;
}

export function createLayout(set, { height = 3.2, rooms, doors = [], windows = [], lamps = true, sky = "#141c2c" }) {
  const scene = set.scene;
  const noWalk = [];
  const mats = rooms.map(roomMats);
  rooms.forEach((r, i) => addFloor(set, r.x0, r.x1, r.z0, r.z1, mats[i], { ceilingHeight: r.height ?? height }));

  // openings that lie on a segment (a fixed line, from..to)
  const holesOn = (seg) => {
    const out = [];
    for (const d of doors) {
      const on = seg.fixed === "z" ? Math.abs(d.z - seg.at) < EPS && d.x > seg.from && d.x < seg.to : Math.abs(d.x - seg.at) < EPS && d.z > seg.from && d.z < seg.to;
      if (on) out.push({ at: (seg.fixed === "z" ? d.x : d.z) - seg.from, width: d.width ?? 1.1, height: d.height ?? 2.2 });
    }
    for (const w of windows) {
      const on = seg.fixed === "z" ? Math.abs(w.z - seg.at) < EPS && w.x > seg.from && w.x < seg.to : Math.abs(w.x - seg.at) < EPS && w.z > seg.from && w.z < seg.to;
      if (on) out.push({ at: (seg.fixed === "z" ? w.x : w.z) - seg.from, width: w.width ?? 1.25, height: w.height ?? 1.45, bottom: w.bottom ?? 1.05, window: true, seg });
    }
    return out;
  };
  const build = (seg, m, h) => {
    const a = seg.fixed === "z" ? [seg.from, seg.at] : [seg.at, seg.from];
    const b = seg.fixed === "z" ? [seg.to, seg.at] : [seg.at, seg.to];
    const holes = holesOn(seg);
    noWalk.push(...addWall(set, a, b, { mats: m, height: h, openings: holes }));
    // windows: glass, a cross of glazing bars, and the sky beyond
    for (const hole of holes.filter((o) => o.window)) {
      const cx = seg.fixed === "z" ? seg.from + hole.at : seg.at;
      const cz = seg.fixed === "z" ? seg.at : seg.from + hole.at;
      const rot = seg.fixed === "z" ? 0 : Math.PI / 2;
      const y = hole.bottom + hole.height / 2;
      const glass = new THREE.Mesh(new THREE.PlaneGeometry(hole.width, hole.height), new THREE.MeshStandardMaterial({ color: "#9ab0c8", transparent: true, opacity: 0.12, roughness: 0.05 }));
      glass.position.set(cx, y, cz);
      glass.rotation.y = rot;
      set.add(glass);
      const bar = new THREE.MeshStandardMaterial({ color: "#3a2618", roughness: 0.5 });
      const v = new THREE.Mesh(new THREE.BoxGeometry(0.05, hole.height, 0.06), bar);
      const hz = new THREE.Mesh(new THREE.BoxGeometry(hole.width, 0.05, 0.06), bar);
      for (const m of [v, hz]) {
        m.position.set(cx, y, cz);
        m.rotation.y = rot;
        set.add(m);
      }
      const out = seg.out;
      const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(14, 8), new THREE.MeshBasicMaterial({ color: sky }));
      backdrop.position.set(cx + out[0] * 5, 2, cz + out[1] * 5);
      backdrop.lookAt(cx, 2, cz);
      set.add(backdrop);
    }
  };

  // walls: split every side of every room into "shared with a neighbour" and "outside" parts
  rooms.forEach((r, i) => {
    const h = r.height ?? height;
    for (const side of sides(r)) {
      const cuts = [];
      rooms.forEach((o, j) => {
        if (j === i) return;
        for (const os of sides(o)) {
          if (os.dir !== OPPOSITE[side.dir] || Math.abs(os.at - side.at) > EPS) continue;
          const from = Math.max(side.from, os.from), to = Math.min(side.to, os.to);
          if (to - from > EPS) cuts.push({ from, to, owner: Math.min(i, j) === i });
        }
      });
      cuts.sort((p, q) => p.from - q.from);
      let pos = side.from;
      for (const c of cuts) {
        if (c.from - pos > EPS) build({ ...side, from: pos, to: c.from }, mats[i], h); // outside part
        if (c.owner) build({ ...side, from: c.from, to: c.to }, mats[i], h); // shared part, built once
        pos = c.to;
      }
      if (side.to - pos > EPS) build({ ...side, from: pos, to: side.to }, mats[i], h);
    }
  });

  // doors (wooden leaves on hinges) — door: false keeps an open archway
  for (const d of doors) {
    if (d.door === false) continue;
    // a door on a wall that runs along x (a "z = constant" side) or along z
    const along = rooms.some((r) => (Math.abs(r.z0 - d.z) < EPS || Math.abs(r.z1 - d.z) < EPS) && d.x > r.x0 + EPS && d.x < r.x1 - EPS) ? "x" : "z";
    set.add(createDoorLeaf({ x: d.x, z: d.z, width: d.width ?? 1.1, along, open: d.open ?? true, scene }));
  }

  // a ceiling lamp in each room, and its switch next to the room's first door
  if (lamps) {
    rooms.forEach((r) => {
      if (r.lamp === false) return;
      const lamp = createCeilingLamp(r.lampColor, r.lampIntensity ?? 2.4);
      lamp.position.set((r.x0 + r.x1) / 2, (r.height ?? height) - 0.55, (r.z0 + r.z1) / 2);
      set.add(lamp);
      const d = doors.find((dd) => (Math.abs(dd.x - r.x0) < EPS || Math.abs(dd.x - r.x1) < EPS) && dd.z > r.z0 && dd.z < r.z1)
        ?? doors.find((dd) => (Math.abs(dd.z - r.z0) < EPS || Math.abs(dd.z - r.z1) < EPS) && dd.x > r.x0 && dd.x < r.x1);
      if (!d) return;
      const sw = createSwitchFor([lamp]);
      const w = (d.width ?? 1.1) / 2 + 0.25;
      if (Math.abs(d.x - r.x0) < EPS) sw.position.set(r.x0 + 0.09, 1.3, d.z + w), (sw.rotation.y = Math.PI / 2);
      else if (Math.abs(d.x - r.x1) < EPS) sw.position.set(r.x1 - 0.09, 1.3, d.z - w), (sw.rotation.y = -Math.PI / 2);
      else if (Math.abs(d.z - r.z0) < EPS) sw.position.set(d.x + w, 1.3, r.z0 + 0.09);
      else sw.position.set(d.x - w, 1.3, r.z1 - 0.09), (sw.rotation.y = Math.PI);
      set.add(sw);
    });
  }

  // furniture, room by room
  rooms.forEach((r) => r.furnish?.(set, { ...r, cx: (r.x0 + r.x1) / 2, cz: (r.z0 + r.z1) / 2, doorPoints: doors }));

  // first person: everywhere inside the plan, never through a wall
  const box = new THREE.Box3();
  for (const r of rooms) box.expandByPoint(new THREE.Vector3(r.x0, 0, r.z0)).expandByPoint(new THREE.Vector3(r.x1, height, r.z1));
  box.expandByVector(new THREE.Vector3(-0.3, 0, -0.3));
  scene.userData.walkBounds = box;
  scene.userData.noWalk = [...(scene.userData.noWalk ?? []), ...noWalk];
  return { rooms, noWalk };
}
