// createSet() is the common start of every chapter set (stories/einstein/sets/*.js).
// A set is its own small THREE.Scene. Only the scene of the current chapter is rendered.
//
//   const set = createSet({ background: "#0a0706" })
//   set.add(room, table, candle)
//   set.onUpdate((time, delta, t) => { ... })   // optional animation (t = chapter progress 0..1)
//   return set

import * as THREE from "three";

export function createSet({ background = "#070505", fog = null } = {}) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(background);
  // fog: things far away fade into the background colour (gives depth, hides the room's edges)
  if (fog) scene.fog = new THREE.Fog(background, fog[0], fog[1]);

  const updaters = [];
  let animated = null; // objects with userData.update (candles, lamps...), found once

  return {
    scene,
    add(...objects) {
      scene.add(...objects);
      return objects[0];
    },
    onUpdate(fn) {
      updaters.push(fn);
    },
    /** called every frame by the story director while this set is on screen */
    update(time, delta, t) {
      if (!animated) {
        animated = [];
        scene.traverse((o) => o.userData.update && animated.push(o));
      }
      for (const o of animated) o.userData.update(time, delta);
      for (const fn of updaters) fn(time, delta, t);
    },
  };
}
