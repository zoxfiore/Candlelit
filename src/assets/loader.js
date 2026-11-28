// Loads all the assets at the start, then gives them to the sets.
//
//   await loadAssets((progress) => console.log(progress))   // 0..1
//   const desk = getModel("desk")                // a NEW copy of the 3D model
//   const wood = getTexture("wood-planks", 3, 2) // texture repeated 3 x 2 times
//   const img  = getImage("einstein")            // texture of a character / 2D prop

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import { MODELS, TEXTURES, CHARACTERS, PROPS, ACTORS } from "./manifest.js";

const models = {};
const textures = {};
const images = {};
const actors = {}; // rigged characters: { scene, animations }

export function loadAssets(onProgress) {
  // the LoadingManager counts the files and tells us the progress
  const manager = new THREE.LoadingManager();
  manager.onProgress = (url, loaded, total) => onProgress(loaded / total);

  const gltfLoader = new GLTFLoader(manager);
  const textureLoader = new THREE.TextureLoader(manager);

  for (const name of MODELS) {
    gltfLoader.load(`assets/models/${name}.glb`, (gltf) => (models[name] = gltf.scene));
  }
  for (const file of TEXTURES) {
    const name = file.split(".")[0]; // "plaster.png" -> "plaster"
    textures[name] = textureLoader.load(`assets/textures/${file}`);
    textures[name].colorSpace = THREE.SRGBColorSpace;
  }
  for (const name of ACTORS) {
    gltfLoader.load(`assets/actors/${name}.glb`, (gltf) => (actors[name] = gltf), undefined, () => {}); // missing = use the figure
  }
  for (const name of CHARACTERS) images[name] = loadImage(textureLoader, `assets/characters/${name}.png`);
  for (const name of PROPS) images[name] = loadImage(textureLoader, `assets/props/${name}.png`);

  // resolves when every file is loaded
  return new Promise((resolve) => (manager.onLoad = resolve));
}

function loadImage(loader, url) {
  const texture = loader.load(url);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

/** a copy of a 3D model, with shadows turned on for every part */
export function getModel(name) {
  const model = models[name].clone();
  model.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  return model;
}

/** a texture that repeats (for floors and walls) */
export function getTexture(name, repeatX = 1, repeatY = 1) {
  const texture = textures[name].clone(); // clone = same image, its own repeat settings
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  texture.needsUpdate = true;
  return texture;
}

/** the texture of a character or 2D prop image */
export function getImage(name) {
  return images[name];
}

/** is there a rigged .glb for this character? */
export function hasActor(name) {
  return !!actors[name];
}

/** a copy of a rigged character (SkeletonUtils.clone also copies the skeleton) + its animation clips */
export function getActor(name) {
  return { scene: cloneSkinned(actors[name].scene), animations: actors[name].animations };
}
