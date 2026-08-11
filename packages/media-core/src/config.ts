/**
 * ============================================================
 * media-core — Configuration Helpers
 * ============================================================
 * Central place for defaults + config validation.
 * ============================================================
 */

import type { SDKConfig } from "./types";
import { ValidationError } from "./errors";

export const DEFAULT_BASE_URL = "https://api.pexels.com";
export const DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
export const DEFAULT_PER_PAGE = 15;
export const MAX_PER_PAGE = 80;

/** Validate and normalize the SDK config passed at init */
export function normalizeConfig(config: SDKConfig): Required<SDKConfig> {
  if (!config) {
    throw new ValidationError("SDK config is required");
  }
  if (
    !config.apiKey ||
    typeof config.apiKey !== "string" ||
    !config.apiKey.trim()
  ) {
    throw new ValidationError("A valid Pexels apiKey is required");
  }

  return {
    apiKey: config.apiKey.trim(),
    baseUrl: config.baseUrl ?? DEFAULT_BASE_URL,
    cacheTTL: config.cacheTTL ?? DEFAULT_CACHE_TTL,
    enableDefaultLogger: config.enableDefaultLogger ?? true,
  };
}
