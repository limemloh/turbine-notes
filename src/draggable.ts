import {
  ViewOut,
  ModelOut,
  nextOccurence,
  freezeAt,
  lift,
  momentS
} from "./utils";
import {
  streamFromEvent,
  stepper,
  Now,
  Stream,
  Behavior,
  Future,
  sample,
  snapshotWith,
  scan
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

export type DraggableChildOut = { mousedown: Stream<MouseEvent> };

const draggableModel = fgo(function*<A extends DraggableChildOut>(
  compOut: FromView,
  _: Component<A>
) {
  const { mousedown: startDrag } = compOut;
  const mousePos = yield sample(mousePosition);

  const dragOffset = momentS((evt, at) => {
    evt.stopPropagation();
    const end = at(endDrags);
    const offset = at(
      freezeAt(
        mousePos.map(({ x, y }) => ({
          x: x - evt.x,
          y: y - evt.y
        })),
        end
      )
    );
    return {
      startEvent: evt,
      offset,
      end
    };
  }, startDrag);

  const sumOffsets = yield sample(
    scan(
      ({ offset }, acc) => lift(addPoint, offset, acc),
      Behavior.of({ x: 0, y: 0 }),
      dragOffset
    )
  );
  const sumOffset = sumOffsets.flatten();

  return { ...compOut, dragOffset, sumOffset };
});

function draggableView<A extends DraggableChildOut>(
  _: any,
  child: Component<A>
) {
  return child;
}

export const draggable = modelView(draggableModel, draggableView);
