import { go, combine, fgo } from "@funkia/jabz";
import {
  runComponent,
  elements as e,
  modelView,
  Component,
  Child
} from "@funkia/turbine";
const { p, div, h1, button, textarea } = e;
import { Behavior } from "@funkia/hareactive";
import { note } from "./note";
import { box } from "./box";
import { ViewOut, ModelOut } from "./utils";

import "./style.scss";

const main = go(function*() {
  yield div({ class: "container" }, [
    h1("Welcome to Turbine notes"),
    box({
      pos: Behavior.of({ x: 200, y: 200 }),
      width: Behavior.of(400),
      height: Behavior.of(300),
      child: note()
    })
  ]);
  return {};
});

runComponent("#mount", main);
