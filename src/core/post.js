// Post-processing: instead of drawing the scene straight to the screen, we draw it into a texture,
// then run full-screen effects on that texture before showing it.
//
//   RenderPass      draws the scene (in HDR: colours can be brighter than 1)
//   UnrealBloomPass everything brighter than `threshold` leaks a soft glow around it (flames, bulbs)
//   OutputPass      tone mapping + sRGB (what the renderer did by itself before)
//   film pass       our own small shader: film grain + a vignette, like an old lens,
//                   and the chapter transition: the image burns away like old paper (uBurn 0..1)

import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

const FilmShader = {
  uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uGrain: { value: 0.06 }, uVignette: { value: 0.9 }, uBurn: { value: 0 }, uAspect: { value: 1 } },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime, uGrain, uVignette, uBurn, uAspect;
    varying vec2 vUv;
    float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    float vnoise(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
    }
    // fractal noise: a few layers of noise, each finer and fainter -> ragged, paper-like shapes
    float fbm(vec2 p) {
      float v = 0.0, a = 0.5;
      for (int i = 0; i < 5; i++) { v += a * vnoise(p); p *= 2.03; a *= 0.5; }
      return v;
    }
    void main() {
      vec3 color = texture2D(tDiffuse, vUv).rgb;
      // grain: a different random value per pixel AND per frame
      float noise = hash(vUv * 1000.0 + fract(uTime) * 100.0) - 0.5;
      color += noise * uGrain;
      // vignette: darker toward the corners
      float d = distance(vUv, vec2(0.5));
      color *= 1.0 - smoothstep(0.35, 0.85, d) * uVignette;

      // burn transition: every pixel gets a "burn time" from the noise (+ the corners burn first).
      // when uBurn passes that time the pixel is ash (black); just before, it glows like an ember.
      if (uBurn > 0.0) {
        vec2 p = vec2(vUv.x * uAspect, vUv.y);
        float n = fbm(p * 3.5) * 0.75 + (1.0 - d * 1.3) * 0.25;
        float level = uBurn * 1.25 - 0.12;            // 0 -> nothing burnt, 1 -> everything burnt
        float burnt = smoothstep(n - 0.01, n + 0.01, level);
        float edge = smoothstep(n - 0.035, n, level) * (1.0 - burnt);
        vec3 ember = mix(vec3(0.9, 0.25, 0.04), vec3(1.0, 0.8, 0.35), edge * edge);
        color = mix(color, color * 0.35, smoothstep(n - 0.12, n - 0.03, level)); // paper browns before it burns
        color += ember * edge * 1.1;
        color = mix(color, vec3(0.0), burnt);
      }
      gl_FragColor = vec4(color, 1.0);
    }`,
};

export function createPost(renderer, camera) {
  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(new THREE.Scene(), camera);
  const size = new THREE.Vector2(window.innerWidth, window.innerHeight);
  const bloom = new UnrealBloomPass(size, 0.32, 0.4, 0.98); // strength, radius, threshold
  const film = new ShaderPass(FilmShader);

  composer.addPass(renderPass);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  composer.addPass(film);

  film.uniforms.uAspect.value = window.innerWidth / Math.max(1, window.innerHeight);
  window.addEventListener("resize", () => {
    film.uniforms.uAspect.value = window.innerWidth / Math.max(1, window.innerHeight);
    composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    composer.setSize(window.innerWidth, window.innerHeight);
  });

  return {
    bloom,
    film,
    /** 0 = clear picture, 1 = fully burnt (black) */
    setBurn(v) {
      film.uniforms.uBurn.value = v;
    },
    render(scene, time) {
      renderPass.scene = scene;
      film.uniforms.uTime.value = time;
      composer.render();
    },
  };
}
