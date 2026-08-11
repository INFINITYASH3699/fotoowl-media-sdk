---
name: media-react-data-wiring
description: Use this skill when building React UI that needs Pexels media data (photos or videos) through the media-react package. It covers provider setup, hooks, event tracking, and pagination patterns.
when_to_use:
  - User asks to fetch, search, or paginate photos/videos in a React app
  - User needs to wire the MediaProvider or use useSearch / useCurated / useVideo / useMedia hooks
  - User needs to subscribe to SDK events (view, download, search, error)
  - User is confused about where to put the API key or how to track analytics events
---

# Skill: Wiring Data with `media-react`

You are helping a developer consume the `media-react` package. This package is a **thin React wrapper** around `media-core` (a headless Pexels SDK). Your job is to use its hooks and provider **correctly** — not reinvent the fetching logic.

---

## 🚦 Rule 0 — Boundaries (never violate)

- ❌ **NEVER** import from `media-core` directly in app code. Always import from `media-react`.
- ❌ **NEVER** call `fetch()` to Pexels yourself. Use hooks.
- ❌ **NEVER** import from `media-ui-react` inside this file's concerns. Data wiring and UI rendering are separate layers.
- ✅ All Pexels access flows: **app → `media-react` hooks → `media-core` client**.

---

## 1. Provider setup (do this ONCE at app root)

The `MediaProvider` creates a single `MediaClient` and shares it via context. Put it above your `<Routes>` / `<App>`.

```tsx
// main.tsx or App root
import { MediaProvider } from "media-react";

const apiKey = import.meta.env.VITE_PEXELS_API_KEY;

<MediaProvider
  apiKey={apiKey}
  enableDefaultLogger={true}   // logs SDK events to console
  cacheTTL={5 * 60 * 1000}     // optional, defaults to 5min
>
  <App />
</MediaProvider>
```

Rules:

- The API key comes from an env var — never hardcode it, never accept it as a prop deeper in the tree.
- `enableDefaultLogger` is helpful during development. Turn off in production if noisy.
- Only ONE `<MediaProvider>` in the tree. Don't nest.

---

## 2. Available hooks (pick the right one)

| Hook | When to use | Returns |
|------|-------------|---------|
| `useCurated(opts)` | Homepage / trending photos | `MediaListState` (paginated) |
| `useSearch(query, opts)` | Photo search by keyword | `MediaListState` (paginated) |
| `useVideo(query, opts)` | Video search (empty query → popular videos) | `MediaListState` (paginated) |
| `useMedia(id, { type })` | Single photo/video detail | `MediaItemState` |
| `useEvents(type, listener)` | Subscribe to SDK events | `void` |
| `useMediaClient()` | Escape hatch — raw client for `trackView`, `trackDownload`, `clearCache` | `MediaClient` |

### Paginated shape (`MediaListState`)

Every list hook returns the same shape — memorize it:

```ts
{
  data: MediaItem[] | undefined;   // undefined = never fetched
  error: Error | undefined;
  isLoading: boolean;              // first load only
  isFetchingMore: boolean;         // subsequent pages
  isError: boolean;
  isSuccess: boolean;
  page: number;
  totalResults: number;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
}
```

Never track loading state manually. Use the flags the hook gives you.

---

## 3. Correct patterns (copy these)

### ✅ Search page with pagination

```tsx
import { useState } from "react";
import { useSearch } from "media-react";

function SearchPage() {
  const [query, setQuery] = useState("");
  const {
    data, isLoading, isError, error,
    loadMore, hasMore, isFetchingMore, totalResults,
  } = useSearch(query, { perPage: 20, enabled: query.length > 1 });

  if (isError) return <p>Error: {error?.message}</p>;
  // ...render grid, wire loadMore to a scroll sentinel
}
```

- `enabled` disables the fetch when the query is too short — this is the correct way to gate a hook, not conditional rendering of the hook itself.
- `loadMore()` is safe to call anytime — the hook internally guards against duplicate/stale requests.

### ✅ Curated home feed

```tsx
const { data, isLoading, loadMore, hasMore, isFetchingMore } =
  useCurated({ perPage: 20 });
```

Simpler than search — no query, always enabled.

### ✅ Video reels (empty query = popular)

```tsx
const { data, loadMore, hasMore } = useVideo("", { perPage: 10 });
```

`useVideo` intelligently switches to `/videos/popular` when the query is empty.

### ✅ Tracking activity events (analytics)

Two ways:

**A) Emit manually** (recommended for UI actions like "opened lightbox", "clicked download"):

```tsx
import { useMediaClient } from "media-react";

const client = useMediaClient();

// When lightbox opens:
client.trackView(item.id, item.type);

// When user clicks download:
client.trackDownload(item.id, "photo", "large2x");
```

**B) Listen for events** (for global analytics, dev logging, event bus):

```tsx
import { useEvents } from "media-react";

useEvents("view", (payload) => {
  analytics.track("media_view", payload);
});

useEvents("download", (payload) => {
  analytics.track("media_download", payload);
});
```

Both are already wired — no manual subscribe/unsubscribe cleanup needed.

---

## 4. Anti-patterns (do NOT do these)

### ❌ Don't call hooks conditionally

```tsx
// BAD
if (query) {
  const { data } = useSearch(query);
}
```

```tsx
// GOOD
const { data } = useSearch(query, { enabled: query.length > 1 });
```

### ❌ Don't create your own MediaClient

```tsx
// BAD
import { MediaClient } from "media-core";  // Wrong package!
const client = new MediaClient({ apiKey: "..." });
```

```tsx
// GOOD
import { useMediaClient } from "media-react";
const client = useMediaClient();
```

### ❌ Don't manually manage pagination state

```tsx
// BAD
const [page, setPage] = useState(1);
const [items, setItems] = useState([]);
useEffect(() => { /* fetch and merge */ }, [page]);
```

```tsx
// GOOD
const { data, loadMore, hasMore } = useSearch(query);
```

### ❌ Don't put the API key inside a component

```tsx
// BAD
<MediaProvider apiKey="abc123def..." />
```

```tsx
// GOOD
<MediaProvider apiKey={import.meta.env.VITE_PEXELS_API_KEY} />
```

### ❌ Don't subscribe to events with useEffect + raw client

```tsx
// BAD — leak-prone, verbose
const client = useMediaClient();
useEffect(() => {
  const unsub = client.events.on("view", handler);
  return unsub;
}, []);
```

```tsx
// GOOD
useEvents("view", handler);
```

---

## 5. Error handling

Every hook exposes typed `error: Error | undefined`. The underlying error may be one of the SDK error classes:

- `AuthError` (401/403) — usually a bad or missing API key
- `RateLimitError` (429) — has `.retryAfter`
- `NotFoundError` (404)
- `NetworkError` — no connection
- `SDKError` — everything else, has `.code`

To narrow the type, import from `media-core`:

```ts
import { AuthError, RateLimitError } from "media-core";
// (Only for `instanceof` checks in error UI — this is the ONE allowed cross-import for error narrowing.)

if (error instanceof RateLimitError) {
  return <p>Slow down — retry in {error.retryAfter}s</p>;
}
```

---

## 6. When integrating with UI components

`media-react` gives you data. `media-ui-react` renders it. Wire them in the app layer, not inside either package:

```tsx
// ✅ CORRECT — the app is the wiring layer
import { useSearch } from "media-react";
import { useGrid } from "media-ui-react";

function SearchPage() {
  const { data, loadMore, hasMore, isFetchingMore } = useSearch(query);
  const { getContainerProps, getSentinelProps } = useGrid({
    onLoadMore: loadMore,
    enabled: hasMore && !isFetchingMore,
  });
  return <div {...getContainerProps()}>{/* ... */}</div>;
}
```

See the `media-ui-react` skill for how to render.

---

## 7. Testing checklist for AI-generated code

Before returning code to the user, verify:

- [ ] `MediaProvider` is at the app root, not inside a component that remounts
- [ ] `apiKey` comes from env, not hardcoded
- [ ] No direct import from `"media-core"` except for error classes (`AuthError`, etc.)
- [ ] Loading states use hook flags (`isLoading`, `isFetchingMore`), not local `useState`
- [ ] `loadMore` is passed to a scroll trigger, not called in `useEffect` on every render
- [ ] Event tracking uses `useEvents` hook OR `client.trackView`/`trackDownload` — never direct emitter access
