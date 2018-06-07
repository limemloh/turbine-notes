import {
  ViewOut,
  ModelOut,
  nextOccurence,
  selfie,
  freezeAt,
  lift
} from "./utils";
import {
  streamFromEvent,
  stepper,
  Now,
  Stream,
  Behavior,
  Future,
  sample,
  snapshotWith
} from "@funkia/hareactive";
import { Component, modelView, elements as e, fgo } from "@funkia/turbine";

type FromView = ViewOut<typeof draggableView>;
type FromModel = ModelOut<typeof draggableModel>;
export type DragOffset = Stream<{
  startEvent: MouseEvent;
  offset: Behavior<{ x: number; y: number }>;
  end: Future<any>;
}>;

const mousemove = streamFromEvent(window, "mousemove");
const mouseup = streamFromEvent(window, "mouseup");
const endDrags = nextOccurence(mouseup);
endDrags.activate();
const mousePosition = stepper(
  { x: 0, y: 0 },
  mousemove.map((e) => ({ x: e.x, y: e.y }))
);
const addPoint = (p1: Point, p2: Point) => ({ x: p1.x + p2.x, y: p1.y + p2.y });
type Point = { x: number; y: number };

const calcSumOffset = fgo(function*(dragOffset: DragOffset) {
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

export type DraggableChildOut = { mousedown: Stream<MouseEvent> };

const draggableModel = fgo(function*<A extends DraggableChildOut>(
  compOut: FromView,
  _: Component<A>
) {
  const { mousedown: startDrag } = compOut;
  const mousePos = yield sample(mousePosition);

  const dragOffset = snapshotWith(
    (evt, end) => {
      evt.stopPropagation();
      const offset = mousePos.map(({ x, y }) => ({
        x: x - evt.x,
        y: y - evt.y
      }));
      return {
        startEvent: evt,
        offset,
        end
      };
    },
    endDrags,
    startDrag
  );

  const sumOffset = yield calcSumOffset(dragOffset);

  return { ...compOut, dragOffset, sumOffset };
});

function draggableView<A extends DraggableChildOut>(
  _: any,
  child: Component<A>
) {
  return child;
}

export const draggable = modelView(draggableModel, draggableView);
