import { go, combine } from "@funkia/jabz";
import { runComponent, elements, modelView } from "@funkia/turbine";
import { Behavior, Stream, sample, scan } from "@funkia/hareactive";

import "codemirror/lib/codemirror.css";
import "codemirror/addon/edit/closebrackets";
import "codemirror/addon/display/placeholder";
import "codemirror/mode/markdown/markdown";
import "codemirror/theme/solarized.css";

const { p, div, h1, button, textarea } = elements;

import { codemirror } from "./codemirror";

const main = go(function*() {
  yield h1("Welcome to the Turbine starter kit!");
  yield p("Below is a counter.");
  const { change } = yield codemirror({
    mode: "markdown",
    theme: "solarized light"
  });
  change.map((i: any) => i.getValue()).log("change");
  return { change };
});

runComponent("#mount", main);
