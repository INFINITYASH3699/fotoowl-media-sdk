/**
 * ============================================================
 * media-ui-react — Utility helpers
 * ============================================================
 */

/** Merge multiple refs (React ref forwarding) */
export function mergeRefs<T>(
  ...refs: Array<React.Ref<T> | undefined>
): React.RefCallback<T> {
  return (value: T) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(value);
      } else if (ref && typeof ref === "object") {
        (ref as React.MutableRefObject<T>).current = value;
      }
    });
  };
}

/** Combine event handlers — user's handler runs first, ours runs unless preventDefault */
export function callAll<Args extends unknown[]>(
  ...fns: Array<((...args: Args) => void) | undefined>
): (...args: Args) => void {
  return (...args: Args) => {
    fns.forEach((fn) => fn?.(...args));
  };
}

/** Simple className concatenator */
export function cx(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}
