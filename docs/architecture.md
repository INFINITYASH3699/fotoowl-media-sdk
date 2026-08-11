# Architecture

This document explains **how the SDK ecosystem is layered** and — more importantly — **why the boundaries are what they are**. The task explicitly evaluates architectural discipline, so every rule here is enforced, not aspirational.

---

## The four layers

```
┌──────────────────────────────────────────────────────────┐
│                     apps/web                             │
│    The ONLY place data + UI meet.                        │
│    Imports: media-react, media-ui-react                  │
└─────────┬──────────────────────────┬─────────────────────┘
          │                          │
          ▼                          ▼
┌────────────────────────┐  ┌────────────────────────────┐
│      media-react       │  │      media-ui-react        │
│   React wrapper.       │  │   Headless UI primitives.  │
│   Imports: media-core  │  │   Imports: (nothing)       │
└─────────┬──────────────┘  └────────────────────────────┘
          │
          ▼
┌────────────────────────┐
│      media-core        │
│   Framework-agnostic.  │
│   Imports: (nothing)   │
└────────────────────────┘
```

### Enforced rules

| Rule | How it's enforced |
|---|---|
| `media-core` imports nothing framework-specific | No `react`, `react-dom`, or `react-native` in `package.json`; TypeScript build has no JSX target |
| `media-react` is the only importer of `media-core` | `media-ui-react`'s `package.json` has no dependency on `media-core`; grep-audit before commit |
| `media-ui-react` is data-source agnostic | Zero imports from `media-core` or `media-react`; all data flows in as props |
| The app is the only wiring layer | Only `apps/web` depends on **both** wrappers |

---

## Why this shape?

### Why a headless core?

The task specifies the core "could theoretically power a CLI or a different UI with zero changes." That constrains three things:

1. **No DOM APIs** — the core uses only `fetch` (Node ≥18 & browsers).
2. **No framework state** — the emitter and cache are plain classes.
3. **No UI concerns** — no image URLs are transformed, no thumbnails picked. That's the consumer's job.

The `MediaClient` class is the single entry point. Everything else (`Cache`, `Emitter`, error types) is exposed for advanced use but not required.

### Why a separate React wrapper?

React needs *its own idioms*: hooks, context, effect cleanup, memoization. Bolting these onto `media-core` would either:
- Force every consumer to install React (bad for the CLI use case), or
- Sprinkle framework detection through the core (worse).

`media-react` is thin on purpose — no business logic lives here. Every hook is essentially:

> "Read the client from context, call a method on it, wrap the promise in reducer-managed state, expose canonical flags."

If tomorrow we swap Pexels for another provider, `media-react` doesn't change at all — only `media-core` does.

### Why headless UI (not styled components)?

Two reasons pulled the design toward prop-getters:

1. **The task explicitly says** *"headless pattern: hooks + prop-getters, no shipped styles, consumer supplies markup/CSS"*. Shipping styled components would fail this criterion.
2. **Reusability.** Different apps want different visual languages. The behaviors that *don't* change per app — infinite scroll observation, focus management, keyboard nav, scroll-snap detection — are exactly what belongs in `media-ui-react`.

Prop-getters merge intelligently with consumer props (via `callAll` for handlers, direct passthrough for `className`). Consumers get behavior + a11y for free without giving up markup control.

### Why is the app the only wiring layer?

If `media-ui-react` imported `media-react`, then:
- The UI package would drag React Context / SDK types into its bundle
- A React Native version of the UI couldn't reuse the same interface
- The "components take data as props" contract would silently break

By forcing the app to do the wiring, both packages stay independently testable and portable. The app's `MediaLightbox` component (~90 lines) is where the two worlds meet — and that's the *only* place they meet.

---

## Data flow (a full request lifecycle)

Take a search on the `/search` page:

```
User types "sunset"
    │
    ▼
SearchBar debounces (350ms) ─► setQuery("sunset")
    │
    ▼
useSearch("sunset", { perPage: 20 })                    [media-react]
    │  ├─ reducer: LOAD_START (isLoading = true)
    │  ├─ calls client.searchPhotos({...})
    │
    ▼
MediaClient.searchPhotos                                [media-core]
    │  ├─ Cache.dedupe(url):
    │  │    ├─ cache hit? ─► return cached
    │  │    ├─ in-flight? ─► return shared promise
    │  │    └─ else fire fetch()
    │  ├─ fetch("https://api.pexels.com/v1/search?...", { Auth: apiKey })
    │  ├─ non-2xx? ─► throw typed error (AuthError, RateLimitError, ...)
    │  ├─ normalize response (snake_case → camelCase, wrap items with type: 'photo')
    │  ├─ emit('search', { query, resultsCount, timestamp })
    │
    ▼
useSearch reducer: LOAD_SUCCESS
    │
    ▼
SearchPage re-renders with data                         [apps/web]
    │
    ▼
useGrid({ onLoadMore, enabled: hasMore && !isFetchingMore })  [media-ui-react]
    │  ├─ IntersectionObserver on sentinel
    │  └─ when sentinel enters viewport → onLoadMore()
    │
    ▼
useSearch.loadMore() ─► fetchPage(page+1, append=true)
```

Two SDK-level cross-cuts happen implicitly:

- **The default logger** (attached in `MediaClient` constructor) prints every `search`, `view`, `download`, `error` to the console.
- **The `<EventLog>` component** in the app also subscribes via `useEvents(...)`, populating the bottom-right panel in real time. Neither knows about the other — that's the emitter's job.

---

## Where types live

| Type | Defined in | Re-exported from |
|---|---|---|
| `MediaItem`, `PaginatedResponse`, `SDKConfig`, event types | `media-core/types.ts` | `media-core`, `media-react` (convenience re-export) |
| `AsyncState`, `MediaListState`, hook options | `media-react/types.ts` | `media-react` |
| Prop-getter shapes, hook options | `media-ui-react/components/*/types.ts` | `media-ui-react` |

The one intentional exception: **error classes** (`AuthError`, `RateLimitError`, etc.) are re-exported from `media-react` for convenience, but the app can also import them from `media-core` for `instanceof` checks. This is called out in the data-wiring skill.

---

## Cross-cutting concerns

### Caching
Handled entirely in `media-core/cache.ts`. Two mechanisms in one class:
- **TTL-based cache** — 5 min default, configurable via `SDKConfig.cacheTTL`
- **Single-flight de-dupe** — concurrent identical requests share one promise

Swap-in point: `Cache` is a class with a well-defined interface. Replacing it with a `localStorage`-backed or IndexedDB-backed version is a single-file change.

### Events
The `Emitter` is `Map<EventType, Set<Listener>>`. Typed listeners via `SDKEventPayloads[T]`. `attachDefaultLogger` is opt-out via `enableDefaultLogger: false`.

### Errors
Fetch failures and non-2xx responses are mapped to typed error subclasses of `SDKError`. This lets consumers write `catch (e) { if (e instanceof RateLimitError) ... }` instead of parsing error strings.

### Auth
The API key lives **only** in `MediaClient` — it's captured in `normalizeConfig` and used in the `Authorization` header. It never appears in event payloads, error messages, or public methods. `MediaProvider` accepts it as a prop and it's stored in the `useMemo`-stable client instance.

---

## What this shape enables next

Because of the boundaries:

- **React Native app** — build `media-native` (reusing `media-core`) and `media-ui-native` (new prop-getters for `FlatList` / native gesture handlers). Zero changes to core.
- **CLI tool** — `import { MediaClient } from "media-core"`, no React, no UI package. Done.
- **Swap providers** — replace Pexels with Unsplash by rewriting `media-core/client.ts`. React hooks and UI components are untouched because they're contract-driven, not implementation-driven.
- **Add analytics** — subscribe to events. No changes needed anywhere else.
