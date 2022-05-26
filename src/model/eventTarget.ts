export type TypedCustomEvent<T, K extends string> = CustomEvent<T> & {
  type: K;
};

export class TypedEventTarget<
  T extends { [K in keyof T]: T[K] }
> extends EventTarget {
  addEventListener<K extends keyof T & string>(
    type: K,
    callback: (evt: TypedCustomEvent<T[K], K>) => void
  ): void;
  addEventListener(type: string, callback: (evt: Event) => void): void;
  addEventListener(type: string, callback: (evt: CustomEvent) => void): void {
    super.addEventListener(type, callback as (evt: Event) => void);
  }

  dispatchEvent<K extends keyof T & string>(type: K, detail: T[K]): boolean;
  dispatchEvent(event: Event): boolean;
  dispatchEvent(event: Event | string, detail?: unknown): boolean {
    if (!(event instanceof Event)) {
      event = new CustomEvent(event, { detail });
    }
    return super.dispatchEvent(event);
  }

  removeEventListener<K extends keyof T & string>(
    type: K,
    callback: (evt: TypedCustomEvent<T[K], K>) => void
  ): void;
  removeEventListener(type: string, callback: (evt: Event) => void): void;
  removeEventListener(
    type: string,
    callback: (evt: CustomEvent) => void
  ): void {
    super.removeEventListener(type, callback as (evt: Event) => void);
  }
}
