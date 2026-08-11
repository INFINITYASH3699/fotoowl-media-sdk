# SDK Documentation

The `media-core` + `media-react` packages, documented for a consumer building a React app on top of them.

> For AI-tool usage guidance, see [`skills/data-wiring.skill.md`](https://github.com/<your-username>/fotoowl-media-sdk/blob/main/skills/data-wiring.skill.md).

---

## Installation (inside this monorepo)

Already wired via pnpm workspaces. In `apps/web/package.json`:

```json
{
  "dependencies": {
    "media-react": "workspace:*"
  }
}
```

For external use, both packages would be published to npm and installed normally.

---

## 1. Setup — `<MediaProvider>`

Wrap your app once at the root:

```tsx
import { MediaProvider } from "media-react";

<MediaProvider
  apiKey={import.meta.env.VITE_PEXELS_API_KEY}
  enableDefaultLogger={true}
  cacheTTL={5 * 60 * 1000}
>
  <App />
</MediaProvider>
```

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `apiKey` | `string` | — | Required unless `client` is passed |
| `client` | `MediaClient` | — | Advanced: inject a pre-built client (useful for testing) |
| `baseUrl` | `string` | `https://api.pexels.com` | Override for mocking |
| `cacheTTL` | `number` (ms) | `300_000` (5 min) | Set to `0` to disable cache |
| `enableDefaultLogger` | `boolean` | `true` | Prints SDK events to console |

---

## 2. Hooks

### `useCurated(options?)`

Trending / editor-curated photos.

```tsx
const { data, loadMore, hasMore, isFetchingMore } = useCurated({ perPage: 20 });
```

**Options:** `{ perPage?: number; enabled?: boolean }`

**Returns:** `MediaListState` (see below)

### `useSearch(query, options?)`

Photo search.

```tsx
const state = useSearch("sunset", {
  perPage: 20,
  enabled: query.length > 1,
  orientation: "landscape",  // 'landscape' | 'portrait' | 'square'
  size: "large",             // 'small' | 'medium' | 'large'
});
```

Empty or short queries: pass `enabled: false` to skip fetching.

### `useVideo(query, options?)`

Video search. When `query` is empty, falls back to popular videos.

```tsx
const state = useVideo("", { perPage: 10 });        // popular videos
const state = useVideo("nature", { perPage: 10 });  // search
```

### `useMedia(id, { type })`

Fetch a single photo or video by ID.

```tsx
const { data, isLoading, error } = useMedia(12345, { type: "photo" });
```

Pass `id: null` to disable.

### `useEvents(eventType, listener)`

Subscribe to SDK events from a component. Auto-unsubscribes on unmount.

```tsx
useEvents("view", (payload) => {
  analytics.track("media_view", payload);
});
```

**Event types:** `"view" | "download" | "search" | "error"`.

Payloads are typed via `SDKEventPayloads[T]`.

### `useMediaClient()`

Escape hatch for direct client access. Use for:

```tsx
const client = useMediaClient();

client.trackView(id, "photo");
client.trackDownload(id, "photo", "large2x");
client.clearCache();
```

---

## 3. The `MediaListState` shape

All paginated hooks return the same object:

```ts
{
  data: MediaItem[] | undefined;   // undefined = never fetched
  error: Error | undefined;
  isLoading: boolean;              // initial load
  isFetchingMore: boolean;         // subsequent pages
  isError: boolean;
  isSuccess: boolean;
  page: number;
  totalResults: number;
  hasMore: boolean;
  loadMore: () => void;            // safe to call anytime
  refresh: () => void;
}
```

`MediaItem` is a discriminated union:

```ts
type MediaItem =
  | ({ type: "photo" } & PexelsPhoto)
  | ({ type: "video" } & PexelsVideo);
```

Narrow via `item.type === "photo"` to get autocomplete for `.src.medium`, `.photographer`, etc.

---

## 4. Events

The SDK emits four event types:

| Event | When it fires | Payload |
|---|---|---|
| `search` | After a successful search/curated/popular call | `{ query, resultsCount, timestamp }` |
| `view` | On `client.trackView()` or `getPhoto/getVideo` | `{ mediaId, mediaType, timestamp }` |
| `download` | On `client.trackDownload()` | `{ mediaId, mediaType, quality?, timestamp }` |
| `error` | On any request failure | `{ message, endpoint?, timestamp }` |

Multiple listeners are supported. The default logger (if enabled) and your `useEvents` subscribers all fire independently.

---

## 5. Error handling

Every hook exposes `error: Error | undefined`. The underlying error is one of:

```ts
import { AuthError, RateLimitError, NotFoundError, NetworkError, SDKError } from "media-core";

if (error instanceof RateLimitError) {
  // error.retryAfter (seconds) available
}
```

All errors extend `SDKError`, which has `.code` and `.endpoint`.

---

## 6. Advanced: using `media-core` directly

If you don't need React (e.g., a Node script or CLI):

```ts
import { MediaClient } from "media-core";

const client = new MediaClient({ apiKey: process.env.PEXELS_API_KEY! });

const result = await client.searchPhotos({ query: "mountains", perPage: 20 });
console.log(result.items);

client.events.on("search", (p) => console.log("searched:", p.query));
```

No React, no DOM needed. The core is fully portable.
