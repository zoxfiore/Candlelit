# Student 1 — The World

**Your part: the places.** Loading the asset files, building the rooms, placing the furniture,
and the 12 sets of the story.

Your files:
```
src/assets/manifest.js    the list of every asset file
src/assets/loader.js      loads everything at the start (GLTFLoader, TextureLoader, LoadingManager)
src/world/room.js         floor + 3 walls + ceiling, with repeated textures
src/world/models.js       placeModel(), placeWindow(): put a .glb model in a set
src/world/brainBlocks.js  the 240 brain blocks (InstancedMesh)
src/world/set.js          createSet(): one THREE.Scene per chapter
stories/einstein/sets/    the 12 sets (01-study.js ... 12-museum.js)
public/assets/models/     the 3D models (.glb)
public/assets/textures/   floor and wall textures
```

## 1. Loading assets (`loader.js`)
Like the Assets folder in Unity: the files are in `public/assets/`, and we load them **once**, before
the story starts.
- `GLTFLoader` loads `.glb` files (glTF = the standard 3D format for the web, "the JPEG of 3D").
  One file contains the geometry, the materials and the textures.
- `TextureLoader` loads images (`.jpg`, `.png`).
- A `LoadingManager` counts the files: its `onProgress` updates the "Loading… 45%" button, and its
  `onLoad` tells us that everything is ready.

After that, the sets just ask: `getModel("desk")` gives a **copy** (`.clone()`) of the desk,
so the same model can be used in several chapters. The function also turns on shadows for every part.

## 2. A room (`room.js`)
A room is 5 planes (`PlaneGeometry`): a floor, a back wall, 2 side walls and a ceiling.
The front is open: the camera is there, like the audience of a theatre.
- A plane is vertical by default: for the floor, `rotation.x = -Math.PI / 2` lays it down.
- **Repeated textures**: one wood texture covers 2.3 m. For a 7 m floor we repeat it 7 / 2.3 = 3 times
  (`RepeatWrapping` + `texture.repeat.set(x, y)`), otherwise the planks would be huge.
- **Tint**: the textures are light/neutral; `material.color` multiplies them. The same plaster
  image gives a green wall in chapter 3 and a red wall in the museum.
- `MeshLambertMaterial` = matte surface, cheap to compute.

## 3. Placing models (`models.js`)
```js
placeModel(set, "beer-cooler", 1.6, -1.4, { info: "cooler" });
```
x and z on the floor; options: `y` (height, e.g. on a table), `rotationY`, `scale`,
`info` (hover card key). `placeWindow` changes the colour of the glass (night blue, sunset...): it
**clones** the material first, otherwise all windows would change together (they share it).

## 4. InstancedMesh: 240 blocks in 1 draw call (`brainBlocks.js`)
240 meshes = 240 draw calls (slow). An `InstancedMesh` draws the same box 240 times in **one** call.
Each copy gets its own matrix with `setMatrixAt(i, matrix)` (we fill a `dummy` Object3D with a
position/rotation, then copy its matrix) and its own colour with `setColorAt`.
In chapter 5, `blocks.count` grows with the scroll: the blocks appear one by one.

## 5. A set (`set.js` + `stories/einstein/sets/`)
Every chapter has its own `THREE.Scene`. Every set file follows the same recipe:
```js
const set = createSet({ background: "#080605" });
set.add(createRoom({ width: 7, depth: 5, floorColor: "#8a5a3c", wallColor: "#8a725c" })); // the room
placeModel(set, "desk", -1.2, -0.9);                                                      // furniture
placeCharacter(set, "einstein", 0.4, -1.1);                                               // people (Student 2)
set.add(createCandle({ intensity: 8, shadows: true }));                                   // lights (Student 2)
return set;
```
`set.onUpdate((time, delta, t) => ...)` adds an animation. `t` = how far we are in the chapter (0..1).
Best example, chapter 9 (the road): **the car does not move**. The road texture slides
(`texture.offset.y`), the poles move toward the camera and jump back to the far end when they pass
it, and the wheels turn (`angle = distance / radius`).

## TODO (your part)
- [ ] Rearrange at least 2 sets your own way (positions, which furniture, room size)
- [ ] Choose the floor/wall colours of each room (the `floorColor` / `wallColor` tints)
- [ ] Chapter 2: the autopsy table sheet looks too bright and flat, try a darker colour or another angle
- [ ] Chapter 9: add something along the road (a motel sign, a second car...) with `placeModel`
- [ ] Check the loading time: `public/assets/` is ~9.5 MB, can some PNGs be smaller?
