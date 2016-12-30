var svgParser;
// const svgElements = [
//   {name: "a", attributes: ["href", "target", "xlink:show", "xlink:actuate",
//     "xlink:href"]},
//   {name: "altGlyph", attributes: ["x", "y", "dx", "dy", "rotate", "glyphRef",
//     "format", "xlink:href"]},
//   "altGlyphDef", "altGlyphItem", "animate",
//   "animateColor", "animateMotion", "animateTransform", "audio", "canvas",
//   "circle", "clipPath", "color-profile", "cursor", "defs", "desc", "discard",
//   "ellipse", "feBlend", "feColorMatrix", "feComponentTransfer", "feComposite",
//   "feConvolveMatrix", "feDiffuseLighting", "feDisplacementMap",
//   "feDistantLight", "feDropShadow", "feFlood", "feFuncA", "feFuncB", "feFuncG",
//   "feFuncR", "feGaussianBlur", "feImage", "feMerge", "feMergeNode",
//   "feMorphology", "feOffset", "fePointLight", "feSpecularLighting",
//   "feSpotLight", "feTile", "feTurbulence", "filter", "font", "font-face",
//   "font-face-format", "font-face-name", "font-face-src", "font-face-uri",
//   "foreignObject", "g", "glyph", "glyphRef", "hatch", "hatchpath", "hkern",
//   "iframe", "image", "line", "lineGradient", "marker", "mask", "mesh",
//   "meshgradient", "meshpatch", "meshrow", "metadata", "missing-glyph", "mpath",
//   "path", "pattern", "polygon", "polyline", "radialGradient", "rect", "script",
//   "set", "solidcolor", "stop", "style", "svg", "switch", "symbol", "text",
//   "textPath", "title", "tref", "tspan", "unknown", "use", "video", "view",
//   "vkern"
// ];

function recolor(color) {
  dropzone.style('background-color: ' + color);
}

function loadSVG(file) {
  if (file.type == "image/svg+xml") {
    const fr = new FileReader();
    fr.onload = function (e) {
      svgParser.text = e.target.result;
      svgParser.parse();
    };
    fr.readAsText(file);
  }
}

function drawSVG(speed = 10) {
  for (object of svgObjects) {

  }
}

function setup() {
  createCanvas(windowHeight-150, windowHeight-150);
  svgParser = new SVGParser();

  dropzone = select('#dropzone');
  dropzone.dragOver(function () { recolor("#00dddd50"); });
  dropzone.dragLeave(function () { recolor("#00ffff50"); });
  dropzone.drop(function (f) { loadSVG(f.file); },
    function () { recolor("#00ffff50"); });
}

function draw() {
  background(50);

  // if (svgObjects) drawSVG();
}
