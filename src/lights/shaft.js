// A volumetric light shaft ("god ray"): the visible cone of light you see in a dusty room.
//
// Real volumetric light needs ray-marching through fog, which is expensive. The classic game trick:
// an open cone mesh drawn with ADDITIVE blending and a shader that makes it
//   - bright near the lamp and fading to nothing at the far end   (vUv.y along the cone)
//   - soft at its silhouette edges                                (normal facing away from the camera)
//   - slowly "breathing" with drifting noise, like dust moving in the beam
// Additive = it only adds light, so it can never darken what is behind it.
//
//   const shaft = createLightShaft({ angle: 0.6, length: 3, color: "#ffd9a0" })
//   spotLight.add(shaft)            // the cone points down -Y from its tip

import * as THREE from "three";

const vertexShader = /* glsl */ `
  varying float vAlong;
  varying vec3 vNormalView;
  varying vec3 vViewDir;
  varying vec3 vLocal;
  void main() {
    vAlong = uv.y;                                  // 1 at the lamp, 0 at the far end
    vLocal = position;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormalView = normalize(normalMatrix * normal);
    vViewDir = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uTime, uOpacity;
  varying float vAlong;
  varying vec3 vNormalView;
  varying vec3 vViewDir;
  varying vec3 vLocal;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
  }
  void main() {
    // soft edges: the cone wall seen face-on is bright, seen edge-on fades out
    float facing = abs(dot(vNormalView, vViewDir));
    float edge = pow(facing, 1.2);
    // brightest at the lamp, gone at the end of the beam
    float along = pow(vAlong, 1.4);
    // slow drifting dust
    float dust = 0.75 + 0.5 * noise(vec2(atan(vLocal.x, vLocal.z) * 2.0, vLocal.y * 1.5 - uTime * 0.25));
    float a = edge * along * dust * uOpacity;
    gl_FragColor = vec4(uColor * a, a);
  }`;

export function createLightShaft({ angle = 0.6, length = 3, color = "#ffd9a0", opacity = 0.12, topRadius = 0.06 } = {}) {
  const radius = Math.tan(angle) * length * 0.85;
  const geometry = new THREE.CylinderGeometry(topRadius, radius, length, 48, 1, true);
  geometry.translate(0, -length / 2, 0); // tip at the origin, cone going down
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: { uColor: { value: new THREE.Color(color) }, uTime: { value: 0 }, uOpacity: { value: opacity } },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
  const shaft = new THREE.Mesh(geometry, material);
  shaft.userData.noHover = true;
  shaft.raycast = () => {}; // the mouse goes through the light
  shaft.castShadow = false;
  shaft.renderOrder = 5;
  shaft.userData.base = opacity;
  // called by the lamp that owns it (not by the set), so the beam follows the light's flicker
  shaft.userData.tick = (time, intensityFactor = 1) => {
    material.uniforms.uTime.value = time;
    material.uniforms.uOpacity.value = shaft.userData.base * intensityFactor;
  };
  return shaft;
}
