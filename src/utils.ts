import {
  Stream,
  Behavior,
  isBehavior,
  isStream,
  map,
  Now,
  Future,
  sinkFuture,
  snapshotAt,
  switchTo,
  at
} from "@funkia/hareactive";
import { Component } from "@funkia/turbine";
import { curry } from "ramda";

export function pluck(name: string, b: Behavior<any>) {
  return b.map((a) => a[name]);
}

export function toggle(trigger: Stream<any>, initial = false) {
  return trigger.scan((_, before) => !before, initial);
}

export function mapOrCall<A, B>(fn: (a: A) => B, v: Behavior<A>): Behavior<B>;
export function mapOrCall<A, B>(fn: (a: A) => B, v: Stream<A>): Stream<B>;
export function mapOrCall<A, B>(fn: (a: A) => B, v: A): B;
export function mapOrCall<A, B>(
  fn: (a: A) => B,
  v: Behavior<A> | Stream<A> | A
) {
  if (isBehavior(v) || isStream(v)) {
    return map(fn, v as any);
  } else {
    return fn(v);
  }
}

export type ComponentOut<T> = T extends Component<infer A> ? A : any;
export type NowOut<T> = T extends Now<infer A> ? A : any;

export type ViewOut<T extends (...args: any[]) => any> = ComponentOut<
  ReturnType<T>
>;
export type ModelOut<T extends (...args: any[]) => any> = NowOut<ReturnType<T>>;

class NextOccurence<A> extends Behavior<Future<A>> {
  constructor(private stream: Stream<A>) {
    super();
    this.last = sinkFuture();
  }
  activate() {
    this.stream.addListener(this);
  }
  deactivate() {
    this.stream.removeListener(this);
  }
  push(a: A) {
    this.last.resolve(a);
    this.last = sinkFuture();
    if (this.child !== undefined) {
      this.child.push(this.last);
    }
  }
}

export function nextOccurence<A>(stream: Stream<A>): Behavior<Future<A>> {
  return new NextOccurence(stream);
}

export function freezeAt<A>(
  behavior: Behavior<A>,
  shouldFreeze: Future<any>
): Behavior<Behavior<A>> {
  return snapshotAt(behavior, shouldFreeze).map((f) =>
    switchTo(behavior, f.map(Behavior.of))
  );
}

export function selfie<A>(stream: Stream<Behavior<A>>): Stream<A> {
  return stream.map(at);
}

export function lift(f: any, ...args: any[]) {
  let fn = curry(f);
  let acc = args.shift().map(fn);

  for (const applicative of args) {
    acc = applicative.ap(acc);
  }
  return acc;
}
