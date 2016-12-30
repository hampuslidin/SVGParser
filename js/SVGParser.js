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
  if (!this.text) return;
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
      if (!(i = checkClosingBracket(i))) return;
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
        current.attributes[prevToken] = nextToken.substring(1,
          nextToken.length-1);
      }
      if (!(i = checkClosingBracket(i))) return;
      break;
    case ">":
      i++;
      break;
    default:
      current.content["data"] = token;
      i++;
    }
  }
  return root;
};
