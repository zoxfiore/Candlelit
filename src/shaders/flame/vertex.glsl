// Flame vertex shader.
// The flame is a flat square (a plane). We bend its top part left and right over time,
// so the flame "dances". The bottom (the wick) does not move.

uniform float uTime;   // seconds since start (sent from JavaScript every frame)
uniform float uSeed;   // a different number per candle, so they don't all move together

varying vec2 vUv;      // texture coordinates, passed to the fragment shader

void main() {
  vUv = uv;

  vec3 pos = position;

  // two sine waves at different speeds = a movement that looks random
  float sway = sin(uTime * 5.0 + uSeed) * 0.6 + sin(uTime * 11.0 + uSeed * 2.0) * 0.4;

  // uv.y = 0 at the bottom, 1 at the top. Squared: the top moves a lot, the bottom almost nothing.
  pos.x += sway * 0.035 * uv.y * uv.y;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
