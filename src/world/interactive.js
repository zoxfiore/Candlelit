// Small "make it usable" helpers, applied to the common props in props.js / props2.js, so almost
// everything in the rooms reacts when you click it in first person:
//
//   pullOut(book)            a book slides out of the row (click again: back in)
//   flutter(papers)          a pile of papers lifts and settles again
//   tilt(frame)              a picture frame goes crooked / straight
//   toggleGlow(mesh, light)  something that lights up switches on / off
//   bob(object)              an object hops a little (a jar, a cup...)
//
// Each one sets userData.interact (the click) and userData.update (the animation, every frame).

import { tick, chime } from "../audio/synth.js";

export function pullOut(obj, distance = 0.12) {
  const z0 = obj.position.z;
  let out = 0, target = 0;
  obj.userData.interact = () => ((target = target ? 0 : 1), tick(0.025));
  obj.userData.update = (t, d = 0.016) => {
    out += (target - out) * Math.min(1, d * 7);
    obj.position.z = z0 + out * distance;
  };
  return obj;
}

export function flutter(group) {
  const sheets = group.children.map((c) => ({ c, y: c.position.y, r: c.rotation.y, seed: Math.random() * 6 }));
  let lift = 0;
  group.userData.interact = () => ((lift = 1), tick(0.02));
  group.userData.update = (t, d = 0.016) => {
    if (lift <= 0) return;
    lift = Math.max(0, lift - d * 0.9);
    for (const s of sheets) {
      s.c.position.y = s.y + Math.sin(lift * Math.PI) * 0.06 * (1 + Math.sin(s.seed));
      s.c.rotation.y = s.r + Math.sin(t * 6 + s.seed) * 0.25 * lift;
    }
  };
  return group;
}

export function tilt(frame) {
  let crooked = 0, target = 0;
  frame.userData.interact = () => ((target = target ? 0 : 1), tick(0.03));
  frame.userData.update = (t, d = 0.016) => {
    crooked += (target - crooked) * Math.min(1, d * 5);
    frame.rotation.z = crooked * 0.18;
  };
  return frame;
}

export function toggleGlow(holder, material, light = null, base = material.emissiveIntensity) {
  let on = 1, level = 1;
  holder.userData.interact = () => ((on = on ? 0 : 1), tick(0.06));
  holder.userData.update = (t, d = 0.016) => {
    level += (on - level) * Math.min(1, d * 8);
    material.emissiveIntensity = base * level;
    if (light) light.intensity = (light.userData.base ??= light.intensity) * level;
  };
  return holder;
}

export function bob(obj) {
  let hop = 0;
  obj.userData.interact = () => {
    obj.userData.y0 ??= obj.position.y; // where it stands (known only once it is placed)
    hop = 1;
    tick(0.03);
  };
  const previous = obj.userData.update;
  obj.userData.update = (t, d = 0.016) => {
    previous?.(t, d);
    if (hop <= 0) return;
    hop = Math.max(0, hop - d * 2.2);
    obj.position.y = obj.userData.y0 + Math.sin(hop * Math.PI) * 0.05;
    obj.rotation.y += d * 6 * hop;
  };
  return obj;
}

/** a clock you can make chime */
export function chimes(clock) {
  const previous = clock.userData.update;
  clock.userData.interact = () => chime();
  clock.userData.update = previous;
  return clock;
}
