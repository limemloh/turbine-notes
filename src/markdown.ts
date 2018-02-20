import { Component, DomApi } from "@funkia/turbine";
import { Future } from "@funkia/hareactive";
import * as MarkdownIt from "markdown-it";
// @ts-ignore
import * as markdownKatex from "markdown-it-katex";
import "katex/dist/katex.css";
import "github-markdown-css/github-markdown.css";

const md = new MarkdownIt();
md.use(markdownKatex);

export type DomParserOutput = {};

class DomParser extends Component<DomParserOutput> {
  constructor(private domStr: string) {
    super();
  }
  run(parent: DomApi, destroyed: Future<boolean>): DomParserOutput {
    const container = document.createElement("div");
    container.classList.add("markdown-body");
    container.innerHTML = this.domStr;
    parent.appendChild(container);

    destroyed.subscribe(topLevel => {
      if (topLevel) {
        parent.removeChild(container);
      }
    });

    return {};
  }
}

export function domParser(domStr: string): Component<DomParserOutput> {
  return new DomParser(domStr);
}

export function markdown(mark: string): Component<DomParserOutput> {
  return domParser(md.render(mark));
}
