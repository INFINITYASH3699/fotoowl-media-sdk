/**
 * ============================================================
 * media-core — Public API surface
 * ============================================================
 * Anything a consumer needs must be exported here.
 * Wrappers (media-react, media-native) only import from this.
 * ============================================================
 */

// Main client
export { MediaClient } from "./client";

// Cache + Emitter (advanced use)
export { Cache } from "./cache";
export { Emitter, attachDefaultLogger } from "./emitter";

// Error classes
export {
  SDKError,
  AuthError,
  NetworkError,
  NotFoundError,
  RateLimitError,
  ValidationError,
} from "./errors";

// Config constants
export {
  DEFAULT_BASE_URL,
  DEFAULT_CACHE_TTL,
  DEFAULT_PER_PAGE,
  MAX_PER_PAGE,
  normalizeConfig,
} from "./config";

// All types
export type {
  // Photo
  PexelsPhoto,
  PexelsPhotoSrc,
  PexelsPhotoResponse,
  // Video
  PexelsVideo,
  PexelsVideoFile,
  PexelsVideoPicture,
  PexelsVideoUser,
  PexelsVideoResponse,
  // Unified
  MediaItem,
  PaginatedResponse,
  // Params
  SearchParams,
  CuratedParams,
  // Config
  SDKConfig,
  // Events
  SDKEventType,
  SDKEventPayloads,
  SDKEventListener,
  Unsubscribe,
} from "./types";