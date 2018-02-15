import { go, combine } from "@funkia/jabz";
import { runComponent, elements, modelView } from "@funkia/turbine";
const { p, div, h1, button, textarea } = elements;
import { Behavior, Stream, sample, scan } from "@funkia/hareactive";

import "codemirror/lib/codemirror.css";
import "codemirror/addon/edit/closebrackets";
import "codemirror/addon/display/placeholder";
import "codemirror/mode/markdown/markdown";
import "codemirror/theme/solarized.css";

import { codemirror } from "./codemirror";
import { markdown } from "./markdown";

const main = go(function*() {
  yield h1("Welcome to Turbine notes");
  yield p("Below is a markdown editor");
  const { inputValue } = yield codemirror({
    mode: "markdown",
    theme: "solarized light",
    tabSize: 2
  });
  yield p(inputValue.map(markdown));
  return {};
});

runComponent("#mount", main);
