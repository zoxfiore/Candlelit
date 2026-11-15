// Candle flicker: a value around 1 that changes over time in a "random-looking" way.
// Trick: adding a few sine waves with speeds that don't match never repeats visibly.
// seed = a different offset per candle, so two candles never flicker together.

export function flicker(time, seed = 0) {
  return (
    0.85 +
    0.08 * Math.sin(time * 7.1 + seed) +
    0.05 * Math.sin(time * 13.7 + seed * 1.7) +
    0.03 * Math.sin(time * 29.3 + seed * 3.1)
  );
}

/** an electric bulb: almost stable, with a rare small "buzz" drop */
export function buzz(time, seed = 0) {
  const drop = Math.sin(time * 1.3 + seed) > 0.97 ? 0.75 : 1;
  return drop * (0.97 + 0.03 * Math.sin(time * 50 + seed));
}
