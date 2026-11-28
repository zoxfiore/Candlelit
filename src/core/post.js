// Post-processing: instead of drawing the scene straight to the screen, we draw it into a texture,
// then run full-screen effects on that texture before showing it.
//
//   SceneMixPass    draws the scene (HDR). During a chapter change it draws BOTH scenes (the end of
//                   this chapter and the start of the next one, each with its own camera) and blends
//                   them with a soft, drifting dissolve: no cut, no black screen.
//   GTAOPass        ambient occlusion: darkens corners, the floor under furniture, folds... the soft
//                   "contact shadows" that make objects sit IN the room instead of floating
//   UnrealBloomPass everything brighter than `threshold` leaks a soft glow around it (flames, bulbs)
//   OutputPass      tone mapping (AgX, film-like) + sRGB
//   grade pass      our own shader: warm colour grading, film grain, vignette

import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { Pass, FullScreenQuad } from "three/examples/jsm/postprocessing/Pass.js";
import { GTAOPass } from "three/examples/jsm/postprocessing/GTAOPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

const NOISE = /* glsl */ `
  float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
  float vnoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * vnoise(p); p *= 2.03; a *= 0.5; }
    return v;
  }`;

/** draws one scene, or two scenes blended together (chapter transitions) */
class SceneMixPass extends Pass {
  constructor() {
    super();
    this.needsSwap = false;
    this.sceneA = this.cameraA = this.sceneB = this.cameraB = null;
    this.mix = 0;
    this.time = 0;
    const opts = { type: THREE.HalfFloatType };
    this.rtA = new THREE.WebGLRenderTarget(1, 1, opts);
    this.rtB = new THREE.WebGLRenderTarget(1, 1, opts);
    this.quad = new FullScreenQuad(
      new THREE.ShaderMaterial({
        uniforms: { tA: { value: null }, tB: { value: null }, uMix: { value: 0 }, uTime: { value: 0 } },
        vertexShader: /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
        fragmentShader: /* glsl */ `
          uniform sampler2D tA, tB;
          uniform float uMix, uTime;
          varying vec2 vUv;
          ${NOISE}
          void main() {
            // the old picture drifts a little forward, the new one settles in from slightly bigger
            vec2 ca = (vUv - 0.5) * (1.0 - 0.04 * uMix) + 0.5;
            vec2 cb = (vUv - 0.5) * (1.0 + 0.05 * (1.0 - uMix)) + 0.5;
            vec3 a = texture2D(tA, ca).rgb;
            vec3 b = texture2D(tB, cb).rgb;
            // a soft cloudy dissolve: bright parts of the new image arrive first, like light
            float n = fbm(vUv * 2.6 + vec2(uTime * 0.05, 0.0));
            float lum = dot(b, vec3(0.3, 0.5, 0.2));
            float k = smoothstep(n - 0.35, n + 0.35, uMix * 1.7 - 0.35 + lum * 0.15);
            gl_FragColor = vec4(mix(a, b, k), 1.0);
          }`,
        depthTest: false,
        depthWrite: false,
      }),
    );
  }
  setSize(w, h) {
    this.rtA.setSize(w, h);
    this.rtB.setSize(w, h);
  }
  render(renderer, writeBuffer, readBuffer) {
    if (!this.sceneB || this.mix <= 0.001) {
      renderer.setRenderTarget(this.renderToScreen ? null : readBuffer);
      renderer.clear();
      renderer.render(this.sceneA, this.cameraA);
      return;
    }
    renderer.setRenderTarget(this.rtA);
    renderer.clear();
    renderer.render(this.sceneA, this.cameraA);
    renderer.setRenderTarget(this.rtB);
    renderer.clear();
    renderer.render(this.sceneB, this.cameraB);
    const u = this.quad.material.uniforms;
    u.tA.value = this.rtA.texture;
    u.tB.value = this.rtB.texture;
    u.uMix.value = this.mix;
    u.uTime.value = this.time;
    renderer.setRenderTarget(this.renderToScreen ? null : readBuffer);
    this.quad.render(renderer);
  }
}

/** GTAO that ignores see-through things (cut-out characters, flames, light beams, sprites) */
class SoftAOPass extends GTAOPass {
  // computed at half resolution (4x fewer pixels), then denoised: the eye cannot tell the difference
  setSize(width, height) {
    super.setSize(Math.ceil(width / 2), Math.ceil(height / 2));
  }
  _overrideVisibility() {
    const cache = this._visibilityCache;
    this.scene.traverse((o) => {
      const m = o.material;
      const seeThrough = o.isPoints || o.isLine || o.isSprite || (m && (m.visible === false || m.transparent || m.alphaTest > 0 || m.blending === THREE.AdditiveBlending));
      if (seeThrough && o.visible) {
        o.visible = false;
        cache.push(o);
      }
    });
  }
}

const GradeShader = {
  uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uGrain: { value: 0.045 }, uVignette: { value: 0.85 } },
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
      // colour grading: warm highlights, slightly cool deep shadows, a gentle S-curve of contrast
      float l = dot(color, vec3(0.2126, 0.7152, 0.0722));
      color = mix(color, color * vec3(0.92, 0.97, 1.06), (1.0 - smoothstep(0.0, 0.35, l)) * 0.35);
      color = mix(color, color * vec3(1.06, 1.0, 0.9), smoothstep(0.45, 1.0, l) * 0.4);
      color = mix(color, color * color * (3.0 - 2.0 * color), 0.25);
      // AgX is a little grey: give the colours back some life
      color = mix(vec3(dot(color, vec3(0.2126, 0.7152, 0.0722))), color, 1.2);
      // grain: a different random value per pixel AND per frame (stronger in the shadows, like film)
      float noise = hash(vUv * 1000.0 + fract(uTime) * 100.0) - 0.5;
      color += noise * uGrain * (1.2 - l);
      // vignette: darker toward the corners
      float d = distance(vUv, vec2(0.5));
      color *= 1.0 - smoothstep(0.38, 0.9, d) * uVignette;
      gl_FragColor = vec4(color, 1.0);
    }`,
};

export function createPost(renderer, camera) {
  const composer = new EffectComposer(renderer);
  const size = new THREE.Vector2(window.innerWidth, window.innerHeight);
  const scenePass = new SceneMixPass();
  const ao = new SoftAOPass(new THREE.Scene(), camera, size.x, size.y);
  ao.updateGtaoMaterial({ radius: 0.45, distanceExponent: 1.5, thickness: 1.2, scale: 1.0, samples: 12 });
  ao.updatePdMaterial?.({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 12 });
  ao.blendIntensity = 0.9;
  const bloom = new UnrealBloomPass(size, 0.32, 0.4, 0.98); // strength, radius, threshold
  const grade = new ShaderPass(GradeShader);
  const nextCamera = new THREE.PerspectiveCamera(45, camera.aspect, camera.near, camera.far);

  composer.addPass(scenePass);
  composer.addPass(ao);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  composer.addPass(grade);

  const resize = () => {
    composer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    composer.setSize(window.innerWidth, window.innerHeight);
  };
  resize();
  window.addEventListener("resize", resize);

  return {
    bloom,
    film: grade,
    ao,
    /** the camera used to film the NEXT chapter during a transition */
    nextCamera,
    /**
     * scene: this chapter. next: { scene, mix 0..1 } during a transition (camera = nextCamera).
     * aoAmount: 0..1 (the AO only knows one scene's depth, so it fades out during a blend)
     */
    render(scene, time, next = null, aoAmount = 1) {
      scenePass.sceneA = scene;
      scenePass.cameraA = camera;
      scenePass.sceneB = next?.scene ?? null;
      scenePass.cameraB = nextCamera;
      scenePass.mix = next?.mix ?? 0;
      scenePass.time = time;
      ao.scene = scene;
      ao.camera = camera;
      ao.enabled = aoAmount > 0.01;
      ao.blendIntensity = 0.9 * aoAmount;
      if (next) {
        nextCamera.aspect = camera.aspect;
        nextCamera.updateProjectionMatrix();
      }
      grade.uniforms.uTime.value = time;
      composer.render();
    },
  };
}
