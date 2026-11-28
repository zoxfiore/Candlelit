// WONDERFUL THINGS — the discovery of the tomb of Tutankhamun (1922–1925), in 3 chapters.
// Same format as stories/einstein/story.js. No audio files yet: the narrator reads the lines
// with the browser's speech synthesis (src/ui/narrator.js).
//
// Facts: Howard Carter searched the Valley of the Kings for five seasons, paid by Lord Carnarvon.
// On 4 November 1922 his workmen found a step under the remains of ancient workmen's huts;
// sixteen steps led down to a sealed doorway. On 26 November Carter opened a hole in a second
// sealed doorway and looked in by candlelight ("Can you see anything?" — "Yes, wonderful things").
// The burial chamber was opened in February 1923, the sarcophagus lid raised in February 1924,
// and the innermost coffin — solid gold, about 110 kg — opened in October 1925.

import { buildValley } from "./sets/01-valley.js";
import { buildDoorway } from "./sets/02-doorway.js";
import { buildChamber } from "./sets/03-chamber.js";

export default {
  title: "Wonderful Things",
  chapters: [
    {
      title: "The Last Season",
      place: "Valley of the Kings, Egypt — 4 November 1922",
      set: buildValley,
      screens: 3.2,
      camera: {
        from: { pos: [-1.5, 3.4, 7.5], look: [0, 0.6, -3] },
        shots: [
          { at: 0.3, pos: [2.6, 1.7, 1.6], look: [1.0, 1.5, -0.4], fov: 40 }, // Carter
          { at: 0.55, pos: [0.4, 2.6, 2.4], look: [0, -0.1, -0.9], fov: 46 }, // the sand where the step is
        ],
        to: { pos: [0.1, 1.9, 1.3], look: [0, -1.2, -1.6] }, // looking down the stairs
      },
      gates: [{ id: "dig", at: 0.58, kind: "drag", prompt: "Hold the mouse and brush left / right to clear the sand." }],
      lines: [
        "Egypt. The Valley of the Kings. November 1922.",
        "For five years, the British archaeologist *Howard Carter* has searched this valley for a forgotten king.",
        "Five years... and almost nothing. His rich sponsor, *Lord Carnarvon*, is ready to give up.",
        "This is the *last season*.",
        "On the morning of November 4th, Carter's workmen clear the ruins of some ancient huts.",
        "Under the sand, they find a *stone step*, cut into the rock.",
        "Then another. And another. *Sixteen steps*, going down into the dark.",
      ],
    },
    {
      title: "Wonderful Things",
      place: "The sealed doorway — 26 November 1922",
      set: buildDoorway,
      screens: 3.2,
      camera: {
        from: { pos: [0, 1.7, 4.2], look: [0, 1.4, -2.4] },
        shots: [
          { at: 0.25, pos: [-0.7, 1.7, 1.6], look: [0.3, 1.5, -0.9], fov: 44 }, // Carnarvon and Lady Evelyn
          { at: 0.5, pos: [0.2, 1.75, 0.9], look: [-0.3, 1.7, -2.4], fov: 46 }, // Carter at the seals
        ],
        to: { pos: [-0.6, 1.84, -1.8], look: [-0.64, 1.45, -4.6], fov: 50 }, // through the hole
      },
      gates: [{ id: "hole", at: 0.6, kind: "hold", prompt: "Hold the mouse button to chip a small hole in the corner of the doorway." }],
      lines: [
        "Three weeks later. At the bottom of the sixteen steps, a corridor full of rubble...",
        "...and at its end, a *sealed doorway*.",
        "The plaster still carries the *royal seals*. No one has touched it for more than three thousand years.",
        "Lord Carnarvon has sailed from England to be here, with his daughter, *Lady Evelyn*.",
        "Carter makes a small hole in the top corner, and holds up a *candle*.",
        "Hot air escapes from the chamber. The flame flickers.",
        "Carnarvon can't wait: *Can you see anything?*",
        "*Yes,* Carter answers. *Wonderful things.*",
      ],
    },
    {
      title: "The Golden King",
      place: "The burial chamber — 1923 to 1925",
      set: buildChamber,
      screens: 3.4,
      camera: {
        from: { pos: [0, 2.0, 4.6], look: [0, 1.1, -1.2] },
        shots: [
          { at: 0.3, pos: [2.0, 1.8, 1.6], look: [0, 1.2, -0.6], fov: 42 }, // the sarcophagus and the pulley
          { at: 0.62, pos: [-1.4, 2.1, 0.5], look: [-0.6, 0.6, -0.6], fov: 40 }, // over Carter's shoulder
        ],
        to: { pos: [-0.15, 2.15, 0.75], look: [-0.45, 0.65, -0.6], fov: 40 }, // the golden king in his sarcophagus
      },
      gates: [{ id: "lid", at: 0.4, kind: "hold", prompt: "Hold the mouse button: help the men lift the lid of the sarcophagus." }],
      lines: [
        "Behind the treasures, another sealed wall. Behind it, the *burial chamber* of the king.",
        "Inside a stone sarcophagus lie three coffins, one inside the other.",
        "Lifting the lid takes ropes, pulleys... and months of patience.",
        "In 1925, Carter finally opens the last coffin. It is made of *solid gold*: 110 kilograms.",
        "And inside, on the face of the young king, a *golden mask*.",
        "Tutankhamun was about nineteen when he died. For three thousand years, no one had seen his face.",
        "Today he is the most famous pharaoh in the world. Not for what he did... but for *what he left behind*.",
      ],
    },
  ],
};
