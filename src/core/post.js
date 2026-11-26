// Post-processing: instead of drawing the scene straight to the screen, we draw it into a texture,
// then run full-screen effects on that texture before showing it.
//
//   RenderPass      draws the scene (in HDR: colours can be brighter than 1)
//   UnrealBloomPass everything brighter than `threshold` leaks a soft glow around it (flames, bulbs)
//   OutputPass      tone mapping + sRGB (what the renderer did by itself before)
//   film pass       our own small shader: film grain + a vignette, like an old lens

import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

const FilmShader = {
  uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uGrain: { value: 0.06 }, uVignette: { value: 0.9 } },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime, uGrain, uVignette;
    varying vec2 vUv;
    float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    void main() {
      vec3 color = texture2D(tDiffuse, vUv).rgb;
      // grain: a different random value per pixel AND per frame
      float noise = hash(vUv * 1000.0 + fract(uTime) * 100.0) - 0.5;
      color += noise * uGrain;
      // vignette: darker toward the corners
      float d = distance(vUv, vec2(0.5));
      color *= 1.0 - smoothstep(0.35, 0.85, d) * uVignette;
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

  window.addEventListener("resize", () => {
    composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    composer.setSize(window.innerWidth, window.innerHeight);
  });

  return {
    bloom,
    film,
    render(scene, time) {
      renderPass.scene = scene;
      film.uniforms.uTime.value = time;
      composer.render();
    },
  };
}
