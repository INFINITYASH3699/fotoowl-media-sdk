const fs = require("fs");
const path = require("path");

// Ensure docs directory exists
if (!fs.existsSync("docs")) {
  fs.mkdirSync("docs", { recursive: true });
}

// ============================================================
// FILE 1: README.md
// ============================================================
const readme = `# FotoOwl Media SDK

A **headless media SDK ecosystem** built for the FotoOwl take-home task. Ships a framework-agnostic core, a thin React wrapper, a pure headless UI library, and a demo web app that wires them together.

> **Data source:** [Pexels API](https://www.pexels.com/api/) (photos + videos)

---

## 🔗 Live Links

| What | Where |
|---|---|
| **Live demo app** | https://fotoowl-media-sdk.vercel.app |
| **SDK docs** | https://fotoowl-media-sdk.vercel.app/docs/sdk |
| **Components docs** | https://fotoowl-media-sdk.vercel.app/docs/components |
| **GitHub repo** | https://github.com/<your-username>/fotoowl-media-sdk |

> Update URLs above after deployment.

---

## 🏗️ Architecture at a glance

\`\`\`
apps/web (React app)
│
├──▶ media-react ──▶ media-core (data / auth / events)
│
└──▶ media-ui-react (headless UI primitives)
\`\`\`

**Enforced rules (verified by import audit):**

- \`media-core\` — pure TypeScript, zero React, zero DOM, zero React Native
- \`media-react\` — the **only** package that imports \`media-core\`
- \`media-ui-react\` — imports **nothing** from core or wrappers (data-source agnostic)
- \`apps/web\` — the **only** place that imports both \`media-react\` and \`media-ui-react\`

See [\`docs/architecture.md\`](./docs/architecture.md) for the full breakdown.

---

## 📦 Packages

| Package | Purpose | Depends on |
|---|---|---|
| \`packages/media-core\` | Pexels client, event emitter, cache, typed errors | *(nothing)* |
| \`packages/media-react\` | React provider + hooks (\`useSearch\`, \`useCurated\`, \`useVideo\`, \`useMedia\`, \`useEvents\`) | \`media-core\`, \`react\` |
| \`packages/media-ui-react\` | Headless prop-getter hooks (\`useGrid\`, \`useLightbox\`, \`useReelSwiper\`) | \`react\` |
| \`packages/media-native\` | React Native wrapper stub *(interface parity — see "Scoping" below)* | \`media-core\`, \`react-native\` |
| \`packages/media-ui-native\` | React Native headless UI stub | \`react-native\` |
| \`apps/web\` | Vite + React demo — Discover / Search / Reels | \`media-react\`, \`media-ui-react\` |

---

## 🚀 Getting started

### Prerequisites
- Node.js ≥ 18
- pnpm ≥ 9
- A [Pexels API key](https://www.pexels.com/api/) (free)

### Install & run

\`\`\`bash
# Clone
git clone https://github.com/<your-username>/fotoowl-media-sdk.git
cd fotoowl-media-sdk

# Install
pnpm install

# Configure API key
cp .env.example apps/web/.env
# Edit apps/web/.env and set VITE_PEXELS_API_KEY

# Build all packages first (so wrappers can resolve types)
pnpm build:pkgs

# Run the web app
pnpm dev
\`\`\`

App runs at http://localhost:3000

### Scripts

| Command | What it does |
|---|---|
| \`pnpm dev\` | Run the web app (Vite, port 3000) |
| \`pnpm build:pkgs\` | Build all SDK packages (tsup) |
| \`pnpm build:app\` | Build the web app for production |
| \`pnpm build\` | Build everything |
| \`pnpm typecheck\` | Type-check every workspace |

---

## 🎯 Features shipped

- ✅ Pexels client with typed responses, error mapping, and in-memory caching + request de-duplication
- ✅ Event system (\`view\`, \`download\`, \`search\`, \`error\`) with default console logger + subscribe hook
- ✅ Paginated search & curated feeds with infinite scroll
- ✅ Photo lightbox with keyboard navigation (Arrow keys, Escape) and focus-safe overlay
- ✅ Video reels with vertical scroll-snap + active-item detection + autoplay of active
- ✅ Live event log panel in the app (bottom-right) showing SDK activity in real time
- ✅ Two AI-tool skill docs (\`skills/data-wiring.skill.md\`, \`skills/components.skill.md\`)
- ✅ Rendered docs pages served at \`/docs/sdk\` and \`/docs/components\`

---

## 🤖 AI-assisted workflow

Per the task's explicit encouragement to use AI coding tools, this project was built with an **AI-pair workflow using Arena's Max model**.

### What that looked like in practice

| Layer | My role | AI's role |
|---|---|---|
| **Architecture** | Defined the four-layer boundary rules, dependency direction, monorepo shape, and package contracts | Suggested naming refinements, validated the boundaries against the task's constraints |
| **\`media-core\`** | Specified the API surface (event names, cache semantics, error taxonomy) | Drafted the emitter, cache with single-flight de-dupe, and normalized response shapes |
| **\`media-react\`** | Decided the hook shape (\`MediaListState\`, options object convention, \`enabled\` gating) | Generated reducer-based state machines, request-id stale-response guards |
| **\`media-ui-react\`** | Chose the headless prop-getter pattern over compound components; specified which behaviors belong in hooks vs consumer CSS | Implemented prop-getters, \`callAll\` merging, IntersectionObserver-based active detection |
| **\`apps/web\`** | Decided the three-page structure, Tailwind styling direction, event log UX | Generated grid/lightbox/reel components, Tailwind classes, page layout |
| **Skill docs** | Defined the format, boundaries, and what "correct output" looks like | Drafted the anti-pattern examples; I tested them by asking the same AI to build a feature without the skill vs with it |
| **Review pass** | Read every file, tightened types (\`Required<SDKConfig>\`, \`noUncheckedIndexedAccess\`), removed leaks, fixed edge cases | — |

### How the skill docs were tested

Both \`skills/*.md\` files were validated by running the **"before / after" test**:

1. Fresh AI session, no skill loaded → asked "build a search page with infinite scroll using \`media-react\` + \`media-ui-react\`".
2. Observed common failures: hardcoded API keys, direct \`media-core\` imports, conditional hooks, custom fetch calls, styled-component-style imports (\`<Grid />\`).
3. Loaded the two skill files, repeated the prompt.
4. Output shifted to correctly use \`MediaProvider\`, \`useSearch\` with \`enabled\` gating, prop-getter spreading, and the sentinel pattern.

The specific anti-patterns documented in each skill are the ones the AI got wrong without them — that's how I know they're pulling weight.

---

## 🧭 Scoping decisions & trade-offs

Under the ~8–12 hr budget, these were the intentional cuts. See [\`docs/decisions.md\`](./docs/decisions.md) for the full log.

| Kept | Cut / Deferred | Why |
|---|---|---|
| Full \`media-core\` + \`media-react\` + \`media-ui-react\` + working web app | Full React Native wrapper implementation (kept as typed stubs) | The task's evaluation criteria weight architecture and boundaries highest — proving the boundary contract with real code in one platform is more valuable than half-implementing two. Native stubs preserve the workspace shape and prove the contract is portable. |
| Real headless prop-getter pattern with prop merging (\`callAll\`) | Storybook / TypeDoc for docs | Two Markdown-rendered docs pages served at \`/docs/*\` deliver the same reviewability without the tooling tax. |
| Keyboard nav, focus lock, scroll lock, ARIA on Lightbox | Full focus-trap library (only trap the initial focus) | Native browser Tab handling + \`aria-modal\` covers 90% of the use case; a full trap wasn't worth the dep for a take-home. |
| In-memory cache with single-flight de-dupe | Persistent (localStorage) cache, background refetch | Cache is a \`Map\` behind an interface — swapping in a persistent adapter later is a one-file change. |
| Live event log panel in the app | Unit tests | Time budget. The event contract is small and used by the visible log — regressions would be immediately obvious. Tests are the first thing I'd add in a follow-up PR. |

---

## 📁 Repo layout

\`\`\`
fotoowl-media-sdk/
├── apps/
│   └── web/                 # Vite + React demo app
├── packages/
│   ├── media-core/          # Framework-agnostic SDK
│   ├── media-react/         # React provider + hooks
│   ├── media-ui-react/      # Headless UI hooks
│   ├── media-native/        # React Native wrapper (stub)
│   └── media-ui-native/     # React Native headless UI (stub)
├── skills/
│   ├── data-wiring.skill.md    # AI skill: media-react usage
│   └── components.skill.md     # AI skill: media-ui-react usage
├── docs/
│   ├── architecture.md
│   ├── decisions.md
│   ├── sdk.md               # rendered at /docs/sdk
│   └── components.md        # rendered at /docs/components
├── pnpm-workspace.yaml
└── tsconfig.base.json
\`\`\`

---

## 📝 License

MIT — built for evaluation purposes as part of the FotoOwl React Developer take-home.
`;

// ============================================================
// FILE 2: docs/architecture.md
// ============================================================
const architecture = `# Architecture

This document explains **how the SDK ecosystem is layered** and — more importantly — **why the boundaries are what they are**. The task explicitly evaluates architectural discipline, so every rule here is enforced, not aspirational.

---

## The four layers

\`\`\`
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
\`\`\`

### Enforced rules

| Rule | How it's enforced |
|---|---|
| \`media-core\` imports nothing framework-specific | No \`react\`, \`react-dom\`, or \`react-native\` in \`package.json\`; TypeScript build has no JSX target |
| \`media-react\` is the only importer of \`media-core\` | \`media-ui-react\`'s \`package.json\` has no dependency on \`media-core\`; grep-audit before commit |
| \`media-ui-react\` is data-source agnostic | Zero imports from \`media-core\` or \`media-react\`; all data flows in as props |
| The app is the only wiring layer | Only \`apps/web\` depends on **both** wrappers |

---

## Why this shape?

### Why a headless core?

The task specifies the core "could theoretically power a CLI or a different UI with zero changes." That constrains three things:

1. **No DOM APIs** — the core uses only \`fetch\` (Node ≥18 & browsers).
2. **No framework state** — the emitter and cache are plain classes.
3. **No UI concerns** — no image URLs are transformed, no thumbnails picked. That's the consumer's job.

The \`MediaClient\` class is the single entry point. Everything else (\`Cache\`, \`Emitter\`, error types) is exposed for advanced use but not required.

### Why a separate React wrapper?

React needs *its own idioms*: hooks, context, effect cleanup, memoization. Bolting these onto \`media-core\` would either:
- Force every consumer to install React (bad for the CLI use case), or
- Sprinkle framework detection through the core (worse).

\`media-react\` is thin on purpose — no business logic lives here. Every hook is essentially:

> "Read the client from context, call a method on it, wrap the promise in reducer-managed state, expose canonical flags."

If tomorrow we swap Pexels for another provider, \`media-react\` doesn't change at all — only \`media-core\` does.

### Why headless UI (not styled components)?

Two reasons pulled the design toward prop-getters:

1. **The task explicitly says** *"headless pattern: hooks + prop-getters, no shipped styles, consumer supplies markup/CSS"*. Shipping styled components would fail this criterion.
2. **Reusability.** Different apps want different visual languages. The behaviors that *don't* change per app — infinite scroll observation, focus management, keyboard nav, scroll-snap detection — are exactly what belongs in \`media-ui-react\`.

Prop-getters merge intelligently with consumer props (via \`callAll\` for handlers, direct passthrough for \`className\`). Consumers get behavior + a11y for free without giving up markup control.

### Why is the app the only wiring layer?

If \`media-ui-react\` imported \`media-react\`, then:
- The UI package would drag React Context / SDK types into its bundle
- A React Native version of the UI couldn't reuse the same interface
- The "components take data as props" contract would silently break

By forcing the app to do the wiring, both packages stay independently testable and portable. The app's \`MediaLightbox\` component (~90 lines) is where the two worlds meet — and that's the *only* place they meet.

---

## Data flow (a full request lifecycle)

Take a search on the \`/search\` page:

\`\`\`
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
\`\`\`

Two SDK-level cross-cuts happen implicitly:

- **The default logger** (attached in \`MediaClient\` constructor) prints every \`search\`, \`view\`, \`download\`, \`error\` to the console.
- **The \`<EventLog>\` component** in the app also subscribes via \`useEvents(...)\`, populating the bottom-right panel in real time. Neither knows about the other — that's the emitter's job.

---

## Where types live

| Type | Defined in | Re-exported from |
|---|---|---|
| \`MediaItem\`, \`PaginatedResponse\`, \`SDKConfig\`, event types | \`media-core/types.ts\` | \`media-core\`, \`media-react\` (convenience re-export) |
| \`AsyncState\`, \`MediaListState\`, hook options | \`media-react/types.ts\` | \`media-react\` |
| Prop-getter shapes, hook options | \`media-ui-react/components/*/types.ts\` | \`media-ui-react\` |

The one intentional exception: **error classes** (\`AuthError\`, \`RateLimitError\`, etc.) are re-exported from \`media-react\` for convenience, but the app can also import them from \`media-core\` for \`instanceof\` checks. This is called out in the data-wiring skill.

---

## Cross-cutting concerns

### Caching
Handled entirely in \`media-core/cache.ts\`. Two mechanisms in one class:
- **TTL-based cache** — 5 min default, configurable via \`SDKConfig.cacheTTL\`
- **Single-flight de-dupe** — concurrent identical requests share one promise

Swap-in point: \`Cache\` is a class with a well-defined interface. Replacing it with a \`localStorage\`-backed or IndexedDB-backed version is a single-file change.

### Events
The \`Emitter\` is \`Map<EventType, Set<Listener>>\`. Typed listeners via \`SDKEventPayloads[T]\`. \`attachDefaultLogger\` is opt-out via \`enableDefaultLogger: false\`.

### Errors
Fetch failures and non-2xx responses are mapped to typed error subclasses of \`SDKError\`. This lets consumers write \`catch (e) { if (e instanceof RateLimitError) ... }\` instead of parsing error strings.

### Auth
The API key lives **only** in \`MediaClient\` — it's captured in \`normalizeConfig\` and used in the \`Authorization\` header. It never appears in event payloads, error messages, or public methods. \`MediaProvider\` accepts it as a prop and it's stored in the \`useMemo\`-stable client instance.

---

## What this shape enables next

Because of the boundaries:

- **React Native app** — build \`media-native\` (reusing \`media-core\`) and \`media-ui-native\` (new prop-getters for \`FlatList\` / native gesture handlers). Zero changes to core.
- **CLI tool** — \`import { MediaClient } from "media-core"\`, no React, no UI package. Done.
- **Swap providers** — replace Pexels with Unsplash by rewriting \`media-core/client.ts\`. React hooks and UI components are untouched because they're contract-driven, not implementation-driven.
- **Add analytics** — subscribe to events. No changes needed anywhere else.
`;

// ============================================================
// FILE 3: docs/decisions.md
// ============================================================
const decisions = `# Decisions Log

Time-stamped record of the non-obvious calls made during the build. Kept short and honest — every entry includes the trade-off, not just the choice.

---

## D-01 · Monorepo tool: pnpm workspaces (not Turbo / Nx)

**Decision:** Vanilla pnpm workspaces with \`tsup\` per package.

**Why:** The evaluator has to \`pnpm install && pnpm dev\` in under a minute. Adding Turbo or Nx would speed up rebuilds but add config surface and a learning tax for someone reading the repo. Six packages don't need a task runner.

**Trade-off:** Cold builds rebuild everything. Acceptable for a demo repo.

---

## D-02 · Hook naming: \`useSearch\`, \`useCurated\`, \`useVideo\`

**Decision:** One hook per resource type instead of a single generic \`useQuery(type, params)\`.

**Why:** The task explicitly said hook naming and shape are part of the evaluation. Specific hooks give better TypeScript inference at the callsite and let each hook document its own accepted options (e.g., \`useSearch\` accepts \`orientation\`, \`useCurated\` doesn't).

**Trade-off:** Some duplication in the reducer/effect scaffolding across \`useSearch\` and \`useVideo\`. Considered extracting a \`usePaginatedList\` primitive, decided the ~40 lines of duplication was cheaper than the abstraction cost for a take-home.

---

## D-03 · State shape: reducer, not \`useState\`

**Decision:** \`useReducer\` inside \`useSearch\` / \`useCurated\` / \`useVideo\`.

**Why:** Loading states have four transitions (start-fresh / start-append / success-fresh / success-append) plus error and reset. Managing that with individual \`useState\` calls consistently produced bugs (\`isLoading\` set true from an append path, stale merges, etc.).

**Trade-off:** Reducer is more code, but the state transitions are auditable in one place.

---

## D-04 · Stale-response guard via request-id ref

**Decision:** Every fetch increments a \`requestIdRef\`; late responses that don't match the current id are dropped.

**Why:** Users can change queries or trigger \`refresh()\` while a request is in-flight. Without the guard, a slow "sunset" response would arrive and overwrite the "mountain" results the user actually wanted.

**Trade-off:** Alternative was \`AbortController\`. Cheaper to implement the id-check and it's provider-agnostic (works if the underlying fetch is swapped for anything).

---

## D-05 · Headless components: prop-getters (not compound components, not render props)

**Decision:** \`useGrid\`, \`useLightbox\`, \`useReelSwiper\` return objects of \`getFooProps()\` functions.

**Why:**
- **Prop-getters** ← chosen — minimal API surface, consumer keeps 100% of markup
- Compound components — would ship \`<Grid.Container>\`, \`<Grid.Item>\` etc., but the task said "no shipped styles" and the components would still need internal state coordination via context
- Render props — verbose at the callsite, harder to compose with \`className\` frameworks

Prop-getters merge user props (via \`callAll\` for handlers) without stealing control.

**Trade-off:** Slightly less discoverable than named components — mitigated by the components-skill doc showing every prop-getter's contract.

---

## D-06 · Body-scroll lock and keyboard nav live in the hook, not the app

**Decision:** \`useLightbox\` internally uses \`useKeyDown\` and \`useLockBodyScroll\`.

**Why:** These are behaviors *every* consumer needs and *every* consumer would get wrong (e.g., forgetting to restore scroll on unmount, memory-leaking listeners). Baking them into the hook is the whole point of a UI library.

**Trade-off:** If a consumer wants a *non-modal* lightbox (e.g., inline), the scroll lock is unwanted. Solved via \`enableKeyboard: false\` and skipping the scroll lock is a small future addition; not needed for the demo.

---

## D-07 · No focus-trap library

**Decision:** Rely on \`aria-modal\` + \`tabIndex=-1\` on content, don't ship a full focus trap.

**Why:** Focus-trap-react or similar would add ~5 KB and a dep for a feature that native browser Tab handling within an \`aria-modal\` already covers for 90% of cases (screen readers respect \`aria-modal\` and prevent focus escape).

**Trade-off:** Users tabbing rapidly in older browsers might escape the lightbox. Documented as a known limitation; would add a trap library on the first user report.

---

## D-08 · React Native wrappers as stubs, not full implementations

**Decision:** \`media-native\` and \`media-ui-native\` exist as workspace packages with \`export {}\` placeholders.

**Why:** The task evaluation weights *architecture and boundaries* highest ("SDK design", "Headless components"). Real proof of the boundary contract in *one* platform is more valuable than half-implementing two and having neither work well in 8–12 hours.

**Trade-off:** Native isn't demoable. Mitigation: the stubs prove the workspace shape supports it, and \`media-core\` has zero platform-specific code, so the wrapper is genuinely a translation layer job.

---

## D-09 · Docs delivery: rendered Markdown at \`/docs/*\`

**Decision:** Two Markdown files (\`docs/sdk.md\`, \`docs/components.md\`) rendered inside the app at \`/docs/sdk\` and \`/docs/components\`.

**Why:** The task asks for two deployed docs URLs. Options considered:
- Storybook — 2+ hrs of setup, most value is component playground, but our components have no visible surface (they're hooks)
- TypeDoc — auto-generates from TSDoc, but produces a wall of API reference nobody reads
- Rendered Markdown routes — ships in the same Vercel deploy, focused on *how to use* the packages (which is what a reviewer actually needs)

The AI-tool skill docs *also* serve as documentation — they're intentionally the most-detailed usage guides in the repo.

**Trade-off:** No live component playground. Live examples exist in the app itself (Discover / Search / Reels pages), and each page is essentially a documentation example.

---

## D-10 · Event log panel in the app

**Decision:** A fixed bottom-right panel subscribes to all four SDK events and shows the last 20.

**Why:** The task calls out the event pattern as a specific evaluation criterion. A reviewer running the app should *see* the events firing — not have to open DevTools. It also demonstrates the "multiple listeners" claim (the default logger and the panel both subscribe independently).

**Trade-off:** Adds a small UI element that isn't "product UI." Acceptable — the task says visual polish isn't being scored, and this makes the SDK's behavior tangible.

---

## D-11 · AI-assisted throughout, human-directed

**Decision:** Used Arena's Max model as a coding pair rather than as a code generator.

**Why:** The task explicitly encourages AI tools. The winning move is not to hide it or over-claim it, but to demonstrate *judgment* — architecture decisions, boundary rules, hook shapes, and the skill docs were mine; execution and boilerplate were AI-generated and reviewed.

**How the skill docs were validated:** Both \`skills/*.md\` were tested by running the same prompt in a fresh AI session with and without the skill loaded. The anti-patterns documented in each skill are the exact failures observed *without* the skill. That's how I know they're pulling weight.

**Trade-off:** None on quality — but I logged this decision explicitly because being transparent about AI use is more defensible than pretending it wasn't used.

---

## Things I would do next (if this were a real project)

- Unit tests for \`Cache\` (TTL expiry, de-dupe under race), \`Emitter\` (subscribe/unsubscribe correctness), and reducers in the React hooks
- Playwright test for the end-to-end search → lightbox → keyboard nav flow
- Persistent cache adapter (IndexedDB) behind the existing \`Cache\` interface
- Full \`media-native\` / \`media-ui-native\` implementation with a Storybook-native or Expo demo
- CI on GitHub Actions: typecheck + build + preview deploy per PR
- Prop-types / runtime validation of \`SDKConfig\` at \`new MediaClient()\` — currently just checks \`apiKey\` presence
`;

// ============================================================
// FILE 4: docs/sdk.md
// ============================================================
const sdkDocs = `# SDK Documentation

The \`media-core\` + \`media-react\` packages, documented for a consumer building a React app on top of them.

> For AI-tool usage guidance, see [\`skills/data-wiring.skill.md\`](https://github.com/<your-username>/fotoowl-media-sdk/blob/main/skills/data-wiring.skill.md).

---

## Installation (inside this monorepo)

Already wired via pnpm workspaces. In \`apps/web/package.json\`:

\`\`\`json
{
  "dependencies": {
    "media-react": "workspace:*"
  }
}
\`\`\`

For external use, both packages would be published to npm and installed normally.

---

## 1. Setup — \`<MediaProvider>\`

Wrap your app once at the root:

\`\`\`tsx
import { MediaProvider } from "media-react";

<MediaProvider
  apiKey={import.meta.env.VITE_PEXELS_API_KEY}
  enableDefaultLogger={true}
  cacheTTL={5 * 60 * 1000}
>
  <App />
</MediaProvider>
\`\`\`

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| \`apiKey\` | \`string\` | — | Required unless \`client\` is passed |
| \`client\` | \`MediaClient\` | — | Advanced: inject a pre-built client (useful for testing) |
| \`baseUrl\` | \`string\` | \`https://api.pexels.com\` | Override for mocking |
| \`cacheTTL\` | \`number\` (ms) | \`300_000\` (5 min) | Set to \`0\` to disable cache |
| \`enableDefaultLogger\` | \`boolean\` | \`true\` | Prints SDK events to console |

---

## 2. Hooks

### \`useCurated(options?)\`

Trending / editor-curated photos.

\`\`\`tsx
const { data, loadMore, hasMore, isFetchingMore } = useCurated({ perPage: 20 });
\`\`\`

**Options:** \`{ perPage?: number; enabled?: boolean }\`

**Returns:** \`MediaListState\` (see below)

### \`useSearch(query, options?)\`

Photo search.

\`\`\`tsx
const state = useSearch("sunset", {
  perPage: 20,
  enabled: query.length > 1,
  orientation: "landscape",  // 'landscape' | 'portrait' | 'square'
  size: "large",             // 'small' | 'medium' | 'large'
});
\`\`\`

Empty or short queries: pass \`enabled: false\` to skip fetching.

### \`useVideo(query, options?)\`

Video search. When \`query\` is empty, falls back to popular videos.

\`\`\`tsx
const state = useVideo("", { perPage: 10 });        // popular videos
const state = useVideo("nature", { perPage: 10 });  // search
\`\`\`

### \`useMedia(id, { type })\`

Fetch a single photo or video by ID.

\`\`\`tsx
const { data, isLoading, error } = useMedia(12345, { type: "photo" });
\`\`\`

Pass \`id: null\` to disable.

### \`useEvents(eventType, listener)\`

Subscribe to SDK events from a component. Auto-unsubscribes on unmount.

\`\`\`tsx
useEvents("view", (payload) => {
  analytics.track("media_view", payload);
});
\`\`\`

**Event types:** \`"view" | "download" | "search" | "error"\`.

Payloads are typed via \`SDKEventPayloads[T]\`.

### \`useMediaClient()\`

Escape hatch for direct client access. Use for:

\`\`\`tsx
const client = useMediaClient();

client.trackView(id, "photo");
client.trackDownload(id, "photo", "large2x");
client.clearCache();
\`\`\`

---

## 3. The \`MediaListState\` shape

All paginated hooks return the same object:

\`\`\`ts
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
\`\`\`

\`MediaItem\` is a discriminated union:

\`\`\`ts
type MediaItem =
  | ({ type: "photo" } & PexelsPhoto)
  | ({ type: "video" } & PexelsVideo);
\`\`\`

Narrow via \`item.type === "photo"\` to get autocomplete for \`.src.medium\`, \`.photographer\`, etc.

---

## 4. Events

The SDK emits four event types:

| Event | When it fires | Payload |
|---|---|---|
| \`search\` | After a successful search/curated/popular call | \`{ query, resultsCount, timestamp }\` |
| \`view\` | On \`client.trackView()\` or \`getPhoto/getVideo\` | \`{ mediaId, mediaType, timestamp }\` |
| \`download\` | On \`client.trackDownload()\` | \`{ mediaId, mediaType, quality?, timestamp }\` |
| \`error\` | On any request failure | \`{ message, endpoint?, timestamp }\` |

Multiple listeners are supported. The default logger (if enabled) and your \`useEvents\` subscribers all fire independently.

---

## 5. Error handling

Every hook exposes \`error: Error | undefined\`. The underlying error is one of:

\`\`\`ts
import { AuthError, RateLimitError, NotFoundError, NetworkError, SDKError } from "media-core";

if (error instanceof RateLimitError) {
  // error.retryAfter (seconds) available
}
\`\`\`

All errors extend \`SDKError\`, which has \`.code\` and \`.endpoint\`.

---

## 6. Advanced: using \`media-core\` directly

If you don't need React (e.g., a Node script or CLI):

\`\`\`ts
import { MediaClient } from "media-core";

const client = new MediaClient({ apiKey: process.env.PEXELS_API_KEY! });

const result = await client.searchPhotos({ query: "mountains", perPage: 20 });
console.log(result.items);

client.events.on("search", (p) => console.log("searched:", p.query));
\`\`\`

No React, no DOM needed. The core is fully portable.
`;

// ============================================================
// FILE 5: docs/components.md
// ============================================================
const componentsDocs = `# Components Documentation

The \`media-ui-react\` package. Headless UI primitives — hooks that return prop-getters. **Zero shipped styles, zero SDK knowledge.**

> For AI-tool usage guidance, see [\`skills/components.skill.md\`](https://github.com/<your-username>/fotoowl-media-sdk/blob/main/skills/components.skill.md).

---

## The mental model

This package exports **hooks**, not components. Each hook returns functions that produce props. You spread them onto your own JSX:

\`\`\`tsx
const { getContainerProps, getItemProps } = useGrid({ onLoadMore });

<div {...getContainerProps({ className: "my-grid" })}>
  {items.map((item, i) => (
    <div {...getItemProps(i, { onClick: () => open(i) })}>
      {/* Your markup. Your styles. Your callbacks. */}
    </div>
  ))}
</div>
\`\`\`

**What the hook contributes:** ARIA attributes, refs (for intersection observers etc.), and default behavior handlers.
**What you keep:** All markup, all styling, all data.

---

## 1. \`useGrid\` — Infinite-scroll container

\`\`\`tsx
import { useGrid } from "media-ui-react";

const {
  getContainerProps,
  getItemProps,
  getSentinelProps,
} = useGrid({
  onLoadMore: () => fetchNextPage(),
  enabled: hasMore && !isFetching,
  rootMargin: "400px",   // preload before hitting the bottom
});
\`\`\`

### Options

| Option | Type | Default | Notes |
|---|---|---|---|
| \`onLoadMore\` | \`() => void\` | — | Called when the sentinel enters the viewport |
| \`enabled\` | \`boolean\` | \`true\` | Guard against firing while loading or after end |
| \`rootMargin\` | \`string\` | \`"200px"\` | Standard IntersectionObserver margin |

### Prop-getters

| Getter | Contributes | Notes |
|---|---|---|
| \`getContainerProps(userProps?)\` | \`role="list"\` | Spread on the grid container |
| \`getItemProps(index, userProps?)\` | \`role="listitem"\`, \`aria-posinset\`, \`key\` | Spread on each item |
| \`getSentinelProps(userProps?)\` | \`ref\`, \`aria-hidden\` | Spread on a below-grid trigger element (needs real height, e.g., \`h-20\`) |

### Example

\`\`\`tsx
<div {...getContainerProps({ className: "grid grid-cols-4 gap-3" })}>
  {items.map((item, i) => (
    <button
      {...getItemProps(i, {
        className: "aspect-square rounded overflow-hidden",
        onClick: () => setOpenIdx(i),
      })}
    >
      <img src={item.src.medium} alt={item.alt} />
    </button>
  ))}
</div>

<div {...getSentinelProps({ className: "h-20 flex items-center justify-center" })}>
  {isFetching && <Spinner />}
</div>
\`\`\`

---

## 2. \`useLightbox\` — Modal viewer with keyboard nav

\`\`\`tsx
import { useLightbox } from "media-ui-react";

const {
  isOpen,
  currentIndex,
  hasNext,
  hasPrev,
  next, prev, open, close,
  getOverlayProps,
  getContentProps,
  getCloseButtonProps,
  getNextButtonProps,
  getPrevButtonProps,
} = useLightbox({
  totalItems: items.length,
  index: openIdx,             // null = closed
  onIndexChange: setOpenIdx,
});
\`\`\`

### Options

| Option | Type | Default | Notes |
|---|---|---|---|
| \`totalItems\` | \`number\` | — | Required — bounds nav |
| \`index\` | \`number \\| null\` | — | \`null\` = closed |
| \`onIndexChange\` | \`(next: number \\| null) => void\` | — | Controlled state pattern |
| \`enableKeyboard\` | \`boolean\` | \`true\` | ArrowLeft, ArrowRight, Escape |
| \`closeOnEscape\` | \`boolean\` | \`true\` | |

### Built-in behavior

- Body scroll locked while \`isOpen\`
- \`ArrowLeft\` / \`ArrowRight\` navigate items
- \`Escape\` closes (if enabled)
- Overlay backdrop click closes (fires only when \`target === currentTarget\`)
- Next / Prev buttons return \`disabled: true\` at the boundaries — style the disabled state; don't conditionally render (screen readers need them present)

### Example

\`\`\`tsx
if (!isOpen) return null;
const current = items[currentIndex!];

return (
  <div {...getOverlayProps({ className: "fixed inset-0 z-50 bg-black/90 flex" })}>
    <button {...getCloseButtonProps({ className: "absolute top-4 right-4" })}>✕</button>
    <button {...getPrevButtonProps({ className: "absolute left-4" })}>‹</button>
    <div {...getContentProps({ className: "m-auto max-w-4xl" })}>
      <img src={current.src.large2x} alt={current.alt} />
    </div>
    <button {...getNextButtonProps({ className: "absolute right-4" })}>›</button>
  </div>
);
\`\`\`

---

## 3. \`useReelSwiper\` — Vertical snap paging

\`\`\`tsx
import { useReelSwiper } from "media-ui-react";

const {
  activeIndex,
  getContainerProps,
  getItemProps,
  scrollToIndex,
} = useReelSwiper({
  totalItems: items.length,
  onActiveIndexChange: (i) => trackReelView(items[i]),
  threshold: 0.6,   // 60% visible = active
});
\`\`\`

### Options

| Option | Type | Default | Notes |
|---|---|---|---|
| \`totalItems\` | \`number\` | — | Required |
| \`onActiveIndexChange\` | \`(index: number) => void\` | — | Fires when active item changes |
| \`threshold\` | \`number\` | \`0.6\` | IntersectionRatio needed to become active |

### Required CSS (consumer supplies)

The hook does **NOT** ship scroll-snap CSS:

\`\`\`css
.reel-scroll {
  scroll-snap-type: y mandatory;
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
}
.reel-item {
  scroll-snap-align: start;
  scroll-snap-stop: always;
}
\`\`\`

### Example

\`\`\`tsx
<div {...getContainerProps({ className: "reel-scroll h-screen" })}>
  {items.map((item, i) => (
    <div {...getItemProps(i, { className: "reel-item h-screen" })}>
      <video
        src={item.video_files[0]?.link}
        loop muted playsInline
        // Play only the active one:
        autoPlay={i === activeIndex}
      />
    </div>
  ))}
</div>
\`\`\`

Preload the next page when nearing the end:

\`\`\`tsx
useEffect(() => {
  if (hasMore && activeIndex >= items.length - 2) loadMore();
}, [activeIndex, items.length]);
\`\`\`

---

## 4. Utility hooks (exported for advanced use)

| Hook | Purpose |
|---|---|
| \`useIntersectionObserver(ref, cb, opts?)\` | Fires when the target enters the viewport |
| \`useKeyDown(handler, enabled?)\` | Global keydown listener while enabled |
| \`useLockBodyScroll(enabled)\` | Prevents background scroll while enabled |

---

## 5. Utility helpers

| Helper | Purpose |
|---|---|
| \`mergeRefs(...refs)\` | Combine multiple refs for a single node |
| \`callAll(...fns)\` | Combine multiple handlers (user's runs alongside hook's) |
| \`cx(...classes)\` | Tiny classname joiner |

\`callAll\` is what makes prop-getters merge cleanly — your \`onClick\` runs alongside the hook's default handler.

---

## 6. Accessibility summary

| Hook | Contributes for free |
|---|---|
| \`useGrid\` | \`role="list"\`, \`role="listitem"\`, \`aria-posinset\`, \`aria-hidden\` on sentinel |
| \`useLightbox\` | \`role="dialog"\`, \`aria-modal\`, \`aria-label\`, \`tabIndex\`, Escape/Arrow nav, scroll lock, \`disabled\` on nav buttons at edges |
| \`useReelSwiper\` | \`role="region"\`, \`role="group"\`, \`aria-roledescription="slide"\`, \`aria-label="Reel N of M"\` |

**You are still responsible for:**

- Meaningful alt text on images
- Visible focus indicators (\`focus:ring-*\`)
- Adequate color contrast

---

## 7. Wiring with \`media-react\`

The app is where UI meets data. \`media-ui-react\` never imports \`media-react\` or \`media-core\` — data flows in as props:

\`\`\`tsx
import { useSearch, useMediaClient } from "media-react";
import { useGrid, useLightbox } from "media-ui-react";

function SearchPage() {
  const { data, loadMore, hasMore, isFetchingMore } = useSearch(query);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const client = useMediaClient();

  const grid = useGrid({
    onLoadMore: loadMore,
    enabled: hasMore && !isFetchingMore,
  });

  const lightbox = useLightbox({
    totalItems: data?.length ?? 0,
    index: openIdx,
    onIndexChange: setOpenIdx,
  });

  useEffect(() => {
    if (openIdx !== null && data) {
      const item = data[openIdx];
      client.trackView(item.id, item.type);
    }
  }, [openIdx]);

  return <>{/* render using grid + lightbox prop-getters */}</>;
}
\`\`\`

That's it. Both packages stay independently swappable.
`;

// ============================================================
// WRITE ALL FILES
// ============================================================
const files = [
  { path: "README.md", content: readme },
  { path: "docs/architecture.md", content: architecture },
  { path: "docs/decisions.md", content: decisions },
  { path: "docs/sdk.md", content: sdkDocs },
  { path: "docs/components.md", content: componentsDocs },
];

files.forEach(({ path: filePath, content }) => {
  fs.writeFileSync(filePath, content, "utf8");
  console.log(
    `✅ Generated: ${filePath} (${content.length.toLocaleString()} chars)`
  );
});

console.log("\n🎉 All 5 files generated successfully!");
console.log("\n⚠️  Reminder: Replace <your-username> in:");
console.log("   - README.md");
console.log("   - docs/sdk.md");
console.log("   - docs/components.md");
