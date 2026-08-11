/**
 * ============================================================
 * ReelSwiper — Types
 * ============================================================
 */

import type { HTMLAttributes, RefObject, Ref } from "react";

export interface UseReelSwiperOptions {
  totalItems: number;
  onActiveIndexChange?: (index: number) => void;
  threshold?: number;
}

export type ReelContainerProps = HTMLAttributes<HTMLDivElement> & {
  ref: Ref<HTMLDivElement>;
};

export type ReelItemProps = HTMLAttributes<HTMLElement> & {
  ref: (el: HTMLElement | null) => void;
  "data-reel-index": number;
};

export interface UseReelSwiperReturn {
  activeIndex: number;
  containerRef: RefObject<HTMLDivElement | null>;
  getContainerProps: (
    userProps?: HTMLAttributes<HTMLDivElement>
  ) => ReelContainerProps;
  getItemProps: (
    index: number,
    userProps?: HTMLAttributes<HTMLElement>
  ) => ReelItemProps;
  scrollToIndex: (index: number) => void;
}
