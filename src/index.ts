import { go, combine, fgo } from "@funkia/jabz";
import {
  runComponent,
  elements as e,
  modelView,
  Component,
  Child,
  Properties
} from "@funkia/turbine";
const { p, div, h1, button, textarea } = e;
import {
  Behavior,
  Stream,
  sample,
  scan,
  isBehavior,
  Now,
  stepper,
  streamFromEvent,
  snapshot
} from "@funkia/hareactive";

import { note } from "./note";
import { mapOrCall, ViewOut, ModelOut, nextOccurence } from "./utils";

import "./style.scss";
import { draggable } from "./draggable";

function edge<A>(props: Properties<A>, child?: Child) {
  return draggable(div(props, child));
}

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
      edge({ class: "north-west" }),
      edge({ class: "north" }),
      edge({ class: "north-east" }),
      edge({ class: "west" }),
      edge({ class: "content" }, child),
      edge({ class: "east" }),
      edge({ class: "south-west" }),
      edge({ class: "south" }),
      edge({ class: "south-east" })
    ]
  );
}

const main = go(function*() {
  yield h1("Welcome to Turbine notes");
  yield div({ class: "container" }, [
    box({ left: 500, top: 100, width: 400, height: 300 }, note())
  ]);
  return {};
});

runComponent("#mount", main);

function toUnit(b: number | string, unit: string): string;
function toUnit(b: Behavior<number | string>, unit: string): Behavior<string>;
function toUnit(b: Behavior<number | string> | number | string, unit: string) {
  // @ts-ignore
  return mapOrCall<number | string, string>((v) => `${v}${unit}`, b);
}
