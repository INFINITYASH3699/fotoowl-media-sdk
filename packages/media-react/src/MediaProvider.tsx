/**
 * ============================================================
 * media-react — <MediaProvider />
 * ============================================================
 */

import { useMemo, type ReactNode } from "react";
import { MediaClient } from "media-core";
import type { SDKConfig } from "media-core";
import { MediaContext } from "./context";

export interface MediaProviderProps {
  children: ReactNode;
  apiKey?: string;
  baseUrl?: string;
  cacheTTL?: number;
  enableDefaultLogger?: boolean;
  /** Pass an existing client instance instead of config (advanced) */
  client?: MediaClient;
}

export function MediaProvider(props: MediaProviderProps) {
  const {
    children,
    client: externalClient,
    apiKey,
    baseUrl,
    cacheTTL,
    enableDefaultLogger,
  } = props;

  const client = useMemo(() => {
    if (externalClient) return externalClient;
    if (!apiKey) {
      throw new Error(
        "MediaProvider requires either `apiKey` or `client` prop"
      );
    }
    const config: SDKConfig = { apiKey };
    if (baseUrl !== undefined) config.baseUrl = baseUrl;
    if (cacheTTL !== undefined) config.cacheTTL = cacheTTL;
    if (enableDefaultLogger !== undefined)
      config.enableDefaultLogger = enableDefaultLogger;
    return new MediaClient(config);
  }, [externalClient, apiKey, baseUrl, cacheTTL, enableDefaultLogger]);

  return (
    <MediaContext.Provider value={{ client }}>
      {children}
    </MediaContext.Provider>
  );
}