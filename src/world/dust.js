// Dust floating in the air: a THREE.Points cloud (one draw call, every point is a tiny glowing dot).
// The movement is done on the GPU, in the vertex shader: each point drifts on its own slow sine path,
// so the CPU never touches the 600 positions after the start.

import * as THREE from "three";

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  attribute float aSeed;
  varying float vTwinkle;
  void main() {
    vec3 p = position;
    p.x += sin(uTime * 0.13 + aSeed * 6.0) * 0.25;
    p.y += sin(uTime * 0.09 + aSeed * 9.0) * 0.18;
    p.z += cos(uTime * 0.11 + aSeed * 4.0) * 0.25;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.5 + aSeed) / -mv.z;   // smaller when far away
    vTwinkle = 0.5 + 0.5 * sin(uTime * (1.0 + aSeed * 2.0) + aSeed * 30.0);
  }`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vTwinkle;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);              // soft round dot
    gl_FragColor = vec4(uColor, a * uOpacity * vTwinkle);
  }`;

export function createDust({ count = 260, size = [6, 2.8, 5], color = "#ffd2a0", opacity = 0.16 } = {}) {
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * size[0];
    positions[i * 3 + 1] = Math.random() * size[1];
    positions[i * 3 + 2] = (Math.random() - 0.5) * size[2];
    seeds[i] = Math.random();
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uSize: { value: 11 * Math.min(window.devicePixelRatio, 2) },
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: opacity },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const dust = new THREE.Points(geometry, material);
  dust.userData.noHover = true;
  dust.raycast = () => {}; // the mouse goes through the dust
  dust.userData.update = (time) => (material.uniforms.uTime.value = time);
  return dust;
}
