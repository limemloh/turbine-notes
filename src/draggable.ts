import { ViewOut, ModelOut, nextOccurence } from "./utils";
import {
  streamFromEvent,
  stepper,
  Now,
  Stream,
  Behavior,
  Future
} from "@funkia/hareactive";
import { Component, modelView, elements as e } from "@funkia/turbine";

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
).at();

export type DraggableChildOut = { mousedown: Stream<MouseEvent> };

function draggableModel<A extends DraggableChildOut>(
  compOut: FromView,
  _: Component<A>
) {
  const { mousedown: startDrag } = compOut;

  const dragOffset = startDrag.map((evt) => {
    evt.stopPropagation();
    const offset = mousePosition.map(({ x, y }) => ({
      x: x - evt.x,
      y: y - evt.y
    }));
    const end = endDrags.at();
    return {
      startEvent: evt,
      offset,
      end
    };
  });
  return Now.of({ ...compOut, dragOffset });
}

function draggableView<A extends DraggableChildOut>(
  { startDrag }: any,
  child: Component<A>
) {
  return child;
}

export const draggable = modelView(draggableModel, draggableView);
