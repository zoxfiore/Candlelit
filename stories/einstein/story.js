// THE STORY: the list of chapters, in order (12 chapters).
// task / explorePrompt: the first-person part at the end of the chapter (simple, a different action each time).
// Each chapter is pure data, the engine (src/story/director.js) does the rest:
//
//   title, place   shown at the top left
//   set            function that builds the 3D scene (sets/*.js)
//   screens        how long the chapter is, in "screen heights" of scrolling (~1 screen per 10 s of audio)
//   camera         start shot and end shot: { pos: [x, y, z], look: [x, y, z] }
//   audio          voice-over file for this chapter (public/audio/)
//   lines          subtitles, shown one after the other while scrolling. *word* = gold
//   camera.shots   extra "beat" shots between from and to: { at: 0..1, pos, look, fov }
//   gates          interactions: the scroll stops at `at` until the viewer does it
//                  { id, at, kind: move|drag|hold|click|keys, prompt }
//
// The lines are the voice-over script, sentence by sentence (same text as the audio files).

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
      task: "Read Einstein's letter",
      explorePrompt: "Walk through the house. His last wish is on the desk.",
      candle: false, // you walk as yourself: the house is lit
      place: "Princeton, New Jersey — April 1955",
      set: buildStudy,
      screens: 4.6,
      camera: {
        from: { pos: [0, 1.8, 4.6], look: [-0.2, 1.3, -1] },
        shots: [
          { at: 0.3, pos: [0.9, 1.6, 1.4], look: [0.4, 1.45, -1.1], fov: 38 }, // meet Einstein
          { at: 0.55, pos: [-0.3, 1.7, 1.6], look: [-1.1, 0.8, -0.8], fov: 50 }, // the desk, where the note is
          { at: 0.72, pos: [-0.6, 1.25, 0.2], look: [-1.05, 0.8, -0.75], fov: 40 }, // read the note
        ],
        to: { pos: [0.5, 1.55, 1.3], look: [0.35, 1.45, -1.1] },
      },
      gates: [{ id: "wish", at: 0.56, kind: "move", prompt: "You hold the candle. Move it over Einstein's desk to find his last wish." }],
      audio: "audio/chapter-01.mp3",
      lines: [
        "Princeton, New Jersey. April 1955.",
        "In this quiet house lives the most famous scientist in the world: *Albert Einstein*.",
        "The man who showed that time can slow down, and that a tiny bit of matter hides a huge amount of energy.",
        "He is 76 years old, and he knows his time is running out.",
        "He gives his family one last wish: no grave, no monument, *no shrine*.",
        "Burn my body, he says, and scatter the ashes in secret.",
        "His desk is just as he left it: pipes, letters, and an equation he never finished.",
        "Upstairs, the house is silent. Downstairs, the radio talks about the weather.",
        "On April 18, at 1:15 in the morning, Albert Einstein dies at Princeton Hospital.",
      ],
    },
    {
      title: "The Autopsy",
      task: "Open the specimen cabinet",
      explorePrompt: "The report is locked in the cabinet. Find the key somewhere on this floor.",
      place: "Princeton Hospital — April 18, 1955",
      set: buildAutopsy,
      screens: 3.1,
      camera: {
        from: { pos: [-0.6, 2.3, 3.6], look: [-0.2, 0.9, -0.7] },
        shots: [
          { at: 0.25, pos: [1.6, 1.6, 1.2], look: [1.3, 1.35, -1.0], fov: 36 }, // Harvey
          { at: 0.5, pos: [0.4, 2.6, 2.0], look: [-0.3, 1.2, -0.7], fov: 50 }, // the lamp over the table
        ],
        to: { pos: [0.9, 1.5, 0.9], look: [1.25, 1.25, -1.0] },
      },
      gates: [{ id: "lamp", at: 0.5, kind: "drag", prompt: "Hold and drag left / right to swing the surgical lamp." }],
      audio: "audio/chapter-02.mp3",
      lines: [
        "A few hours later, the pathologist on duty begins the autopsy.",
        "His name is *Thomas Harvey*. He is 42 years old.",
        "His job is simple: find out why Einstein died. The biggest blood vessel in his body has burst.",
        "But when the autopsy is over, Harvey does something no one asked him to do.",
        "He lifts out Einstein's brain...",
        "...and he *keeps it*.",
        "No one stops him. No one even asks.",
        "The jar is closed, labelled, and carried out of the room.",
      ],
    },
    {
      title: "Permission, Too Late",
      task: "Answer the telephone",
      explorePrompt: "The telephone is ringing. Answer it, then read the morning paper.",
      place: "Princeton — April 1955",
      set: buildPermission,
      screens: 3.1,
      camera: { from: { pos: [0, 1.7, 4], look: [0, 1.2, -1] }, to: { pos: [0.2, 1.4, 1.5], look: [0.1, 1.1, -0.8] } },
      audio: "audio/chapter-03.mp3",
      lines: [
        "That same afternoon, Einstein's body is cremated, and his ashes are scattered in secret.",
        "But his brain is not with them.",
        "A few days later, the family learns the truth... from the newspapers.",
        "Harvey contacts Einstein's son, *Hans Albert*, and asks for his blessing.",
        "Hans Albert agrees, reluctantly, on one condition:",
        "the brain can only be used *for science*.",
        "Hans Albert is shocked. But the brain is already gone.",
        "His permission changes nothing. It only comes too late.",
      ],
    },
    {
      title: "The Eyes",
      task: "Open box 17",
      explorePrompt: "A bank vault. Box 17 is locked: its key is kept somewhere in the bank.",
      place: "New York City",
      set: buildEyes,
      screens: 3.1,
      camera: { from: { pos: [-0.5, 1.7, 3.4], look: [0, 1.3, -1.5] }, to: { pos: [0.55, 1.35, 0.7], look: [0.6, 1.1, -0.9] } },
      audio: "audio/chapter-04.mp3",
      lines: [
        "And the brain is not the only thing taken that day.",
        "Einstein's eye doctor, *Henry Abrams*, is given his eyes.",
        "He locks them in a *safe-deposit box* in a New York bank.",
        "It is said they are still there today.",
        "Abrams never sells them, and never shows them.",
        "Like the brain, the eyes become a secret kept in a box.",
      ],
    },
    {
      title: "240 Pieces",
      task: "Find the two slides",
      explorePrompt: "Two glass slides are somewhere in the lab rooms. Find them, then look into the microscope.",
      place: "Philadelphia — 1955",
      set: buildLab,
      screens: 3.6,
      camera: {
        from: { pos: [0, 2.7, 1.6], look: [-0.3, 0.8, -0.8] },
        shots: [{ at: 0.45, pos: [0.15, 1.5, 0.55], look: [-0.3, 0.95, -0.8], fov: 40 }], // the whole brain on the bench
        to: { pos: [-0.25, 1.45, 0.35], look: [-0.3, 0.8, -0.85] },
      },
      gates: [{ id: "cut", at: 0.48, kind: "hold", prompt: "Hold the mouse button to cut the brain into 240 blocks." }],
      audio: "audio/chapter-05.mp3",
      lines: [
        "Harvey takes the brain to a laboratory at the University of Pennsylvania, in Philadelphia.",
        "He weighs it: 1,230 grams. A little *lighter than average*.",
        "He photographs it from every angle.",
        "Then he has it cut into about *240 small blocks*, each one sealed in a hard resin called celloidin.",
        "From the blocks come hundreds of slices, thinner than a hair, mounted on glass slides.",
        "The greatest mind of the century now fits in *two glass jars*.",
        "Each block gets a number. Each slide gets a label.",
        "Some of them Harvey mails to scientists, like souvenirs.",
      ],
    },
    {
      title: "Fired",
      task: "Pack the two jars",
      explorePrompt: "Harvey is leaving. Find his two jars and put them in the box.",
      place: "Princeton — 1960",
      set: buildFired,
      screens: 3.1,
      camera: { from: { pos: [-1.5, 1.6, 3], look: [0, 1.2, -1] }, to: { pos: [0.3, 1.5, 1.2], look: [0.2, 1.3, -0.9] } },
      audio: "audio/chapter-06.mp3",
      lines: [
        "Harvey promises that the best scientists in the world will study the brain.",
        "Months pass. Then years. *No study comes out.*",
        "Princeton Hospital asks for the brain back. Harvey refuses... and *loses his job*.",
        "He leaves Princeton. He moves to Missouri, then to Kansas.",
        "His marriage ends. His career fades.",
        "But wherever he goes, the jars go with him.",
        "In Kansas he works in a lab, then as a doctor, then on a factory line.",
        "And at home, the jars wait in a cardboard box.",
      ],
    },
    {
      title: "The Cider Box",
      task: "Take the letter opener",
      explorePrompt: "The box is taped shut. Find the letter opener somewhere in the building.",
      place: "Wichita, Kansas — 1978",
      set: buildWichita,
      screens: 3.6,
      camera: {
        from: { pos: [-0.3, 1.8, 4], look: [0, 1.1, -1.2] },
        shots: [
          { at: 0.35, pos: [-0.6, 1.6, 1.2], look: [0.7, 1.3, -1.2], fov: 38 }, // over Levy's shoulder, on Harvey
          { at: 0.66, pos: [0.6, 1.3, 1.0], look: [1.6, 0.4, -1.4], fov: 45 }, // the corner of the room
        ],
        to: { pos: [1.15, 0.65, 0.2], look: [1.6, 0.25, -1.4] },
      },
      gates: [{ id: "box", at: 0.67, kind: "click", prompt: "Something is hidden under the beer cooler. Click it." }],
      audio: "audio/chapter-07.mp3",
      lines: [
        "For twenty years, the world forgets about Einstein's brain.",
        "Then, in 1978, a young journalist named *Steven Levy* decides to find it.",
        "He tracks Harvey down to an office in Wichita, Kansas.",
        "Harvey is embarrassed. At first, he doesn't want to say a word.",
        "Then he walks to a corner of the room, and pulls out a cardboard box marked *Costa Cider*, hidden under a beer cooler.",
        "Inside, floating in two glass jars: what is left of *Einstein's brain*.",
        "Levy's article makes the brain famous all over again.",
        "Letters start to arrive: scientists who want a piece.",
      ],
    },
    {
      title: "Counting Cells",
      task: "Count the glial cells: 0 / 3",
      explorePrompt: "Three glowing samples are hidden in three rooms of the lab. Count them all.",
      place: "University of California, Berkeley — 1985",
      set: buildDiamond,
      screens: 4.1,
      camera: { from: { pos: [-0.6, 1.7, 3.8], look: [0, 1.3, -1.5] }, to: { pos: [0.4, 1.5, 0.6], look: [0.6, 1.5, -2.4] } },
      audio: "audio/chapter-08.mp3",
      lines: [
        "Levy's story makes headlines, and Harvey starts mailing pieces of the brain to scientists.",
        "In Berkeley, California, neuroscientist *Marian Diamond* receives four tiny blocks.",
        "She counts the cells under her microscope, one by one.",
        "In 1985, she announces her result: Einstein's brain has more *glial cells*, the cells that feed and protect the neurons, than the brains of eleven other men.",
        "Was this the secret of his genius?",
        "Many scientists are not convinced. *One brain*, they say, *proves nothing*.",
        "It is the first study of Einstein's brain ever published.",
        "Its title promises answers. The debate only begins.",
      ],
    },
    {
      title: "Driving Mr. Albert",
      place: "Across America — 1997",
      set: buildRoad,
      screens: 3.1,
      camera: {
        from: { pos: [3.5, 1.3, 9], look: [0, 0.7, 0] },
        shots: [{ at: 0.45, pos: [0, 2.4, -6.5], look: [0, 0.7, 8], fov: 55 }], // behind the car: you drive
        to: { pos: [3.2, 1.4, 1.8], look: [0, 0.85, -0.2] },
      },
      noExplore: true, // you are driving: no walking around
      gates: [{ id: "drive", at: 0.46, kind: "keys", prompt: "Take the wheel: ← → (or hold the mouse) to steer the Buick." }],
      audio: "audio/chapter-09.mp3",
      lines: [
        "In 1997, Thomas Harvey is *84 years old*.",
        "He gets into a Buick with a young writer, *Michael Paterniti*.",
        "In the trunk, in a plastic Tupperware box, rides what is left of *Einstein's brain*.",
        "Together they drive across America, from New Jersey to California.",
        "Paterniti will later tell the whole trip in a book: *Driving Mr. Albert*.",
        "The brain rides in the trunk, in a plastic box, from motel to motel.",
        "Diners, gas stations, long empty roads: America, at night.",
      ],
    },
    {
      title: "She Didn't Want It",
      task: "Close the box",
      explorePrompt: "Evelyn does not want it. Close the box, then find the note she left.",
      place: "Berkeley, California — 1997",
      set: buildEvelyn,
      screens: 3.1,
      camera: { from: { pos: [0, 1.7, 4], look: [0, 1.2, -1.2] }, to: { pos: [0.2, 1.5, 1.6], look: [0.2, 1.25, -1.1] } },
      audio: "audio/chapter-10.mp3",
      lines: [
        "The road ends in Berkeley, at the home of *Evelyn Einstein*, Albert's granddaughter.",
        "Harvey has come all this way to meet her.",
        "He shows her the box with her grandfather's brain.",
        "She looks at it for a long moment...",
        "*She doesn't want it.*",
        "A rumour said Evelyn might be Einstein's daughter, not his granddaughter.",
        "A DNA test could have told her. The samples were too damaged.",
      ],
    },
    {
      title: "Back to Princeton",
      task: "Sign the receipt",
      explorePrompt: "Find a pen, then sign the receipt on the desk.",
      place: "Princeton Hospital — 1998",
      set: buildReturn,
      screens: 3.1,
      camera: { from: { pos: [0.4, 1.7, 3.8], look: [0, 1.2, -1] }, to: { pos: [0, 1.5, 1.2], look: [0, 1.3, -1.05] } },
      audio: "audio/chapter-11.mp3",
      lines: [
        "In 1998, after *43 years*, Harvey brings the brain back to where it all began.",
        "At Princeton Hospital, he hands what is left to the pathologist, *Dr. Elliot Krauss*.",
        "The journey is over.",
        "Thomas Harvey dies in 2007. He was 94.",
        "Dr. Elliot Krauss locks the brain away at the hospital.",
        "Thomas Harvey dies in 2007, at the age of 94.",
      ],
    },
    {
      title: "Still Arguing",
      task: "Turn on the lights",
      explorePrompt: "The museum is closed. Turn on the lights, read the case... and find his letter, one last time.",
      place: "Mütter Museum, Philadelphia — Today",
      set: buildMuseum,
      screens: 3.1,
      camera: { from: { pos: [0, 1.6, 4.2], look: [0, 1.4, -2] }, to: { pos: [0, 1.4, 0.55], look: [0, 0.95, -0.8] } },
      audio: "audio/chapter-12.mp3",
      lines: [
        "Today, *46 slides* of Einstein's brain are on display at the Mütter Museum, in Philadelphia.",
        "Anyone can buy a ticket, lean over the glass, and look at them.",
        "Einstein wanted no grave, no monument, no shrine.",
        "He got one anyway.",
        "Every year, thousands of visitors stop in front of this glass.",
        "Some come for science. Most come because of a story.",
        "So... what made Einstein a genius?",
        "*Scientists are still arguing.*",
      ],
    },
  ],
};
