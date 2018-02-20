import { go, combine } from "@funkia/jabz";
import {
  runComponent,
  elements,
  modelView,
  Component,
  Child
} from "@funkia/turbine";
const { p, div, h1, button, textarea } = elements;
import { Behavior, Stream, sample, scan } from "@funkia/hareactive";

import "codemirror/lib/codemirror.css";
import "codemirror/addon/edit/closebrackets";
import "codemirror/addon/display/placeholder";
import "codemirror/mode/markdown/markdown";
import "codemirror/theme/solarized.css";

import { codemirror } from "./codemirror";
import { markdown } from "./markdown";

import "./style.scss";

type BoxProps = {
  width: Behavior<number>;
  height: Behavior<number>;
};

function box({ left, top, width, height }: any, child?: Child): Component<any> {
  return div(
    {
      class: "box",
      style: {
        // @ts-ignore
        gridColumnStart: left,
        gridColumnEnd: left + width,
        gridRowStart: top,
        gridRowEnd: top + height
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
      { left: 1, top: 1, width: 1, height: 3 },
      codemirror({
        mode: "markdown",
        theme: "solarized light",
        lineWrapping: true,
        tabSize: 2
      })
    ),
    box(
      { left: 2, top: 3, width: 3, height: 3 },
      markdown(`
## TODO
her er alle opgaver som skal laves:

1. Ryd op
2. Støvsuge
    `)
    )
    // box({ left: 1, top: 1, width: 3, height: 3 })
  ]);

  // const { inputValue } = yield codemirror({
  //   mode: "markdown",
  //   theme: "solarized light",
  //   tabSize: 2
  // });

  // yield p(inputValue.map(markdown));
  return {};
});

runComponent("#mount", main);
