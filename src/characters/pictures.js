// 2D objects (public/assets/props/*.png): the jar, the microscope, the newspaper, the portrait...
// Same cut-out as the characters, but they don't turn toward the camera by default.
//
//   placePicture(set, "newspaper", 0.6, 0.75, -0.7, { height: 0.6, rotationY: 0.25, info: "newspaper" })

import { getImage } from "../assets/loader.js";
import { createCutout } from "./cutout.js";

export function placePicture(set, name, x, y, z, { height = 0.5, rotationY = 0, info = null, faceCamera = false, glow = 0.12 } = {}) {
  const picture = createCutout(getImage(name), height, { info, faceCamera, glow });
  picture.position.set(x, y, z);
  picture.rotation.y = rotationY;
  set.add(picture);
  return picture;
}
