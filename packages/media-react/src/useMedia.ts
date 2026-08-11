/**
 * ============================================================
 * useMedia — Fetch a single photo or video by ID
 * ============================================================
 */

import { useEffect, useState } from "react";
import type { MediaItem } from "media-core";
import type { MediaItemState } from "./types";
import { useMediaClient } from "./useMediaClient";

export interface UseMediaOptions {
  type: "photo" | "video";
  enabled?: boolean;
}

export function useMedia(
  id: number | null,
  options: UseMediaOptions
): MediaItemState {
  const client = useMediaClient();
  const { type, enabled = true } = options;
  const [data, setData] = useState<MediaItem | undefined>(undefined);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!enabled || id === null) {
      setData(undefined);
      setError(undefined);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(undefined);

    const promise: Promise<MediaItem> =
      type === "photo" ? client.getPhoto(id) : client.getVideo(id);

    promise
      .then((item: MediaItem) => {
        if (!cancelled) setData(item);
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [client, id, type, enabled]);

  return {
    data,
    error,
    isLoading,
    isError: !!error,
    isSuccess: !isLoading && !error && !!data,
  };
}