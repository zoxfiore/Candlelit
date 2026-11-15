// Flame fragment shader: runs once for every pixel of the flame square.
// It draws two things with maths (no image):
//   1. a teardrop-shaped flame: white-yellow core, orange edge, a bit of blue at the base
//   2. a soft round glow (halo) around it, so the candle looks bright without post-processing

uniform float uTime;
uniform float uSeed;
uniform float uIntensity;  // flicker value from JavaScript (about 0.7 .. 1.1)

varying vec2 vUv;

void main() {
  // move the origin to the wick (centre, 35% from the bottom)
  vec2 p = vUv - vec2(0.5, 0.35);

  // ---- 1. the flame ----
  // stretch the space so the flame is narrow (0.06 wide) and tall (0.24 high)
  vec2 f = p / vec2(0.06, 0.24);
  // small wave inside the flame (moves upward with time)
  f.x += sin(f.y * 5.0 - uTime * 12.0 + uSeed) * 0.08 * max(f.y, 0.0);
  // teardrop: above the wick the flame gets thinner toward the tip, below it is a squashed circle
  float taper = 1.0 - 0.85 * clamp(f.y, 0.0, 1.0);
  float d = length(vec2(f.x / taper, f.y < 0.0 ? f.y * 2.5 : f.y));
  float flame = 1.0 - smoothstep(0.75, 1.0, d);       // 1 inside, 0 outside, soft edge
  float core = 1.0 - smoothstep(0.0, 0.65, d);        // bright centre

  vec3 orange = vec3(1.0, 0.45, 0.1);
  vec3 yellow = vec3(1.0, 0.92, 0.65);
  vec3 blue = vec3(0.25, 0.35, 1.0);
  vec3 color = mix(orange, yellow, core);
  color = mix(color, blue, smoothstep(0.0, -0.5, f.y) * 0.6);   // blue at the base

  // ---- 2. the halo ----
  float dist = length(p * vec2(1.0, 0.8));
  float halo = exp(-dist * 10.0) * 0.45;
  vec3 haloColor = vec3(1.0, 0.6, 0.25);

  vec3 result = (color * flame + haloColor * halo) * uIntensity;

  // additive blending: black = invisible, bright = glows on top of the scene
  gl_FragColor = vec4(result, 1.0);
}
