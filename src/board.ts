import {
  elements as e,
  modelView,
  Component,
  Child,
  list,
  fgo
} from "@funkia/turbine";
import { Behavior, Now, Stream, scanCombine, sample } from "@funkia/hareactive";
import { note } from "./note";
import { box } from "./box";
import { draggable, DragOffset } from "./draggable";
import { ViewOut, ModelOut, pluck, freezeAt } from "./utils";

type FromView = {
  dragOffset: DragOffset;
};
const add = (a) => (b) => a + b;
const boardModel = fgo(function*({ dragOffset }: FromView) {
  const addNotes = dragOffset.map(({ startEvent, offset, end }) => ({
    id: Date.now(),
    view: box({
      pos: Behavior.of({ x: startEvent.x - 11, y: startEvent.y - 11 }),
      width: pluck("x", offset).map(add(11 * 2)),
      height: pluck("y", offset).map(add(11 * 2)),
      child: note
    })
  }));

  const initial: Component[] = [];

  const notes = yield sample(
    scanCombine([[addNotes, (item, acc) => acc.concat([item])]], initial)
  );

  return { notes };
});

function boardView({ notes }: any) {
  return draggable(
    e.div({ class: "container" }, [
      e.h1("Welcome to Turbine notes"),
      list(({ view }) => view, notes, ({ id }) => id)
    ])
  );
}

export const board = modelView(boardModel, boardView)();
