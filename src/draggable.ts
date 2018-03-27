import { ViewOut, ModelOut, nextOccurence } from "./utils";
import { streamFromEvent, stepper, Now, Stream } from "@funkia/hareactive";
import { Component, modelView, elements as e } from "@funkia/turbine";

type FromView = ViewOut<typeof draggableView>;
type FromModel = ModelOut<typeof draggableModel>;

const mousemove = streamFromEvent(window, "mousemove");
const mouseup = streamFromEvent(window, "mouseup");
const endDrags = nextOccurence(mouseup);
endDrags.activate();
const mousePosition = stepper(
  { x: 0, y: 0 },
  mousemove.map((e) => ({ x: e.x, y: e.y }))
).at();

function draggableModel(compOut: FromView, _: any) {
  const { mousedown: startDrag } = compOut;

  const drag = startDrag.map((evt) => {
    const offset = mousePosition.map(({ x, y }) => ({
      x: x - evt.x,
      y: y - evt.y
    }));
    const end = endDrags.at();
    return {
      offset,
      end
    };
  });
  return Now.of({ ...compOut, drag });
}

export function draggableView<A extends { mousedown: Stream<any> }>(
  { startDrag }: any,
  child: Component<A>
) {
  return child;
}

export const draggable = modelView(draggableModel, draggableView);
