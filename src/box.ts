import { DraggableChildOut, draggable } from "./draggable";
import {
  Child,
  Component,
  elements as e,
  fgo,
  modelView
} from "@funkia/turbine";
import { lift, pluck, mapOrCall } from "./utils";
import { sample, Behavior, Now } from "@funkia/hareactive";

const max = (a: number) => (b: number) => Math.max(a, b);

function edge<A extends DraggableChildOut, B extends string>(
  name: B,
  child?: Child<A>
): Component<A & Record<B, any>> {
  return <any>draggable(e.div({ class: name }, child)).output({
    [name]: "sumOffset"
  });
}

type Point = { x: number; y: number };

//type FromView = ViewOut<typeof boxView>;
type FromView = {
  content: Behavior<Point>;
  north: Behavior<Point>;
  south: Behavior<Point>;
  west: Behavior<Point>;
  east: Behavior<Point>;
  northWest: Behavior<Point>;
  northEast: Behavior<Point>;
  southWest: Behavior<Point>;
  southEast: Behavior<Point>;
};

function boxModel(
  {
    content,
    north,
    south,
    west,
    east,
    northWest,
    northEast,
    southWest,
    southEast
  }: FromView,
  { pos: pos_, width: width_, height: height_ }: BoxArgs
) {
  const pos = lift(
    (pos1, pos2, n, w, nw, ne, sw) => ({
      x: pos1.x + pos2.x + w.x + nw.x + sw.x,
      y: pos1.y + pos2.y + n.y + nw.y + ne.y
    }),
    content,
    pos_,
    north,
    west,
    northWest,
    northEast,
    southWest
  );

  const height = lift(
    (h, n, s, nw, ne, sw, se) => h - n.y + s.y - nw.y - ne.y + sw.y + se.y,
    height_,
    north,
    south,
    northWest,
    northEast,
    southWest,
    southEast
  ).map(max(100));

  const width = lift(
    (wi, we, e, nw, ne, sw, se) => wi - we.x + e.x - nw.x + ne.x - sw.x + se.x,
    width_,
    west,
    east,
    northWest,
    northEast,
    southWest,
    southEast
  ).map(max(100));

  return Now.of({ pos, width, height });
}

type BoxArgs = {
  pos: Behavior<Point>;
  width: Behavior<number>;
  height: Behavior<number>;
  child?: Child<any>;
};

function boxView({ pos, width, height }: any, { child }: BoxArgs) {
  return e.div(
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

export const box = modelView(boxModel, boxView);

function toUnit(b: number | string, unit: string): string;
function toUnit(b: Behavior<number | string>, unit: string): Behavior<string>;
function toUnit(b: Behavior<number | string> | number | string, unit: string) {
  return mapOrCall<number | string, string>((v) => `${v}${unit}`, b);
}
