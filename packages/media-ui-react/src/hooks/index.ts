/**
 * ============================================================
 * media-ui-react — Shared hooks
 * ============================================================
 */

import { useEffect, useRef, type RefObject } from "react";

/**
 * useIntersectionObserver
 * Fires callback when the target ref enters the viewport.
 * Used for infinite scroll.
 */
export function useIntersectionObserver(
  targetRef: RefObject<Element | null>,
  callback: () => void,
  options: IntersectionObserverInit = {}
): void {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          savedCallback.current();
        }
      });
    }, options);

    observer.observe(target);
    return () => observer.disconnect();
  }, [targetRef, options.root, options.rootMargin, options.threshold]);
}

/**
 * useKeyDown
 * Attach global keyboard listener while enabled.
 */
export function useKeyDown(
  handler: (e: KeyboardEvent) => void,
  enabled = true
): void {
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!enabled) return;
    const listener = (e: KeyboardEvent) => savedHandler.current(e);
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [enabled]);
}

/**
 * useLockBodyScroll
 * Prevent background scroll while enabled (used by Lightbox).
 */
export function useLockBodyScroll(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [enabled]);
}
