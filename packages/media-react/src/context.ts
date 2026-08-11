/**
 * ============================================================
 * media-react — Context definition
 * ============================================================
 * The React Context that carries a shared MediaClient instance.
 * ============================================================
 */

import { createContext } from "react";
import type { MediaClient } from "media-core";

export interface MediaContextValue {
  client: MediaClient;
}

export const MediaContext = createContext<MediaContextValue | null>(null);
MediaContext.displayName = "MediaContext";
