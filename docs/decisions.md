# Decisions Log

Time-stamped record of the non-obvious calls made during the build. Kept short and honest — every entry includes the trade-off, not just the choice.

---

## D-01 · Monorepo tool: pnpm workspaces (not Turbo / Nx)

**Decision:** Vanilla pnpm workspaces with `tsup` per package.

**Why:** The evaluator has to `pnpm install && pnpm dev` in under a minute. Adding Turbo or Nx would speed up rebuilds but add config surface and a learning tax for someone reading the repo. Six packages don't need a task runner.

**Trade-off:** Cold builds rebuild everything. Acceptable for a demo repo.

---

## D-02 · Hook naming: `useSearch`, `useCurated`, `useVideo`

**Decision:** One hook per resource type instead of a single generic `useQuery(type, params)`.

**Why:** The task explicitly said hook naming and shape are part of the evaluation. Specific hooks give better TypeScript inference at the callsite and let each hook document its own accepted options (e.g., `useSearch` accepts `orientation`, `useCurated` doesn't).

**Trade-off:** Some duplication in the reducer/effect scaffolding across `useSearch` and `useVideo`. Considered extracting a `usePaginatedList` primitive, decided the ~40 lines of duplication was cheaper than the abstraction cost for a take-home.

---

## D-03 · State shape: reducer, not `useState`

**Decision:** `useReducer` inside `useSearch` / `useCurated` / `useVideo`.

**Why:** Loading states have four transitions (start-fresh / start-append / success-fresh / success-append) plus error and reset. Managing that with individual `useState` calls consistently produced bugs (`isLoading` set true from an append path, stale merges, etc.).

**Trade-off:** Reducer is more code, but the state transitions are auditable in one place.

---

## D-04 · Stale-response guard via request-id ref

**Decision:** Every fetch increments a `requestIdRef`; late responses that don't match the current id are dropped.

**Why:** Users can change queries or trigger `refresh()` while a request is in-flight. Without the guard, a slow "sunset" response would arrive and overwrite the "mountain" results the user actually wanted.

**Trade-off:** Alternative was `AbortController`. Cheaper to implement the id-check and it's provider-agnostic (works if the underlying fetch is swapped for anything).

---

## D-05 · Headless components: prop-getters (not compound components, not render props)

**Decision:** `useGrid`, `useLightbox`, `useReelSwiper` return objects of `getFooProps()` functions.

**Why:**
- **Prop-getters** ← chosen — minimal API surface, consumer keeps 100% of markup
- Compound components — would ship `<Grid.Container>`, `<Grid.Item>` etc., but the task said "no shipped styles" and the components would still need internal state coordination via context
- Render props — verbose at the callsite, harder to compose with `className` frameworks

Prop-getters merge user props (via `callAll` for handlers) without stealing control.

**Trade-off:** Slightly less discoverable than named components — mitigated by the components-skill doc showing every prop-getter's contract.

---

## D-06 · Body-scroll lock and keyboard nav live in the hook, not the app

**Decision:** `useLightbox` internally uses `useKeyDown` and `useLockBodyScroll`.

**Why:** These are behaviors *every* consumer needs and *every* consumer would get wrong (e.g., forgetting to restore scroll on unmount, memory-leaking listeners). Baking them into the hook is the whole point of a UI library.

**Trade-off:** If a consumer wants a *non-modal* lightbox (e.g., inline), the scroll lock is unwanted. Solved via `enableKeyboard: false` and skipping the scroll lock is a small future addition; not needed for the demo.

---

## D-07 · No focus-trap library

**Decision:** Rely on `aria-modal` + `tabIndex=-1` on content, don't ship a full focus trap.

**Why:** Focus-trap-react or similar would add ~5 KB and a dep for a feature that native browser Tab handling within an `aria-modal` already covers for 90% of cases (screen readers respect `aria-modal` and prevent focus escape).

**Trade-off:** Users tabbing rapidly in older browsers might escape the lightbox. Documented as a known limitation; would add a trap library on the first user report.

---

## D-08 · React Native wrappers as stubs, not full implementations

**Decision:** `media-native` and `media-ui-native` exist as workspace packages with `export {}` placeholders.

**Why:** The task evaluation weights *architecture and boundaries* highest ("SDK design", "Headless components"). Real proof of the boundary contract in *one* platform is more valuable than half-implementing two and having neither work well in 8–12 hours.

**Trade-off:** Native isn't demoable. Mitigation: the stubs prove the workspace shape supports it, and `media-core` has zero platform-specific code, so the wrapper is genuinely a translation layer job.

---

## D-09 · Docs delivery: rendered Markdown at `/docs/*`

**Decision:** Two Markdown files (`docs/sdk.md`, `docs/components.md`) rendered inside the app at `/docs/sdk` and `/docs/components`.

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

**How the skill docs were validated:** Both `skills/*.md` were tested by running the same prompt in a fresh AI session with and without the skill loaded. The anti-patterns documented in each skill are the exact failures observed *without* the skill. That's how I know they're pulling weight.

**Trade-off:** None on quality — but I logged this decision explicitly because being transparent about AI use is more defensible than pretending it wasn't used.

---

## Things I would do next (if this were a real project)

- Unit tests for `Cache` (TTL expiry, de-dupe under race), `Emitter` (subscribe/unsubscribe correctness), and reducers in the React hooks
- Playwright test for the end-to-end search → lightbox → keyboard nav flow
- Persistent cache adapter (IndexedDB) behind the existing `Cache` interface
- Full `media-native` / `media-ui-native` implementation with a Storybook-native or Expo demo
- CI on GitHub Actions: typecheck + build + preview deploy per PR
- Prop-types / runtime validation of `SDKConfig` at `new MediaClient()` — currently just checks `apiKey` presence
