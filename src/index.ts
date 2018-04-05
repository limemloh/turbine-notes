import { go, combine, fgo, lift } from "@funkia/jabz";
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
  snapshot,
  switchTo,
  Future
} from "@funkia/hareactive";

import { note } from "./note";
import {
  mapOrCall,
  ViewOut,
  ModelOut,
  nextOccurence,
  pluck,
  freezeAt,
  selfie
} from "./utils";

import "./style.scss";
import { draggable, DraggableChildOut, DragOffset } from "./draggable";

const addPoint = (p1: Point, p2: Point) => ({ x: p1.x + p2.x, y: p1.y + p2.y });

function edge<A extends DraggableChildOut, B extends string>(
  name: B,
  child?: Child<A>
): Component<A & Record<B, any>> {
  return <any>draggable(div({ class: name }, child)).output({
    [name]: "dragOffset"
  });
}

type Point = { x: number; y: number };

//type FromView = ViewOut<typeof boxView>;
type FromView = {
  content: DragOffset;
};

const sumOffset = fgo(function*(content: DragOffset) {
  const offsets = selfie(
    content.map(({ offset, end }) => freezeAt(offset, end))
  );
  const leftOffset = yield sample(
    offsets.scan(
      (next, acc) => lift(addPoint, next, acc),
      Behavior.of({ x: 0, y: 0 })
    )
  );
  return leftOffset.flatten();
});

function* boxModel(
  { content }: FromView,
  { pos: receivedPos, width, height }: BoxArgs
) {
  const offset: Behavior<Point> = yield sumOffset(content);
  const pos = lift(addPoint, offset, receivedPos);

  return { pos, width, height };
}

type BoxArgs = {
  pos: Behavior<Point>;
  width: Behavior<number>;
  height: Behavior<number>;
  child?: Child<any>;
};

function boxView({ pos, width, height }: any, { child }: BoxArgs) {
  return div(
    {
      class: "box",
      style: {
        // @ts-ignore
        top: toUnit(pluck("y", pos), "px"),
        left: toUnit(pluck("x", pos), "px"),
        width: toUnit(width, "px"),
        height: toUnit(height, "px")
      }
    },
    [
      edge("northWest"),
      edge("north"),
      edge("northEast"),
      edge("west"),
      edge("content", child),
      edge("east"),
      edge("southWest"),
      edge("south"),
      edge("southEast")
    ]
  );
}

const box = modelView(boxModel, boxView);

const main = go(function*() {
  yield h1("Welcome to Turbine notes");
  yield div({ class: "container" }, [
    box({
      pos: Behavior.of({ x: 500, y: 200 }),
      width: Behavior.of(400),
      height: Behavior.of(300),
      child: note()
    })
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
