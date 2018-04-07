import { Behavior, Stream, sample } from "@funkia/hareactive";
import { go } from "@funkia/jabz";
import { elements as e, modelView } from "@funkia/turbine";
import { codemirror } from "./codemirror";
import { markdown } from "./markdown";

import "codemirror/lib/codemirror.css";
import "codemirror/addon/edit/closebrackets";
import "codemirror/addon/display/placeholder";
import "codemirror/mode/markdown/markdown";
import "codemirror/theme/solarized.css";

import { toggle } from "./utils";

type NoteViewParams = { editing: Behavior<boolean> };

function noteView({ editing }: NoteViewParams) {
  const displayCode = editing.map((b) => (b ? "inline" : "none"));
  const displayMark = editing.map((b) => (b ? "none" : "inline"));

  return go(function*() {
    const { click: editClick } = yield e.div({ class: "edit-icon" }, "✎");
    const { inputValue } = yield e.div(
      { class: "expand", style: { display: displayCode } },
      codemirror({
        mode: "markdown",
        theme: "solarized light",
        lineWrapping: true,
        tabSize: 2,
        value: ""
      }).output({ inputValue: "inputValue" })
    );
    yield e.div(
      { class: "expand", style: { display: displayMark } },
      inputValue.map(markdown)
    );
    return { editClick, inputValue };
  });
}

type NoteModelParams = { editClick: Stream<any>; inputValue: Behavior<string> };

function* noteModel({ editClick, inputValue }: NoteModelParams) {
  const editing = yield sample(toggle(editClick, true));
  return { editing };
}

export const note = modelView(noteModel, noteView);
