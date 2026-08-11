/**
 * ============================================================
 * media-core — Pexels HTTP Client (the main class)
 * ============================================================
 * The single entry point for all SDK functionality.
 *   - Wraps fetch with auth + error mapping
 *   - Uses Cache for de-dupe + TTL
 *   - Exposes Emitter for activity events
 *   - Returns normalized (camelCase, unified) shapes
 * ============================================================
 */

import type {
  SDKConfig,
  SearchParams,
  CuratedParams,
  PexelsPhoto,
  PexelsVideo,
  PexelsPhotoResponse,
  PexelsVideoResponse,
  PaginatedResponse,
  MediaItem,
} from "./types";

import {
  AuthError,
  NetworkError,
  NotFoundError,
  RateLimitError,
  SDKError,
} from "./errors";

import { Cache } from "./cache";
import { Emitter, attachDefaultLogger } from "./emitter";
import { normalizeConfig, DEFAULT_PER_PAGE, MAX_PER_PAGE } from "./config";

export class MediaClient {
  private readonly config: Required<SDKConfig>;
  private readonly cache: Cache;
  public readonly events: Emitter;

  constructor(config: SDKConfig) {
    this.config = normalizeConfig(config);
    this.cache = new Cache(this.config.cacheTTL);
    this.events = new Emitter();

    if (this.config.enableDefaultLogger) {
      attachDefaultLogger(this.events);
    }
  }

  // ─── Internal fetch wrapper ────────────────────────────────

  private async request<T>(
    path: string,
    params: Record<string, unknown> = {}
  ): Promise<T> {
    const url = new URL(path, this.config.baseUrl);
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") {
        url.searchParams.set(k, String(v));
      }
    });

    const cacheKey = url.toString();

    return this.cache.dedupe<T>(cacheKey, async () => {
      let response: Response;
      try {
        response = await fetch(url.toString(), {
          headers: { Authorization: this.config.apiKey },
        });
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Unknown network error";
        this.events.emit("error", {
          message: msg,
          endpoint: path,
          timestamp: Date.now(),
        });
        throw new NetworkError(msg, path);
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        const message = errorText || response.statusText;

        this.events.emit("error", {
          message: `${response.status}: ${message}`,
          endpoint: path,
          timestamp: Date.now(),
        });

        switch (response.status) {
          case 401:
          case 403:
            throw new AuthError(message, path);
          case 404:
            throw new NotFoundError(message, path);
          case 429: {
            const retryAfter =
              Number(response.headers.get("retry-after")) || undefined;
            throw new RateLimitError(message, retryAfter, path);
          }
          default:
            throw new SDKError(message, `HTTP_${response.status}`, path);
        }
      }

      return response.json() as Promise<T>;
    });
  }

  // ─── Normalizers ──────────────────────────────────────────

  private normalizePhotos(
    res: PexelsPhotoResponse
  ): PaginatedResponse<MediaItem> {
    return {
      page: res.page,
      perPage: res.per_page,
      totalResults: res.total_results,
      nextPage: res.next_page,
      prevPage: res.prev_page,
      items: res.photos.map((p) => ({ type: "photo" as const, ...p })),
    };
  }

  private normalizeVideos(
    res: PexelsVideoResponse
  ): PaginatedResponse<MediaItem> {
    return {
      page: res.page,
      perPage: res.per_page,
      totalResults: res.total_results,
      nextPage: res.next_page,
      prevPage: res.prev_page,
      items: res.videos.map((v) => ({ type: "video" as const, ...v })),
    };
  }

  private clampPerPage(n?: number): number {
    const val = n ?? DEFAULT_PER_PAGE;
    return Math.max(1, Math.min(MAX_PER_PAGE, val));
  }

  // ─── Public API ───────────────────────────────────────────

  /** Search photos by keyword */
  async searchPhotos(
    params: SearchParams
  ): Promise<PaginatedResponse<MediaItem>> {
    const res = await this.request<PexelsPhotoResponse>("/v1/search", {
      query: params.query,
      page: params.page ?? 1,
      per_page: this.clampPerPage(params.perPage),
      orientation: params.orientation,
      size: params.size,
      color: params.color,
      locale: params.locale,
    });

    const normalized = this.normalizePhotos(res);

    this.events.emit("search", {
      query: params.query,
      resultsCount: normalized.items.length,
      timestamp: Date.now(),
    });

    return normalized;
  }

  /** Get curated/trending photos */
  async getCuratedPhotos(
    params: CuratedParams = {}
  ): Promise<PaginatedResponse<MediaItem>> {
    const res = await this.request<PexelsPhotoResponse>("/v1/curated", {
      page: params.page ?? 1,
      per_page: this.clampPerPage(params.perPage),
    });
    return this.normalizePhotos(res);
  }

  /** Get a single photo by ID */
  async getPhoto(id: number): Promise<MediaItem> {
    const p = await this.request<PexelsPhoto>(`/v1/photos/${id}`);
    const item: MediaItem = { type: "photo", ...p };
    this.events.emit("view", {
      mediaId: p.id,
      mediaType: "photo",
      timestamp: Date.now(),
    });
    return item;
  }

  /** Search videos by keyword */
  async searchVideos(
    params: SearchParams
  ): Promise<PaginatedResponse<MediaItem>> {
    const res = await this.request<PexelsVideoResponse>("/videos/search", {
      query: params.query,
      page: params.page ?? 1,
      per_page: this.clampPerPage(params.perPage),
      orientation: params.orientation,
      size: params.size,
      locale: params.locale,
    });

    const normalized = this.normalizeVideos(res);

    this.events.emit("search", {
      query: params.query,
      resultsCount: normalized.items.length,
      timestamp: Date.now(),
    });

    return normalized;
  }

  /** Get popular/trending videos */
  async getPopularVideos(
    params: CuratedParams = {}
  ): Promise<PaginatedResponse<MediaItem>> {
    const res = await this.request<PexelsVideoResponse>("/videos/popular", {
      page: params.page ?? 1,
      per_page: this.clampPerPage(params.perPage),
    });
    return this.normalizeVideos(res);
  }

  /** Get a single video by ID */
  async getVideo(id: number): Promise<MediaItem> {
    const v = await this.request<PexelsVideo>(`/videos/videos/${id}`);
    const item: MediaItem = { type: "video", ...v };
    this.events.emit("view", {
      mediaId: v.id,
      mediaType: "video",
      timestamp: Date.now(),
    });
    return item;
  }

  // ─── Activity tracking (called by consumer, not automatic) ─

  /** Explicitly record a view event (e.g., when Lightbox opens) */
  trackView(mediaId: number, mediaType: "photo" | "video"): void {
    this.events.emit("view", { mediaId, mediaType, timestamp: Date.now() });
  }

  /** Explicitly record a download event */
  trackDownload(
    mediaId: number,
    mediaType: "photo" | "video",
    quality?: string
  ): void {
    this.events.emit("download", {
      mediaId,
      mediaType,
      quality,
      timestamp: Date.now(),
    });
  }

  // ─── Cache controls ───────────────────────────────────────

  clearCache(): void {
    this.cache.clear();
  }
}
