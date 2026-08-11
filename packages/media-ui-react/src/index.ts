/**
 * ============================================================
 * media-ui-react — Public API
 * ============================================================
 * Pure headless components. Zero SDK dependency.
 * ============================================================
 */

// Grid
export { useGrid } from "./components/Grid";
export type { UseGridOptions, UseGridReturn } from "./components/Grid";

// Lightbox
export { useLightbox } from "./components/Lightbox";
export type {
  UseLightboxOptions,
  UseLightboxReturn,
} from "./components/Lightbox";

// ReelSwiper
export { useReelSwiper } from "./components/ReelSwiper";
export type {
  UseReelSwiperOptions,
  UseReelSwiperReturn,
} from "./components/ReelSwiper";

// Shared hooks (advanced use)
export {
  useIntersectionObserver,
  useKeyDown,
  useLockBodyScroll,
} from "./hooks";

// Utilities
export { mergeRefs, callAll, cx } from "./utils";
