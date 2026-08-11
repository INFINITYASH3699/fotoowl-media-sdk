/**
 * ============================================================
 * media-react — Hook return types
 * ============================================================
 */

import type { MediaItem } from "media-core";

export interface AsyncState<T> {
  data: T | undefined;
  error: Error | undefined;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
}

export interface PaginatedState<T> extends AsyncState<T[]> {
  page: number;
  hasMore: boolean;
  totalResults: number;
  loadMore: () => void;
  refresh: () => void;
  isFetchingMore: boolean;
}

export interface SearchHookOptions {
  perPage?: number;
  enabled?: boolean;
  orientation?: "landscape" | "portrait" | "square";
  size?: "small" | "medium" | "large";
}

export interface CuratedHookOptions {
  perPage?: number;
  enabled?: boolean;
}

export type MediaListState = PaginatedState<MediaItem>;
export type MediaItemState = AsyncState<MediaItem>;