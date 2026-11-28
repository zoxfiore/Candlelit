// THE ANTHOLOGY: every story the engine can play. The start screen shows one card per story.
// A story is loaded only when the viewer picks it (dynamic import), so adding a story costs nothing
// to the others.
//
//   id        used in the address: ?story=tutankhamun (add &chapter=2 to jump to a chapter)
//   load()    returns { story, evidence, caseFile } (see stories/<id>/index.js)

export default [
  {
    id: "einstein",
    title: "The Stolen Brain",
    subtitle: "of Albert Einstein",
    when: "Princeton · 1955",
    blurb: "The greatest mind of the century dies. His brain does not go with him.",
    chapters: 12,
    load: () => import("./einstein/index.js"),
  },
  // Set aside for now (the code is in stories/tutankhamun/): uncomment to bring it back.
  // {
  //   id: "tutankhamun",
  //   title: "Wonderful Things",
  //   subtitle: "the tomb of Tutankhamun",
  //   when: "Valley of the Kings · 1922",
  //   blurb: "Five years of digging, nothing found. Then a stone step appears under the sand.",
  //   chapters: 3,
  //   load: () => import("./tutankhamun/index.js"),
  // },
];
