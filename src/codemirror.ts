import * as CodeMirror from "codemirror";
import { Component, DomApi, Properties } from "@funkia/turbine";
import {
  Future,
  behaviorFromEvent,
  streamFromEvent,
  producerStream,
  producerBehavior,
  Behavior
} from "@funkia/hareactive";

export type CodemirrorOutput = {
  inputValue: Behavior<string>;
};

export type CodemirrorProps = {
  containerProps?: Properties<any>;
} & CodeMirror.EditorConfiguration;

function id<A>(a: A): A {
  return a;
}

class CodeMirrorComponent extends Component<CodemirrorOutput> {
  constructor(private options?: CodemirrorProps) {
    super();
  }
  run(parent: DomApi, destroyed: Future<boolean>): CodemirrorOutput {
    const editor = CodeMirror(parent.appendChild.bind(parent), this.options);

    const handler = {
      get(target: any, name: string) {
        if (!(name in target)) {
          target[name] = producerStream(push => {
            editor.on(name, push);
            return editor.off.bind(editor, name, push);
          });
        }
        return target[name];
      }
    };
    const initial = {
      inputValue: producerBehavior(push => {
        editor.on("change", () => push(editor.getValue()));
        return editor.off.bind(editor, "change", push);
      }, editor.getValue())
    };

    const output = new Proxy(initial, handler);

    destroyed.subscribe(toplevel => {
      if (toplevel) {
        parent.removeChild(editor.getWrapperElement());
      }
    });

    return output;
  }
}

export function codemirror(
  options?: CodeMirror.EditorConfiguration
): Component<CodemirrorOutput> {
  return new CodeMirrorComponent(options);
}
