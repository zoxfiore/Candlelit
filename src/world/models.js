// Put a 3D model (.glb file from public/assets/models) in a set.
//
//   placeModel(set, "desk", -1.2, -0.9)                              // x, z (on the floor)
//   placeModel(set, "beer-cooler", 1.6, -1.4, { info: "cooler" })    // info = hover card
//   placeModel(set, "table", 0.8, -0.6, { scale: 0.7, rotationY: 0.3, y: 0 })

import { getModel } from "../assets/loader.js";
import { flashNote } from "../ui/task.js";

export function placeModel(set, name, x, z, { y = 0, rotationY = 0, scale = 1, info = null } = {}) {
  const model = getModel(name);
  model.position.set(x, y, z);
  model.rotation.y = rotationY;
  model.scale.setScalar(scale);
  if (info) model.userData.info = info;
  // a decorative door (in an outside wall: it leads nowhere) says so when you try it
  if (name === "door") model.userData.interact = () => flashNote("This door is locked.");
  set.add(model);
  return model;
}

/** a window on a wall. glassColor = the colour of the sky behind it (night blue, sunset...) */
export function placeWindow(set, x, y, z, { rotationY = 0, glassColor = "#2a3448", scale = 1 } = {}) {
  const win = placeModel(set, "window", x, z, { y, rotationY, scale });
  const glass = win.getObjectByName("glass");
  glass.material = glass.material.clone(); // own copy, so other windows keep their colour
  glass.material.color.set(glassColor);
  return win;
}
