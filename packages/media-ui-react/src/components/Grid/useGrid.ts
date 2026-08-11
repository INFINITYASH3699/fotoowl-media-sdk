/**
 * ============================================================
 * useGrid — Headless infinite-scroll grid
 * ============================================================
 */

import { useRef, type HTMLAttributes } from "react";
import { useIntersectionObserver } from "../../hooks";
import type {
  UseGridOptions,
  UseGridReturn,
  ContainerProps,
  ItemProps,
  SentinelProps,
} from "./types";

export function useGrid(options: UseGridOptions = {}): UseGridReturn {
  const { onLoadMore, enabled = true, rootMargin = "200px" } = options;
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useIntersectionObserver(
    sentinelRef,
    () => {
      if (enabled) onLoadMore?.();
    },
    { rootMargin }
  );

  const getContainerProps = (userProps?: ContainerProps): ContainerProps => ({
    role: "list",
    "aria-busy": false,
    ...userProps,
  });

  const getItemProps = (
    index: number,
    userProps?: HTMLAttributes<HTMLElement>
  ): ItemProps => ({
    role: "listitem",
    "aria-posinset": index + 1,
    ...userProps,
    key: index,
  });

  const getSentinelProps = (
    userProps?: HTMLAttributes<HTMLDivElement>
  ): SentinelProps => ({
    ...userProps,
    ref: sentinelRef,
    "aria-hidden": true,
  });

  return {
    getContainerProps,
    getItemProps,
    getSentinelProps,
    sentinelRef,
  };
}
