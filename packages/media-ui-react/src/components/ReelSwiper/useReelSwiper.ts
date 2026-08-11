/**
 * ============================================================
 * useReelSwiper — Vertical snap paging with active detection
 * ============================================================
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
} from "react";
import type {
  UseReelSwiperOptions,
  UseReelSwiperReturn,
  ReelContainerProps,
  ReelItemProps,
} from "./types";

export function useReelSwiper(
  options: UseReelSwiperOptions
): UseReelSwiperReturn {
  const { totalItems, onActiveIndexChange, threshold = 0.6 } = options;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Map<number, HTMLElement>>(new Map());
  const [activeIndex, setActiveIndex] = useState(0);

  const onActiveIndexChangeRef = useRef(onActiveIndexChange);
  useEffect(() => {
    onActiveIndexChangeRef.current = onActiveIndexChange;
  }, [onActiveIndexChange]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let bestIdx = activeIndex;
        let bestRatio = 0;
        entries.forEach((entry) => {
          const idxStr = (entry.target as HTMLElement).dataset.reelIndex;
          if (!idxStr) return;
          const idx = Number(idxStr);
          if (entry.intersectionRatio > bestRatio) {
            bestRatio = entry.intersectionRatio;
            bestIdx = idx;
          }
        });
        if (bestRatio >= threshold && bestIdx !== activeIndex) {
          setActiveIndex(bestIdx);
          onActiveIndexChangeRef.current?.(bestIdx);
        }
      },
      {
        root: container,
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    itemRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [threshold, totalItems, activeIndex]);

  const scrollToIndex = useCallback((index: number) => {
    const el = itemRefs.current.get(index);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const getContainerProps = (
    userProps?: HTMLAttributes<HTMLDivElement>
  ): ReelContainerProps => ({
    role: "region",
    "aria-label": "Reels",
    ...userProps,
    ref: containerRef,
  });

  const getItemProps = (
    index: number,
    userProps?: HTMLAttributes<HTMLElement>
  ): ReelItemProps => {
    const setRef = (el: HTMLElement | null) => {
      if (el) itemRefs.current.set(index, el);
      else itemRefs.current.delete(index);
    };

    return {
      ...userProps,
      ref: setRef,
      "data-reel-index": index,
      "aria-roledescription": "slide",
      "aria-label": `Reel ${index + 1} of ${totalItems}`,
      role: "group",
    };
  };

  return useMemo(
    () => ({
      activeIndex,
      containerRef,
      getContainerProps,
      getItemProps,
      scrollToIndex,
    }),
    [activeIndex, scrollToIndex, totalItems]
  );
}
