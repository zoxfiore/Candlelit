# Candlelit — The Stolen Brain of Albert Einstein

A scroll-driven 3D story in the browser, made with **three.js (WebGL)**.
You scroll, and the camera moves through 12 small candle-lit sets while the story is told:
in 1955 a doctor took Einstein's brain, kept it for 43 years, hid it in a cider box,
drove it across America... and today some of it is in a museum.

Characters are flat 2D cut-outs standing in simple 3D rooms, lit by flickering candles and lamps
with real-time shadows. Models, textures and character images are AI-generated assets
(`public/assets/CREDITS.md`); the code loads, places, lights and animates them.

## Run

    npm install
    npm run dev

Then open http://localhost:5173

- `?chapter=7` jumps straight to chapter 7 (handy for the presentation)
- `?debug` opens the lil-gui panel: exposure and a slider for every light of the current chapter

## What you can do
- **Scroll**: move through the story (12 chapters, about 35 screens)
- **Hover** people and objects: a card explains who or what they are
- **🔊**: voice-over on / off (one narrated track per chapter, with music and sound effects)

## WebGL features
| Feature | Where |
|---|---|
| Loading 3D models (glTF) and textures, loading progress | `src/assets/` |
| Rooms from planes, repeated + tinted textures | `src/world/room.js` |
| InstancedMesh (240 brain blocks in one draw call) | `src/world/brainBlocks.js` |
| 2D cut-out characters with alpha test, shaped shadows, billboarding | `src/characters/` |
| Lights: hemisphere, point, spot, directional + real-time shadows | `src/lights/` |
| Custom GLSL shader (candle flame + halo) | `src/shaders/flame/` |
| Raycasting (hover cards) | `src/ui/hover.js` |
| Scroll → chapters → camera animation, fades | `src/story/` |

## Project structure

```
index.html                  page: canvas + HTML overlays (titles, subtitles, tooltip)
public/assets/              AI-generated assets: models/ (.glb), textures/, characters/, props/ (see CREDITS.md)
public/audio/               voice-over + music + sound effects, one track per chapter (AI-generated, see CREDITS.md)
src/
  main.js                   connects everything + render loop
  core/                     renderer, camera, resize
  assets/                   manifest + loader                          [Student 1: World]
  world/                    room, placeModel, brain blocks, createSet   [Student 1: World]
  characters/               cut-outs, cast, pictures, billboard        [Student 2: Characters & Light]
  lights/  shaders/         candles, lamps, flicker, GLSL flame        [Student 2: Characters & Light]
  ui/hover.js, tooltip.js   hover cards                                [Student 2: Characters & Light]
  story/                    scroll, director, camera rig               [Student 3: Story & UI]
  ui/  styles/              subtitles, titles, audio, start screen     [Student 3: Story & UI]
stories/einstein/
  sets/01-...12-*.js        one 3D set per chapter                     [Student 1, lights by Student 2]
  glossary.js               hover card texts                           [Student 2]
  story.js                  the 12 chapters: text, camera, audio       [Student 3]
docs/                       one guide per student + story facts
```

## Team
| Student | Part | Guide |
|---|---|---|
| 1 | **World**: assets loading, rooms, models, the 12 sets | [docs/STUDENT-1-WORLD.md](docs/STUDENT-1-WORLD.md) |
| 2 | **Characters & Light**: cut-outs, hover cards, lights, shadows, GLSL flame | [docs/STUDENT-2-CHARACTERS-AND-LIGHT.md](docs/STUDENT-2-CHARACTERS-AND-LIGHT.md) |
| 3 | **Story & UI**: render loop, scroll, chapters, camera, subtitles, audio | [docs/STUDENT-3-STORY-AND-UI.md](docs/STUDENT-3-STORY-AND-UI.md) |

Story facts and sources: [docs/STORY.md](docs/STORY.md)

## Tech
three.js (GLTFLoader) · Vite · lil-gui · plain JavaScript (ES modules). No backend.
