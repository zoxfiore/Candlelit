# Scroll Story — a WebGL scroll-driven 3D story

A short interactive story told in 3D: scroll the page and the camera moves through a dark, candle-lit
scene while the story unfolds in chapters. Built from scratch with three.js as a school WebGL project.

## Features
- **Scroll-driven camera**: each chapter has a camera path, lighting and events tied to the scroll position
- **Lighting**: ambient, point, spot and directional lights; real-time shadows; flickering candles; moonlight
- **Procedural world**: geometry generated in code (walls, floor, props), instancing for repeated objects
- **Custom shaders (GLSL)**: candle flame, a reveal/scan effect, film grain + vignette
- **Post-processing**: bloom, depth of field
- **Particles**: dust floating in the light
- **Debug panel**: live sliders for lights and effects (lil-gui)

## Tech
- three.js
- Vite
- lil-gui
- No backend

## Run
    npm install
    npm run dev

## Structure
    src/
      main.js        renderer, camera, loop
      world/         procedural geometry (room, props)
      lights/        light setup, candle flicker
      shaders/       custom GLSL
      story/         chapters + scroll timeline
      post/          post-processing
      ui/            debug panel

## Story
To be decided. Chapters live in `src/story/` so the story can change without touching the engine.

## Author
<your name> — <course>, <school>, <year>
