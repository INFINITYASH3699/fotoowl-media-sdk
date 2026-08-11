/**
 * ============================================================
 * useMediaClient — Access the raw MediaClient
 * ============================================================
 * Escape hatch for advanced use (tracking, cache clearing, etc.)
 * ============================================================
 */

import { useContext } from "react";
import type { MediaClient } from "media-core";
import { MediaContext } from "./context";

export function useMediaClient(): MediaClient {
  const ctx = useContext(MediaContext);
  if (!ctx) {
    throw new Error(
      "useMediaClient must be used inside <MediaProvider>. " +
        "Wrap your app root with <MediaProvider apiKey='...' />."
    );
  }
  return ctx.client;
}