/**
 * ============================================================
 * Grid — Types
 * ============================================================
 */

import type { HTMLAttributes, RefObject, Ref } from "react";

export interface UseGridOptions {
  /** Called when the load-more sentinel enters viewport */
  onLoadMore?: () => void;
  /** Should load-more fire? (typically hasMore && !isLoading) */
  enabled?: boolean;
  /** IntersectionObserver root margin */
  rootMargin?: string;
}

export type ContainerProps = HTMLAttributes<HTMLElement>;
export type ItemProps = HTMLAttributes<HTMLElement> & { key: number };
export type SentinelProps = HTMLAttributes<HTMLDivElement> & {
  ref: Ref<HTMLDivElement>;
};

export interface UseGridReturn {
  /** Props for the grid container element */
  getContainerProps: (userProps?: ContainerProps) => ContainerProps;
  /** Props for each grid item element */
  getItemProps: (
    index: number,
    userProps?: HTMLAttributes<HTMLElement>
  ) => ItemProps;
  /** Ref for the sentinel element that triggers loading more */
  sentinelRef: RefObject<HTMLDivElement | null>;
  /** Props to spread on the sentinel */
  getSentinelProps: (
    userProps?: HTMLAttributes<HTMLDivElement>
  ) => SentinelProps;
}
