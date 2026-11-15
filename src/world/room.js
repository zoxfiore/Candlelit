// A room = a floor + 3 walls (+ a ceiling). The front stays open: that's where the camera is,
// like a theatre stage. The textures are repeated so they keep a realistic size.
//
//   createRoom({ width: 7, depth: 5, floor: "wood-planks", floorColor: "#6a4630", wall: "plaster", wallColor: "#7a6450" })

import * as THREE from "three";
import { getTexture } from "../assets/loader.js";

// size (in metres) of ONE copy of each texture: [width, height]
const TEXTURE_SIZE = {
  "wood-planks": [2.3, 2.5],
  plaster: [2.3, 3.2],
  tiles: [1, 1],
  bricks: [2, 1.5],
  "checker-floor": [1, 1],
};

/** a matte material with a repeated texture, tinted with a colour */
function surface(textureName, color, width, height) {
  const [tw, th] = TEXTURE_SIZE[textureName];
  return new THREE.MeshLambertMaterial({ map: getTexture(textureName, width / tw, height / th), color });
}

function wall(width, height, material) {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
  mesh.receiveShadow = true;
  return mesh;
}

export function createRoom({
  width = 7,
  depth = 5,
  height = 3.2,
  floor = "wood-planks",
  floorColor = "#ffffff",
  wall: wallTexture = "plaster",
  wallColor = "#ffffff",
  ceiling = true,
}) {
  const room = new THREE.Group();

  const ground = wall(width, depth, surface(floor, floorColor, width, depth));
  ground.rotation.x = -Math.PI / 2; // a plane is vertical by default: lay it down
  room.add(ground);

  const back = wall(width, height, surface(wallTexture, wallColor, width, height));
  back.position.set(0, height / 2, -depth / 2);
  room.add(back);

  const left = wall(depth, height, surface(wallTexture, wallColor, depth, height));
  left.position.set(-width / 2, height / 2, 0);
  left.rotation.y = Math.PI / 2;
  room.add(left);

  const right = wall(depth, height, surface(wallTexture, wallColor, depth, height));
  right.position.set(width / 2, height / 2, 0);
  right.rotation.y = -Math.PI / 2;
  room.add(right);

  if (ceiling) {
    const top = wall(width, depth, new THREE.MeshLambertMaterial({ color: "#2a1e18" }));
    top.position.y = height;
    top.rotation.x = Math.PI / 2;
    room.add(top);
  }
  return room;
}
