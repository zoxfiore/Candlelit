// THE STORY: the list of chapters, in order.
// Each chapter is pure data, the engine (src/story/director.js) does the rest:
//
//   title, place   shown at the top left
//   set            function that builds the 3D scene (sets/*.js)
//   screens        how long the chapter is, in "screen heights" of scrolling
//   camera         start shot and end shot: { pos: [x, y, z], look: [x, y, z] }
//   audio          voice-over file for this chapter (put the files in public/audio/)
//   lines          subtitles, shown one after the other while scrolling. *word* = gold
//
// The lines are a first version of the narration: replace them with the final voice-over script.

import { buildStudy } from "./sets/01-study.js";
import { buildAutopsy } from "./sets/02-autopsy.js";
import { buildPermission } from "./sets/03-permission.js";
import { buildEyes } from "./sets/04-eyes.js";
import { buildLab } from "./sets/05-lab.js";
import { buildFired } from "./sets/06-fired.js";
import { buildWichita } from "./sets/07-wichita.js";
import { buildDiamond } from "./sets/08-diamond.js";
import { buildRoad } from "./sets/09-road.js";
import { buildEvelyn } from "./sets/10-evelyn.js";
import { buildReturn } from "./sets/11-return.js";
import { buildMuseum } from "./sets/12-museum.js";

export default {
  title: "The Stolen Brain of Albert Einstein",
  chapters: [
    {
      title: "The Last Wish",
      place: "Princeton, New Jersey — April 1955",
      set: buildStudy,
      screens: 3,
      camera: { from: { pos: [0, 1.8, 4.6], look: [-0.2, 1.3, -1] }, to: { pos: [0.5, 1.55, 1.3], look: [0.35, 1.45, -1.1] } },
      audio: "audio/chapter-01.mp3",
      lines: [
        "In 1955, *Albert Einstein* was the most famous mind on Earth.",
        "He was 76, and he knew his time was running out.",
        "He had one last wish: no grave, no monument, *no shrine*.",
        "Burn my body, he said, and scatter the ashes in secret.",
        "On April 18, 1955, at 1:15 in the morning, Einstein died.",
      ],
    },
    {
      title: "The Autopsy",
      place: "Princeton Hospital — April 18, 1955",
      set: buildAutopsy,
      screens: 3,
      camera: { from: { pos: [-0.6, 2.3, 3.6], look: [-0.2, 0.9, -0.7] }, to: { pos: [0.9, 1.5, 0.9], look: [1.25, 1.25, -1.0] } },
      audio: "audio/chapter-02.mp3",
      lines: [
        "That morning, the pathologist on duty was *Dr. Thomas Harvey*.",
        "His job was simple: find out why Einstein died.",
        "But when he finished, he did something no one had asked him to do.",
        "He lifted out Einstein's brain...",
        "...and he *kept it*.",
      ],
    },
    {
      title: "Permission, Too Late",
      place: "Princeton — April 1955",
      set: buildPermission,
      screens: 3,
      camera: { from: { pos: [0, 1.7, 4], look: [0, 1.2, -1] }, to: { pos: [0.2, 1.4, 1.5], look: [0.1, 1.1, -0.8] } },
      audio: "audio/chapter-03.mp3",
      lines: [
        "That same afternoon, Einstein's body was cremated. *Without its brain.*",
        "The family learned the news from the newspapers.",
        "Harvey called Einstein's son, *Hans Albert*, and asked for his blessing.",
        "Hans Albert said yes, reluctantly, on one condition:",
        "the brain could only be used *for science*.",
      ],
    },
    {
      title: "The Eyes",
      place: "New York City",
      set: buildEyes,
      screens: 2.5,
      camera: { from: { pos: [-0.5, 1.7, 3.4], look: [0, 1.3, -1.5] }, to: { pos: [0.55, 1.35, 0.7], look: [0.6, 1.1, -0.9] } },
      audio: "audio/chapter-04.mp3",
      lines: [
        "The brain was not the only thing that left the hospital.",
        "Einstein's eye doctor, *Henry Abrams*, was given his eyes.",
        "He locked them in a *safe-deposit box* in New York...",
        "...where, it is said, they still are today.",
      ],
    },
    {
      title: "240 Pieces",
      place: "Philadelphia — 1955",
      set: buildLab,
      screens: 3,
      camera: { from: { pos: [0, 2.7, 1.6], look: [-0.3, 0.8, -0.8] }, to: { pos: [-0.25, 1.45, 0.35], look: [-0.3, 0.8, -0.85] } },
      audio: "audio/chapter-05.mp3",
      lines: [
        "Harvey took the brain to a lab in Philadelphia.",
        "He weighed it: 1,230 grams. A bit *lighter than average*.",
        "Then he had it cut into *240 small blocks*,",
        "each one sealed in a hard resin called celloidin.",
        "Slices thinner than a hair went onto glass slides, ready for the microscope.",
      ],
    },
    {
      title: "Fired",
      place: "Princeton — 1960",
      set: buildFired,
      screens: 2.5,
      camera: { from: { pos: [-1.5, 1.6, 3], look: [0, 1.2, -1] }, to: { pos: [0.3, 1.5, 1.2], look: [0.2, 1.3, -0.9] } },
      audio: "audio/chapter-06.mp3",
      lines: [
        "Harvey promised that the best scientists would study it.",
        "Years went by. *No study came out.*",
        "The hospital asked for the brain back. Harvey refused, and *lost his job*.",
        "He moved west to Missouri, then Kansas, and the brain went with him.",
      ],
    },
    {
      title: "The Cider Box",
      place: "Wichita, Kansas — 1978",
      set: buildWichita,
      screens: 3,
      camera: { from: { pos: [-0.3, 1.8, 4], look: [0, 1.1, -1.2] }, to: { pos: [1.15, 0.65, 0.2], look: [1.6, 0.25, -1.4] } },
      audio: "audio/chapter-07.mp3",
      lines: [
        "For twenty years, the world forgot about Einstein's brain.",
        "Then a young journalist, *Steven Levy*, tracked Harvey down.",
        "Harvey was embarrassed. He walked to a corner of his office...",
        "...and pulled out a box marked *Costa Cider*, hidden under a beer cooler.",
        "Inside, in two glass jars: *Einstein's brain*.",
      ],
    },
    {
      title: "Counting Cells",
      place: "University of California, Berkeley — 1985",
      set: buildDiamond,
      screens: 3,
      camera: { from: { pos: [-0.6, 1.7, 3.8], look: [0, 1.3, -1.5] }, to: { pos: [0.4, 1.5, 0.6], look: [0.6, 1.5, -2.4] } },
      audio: "audio/chapter-08.mp3",
      lines: [
        "The story made headlines, and Harvey began sending pieces to researchers.",
        "Neuroscientist *Marian Diamond* received four tiny blocks.",
        "She counted the cells, and found more *glial cells*, the brain's helpers, than in 11 other men.",
        "Was this the secret of genius?",
        "Many scientists were not convinced: *one brain proves nothing*.",
      ],
    },
    {
      title: "Driving Mr. Albert",
      place: "Across America — 1997",
      set: buildRoad,
      screens: 3,
      camera: { from: { pos: [3.5, 1.3, 9], look: [0, 0.7, 0] }, to: { pos: [3.2, 1.4, 1.8], look: [0, 0.85, -0.2] } },
      audio: "audio/chapter-09.mp3",
      lines: [
        "In 1997, Thomas Harvey was *84 years old*.",
        "He got into a Buick with a young writer, *Michael Paterniti*.",
        "In the trunk, in a plastic Tupperware box: *Einstein's brain*.",
        "Together they drove across the whole country, from New Jersey to California.",
      ],
    },
    {
      title: "She Didn't Want It",
      place: "Berkeley, California — 1997",
      set: buildEvelyn,
      screens: 3,
      camera: { from: { pos: [0, 1.7, 4], look: [0, 1.2, -1.2] }, to: { pos: [0.2, 1.5, 1.6], look: [0.2, 1.25, -1.1] } },
      audio: "audio/chapter-10.mp3",
      lines: [
        "The trip ended in Berkeley, at the house of *Evelyn Einstein*, Albert's granddaughter.",
        "Harvey had brought her a gift: a piece of her grandfather.",
        "She looked at the box...",
        "*She didn't want it.*",
      ],
    },
    {
      title: "Back to Princeton",
      place: "Princeton Hospital — 1998",
      set: buildReturn,
      screens: 2.5,
      camera: { from: { pos: [0.4, 1.7, 3.8], look: [0, 1.2, -1] }, to: { pos: [0, 1.5, 1.2], look: [0, 1.3, -1.05] } },
      audio: "audio/chapter-11.mp3",
      lines: [
        "In 1998, after *43 years*, Harvey brought the brain back where it all began.",
        "He gave what was left to *Dr. Elliot Krauss*, the pathologist at Princeton Hospital.",
        "Thomas Harvey died in 2007. He was 94.",
      ],
    },
    {
      title: "Still Arguing",
      place: "Mütter Museum, Philadelphia — Today",
      set: buildMuseum,
      screens: 3,
      camera: { from: { pos: [0, 1.6, 4.2], look: [0, 1.4, -2] }, to: { pos: [0, 1.4, 0.55], look: [0, 0.95, -0.8] } },
      audio: "audio/chapter-12.mp3",
      lines: [
        "Today, *46 slides* of Einstein's brain are on display in a museum in Philadelphia.",
        "Anyone can buy a ticket and look at them.",
        "Einstein wanted no shrine. He got one anyway.",
        "So what made Einstein a genius?",
        "*Scientists are still arguing.*",
      ],
    },
  ],
};
