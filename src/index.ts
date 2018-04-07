import { go, combine, fgo } from "@funkia/jabz";
import {
  runComponent,
  elements as e,
  modelView,
  Component,
  Child,
  list
} from "@funkia/turbine";
const { p, div, h1, button, textarea } = e;
import { Behavior, Now, Stream, scanCombine, sample } from "@funkia/hareactive";
import { note } from "./note";
import { box } from "./box";
import { draggable, DragOffset } from "./draggable";
import { ViewOut, ModelOut, pluck, freezeAt } from "./utils";

import "./style.scss";

type FromView = {
  dragOffset: DragOffset;
};

const mainModel = fgo(function*({ dragOffset }: FromView) {
  const addNotes = dragOffset.map(({ startEvent, offset, end }) => {
    const drag = freezeAt(offset, end).at();
    return {
      id: Date.now(),
      view: box({
        pos: Behavior.of({ x: startEvent.x, y: startEvent.y }),
        width: pluck("x", drag),
        height: pluck("y", drag),
        child: note()
      })
    };
  });
  const initial: Component[] = [];

  const notes = yield sample(
    scanCombine([[addNotes, (item, acc) => acc.concat([item])]], initial)
  );

  return { notes };
});

function mainView({ notes }: any) {
  return draggable(
    div({ class: "container" }, [
      h1("Welcome to Turbine notes"),
      list(({ view }) => view, notes, ({ id }) => id)
    ])
  );
}

const main = modelView(mainModel, mainView);

runComponent("#mount", main());
