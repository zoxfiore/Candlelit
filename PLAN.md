# Candlelit — Project Plan

## The idea
A scroll-driven 3D story in the browser with three.js: **The Stolen Brain of Albert Einstein**.
Inspired by our earlier rendered short (`references/short1_einsteins_brain_v2.mp4`), but live, interactive
and longer: 12 chapters, hover cards on every character and key object, one voice-over clip per chapter.

The **engine** (`src/`) knows nothing about Einstein. The **story** (`stories/einstein/`) is data + sets.

## Graded features
1. Lighting: hemisphere, point, spot, directional; real-time shadows; flickering candles; moonlight
2. One custom GLSL shader: candle flame + halo
3. Asset loading (glTF models, textures, cut-out characters) + InstancedMesh
4. Scroll-driven camera, chapters, fades
5. Interaction: raycasting hover cards, subtitles, voice-over

Rules: three.js code, no 3D editor, no backend. Assets (models, textures, character images) are
AI-generated and credited in `public/assets/CREDITS.md`.

## Team (3 students)
| Student | Owns | Focus |
|---|---|---|
| 1 — World | `src/assets/`, `src/world/`, `stories/einstein/sets/` | the places: loading assets, rooms, models, the 12 sets |
| 2 — Characters & Light | `src/characters/`, `src/lights/`, `src/shaders/`, `src/core/renderer.js`, `src/ui/hover.js`, `tooltip.js`, `debug.js`, `glossary.js` | what is alive: cut-outs, hover cards, light, shadows, flame shader |
| 3 — Story & UI | `index.html`, `src/main.js`, `src/story/`, the rest of `src/ui/`, `src/styles/`, `stories/einstein/story.js` | what happens: loop, scroll, chapters, camera, subtitles, audio |

Each student explains their part with their guide in `docs/`.

## Contracts between the parts
- Every module exports a `create…()` function. If it animates, it has `userData.update(time, delta)`
  (candles, lamps) or the set registers `set.onUpdate((time, delta, t) => ...)`.
- A set is `createSet()` + objects, returned to the director. `t` = chapter progress 0..1.
- Hoverable objects have `userData.info = "<glossary key>"`.
- `main.js` only wires things together.

## Remaining work
- [ ] Final voice-over script → 12 audio files in `public/audio/` → update `lines` in `story.js`
- [ ] Adjust `screens` per chapter to the length of each audio clip
- [ ] Each student: read your guide, run the project with `?debug`, change one value and see the effect
- [ ] Rehearsal: each student presents their part (5 min each)

## Git workflow
- `main` always runs. One branch per task: `feature/…`, `fix/…`, `docs/…`
- Pull request → another student reviews → merge
- Stay in your own folders → almost no conflicts
