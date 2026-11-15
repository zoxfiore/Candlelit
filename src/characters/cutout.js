// A "cut-out": a flat plane showing a PNG image with a transparent background
// (a character or a 2D object), standing in the 3D world like a cardboard figure.
//
//  - alphaTest: transparent pixels are not drawn, so we see the shape, not a rectangle
//  - custom depth materials: the SHADOW also has the shape of the image
//  - the bottom of the image is at y = 0, so the feet touch the floor

import * as THREE from "three";

export function createCutout(texture, height, { info = null, faceCamera = true, glow = 0.12 } = {}) {
  const image = texture.image;
  const width = (height * image.width) / image.height; // keep the image's proportions

  const geometry = new THREE.PlaneGeometry(width, height);
  geometry.translate(0, height / 2, 0); // move the plane up: its bottom edge is now at y = 0

  const material = new THREE.MeshLambertMaterial({
    map: texture,
    alphaTest: 0.5, // pixels with alpha < 0.5 are thrown away
    side: THREE.DoubleSide,
    emissive: "#ffffff", // a little self-light, so the characters never disappear in the dark
    emissiveMap: texture,
    emissiveIntensity: glow,
  });

  const cutout = new THREE.Mesh(geometry, material);
  cutout.castShadow = true;
  // without these two, the shadow would be a full rectangle
  cutout.customDepthMaterial = new THREE.MeshDepthMaterial({ map: texture, alphaTest: 0.5 }); // spot & directional lights
  cutout.customDistanceMaterial = new THREE.MeshDistanceMaterial({ map: texture, alphaTest: 0.5 }); // point lights

  cutout.userData.info = info; // key of the hover card (stories/einstein/glossary.js)
  cutout.userData.faceCamera = faceCamera; // see billboard.js
  cutout.userData.baseGlow = glow; // used by the hover highlight
  cutout.userData.isSolidAt = makeAlphaTest(image); // used by the hover: ignore transparent pixels
  return cutout;
}

/** returns a function (uv) => true if the pixel of the image at uv is not transparent */
function makeAlphaTest(image) {
  let pixels = null;
  return (uv) => {
    if (!pixels) {
      // copy the image into a canvas once, to be able to read its pixels
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(image, 0, 0);
      pixels = ctx.getImageData(0, 0, image.width, image.height).data;
    }
    const x = Math.floor(uv.x * (image.width - 1));
    const y = Math.floor((1 - uv.y) * (image.height - 1));
    return pixels[(y * image.width + x) * 4 + 3] > 128; // alpha channel
  };
}
