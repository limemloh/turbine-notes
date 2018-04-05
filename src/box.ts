import { DraggableChildOut, draggable, DragOffset } from "./draggable";
import {
  Child,
  Component,
  elements as e,
  fgo,
  modelView
} from "@funkia/turbine";
import { selfie, freezeAt, lift, pluck, mapOrCall } from "./utils";
import { sample, Behavior } from "@funkia/hareactive";

const addPoint = (p1: Point, p2: Point) => ({ x: p1.x + p2.x, y: p1.y + p2.y });

function edge<A extends DraggableChildOut, B extends string>(
  name: B,
  child?: Child<A>
): Component<A & Record<B, any>> {
  return <any>draggable(e.div({ class: name }, child)).output({
    [name]: "dragOffset"
  });
}

type Point = { x: number; y: number };

//type FromView = ViewOut<typeof boxView>;
type FromView = {
  content: DragOffset;
  north: DragOffset;
  south: DragOffset;
  west: DragOffset;
  east: DragOffset;
  northWest: DragOffset;
  northEast: DragOffset;
  southWest: DragOffset;
  southEast: DragOffset;
};

const sumOffset = fgo(function*(dragOffset: DragOffset) {
  const offsets = selfie(
    dragOffset.map(({ offset, end }) => freezeAt(offset, end))
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
  const posOffset: Behavior<Point> = yield sumOffset(content);

  const northOffset: Behavior<Point> = yield sumOffset(north);
  const southOffset: Behavior<Point> = yield sumOffset(south);
  const westOffset: Behavior<Point> = yield sumOffset(west);
  const eastOffset: Behavior<Point> = yield sumOffset(east);
  const nwOffset: Behavior<Point> = yield sumOffset(northWest);
  const neOffset: Behavior<Point> = yield sumOffset(northEast);
  const swOffset: Behavior<Point> = yield sumOffset(southWest);
  const seOffset: Behavior<Point> = yield sumOffset(southEast);

  const pos = lift(
    (pos1, pos2, n, w, nw, ne, sw) => ({
      x: pos1.x + pos2.x + w.x + nw.x + sw.x,
      y: pos1.y + pos2.y + n.y + nw.y + ne.y
    }),
    posOffset,
    pos_,
    northOffset,
    westOffset,
    nwOffset,
    neOffset,
    swOffset
  );

  const height = lift(
    (h, n, s, nw, ne, sw, se) => h - n.y + s.y - nw.y - ne.y + sw.y + se.y,
    height_,
    northOffset,
    southOffset,
    nwOffset,
    neOffset,
    swOffset,
    seOffset
  );

  const width = lift(
    (wi, we, e, nw, ne, sw, se) => wi - we.x + e.x - nw.x + ne.x - sw.x + se.x,
    width_,
    westOffset,
    eastOffset,
    nwOffset,
    neOffset,
    swOffset,
    seOffset
  );

  return { pos, width, height };
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
