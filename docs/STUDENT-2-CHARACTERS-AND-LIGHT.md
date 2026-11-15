# Student 2 — Characters & Light

**Your part: what makes the scene alive.** The characters (2D cut-outs in 3D), the hover cards,
the candles, the lamps, the shadows and our GLSL flame shader.

Your files:
```
src/characters/cutout.js     a PNG image → a standing cut-out with a real shadow
src/characters/cast.js       the list of characters + placeCharacter()
src/characters/pictures.js   2D objects (jar, newspaper, portrait...) + placePicture()
src/characters/billboard.js  turns the cut-outs toward the camera
src/ui/hover.js              Raycaster: what is under the mouse?
src/ui/tooltip.js            the info card that follows the mouse
stories/einstein/glossary.js the text of every hover card
src/lights/flicker.js        the flicker maths
src/lights/candle.js         candle = wax + shader flame + PointLight
src/lights/lamps.js          ambient, hanging lamp, spot, moonlight, headlights
src/shaders/flame/*.glsl     the flame shader (vertex + fragment)
src/shaders/flameMaterial.js the ShaderMaterial
src/core/renderer.js         shadows on, tone mapping
src/ui/debug.js              lil-gui sliders for the lights (?debug)
public/assets/characters/, public/assets/props/   the images
```

## 1. Characters: 2D cut-outs in a 3D world (`cutout.js`)
Same style as the reference videos: flat drawn characters standing in real 3D rooms.
Each character is a PNG with a transparent background, put on a `PlaneGeometry`:
1. **Proportions**: width = height × (image width / image height), so the image is not stretched.
2. `geometry.translate(0, height / 2, 0)`: the bottom of the plane is at y = 0, so the feet touch the floor.
3. `alphaTest: 0.5`: transparent pixels are thrown away → we see Einstein, not a rectangle.
4. **Shadows with the right shape**: by default a plane's shadow is a rectangle.
   `customDepthMaterial` (spot/directional lights) and `customDistanceMaterial` (point lights) use the
   image's alpha too, so the shadow on the wall has the shape of the character.
5. `emissive` + `emissiveMap`: a little self-light so characters never disappear in the dark.

**Billboarding** (`billboard.js`): every frame, each cut-out does
`lookAt(camera.x, ownY, camera.z)`: it turns toward the camera, but only around the vertical axis.

`cast.js` is just a table: image name → real height + hover card. `placeCharacter(set, "einstein", x, z)`.

## 2. Hover cards (`hover.js`)
1. Mouse position in pixels → **NDC** (from -1 to 1 on both axes, y up)
2. `raycaster.setFromCamera(mouse, camera)`: an invisible ray from the camera through the mouse
3. `raycaster.intersectObjects(scene.children, true)`: everything the ray hits, nearest first
4. On a cut-out we check the pixel under the mouse (`isSolidAt(uv)`): if it's transparent, we ignore it.
   Otherwise the empty space next to Einstein would show his card.
5. Walk up the parents until one has `userData.info` (e.g. `"harvey"`) → `glossary.harvey` → tooltip
6. The hovered character glows a bit (`emissiveIntensity`)

## 3. The 4 light types
| Light | Like... | Shadow | Used for |
|---|---|---|---|
| `HemisphereLight` | soft light from sky + floor | no | every set: nothing is pure black |
| `PointLight` | a bulb, all directions | yes (6 renders, expensive!) | candles |
| `SpotLight` | a cone | yes | hanging lamps, museum, car headlights |
| `DirectionalLight` | parallel rays from far away | yes | moon, sun through a window |

`decay = 2`: like real light, 2× farther = 4× darker.

## 4. Flicker (`flicker.js`)
`0.85 + 0.08·sin(7.1t) + 0.05·sin(13.7t) + 0.03·sin(29.3t)`: sine waves with speeds that don't match
never repeat visibly, so it looks random. Each candle has its own `seed`.
Every frame: `light.intensity = base × flicker(time)`.

## 5. Shadows
`renderer.shadowMap.enabled = true` + `light.castShadow = true` + `mesh.castShadow / receiveShadow`.
The light renders the scene from its own point of view and stores depths (the **shadow map**). A pixel
is in shadow if something is closer to the light. `shadow.bias` removes "shadow acne" stripes,
`shadow.radius` softens the edge. Max 1–2 shadow lights per set (each costs extra renders).

## 6. The GLSL flame shader
A shader = a small program running **on the GPU**. The flame is a flat square with a `ShaderMaterial`:
- **vertex shader** (once per corner): bends the top of the square left/right with two sine waves,
  `pos.x += sway * 0.035 * uv.y * uv.y` (the top moves, the wick doesn't)
- **fragment shader** (once per pixel): computes the colour with maths, no image:
  stretch space into a tall drop (`taper`) → `smoothstep` for a soft edge → white-yellow core,
  orange edge, blue base (`mix`) → plus a **halo** `exp(-distance × 10)`: the glow around the flame
- **uniforms** = values sent from JS each frame: `uTime`, `uSeed`, `uIntensity` (the flicker)
- `AdditiveBlending`: the colour is **added** to what's behind (black = invisible, bright = glow)

## 7. Tone mapping & debug
`ACESFilmicToneMapping` compresses very bright light values softly, like a film camera.
Open `?debug&chapter=2`: a slider for every light of the current chapter.

## TODO (your part)
- [ ] Tune the lights of every chapter with `?debug` and write the values into the set files
- [ ] Try other flame colours / shapes in `fragment.glsl` (e.g. a taller, thinner flame)
- [ ] Some characters are a bit small on a phone screen: check heights in `cast.js`
- [ ] Re-read every hover card text in `glossary.js` and check the facts
- [ ] Hover cards don't work on touch screens yet (no mouse): show the card on tap?
