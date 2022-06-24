export function isNotNullable<T>(value: T | null | undefined): value is T {
  return value != null;
}

export function isHTMLElementOfType<
  T extends Uppercase<keyof HTMLElementTagNameMap>
>(
  element: HTMLElement,
  tagName: T
): element is HTMLElementTagNameMap[Lowercase<T>] {
  return element.tagName === tagName;
}
