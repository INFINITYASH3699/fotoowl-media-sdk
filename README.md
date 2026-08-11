# FotoOwl Media SDK

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

```
apps/web (React app)
│
├──▶ media-react ──▶ media-core (data / auth / events)
│
└──▶ media-ui-react (headless UI primitives)
```

**Enforced rules (verified by import audit):**

- `media-core` — pure TypeScript, zero React, zero DOM, zero React Native
- `media-react` — the **only** package that imports `media-core`
- `media-ui-react` — imports **nothing** from core or wrappers (data-source agnostic)
- `apps/web` — the **only** place that imports both `media-react` and `media-ui-react`

See [`docs/architecture.md`](./docs/architecture.md) for the full breakdown.

---

## 📦 Packages

| Package | Purpose | Depends on |
|---|---|---|
| `packages/media-core` | Pexels client, event emitter, cache, typed errors | *(nothing)* |
| `packages/media-react` | React provider + hooks (`useSearch`, `useCurated`, `useVideo`, `useMedia`, `useEvents`) | `media-core`, `react` |
| `packages/media-ui-react` | Headless prop-getter hooks (`useGrid`, `useLightbox`, `useReelSwiper`) | `react` |
| `packages/media-native` | React Native wrapper stub *(interface parity — see "Scoping" below)* | `media-core`, `react-native` |
| `packages/media-ui-native` | React Native headless UI stub | `react-native` |
| `apps/web` | Vite + React demo — Discover / Search / Reels | `media-react`, `media-ui-react` |

---

## 🚀 Getting started

### Prerequisites
- Node.js ≥ 18
- pnpm ≥ 9
- A [Pexels API key](https://www.pexels.com/api/) (free)

### Install & run

```bash
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
```

App runs at http://localhost:3000

### Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Run the web app (Vite, port 3000) |
| `pnpm build:pkgs` | Build all SDK packages (tsup) |
| `pnpm build:app` | Build the web app for production |
| `pnpm build` | Build everything |
| `pnpm typecheck` | Type-check every workspace |

---

## 🎯 Features shipped

- ✅ Pexels client with typed responses, error mapping, and in-memory caching + request de-duplication
- ✅ Event system (`view`, `download`, `search`, `error`) with default console logger + subscribe hook
- ✅ Paginated search & curated feeds with infinite scroll
- ✅ Photo lightbox with keyboard navigation (Arrow keys, Escape) and focus-safe overlay
- ✅ Video reels with vertical scroll-snap + active-item detection + autoplay of active
- ✅ Live event log panel in the app (bottom-right) showing SDK activity in real time
- ✅ Two AI-tool skill docs (`skills/data-wiring.skill.md`, `skills/components.skill.md`)
- ✅ Rendered docs pages served at `/docs/sdk` and `/docs/components`

---

## 🤖 AI-assisted workflow

Per the task's explicit encouragement to use AI coding tools, this project was built with an **AI-pair workflow using Arena's Max model**.

### What that looked like in practice

| Layer | My role | AI's role |
|---|---|---|
| **Architecture** | Defined the four-layer boundary rules, dependency direction, monorepo shape, and package contracts | Suggested naming refinements, validated the boundaries against the task's constraints |
| **`media-core`** | Specified the API surface (event names, cache semantics, error taxonomy) | Drafted the emitter, cache with single-flight de-dupe, and normalized response shapes |
| **`media-react`** | Decided the hook shape (`MediaListState`, options object convention, `enabled` gating) | Generated reducer-based state machines, request-id stale-response guards |
| **`media-ui-react`** | Chose the headless prop-getter pattern over compound components; specified which behaviors belong in hooks vs consumer CSS | Implemented prop-getters, `callAll` merging, IntersectionObserver-based active detection |
| **`apps/web`** | Decided the three-page structure, Tailwind styling direction, event log UX | Generated grid/lightbox/reel components, Tailwind classes, page layout |
| **Skill docs** | Defined the format, boundaries, and what "correct output" looks like | Drafted the anti-pattern examples; I tested them by asking the same AI to build a feature without the skill vs with it |
| **Review pass** | Read every file, tightened types (`Required<SDKConfig>`, `noUncheckedIndexedAccess`), removed leaks, fixed edge cases | — |

### How the skill docs were tested

Both `skills/*.md` files were validated by running the **"before / after" test**:

1. Fresh AI session, no skill loaded → asked "build a search page with infinite scroll using `media-react` + `media-ui-react`".
2. Observed common failures: hardcoded API keys, direct `media-core` imports, conditional hooks, custom fetch calls, styled-component-style imports (`<Grid />`).
3. Loaded the two skill files, repeated the prompt.
4. Output shifted to correctly use `MediaProvider`, `useSearch` with `enabled` gating, prop-getter spreading, and the sentinel pattern.

The specific anti-patterns documented in each skill are the ones the AI got wrong without them — that's how I know they're pulling weight.

---

## 🧭 Scoping decisions & trade-offs

Under the ~8–12 hr budget, these were the intentional cuts. See [`docs/decisions.md`](./docs/decisions.md) for the full log.

| Kept | Cut / Deferred | Why |
|---|---|---|
| Full `media-core` + `media-react` + `media-ui-react` + working web app | Full React Native wrapper implementation (kept as typed stubs) | The task's evaluation criteria weight architecture and boundaries highest — proving the boundary contract with real code in one platform is more valuable than half-implementing two. Native stubs preserve the workspace shape and prove the contract is portable. |
| Real headless prop-getter pattern with prop merging (`callAll`) | Storybook / TypeDoc for docs | Two Markdown-rendered docs pages served at `/docs/*` deliver the same reviewability without the tooling tax. |
| Keyboard nav, focus lock, scroll lock, ARIA on Lightbox | Full focus-trap library (only trap the initial focus) | Native browser Tab handling + `aria-modal` covers 90% of the use case; a full trap wasn't worth the dep for a take-home. |
| In-memory cache with single-flight de-dupe | Persistent (localStorage) cache, background refetch | Cache is a `Map` behind an interface — swapping in a persistent adapter later is a one-file change. |
| Live event log panel in the app | Unit tests | Time budget. The event contract is small and used by the visible log — regressions would be immediately obvious. Tests are the first thing I'd add in a follow-up PR. |

---

## 📁 Repo layout

```
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
```

---

## 📝 License

MIT — built for evaluation purposes as part of the FotoOwl React Developer take-home.
