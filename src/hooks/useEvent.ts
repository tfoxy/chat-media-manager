import { watchEffect } from "vue";
import { TypedCustomEvent, TypedEventTarget } from "~/model/eventTarget";

export function useEvent<
  T extends { [K in keyof T]: T[K] },
  K extends keyof T & string
>(
  eventTarget: TypedEventTarget<T>,
  type: K,
  callback: (evt: TypedCustomEvent<T[K], K>) => void
): void {
  watchEffect((onCleanup) => {
    eventTarget.addEventListener(type, callback);
    onCleanup(() => eventTarget.removeEventListener(type, callback));
  });
}
