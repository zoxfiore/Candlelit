// What the viewer is doing with mouse / touch / keyboard, readable by any set every frame.
//
//   input.pointer   mouse position in -1..1 (x right, y up), like the raycaster wants
//   input.down      true while the button / finger is pressed
//   input.clicked   true for ONE frame after a click (reset by input.endFrame())
//   input.keys      keys held now, e.g. input.keys.has("ArrowLeft")

import * as THREE from "three";

export function createInput() {
  const input = {
    pointer: new THREE.Vector2(),
    down: false,
    clicked: false,
    keys: new Set(),
    endFrame() {
      input.clicked = false;
    },
  };
  const move = (e) => {
    input.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    input.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
  };
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerdown", (e) => {
    if (e.target.closest("button")) return; // clicks on the UI are not story clicks
    move(e);
    input.down = true;
    input.clicked = true;
  });
  window.addEventListener("pointerup", () => (input.down = false));
  window.addEventListener("keydown", (e) => input.keys.add(e.key));
  window.addEventListener("keyup", (e) => input.keys.delete(e.key));
  window.addEventListener("blur", () => {
    input.keys.clear();
    input.down = false;
  });
  return input;
}
