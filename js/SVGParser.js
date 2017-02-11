String.prototype.words = function (delims, delimsKeep, caseSensitive = true) {
  const words = [];
  let word = "";
  for (c of this) {
    const reducer = function (a, d) { return a || (caseSensitive ? d == c :
      d.toLowerCase() == c.toLowerCase()); };
    if (delims.reduce(reducer, false)) {
      if (word.length) {
        words.push(word);
        word = "";
      }
    } else if (delimsKeep && delimsKeep.reduce(reducer, false)) {
      if (word.length) {
        words.push(word);
        word = "";
      }
      words.push(c);
    } else {
      word += c;
    }
  }
  if (word.length) words.push(word);
  return words;
};

function SVGParser(text) {
  this.text = text;
}

SVGParser.prototype._tokenize = function () {
  const tokens = [];
  let token = "";
  function pushToken() {
    if (token.length && token.trim().length) {
      tokens.push(token);
      token = "";
    }
  }

  let isString = false;
  let inTag = false;
  for (let i = 0; i < this.text.length;) {
    let c = this.text[i++];
    const nextc = this.text[i];

    if (c == "\"") {
      isString = !isString;
      token += c;
      if (!isString) pushToken();
    } else if (!isString) {
      if (inTag && (c == " " || c == "\t" || c == "\n")) {
        pushToken();
      } else if (c == "<") {
        inTag = true;
        pushToken();
        if (nextc == "/") {
          i++;
          token = "</";
          pushToken();
        } else if (nextc == "?") {
          i++;
          token = "<?";
          pushToken();
        } else {
          token = "<";
          pushToken();
        }
      } else if (inTag && c == "=") {
        pushToken();
        token = c;
        pushToken();
      } else if ((c == "?" || c == "/") && nextc == ">") {
        inTag = false;
        i++;
        pushToken();
        token = c + ">";
        pushToken();
      } else if (c == ">") {
        inTag = false;
        pushToken();
        token = c;
        pushToken();
      } else token += c;
    } else token += c;
  }
  return tokens;
};
SVGParser.prototype.parse = function () {
  if (!this.text) return null;
  const tokens = this._tokenize();
  function checkClosingBracket(i) {
    const nextNextToken = tokens[i+2];
    if (tokens[i+3] == "=") {
      return i+3;
    } else if (nextNextToken == ">" || nextNextToken == "?>" ||
        nextNextToken == "/>") {
      return i+2;
    }
  }

  const root = {content: {}};
  let current = root;
  const parentStack = [];
  for (let i = 0; i < tokens.length;) {
    const prevToken = tokens[i-1];
    const token = tokens[i];
    const nextToken = tokens[i+1];
    switch (token) {
      case "<":
      case "<?":
        if (nextToken) {
          const element = {attributes: {}, content: {}};
          parentStack.push(current);
          if (!current.content[nextToken]) current.content[nextToken] = [];
          current.content[nextToken].push(element);
          current = element;
        }
        if (!(i = checkClosingBracket(i))) return null;
        break;
      case "</":
        i += 2;
      case "/>":
      case "?>":
        current = parentStack.pop();
        i++;
        break;
      case "=":
        if (prevToken && nextToken) {
          const attrVal = nextToken.substring(1, nextToken.length-1);
          if (!this._parseAttribute(current.attributes, prevToken, attrVal)) {
            return null;
          }
        }
        if (!(i = checkClosingBracket(i))) return null;
        break;
      case ">":
        i++;
        break;
      default:
        if (!current.content.data) current.content.data = [];
        current.content.data.push(token);
        i++;
    }
  }
  // const cmds = [];
  // this._createCommandList(root, cmds);
  return root;
};
SVGParser.prototype._parseAttribute = function (attrs, attrName, attrVal) {
  let vals, rawVals;
  switch (attrName) {

    /*-- id --*/
    case "id":
      vals = attrVal;
      break;

    /*-- d --*/
    case "d":
      vals = [];
      const cmds = ["a", "c", "h", "l", "m", "q", "s", "t", "v", "z"];
      rawVals = attrVal.words([], cmds, false);
      if (rawVals[0] != "m") return false
      for (let i = 0; i < rawVals.length;) {
        const t = rawVals[i++].toLowerCase();
        if (t == "z") {
          vals.push({cmd: "z"});
          continue;
        }

        const ps = this._parseParams(rawVals[i++]);
        if (!ps) return false;

        let noOfPs;
        switch (t) {
          case "h":
          case "v":
            noOfPs = 1;
            break;
          case "l":
          case "m":
          case "t":
            noOfPs = 2;
            break;
          case "q":
          case "s":
            noOfPs = 4;
            break;
          case "c":
            noOfPs = 6;
            break;
          case "a":
            noOfPs = 7;
            break;
          default:
            return false;
        }
        if (!ps || ps.length < noOfPs || ps.length % noOfPs != 0) return false;
        let cmd = {cmd: rawVals[i-2], params: ps};
        vals.push(cmd);
      }
      break;

    /*-- transform --*/
    case "transform":
      vals = [];
      rawVals = attrVal.words([" ", "\t", "\n"], [",", "(", ")"]);
      if (!rawVals.length) return false;
      for (let i = 0; i < rawVals.length;) {
        const transform = rawVals[i++];
        if (!transform) return false;
        let ns = [];
        const t = {name: transform};
        switch (transform) {
          case "matrix":
          case "translate":
          case "scale":
          case "rotate":
          case "skewX":
          case "skewY":
            vals.push(t);
            const c = rawVals[i++];
            if (!c || c != "(") return false;
            let n = rawVals[i++];
            if (!n) return false;
            let foundComma = false;
            while (n != ")") {
              if (foundComma && n == ",") return false;
              if (!(foundComma = n == ",")) ns.push(n);
              if (!(n = rawVals[i++])) return false;
            }
            break;
          default:
            return false;
        }
        switch (transform) {
          case "matrix":
            if (ns.length != 6) return false;
            break;
          case "translate":
          case "scale":
            if (ns.length != 1 && ns.length != 2) return false;
            break;
          case "rotate":
            if (ns.length != 1 && ns.length != 3) return false;
            break;
          case "skewX":
          case "skewY":
            if (ns.length != 2) return false;
            break;
        }
        t.values = ns.map(function (n) { return parseFloat(n); });
        if (t.values.find(function (v) { return isNaN(v); })) return false;
      }
      break;

    /*-- viewBox --*/
    case "viewBox":
      rawVals = attrVal.words([" ", "\t", "\n", ","]);
      if (rawVals.length != 4) return false;
      vals = rawVals.map(function (n) { return parseFloat(n); });
      if (vals.find(function (v) { return isNaN(v); })) return false;
      if (vals[2] < 0 || vals[3] < 0) return false;
      break;

// TODO: Implement error checking for negative values.
    /*-- Lengths --*/
    case "cx":
    case "cy":
    case "height":
    case "r":
    case "rx":
    case "ry":
    case "width":
    case "x":
    case "y":
      let n = parseFloat(attrVal);
      if (isNaN(n)) return false;
      let u = attrVal.substring(String(n).length, attrVal.length);
      vals = {v: n};
      switch (u) {
        case "":
          break;
        case "em":
        case "ex":
        case "px":
        case "in":
        case "cm":
        case "mm":
        case "pt":
        case "pc":
        case "%":
          vals.u = u;
          break;
        default:
          return false;
      }
      break;

    default:
      return true;

  }
  attrs[attrName] = vals;
  return true;
};
SVGParser.prototype._parseFloat = function (v) {
  if(/^(\-|\+)?([0-9]+(\.[0-9]+)?|Infinity)$/.test(v)) return Number(v);
  return NaN;
};
SVGParser.prototype._parseParams = function (ps) {
  let vals = [], rawVals = ps.words([" ", "\t", "\n"], [","]);
  let n, i = 1, t = rawVals[0];
  while (t || i == 1) {
    if (isNaN(n = this._parseFloat(t))) return null;
    vals.push(n);
    if ((t = rawVals[i++]) == ",") {
      if ((t = rawVals[i++]) == "," || !t) return null;
    }
  }
  return vals;
};
