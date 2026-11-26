// Chapter 2 — The autopsy room of Princeton Hospital. Cold tiles, one hanging lamp.
//
// INTERACTION: the hanging lamp is a real pendulum (a tiny physics simulation).
// Gate "lamp": hold the mouse and drag left / right to push it. When you let go it keeps
// swinging and slowly stops, and its SpotLight sweeps the shadows across the whole room.

import * as THREE from "three";
import { createSet } from "../../../src/world/set.js";
import { createRoom } from "../../../src/world/room.js";
import { placeModel } from "../../../src/world/models.js";
import { placeCharacter } from "../../../src/characters/cast.js";
import { createAmbient, createHangingLamp } from "../../../src/lights/lamps.js";

const GRAVITY_OVER_LENGTH = 9.81 / 0.9; // g / L : the lamp hangs 0.9 m under the ceiling
const FRICTION = 0.35;

export function buildAutopsy() {
  const set = createSet({ background: "#040505", dust: { color: "#cfe6ff", opacity: 0.14 } });

  set.add(createRoom({ width: 6, depth: 5, height: 3, floor: "tiles", floorColor: "#828a80", wall: "tiles", wallColor: "#a0ab9c" }));
  placeModel(set, "autopsy-table", -0.4, -0.7, { info: "autopsy" });
  placeModel(set, "metal-cart", -2.0, -1.2, { info: "autopsy" });
  placeModel(set, "instrument-tray", -2.0, -1.2, { y: 0.86 });

  const harvey = placeCharacter(set, "harvey-1955-jar", 1.3, -1.0);

  set.add(createAmbient(0.22, "#9ab0b0", "#101414"));
  const lamp = set.add(createHangingLamp({ intensity: 15, angle: 0.8 }));
  lamp.position.set(-0.3, 3, -0.7);
  lamp.userData.manual = true; // we move it ourselves (physics below)

  let angle = 0.25; // radians, 0 = straight down
  let speed = 0;
  let pushed = 0; // how much the viewer has swung it (for the gate)
  let lastX = 0;

  set.onUpdate((time, delta, t, ctx) => {
    const x = ctx.input.pointer.x;
    if (ctx.input.down) {
      // dragging: the lamp follows the mouse, and we remember its speed for when we let go
      const target = THREE.MathUtils.clamp(x * 0.7, -0.5, 0.5);
      const next = angle + (target - angle) * Math.min(1, delta * 10);
      speed = (next - angle) / Math.max(delta, 1e-3);
      if (ctx.gate === "lamp") pushed += Math.abs(x - lastX);
      angle = next;
    } else {
      // pendulum: acceleration = -(g / L) * sin(angle), minus a little friction
      speed += (-GRAVITY_OVER_LENGTH * Math.sin(angle) - FRICTION * speed) * delta;
      angle += speed * delta;
    }
    lastX = x;
    lamp.rotation.z = angle;
    lamp.rotation.x = Math.sin(time * 0.7) * 0.03;

    if (ctx.gate === "lamp") {
      ctx.progress(Math.min(1, pushed / 2.5));
      if (pushed >= 2.5) ctx.resolve("lamp");
    }

    // story beat: Harvey reacts at "...and he keeps it" (the end of the chapter)
    harvey.userData.act = { jolt: THREE.MathUtils.smoothstep(t, 0.82, 0.86) * (1 - THREE.MathUtils.smoothstep(t, 0.86, 0.92)) };
  });
  return set;
}
