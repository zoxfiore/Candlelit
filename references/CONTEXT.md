# References

These two videos are earlier story shorts made with WebGL (three.js):

- `short1_einsteins_brain_v2.mp4` — Einstein's brain
- `short2_mary_shelley_v1.mp4` — Mary Shelley

They show the look and the idea we are aiming for: a short history story told in a dark, candle-lit 3D scene,
with camera moves, lighting changes and effects driving each chapter.

## What we build now
The same idea, but **live in the browser** instead of a rendered video:

- Same stack: three.js (WebGL), Vite, lil-gui, plain JavaScript
- The user **scrolls** to move through the story instead of watching a video
- Everything renders in real time: lights, shadows, shaders, post-processing, particles
- One engine, many stories: these stories (or new ones, e.g. Shakespeare's grave) each live in `stories/<name>/`

The videos are references for mood, lighting and pacing only. All code is written by us from scratch.
