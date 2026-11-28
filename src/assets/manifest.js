// The list of every asset file the story uses (they are in public/assets/).
// Everything is loaded once at the start, before the story begins.

export const MODELS = [
  "autopsy-table", "beer-cooler", "bookshelf", "buick", "chair", "chalkboard", "cider-box",
  "coffee-table", "desk", "display-case", "door", "hanging-lamp", "instrument-tray", "lab-bench",
  "metal-cart", "moving-boxes", "safe-deposit-wall", "sofa", "table", "telephone",
  "telephone-pole", "wall-shelf", "window",
];

export const TEXTURES = [
  "wood-planks.jpg", "plaster.png", "tiles.jpg", "bricks.jpg", "checker-floor.jpg",
  "asphalt-road.jpg", "sand.jpg", "night-sky.jpg",
];

export const CHARACTERS = [
  "einstein", "harvey-1955", "harvey-1955-jar", "harvey-1960-jar", "harvey-1978", "harvey-1997",
  "harvey-1997-box", "harvey-1997-jar", "hans-albert", "abrams", "levy", "diamond", "paterniti",
  "evelyn", "krauss",
];

export const PROPS = ["brain-jar", "microscope", "newspaper", "glial-board", "portrait", "museum-plaque"];

// Rigged, animated characters (public/assets/actors/<name>.glb, e.g. from Sketchfab + Mixamo).
// Add a name here once its file is in the folder; until then the story uses a low-poly figure
// (src/characters/figure.js). Names used by the stories: carter, carnarvon, evelyn, worker, boy.
export const ACTORS = [];
