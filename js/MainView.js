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
      const res = svgParser.parse();
      drawSVG(res);
    };
    fr.readAsText(file);
  }
}

function drawSVG(svg) {
  const ipp = 1 / 227;
  const mmpp = 10;
  for (element in svg.content) {
    if (element != "data") {
      for (obj of svg.content[element]) {
        const attr = obj.attributes;
        const v = function (n, d = 0) { return attr[n] ? attr[n].v : d; };
        let cx, cy, height, r, rx, ry, width, x, y;
        switch (element) {

          case "svg":
            width = v("width", "100%"), height = v("height", "100%");
            if (width && height) {
              createCanvas(width, height);
            } else {
              createCanvas(500, 500);
            }
            background(50);
            stroke(255);
            strokeWeight(1);
            noFill();
            break;

          case "circle":
            r = v("r"), cx = v("cx"), cy = v("cy");
            if (r) ellipse(cx, cy, 2*r);
            break;

          case "ellipse":
            cx = v("cx"), cy = v("cy"), rx = v("rx"), ry = v("ry");
            if (rx && ry) ellipse(cx, cy, 2*rx, 2*ry);
            break

          case "rect":
            width = v("width"), height = v("height"), x = v("x"), y = v("y");
            if (width && height) {
              rect(x, y, width, height);
            }
            break;
        }
        drawSVG(obj);
      }
    } else {
      // TODO: Implement.
    }
  }
}

function setup() {
  svgParser = new SVGParser();
  dropzone = select('#dropzone');
  dropzone.dragOver(function () { recolor("#00dddd50"); });
  dropzone.dragLeave(function () { recolor("#00ffff50"); });
  dropzone.drop(function (f) { loadSVG(f.file); },
    function () { recolor("#00ffff50"); });
}
