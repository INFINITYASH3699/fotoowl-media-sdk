/**
 * ============================================================
 * media-core — Event Emitter
 * ============================================================
 */

import type {
  SDKEventType,
  SDKEventListener,
  SDKEventPayloads,
  Unsubscribe,
} from "./types";

type ListenerMap = {
  [K in SDKEventType]: Set<SDKEventListener<K>>;
};

export class Emitter {
  private listeners: ListenerMap = {
    view: new Set(),
    download: new Set(),
    search: new Set(),
    error: new Set(),
  };

  on<T extends SDKEventType>(
    event: T,
    listener: SDKEventListener<T>
  ): Unsubscribe {
    const set = this.listeners[event] as Set<SDKEventListener<T>>;
    set.add(listener);
    return () => this.off(event, listener);
  }

  off<T extends SDKEventType>(event: T, listener: SDKEventListener<T>): void {
    const set = this.listeners[event] as Set<SDKEventListener<T>>;
    set.delete(listener);
  }

  emit<T extends SDKEventType>(event: T, payload: SDKEventPayloads[T]): void {
    const set = this.listeners[event] as Set<SDKEventListener<T>>;
    set.forEach((listener) => {
      try {
        listener(payload);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("[media-core] Listener threw error:", err);
      }
    });
  }

  clear(): void {
    const keys = Object.keys(this.listeners) as SDKEventType[];
    keys.forEach((k) => {
      const set = this.listeners[k];
      set.clear();
    });
  }

  count(event: SDKEventType): number {
    return this.listeners[event].size;
  }
}

/** Default console logger */
export function attachDefaultLogger(emitter: Emitter): Unsubscribe {
  const unsubs: Unsubscribe[] = [
    emitter.on("view", (p: SDKEventPayloads["view"]) =>
      console.log(`[media-core:view] ${p.mediaType}#${p.mediaId}`)
    ),
    emitter.on("download", (p: SDKEventPayloads["download"]) =>
      console.log(
        `[media-core:download] ${p.mediaType}#${p.mediaId}${
          p.quality ? ` (${p.quality})` : ""
        }`
      )
    ),
    emitter.on("search", (p: SDKEventPayloads["search"]) =>
      console.log(
        `[media-core:search] "${p.query}" → ${p.resultsCount} results`
      )
    ),
    emitter.on("error", (p: SDKEventPayloads["error"]) =>
      console.error(`[media-core:error] ${p.message}`, p.endpoint ?? "")
    ),
  ];

  return () => unsubs.forEach((u) => u());
}
