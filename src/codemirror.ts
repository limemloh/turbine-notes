import * as CodeMirror from "codemirror";
import { Component, DomApi } from "@funkia/turbine";
import {
  Future,
  behaviorFromEvent,
  streamFromEvent,
  producerStream
} from "@funkia/hareactive";

export type CodemirrorOutput = {};

function id<A>(a: A): A {
  return a;
}

class CodeMirrorComponent extends Component<CodemirrorOutput> {
  constructor(private options?: CodeMirror.EditorConfiguration) {
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

    const output = new Proxy({}, handler);

    return output;
  }
}

export function codemirror(
  options?: CodeMirror.EditorConfiguration
): Component<CodemirrorOutput> {
  return new CodeMirrorComponent(options);
}
