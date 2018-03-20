import {
  Stream,
  Behavior,
  isBehavior,
  isStream,
  map
} from "@funkia/hareactive";

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
