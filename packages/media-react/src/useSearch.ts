/**
 * ============================================================
 * useSearch — Paginated photo search with infinite loading
 * ============================================================
 * Usage:
 *   const s = useSearch("nature", { perPage: 20 });
 *   s.data      → MediaItem[]
 *   s.loadMore()
 * ============================================================
 */

import { useCallback, useEffect, useReducer, useRef } from "react";
import type { MediaItem } from "media-core";
import type { MediaListState, SearchHookOptions } from "./types";
import { useMediaClient } from "./useMediaClient";

type Action =
  | { type: "RESET" }
  | { type: "LOAD_START"; isLoadMore: boolean }
  | { type: "LOAD_SUCCESS"; items: MediaItem[]; page: number; total: number; append: boolean }
  | { type: "LOAD_ERROR"; error: Error };

interface State {
  data: MediaItem[] | undefined;
  error: Error | undefined;
  page: number;
  totalResults: number;
  isLoading: boolean;
  isFetchingMore: boolean;
}

const initialState: State = {
  data: undefined,
  error: undefined,
  page: 0,
  totalResults: 0,
  isLoading: false,
  isFetchingMore: false,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "RESET":
      return initialState;
    case "LOAD_START":
      return {
        ...state,
        error: undefined,
        isLoading: !action.isLoadMore,
        isFetchingMore: action.isLoadMore,
      };
    case "LOAD_SUCCESS":
      return {
        ...state,
        data: action.append && state.data ? [...state.data, ...action.items] : action.items,
        page: action.page,
        totalResults: action.total,
        isLoading: false,
        isFetchingMore: false,
      };
    case "LOAD_ERROR":
      return {
        ...state,
        error: action.error,
        isLoading: false,
        isFetchingMore: false,
      };
  }
}

export function useSearch(
  query: string,
  options: SearchHookOptions = {}
): MediaListState {
  const client = useMediaClient();
  const { perPage = 15, enabled = true, orientation, size } = options;
  const [state, dispatch] = useReducer(reducer, initialState);
  const requestIdRef = useRef(0);

  const fetchPage = useCallback(
    async (page: number, append: boolean) => {
      const myReqId = ++requestIdRef.current;
      dispatch({ type: "LOAD_START", isLoadMore: append });
      try {
        const res = await client.searchPhotos({
          query,
          page,
          perPage,
          orientation,
          size,
        });
        // Ignore stale responses
        if (myReqId !== requestIdRef.current) return;
        dispatch({
          type: "LOAD_SUCCESS",
          items: res.items,
          page: res.page,
          total: res.totalResults,
          append,
        });
      } catch (err) {
        if (myReqId !== requestIdRef.current) return;
        dispatch({
          type: "LOAD_ERROR",
          error: err instanceof Error ? err : new Error(String(err)),
        });
      }
    },
    [client, query, perPage, orientation, size]
  );

  // Reset + fetch when query/options change
  useEffect(() => {
    if (!enabled || !query.trim()) {
      dispatch({ type: "RESET" });
      return;
    }
    fetchPage(1, false);
  }, [enabled, query, perPage, orientation, size, fetchPage]);

  const loadMore = useCallback(() => {
    if (state.isLoading || state.isFetchingMore) return;
    if (!state.data) return;
    if (state.data.length >= state.totalResults) return;
    fetchPage(state.page + 1, true);
  }, [state, fetchPage]);

  const refresh = useCallback(() => {
    if (!query.trim()) return;
    fetchPage(1, false);
  }, [query, fetchPage]);

  const hasMore =
    state.data !== undefined && state.data.length < state.totalResults;

  return {
    data: state.data,
    error: state.error,
    isLoading: state.isLoading,
    isFetchingMore: state.isFetchingMore,
    isError: !!state.error,
    isSuccess: !state.isLoading && !state.error && !!state.data,
    page: state.page,
    totalResults: state.totalResults,
    hasMore,
    loadMore,
    refresh,
  };
}