# Assets to download (Sketchfab + Mixamo)

The engine is ready for real 3D characters: drop a `.glb` in `public/assets/actors/`, add its name to
`ACTORS` in `src/assets/manifest.js`, and the story uses it instead of the low-poly figure
(`src/characters/figure.js`). Its animation clips are played with an `AnimationMixer`.

## Rules

- **One style for everything**: *low-poly / stylised* (flat colours, simple shapes), like the current figures.
  Do not mix realistic people with low-poly rooms.
- **Licence**: on Sketchfab, filter *Downloadable* + licence **CC0** or **CC Attribution**.
  Write the author and the link in `public/assets/CREDITS.md` for every model.
- **Format**: download the **glTF / .glb** version. Keep each character under ~5 MB.
- **Size**: about 1.7 m tall, feet at y = 0, facing +Z (Mixamo does this for you).

## Characters (file name → who)

| File (`public/assets/actors/`) | Who | Search on Sketchfab |
|---|---|---|
| `carter.glb` | Howard Carter, 1920s explorer: light suit, hat, moustache | `low poly explorer 1920s`, `low poly archaeologist` |
| `carnarvon.glb` | Lord Carnarvon: dark suit, fedora | `low poly gentleman suit hat` |
| `evelyn.glb` | Lady Evelyn: 1920s long dress | `low poly woman 1920s dress` |
| `worker.glb` | Egyptian workman: white robe (galabiya), turban | `low poly arab man robe`, `low poly egyptian worker` |
| `boy.glb` | the water boy (smaller workman) | same as worker, scaled 0.8 |
| `einstein.glb` | Albert Einstein (old man, white hair, cardigan) | `low poly old man scientist` |
| `harvey.glb` | Dr Thomas Harvey (lab coat, glasses) | `low poly doctor lab coat` |
| `levy.glb` | the journalist (1970s, shirt) | `low poly man casual 70s` |

## Animations with Mixamo (free, Adobe account)

1. Go to **mixamo.com**, *Upload Character*, choose the character file (FBX or OBJ export from Blender if needed).
2. Place the markers (chin, wrists, elbows, knees, groin) → Mixamo adds the skeleton.
3. Pick the animations and download each one **"With Skin" for the first, "Without Skin" for the others**:
   - `Idle` (standing, breathing)
   - `Talking` (explaining with the hands)
   - `Walking`
   - `Pointing`
   - `Pulling` / `Lifting` (for the ropes in chapter 3)
4. In Blender: import the FBX files, keep one armature, push each animation as an NLA track with its
   name (`Idle`, `Talking`...), then *Export glTF 2.0 (.glb)* with *Animations* ticked.
5. Put the `.glb` in `public/assets/actors/` and add the name to `ACTORS`.

The story then plays `Idle` by default; a set can switch with `person.userData.play("Talking")`.

## Props and rooms (optional, same style)

| Search | Used in |
|---|---|
| `low poly egyptian sarcophagus` | Tutankhamun ch. 3 |
| `low poly tutankhamun mask` (CC licence only) | Tutankhamun ch. 3 |
| `low poly egyptian statue`, `low poly golden chest` | Tutankhamun ch. 2 |
| `low poly desert rocks`, `low poly cliff` | Tutankhamun ch. 1 |
| `low poly microscope`, `low poly 1950s desk` | Einstein |
