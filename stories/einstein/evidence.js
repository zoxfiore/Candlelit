// THE EVIDENCE: one object per chapter the viewer can click to inspect, like in an adventure game.
//
//   chapter    which chapter (1..12) it lives in
//   attach     the hover key (userData.info) of an object already in the set -> that object becomes clickable
//   place      OR [x, y, z, rotationY]: a new sheet of paper lying on a surface at that spot
//   kind       "letter" (handwritten), "typed" (typewriter document) or "photo" (an image from public/assets/props)
//   body       the text of the document ("letter" / "typed"), \n = new line
//   image      the prop image ("photo")
//   caption    what the viewer learns about it
//
// Documents marked `reconstructed` are not copies of real papers: they are written for the story,
// from the facts told in the chapter. The inspect card says so.

export default [
  {
    id: "wish", chapter: 1, attach: "note", kind: "letter", reconstructed: true,
    title: "The last wish", date: "Princeton, April 1955",
    body: "No grave.\nNo monument.\nBurn my body,\nscatter the ashes\nin secret.\n\n— A.E.",
    caption: "Einstein refused to become a relic. He wanted no place where people could come and worship him.",
  },
  {
    id: "autopsy", chapter: 2, place: [2.2, 1.018, -2.25, 0.1], kind: "typed", reconstructed: true, // inside the locked cabinet
    title: "Autopsy report", date: "April 18, 1955",
    body: "PRINCETON HOSPITAL — PATHOLOGY\n\nSubject: EINSTEIN, Albert. Age 76.\nPathologist: T. S. HARVEY, M.D.\n\nCause of death: rupture of an\nabdominal aortic aneurysm.\n\nBrain: removed. Weight 1,230 g.\nRetained for study.",
    caption: "The report explains the death in two lines. The last line is the one that will follow Harvey for 43 years.",
  },
  {
    id: "newspaper", chapter: 3, attach: "newspaper", kind: "photo", image: "newspaper",
    title: "The morning paper", date: "April 1955",
    caption: "The family learned that the brain had been kept the same way everyone else did: by reading about it.",
  },
  {
    id: "safe", chapter: 4, place: [2.6, 1.248, 2.04, 1.57], kind: "typed", reconstructed: true, // on top of box 17, once it slides out
    title: "Safe-deposit receipt", date: "New York City",
    body: "BANK — SAFE-DEPOSIT DEPARTMENT\n\nBox holder: Dr. Henry ABRAMS\nContents: declared private.\n\nAccess by the holder only.",
    caption: "Einstein's eye doctor kept his eyes in a bank box in New York. It is said they are still there.",
  },
  {
    id: "slides", chapter: 5, attach: "microscope", kind: "photo", image: "microscope",
    title: "The microscope slides", date: "Philadelphia, 1955",
    caption: "From 240 blocks came hundreds of slices thinner than a hair, each one mounted on glass and numbered.",
  },
  {
    id: "fired", chapter: 6, place: [-1.05, 0.005, -0.45, 0.5], kind: "typed", reconstructed: true,
    title: "Letter from the hospital", date: "Princeton, 1960",
    body: "Dr. Harvey,\n\nThe Hospital asks once more that\nthe specimen be returned.\n\nIn the absence of a reply, your\nposition here is terminated.",
    caption: "Harvey refused to give the brain back. He lost his job, and kept the jars.",
  },
  {
    id: "ciderBox", chapter: 7, attach: "ciderBox", kind: "letter", reconstructed: true,
    title: "Costa Cider", date: "Wichita, Kansas — 1978",
    body: "COSTA CIDER\n\n(under the beer cooler)",
    caption: "A cardboard cider box. Inside, floating in two glass jars, what was left of the most famous brain in the world.",
  },
  {
    id: "glia", chapter: 8, attach: "glia", kind: "photo", image: "glial-board",
    title: "Counting glial cells", date: "Berkeley, 1985",
    caption: "Marian Diamond counted more glial cells in Einstein's samples than in eleven other brains. One brain, her critics said, proves nothing.",
  },
  {
    id: "trip", chapter: 9, attach: "buick", kind: "letter", reconstructed: true,
    title: "In the trunk", date: "Across America, 1997",
    body: "New Jersey → California\n\nOne Buick.\nTwo men.\nOne Tupperware box.",
    caption: "Harvey was 84. Michael Paterniti drove, and later told the whole trip in Driving Mr. Albert.",
  },
  {
    id: "evelyn", chapter: 10, place: [-5.25, 0.56, -1.2, 0.3], /* on the bed, in the bedroom */ kind: "letter", reconstructed: true,
    title: "Evelyn's answer", date: "Berkeley, 1997",
    body: "Thank you for coming\nall this way.\n\nBut I do not want it.\n\n— Evelyn",
    caption: "Harvey crossed the country to meet Einstein's granddaughter. She looked at the box, and refused it.",
  },
  {
    id: "return", chapter: 11, place: [1.35, 0.785, -1.4, -0.2], kind: "typed", reconstructed: true,
    title: "Handover", date: "Princeton Hospital, 1998",
    body: "RECEIVED FROM: T. S. Harvey, M.D.\nRECEIVED BY: E. Krauss, M.D.\n\nItem: remaining specimens,\nEinstein, A.\n\nAfter 43 years.",
    caption: "The brain came back to the hospital where it was taken. Harvey died in 2007, aged 94.",
  },
  {
    id: "plaque", chapter: 12, attach: "slides", kind: "photo", image: "museum-plaque",
    title: "On display", date: "Mütter Museum, today",
    caption: "Some of the slides can be seen today in Philadelphia. Scientists still argue about what they prove.",
  },
  {
    id: "lastLetter", chapter: 12, attach: "letter2", kind: "letter", reconstructed: true,
    title: "The last wish, again", date: "Mütter Museum, today",
    body: "No grave.\nNo monument.\nNo place where people\ncome to worship me.",
    caption: "He asked for no shrine. Today people queue to look at his brain. The letter burns; the slides stay.",
  },
];
