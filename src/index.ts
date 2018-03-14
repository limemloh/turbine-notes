import { go, combine } from "@funkia/jabz";
import {
  runComponent,
  elements,
  modelView,
  Component,
  Child
} from "@funkia/turbine";
const { p, div, h1, button, textarea } = elements;
import { Behavior, Stream, sample, scan, isBehavior } from "@funkia/hareactive";

import "codemirror/lib/codemirror.css";
import "codemirror/addon/edit/closebrackets";
import "codemirror/addon/display/placeholder";
import "codemirror/mode/markdown/markdown";
import "codemirror/theme/solarized.css";

import { codemirror } from "./codemirror";
import { markdown } from "./markdown";

import "./style.scss";


function box({ left, top, width, height }: any, child?: Child): Component<any> {
  return div(
    {
      class: "box",
      style: {
        // @ts-ignore
        left: toUnit(left, "px"),
        width: toUnit(width, "px"),
        top: toUnit(top, "px"),
        height: toUnit(height, "px")
      }
    },
    [
      div({ class: "north-west" }),
      div({ class: "north" }),
      div({ class: "north-east" }),
      div({ class: "west" }),
      div({ class: "content" }, child),
      div({ class: "east" }),
      div({ class: "south-west" }),
      div({ class: "south" }),
      div({ class: "south-east" })
    ]
  );
}

const main = go(function*() {
  yield h1("Welcome to Turbine notes");

  yield div({ class: "container" }, [
    box(
      { left: 500, top: 100, width: 400, height: 300 },
      note(Behavior.of(true))
    )
  ]);

  // const { inputValue } = yield codemirror({
  //   mode: "markdown",
  //   theme: "solarized light",
  //   tabSize: 2
  // });

  // yield p(inputValue.map(markdown));
  return {};
});

const demoMarkdown = `
## TODO
her er alle opgaver som skal laves:
    
1. [ ] Ryd op
2. [x] Støvsuge
`;

function note(editing: Behavior<boolean>) {
  const displayCode = editing.map((b) => b ? "inline" : "none");
  const displayMark = editing.map((b) => b ? "none" : "inline");

  return go(function*() {
    const {click: editClick} = yield div({class: "edit-icon"}, "✎");
    const { inputValue } = yield div({class: "expand", style: {display: displayCode}}, 
      codemirror({
        mode: "markdown",
        theme: "solarized light",
        lineWrapping: true,
        tabSize: 2,
        value: "# Her"
      })).output({inputValue: "inputValue"});
      inputValue.log("code");
    yield div({class: "expand", style: {display: displayMark}}, inputValue.map(markdown));
    return {editClick, inputValue};
  });
}

runComponent("#mount", main);

function toUnit(b: number | string, unit: string): string;
function toUnit(b: Behavior<number | string>, unit: string): Behavior<string>;
function toUnit(b: Behavior<number | string> | number | string, unit: string) {
  return isBehavior(b) ? b.map((v) => `${v}${unit}`) : `${b}${unit}` 
}