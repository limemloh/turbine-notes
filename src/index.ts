import { go, combine } from "@funkia/jabz";
import {
  runComponent,
  elements as e,
  modelView,
  Component,
  Child
} from "@funkia/turbine";
const { p, div, h1, button, textarea } = e;
import {
  Behavior,
  Stream,
  sample,
  scan,
  isBehavior,
  Now
} from "@funkia/hareactive";

import { note } from "./note";
import { mapOrCall } from "./utils";

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
    box({ left: 500, top: 100, width: 400, height: 300 }, note())
  ]);
  return {};
});

runComponent("#mount", main);

function toUnit(b: number | string, unit: string): string;
function toUnit(b: Behavior<number | string>, unit: string): Behavior<string>;
function toUnit(b: Behavior<number | string> | number | string, unit: string) {
  return mapOrCall<number | string, string>((v) => `${v}${unit}`, b);
}
