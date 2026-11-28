// The cast: every character image (public/assets/characters/*.png), its real height in metres,
// and the hover card it shows (key in stories/einstein/glossary.js).

import { getImage } from "../assets/loader.js";
import { createCutout } from "./cutout.js";

export const CAST = {
  "einstein":        { height: 1.61, info: "einstein" },
  "harvey-1955":     { height: 1.55, info: "harvey" },     // Dr. Thomas Harvey, lab coat
  "harvey-1955-jar": { height: 1.55, info: "harvey" },     // ... holding the jar
  "harvey-1960-jar": { height: 1.55, info: "harvey" },     // in a suit, worried
  "harvey-1978":     { height: 1.55, info: "harvey" },     // grey hair, brown suit
  "harvey-1997":     { height: 1.55, info: "harvey" },     // 84 years old
  "harvey-1997-box": { height: 1.55, info: "harvey" },     // ... with the Tupperware box
  "harvey-1997-jar": { height: 1.55, info: "harvey" },     // ... with the last jar
  "hans-albert":     { height: 1.55, info: "hansAlbert" },
  "abrams":          { height: 1.51, info: "abrams" },
  "levy":            { height: 1.57, info: "levy" },
  "diamond":         { height: 1.51, info: "diamond" },
  "paterniti":       { height: 1.57, info: "paterniti" },
  "evelyn":          { height: 1.51, info: "evelyn" },
  "krauss":          { height: 1.55, info: "krauss" },
};

/** put a character in a set at (x, z). scale < 1 = smaller (e.g. sitting in the car) */
export function placeCharacter(set, name, x, z, { y = 0, scale = 1 } = {}) {
  const { height, info } = CAST[name];
  const character = createCutout(getImage(name), height * scale, { info });
  character.position.set(x, y, z);
  character.userData.isPerson = true; // the candle cursor lights people up
  set.add(character);
  return character;
}

