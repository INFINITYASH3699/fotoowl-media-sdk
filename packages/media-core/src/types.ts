/**
 * ============================================================
 * media-core — Type Definitions
 * ============================================================
 */

// ─── Pexels Photo Types ─────────────────────────────────────

export interface PexelsPhotoSrc {
  original: string;
  large2x: string;
  large: string;
  medium: string;
  small: string;
  portrait: string;
  landscape: string;
  tiny: string;
}

export interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  photographer_id: number;
  avg_color: string;
  src: PexelsPhotoSrc;
  alt: string;
  liked?: boolean;
}

// ─── Pexels Video Types ─────────────────────────────────────

export interface PexelsVideoFile {
  id: number;
  quality: "hd" | "sd" | "hls" | string;
  file_type: string;
  width: number;
  height: number;
  link: string;
  fps?: number;
}

export interface PexelsVideoPicture {
  id: number;
  picture: string;
  nr: number;
}

export interface PexelsVideoUser {
  id: number;
  name: string;
  url: string;
}

export interface PexelsVideo {
  id: number;
  width: number;
  height: number;
  url: string;
  image: string;
  duration: number;
  user: PexelsVideoUser;
  video_files: PexelsVideoFile[];
  video_pictures: PexelsVideoPicture[];
}

// ─── Unified Media Type ─────────────────────────────────────

export type MediaItem =
  | ({ type: "photo" } & PexelsPhoto)
  | ({ type: "video" } & PexelsVideo);

// ─── API Response Shapes ────────────────────────────────────

export interface PaginatedResponse<T> {
  page: number;
  perPage: number;
  totalResults: number;
  nextPage?: string;
  prevPage?: string;
  items: T[];
}

export interface PexelsPhotoResponse {
  page: number;
  per_page: number;
  total_results: number;
  next_page?: string;
  prev_page?: string;
  photos: PexelsPhoto[];
}

export interface PexelsVideoResponse {
  page: number;
  per_page: number;
  total_results: number;
  url?: string;
  next_page?: string;
  prev_page?: string;
  videos: PexelsVideo[];
}

// ─── Request Parameters ─────────────────────────────────────

export interface SearchParams {
  query: string;
  page?: number;
  perPage?: number;
  orientation?: "landscape" | "portrait" | "square";
  size?: "small" | "medium" | "large";
  color?: string;
  locale?: string;
}

export interface CuratedParams {
  page?: number;
  perPage?: number;
}

// ─── SDK Configuration ──────────────────────────────────────

export interface SDKConfig {
  apiKey: string;
  baseUrl?: string;
  cacheTTL?: number;
  enableDefaultLogger?: boolean;
}

// ─── Event System ───────────────────────────────────────────

export type SDKEventType = "view" | "download" | "search" | "error";

export interface SDKEventPayloads {
  view: {
    mediaId: number;
    mediaType: "photo" | "video";
    timestamp: number;
  };
  download: {
    mediaId: number;
    mediaType: "photo" | "video";
    quality?: string;
    timestamp: number;
  };
  search: {
    query: string;
    resultsCount: number;
    timestamp: number;
  };
  error: {
    message: string;
    endpoint?: string;
    timestamp: number;
  };
}

export type SDKEventListener<T extends SDKEventType> = (
  payload: SDKEventPayloads[T]
) => void;

export type Unsubscribe = () => void;
