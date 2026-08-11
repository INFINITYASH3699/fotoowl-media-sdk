/**
 * ============================================================
 * useEvents — Subscribe to SDK events from a component
 * ============================================================
 * Usage:
 *   useEvents("download", (payload) => {
 *     analytics.track("download", payload);
 *   });
 * ============================================================
 */

import { useEffect } from "react";
import type { SDKEventType, SDKEventListener } from "media-core";
import { useMediaClient } from "./useMediaClient";

export function useEvents<T extends SDKEventType>(
  event: T,
  listener: SDKEventListener<T>
): void {
  const client = useMediaClient();

  useEffect(() => {
    const unsubscribe = client.events.on(event, listener);
    return unsubscribe;
  }, [client, event, listener]);
}
