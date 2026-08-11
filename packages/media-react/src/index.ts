export {};
/**
 * ============================================================
 * media-react — Public API
 * ============================================================
 */

// Provider + Context
export { MediaProvider } from "./MediaProvider";
export type { MediaProviderProps } from "./MediaProvider";
export { MediaContext } from "./context";
export type { MediaContextValue } from "./context";

// Hooks
export { useMediaClient } from "./useMediaClient";
export { useSearch } from "./useSearch";
export { useCurated } from "./useCurated";
export { useMedia } from "./useMedia";
export type { UseMediaOptions } from "./useMedia";
export { useVideo } from "./useVideo";
export { useEvents } from "./useEvents";

// Types
export type {
  AsyncState,
  PaginatedState,
  SearchHookOptions,
  CuratedHookOptions,
  MediaListState,
  MediaItemState,
} from "./types";

// Re-export commonly needed core types (convenience)
export type {
  MediaItem,
  SDKEventType,
  SDKEventPayloads,
  SDKEventListener,
} from "media-core";