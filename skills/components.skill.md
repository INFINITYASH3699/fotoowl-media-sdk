---
name: media-ui-react-components
description: Use this skill when building UI with the media-ui-react headless component library. It covers the prop-getter pattern, styling contract, accessibility, and how to correctly wire Grid, Lightbox, and ReelSwiper primitives.
when_to_use:
  - User wants to render a media grid, lightbox, or vertical reel swiper in React
  - User is confused about how "headless" components work (no shipped styles)
  - User is trying to add className, event handlers, or refs to media-ui-react components
  - User wants to build infinite-scroll, modal, or snap-scrolling UI patterns
---

# Skill: Using `media-ui-react` Headless Components

You are helping a developer render UI using the `media-ui-react` package. This package is **truly headless** — it ships **zero styles, zero markup, zero SDK knowledge**. It gives you **hooks that return prop-getters** you spread onto your own JSX.

If you find yourself importing a `<Grid>` or `<Lightbox>` component, **stop** — that's not how this library works.

---

## 🚦 Rule 0 — Boundaries (never violate)

- ❌ **NEVER** import anything from `media-core` or `media-react` in this layer. Components are data-source agnostic.
- ❌ **NEVER** expect `media-ui-react` to ship CSS, styled-components, or Tailwind. It ships behavior only.
- ❌ **NEVER** try to import a component like `import { Grid } from "media-ui-react"`. Only **hooks** are exported.
- ✅ Data comes in as **props** from the consumer. Components don't know Pexels exists.

---

## 1. The mental model — Headless / Prop-Getter pattern

Instead of shipping a styled `<Grid>` component with 40 configuration props, `media-ui-react` gives you a hook that returns **functions that produce props**:

```tsx
const { getContainerProps, getItemProps, getSentinelProps } = useGrid({ ... });

<div {...getContainerProps({ className: "grid grid-cols-3 gap-4" })}>
  {items.map((item, i) => (
    <div {...getItemProps(i, { className: "aspect-square" })}>
      {/* YOUR markup, YOUR styles */}
    </div>
  ))}
  <div {...getSentinelProps()} />
</div>
```

**Why this pattern?**

- You keep 100% control of markup, styling, and event handlers
- The hook contributes ARIA, refs, and behavior (intersection observers, keyboard nav)
- Your `className` and `onClick` merge with the hook's — they don't get clobbered

---

## 2. Available hooks

| Hook                  | Purpose                                    | Key returned                                                                                            |
| --------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| `useGrid(opts)`       | Infinite-scroll grid                       | `getContainerProps`, `getItemProps`, `getSentinelProps`                                                 |
| `useLightbox(opts)`   | Modal viewer with keyboard nav             | `getOverlayProps`, `getContentProps`, `getCloseButtonProps`, `getNextButtonProps`, `getPrevButtonProps` |
| `useReelSwiper(opts)` | Vertical snap paging with active detection | `getContainerProps`, `getItemProps`, `activeIndex`, `scrollToIndex`                                     |

Utility hooks (rarely needed directly): `useIntersectionObserver`, `useKeyDown`, `useLockBodyScroll`.

---

## 3. `useGrid` — Infinite scroll grid

### Options

```ts
useGrid({
  onLoadMore?: () => void;   // fired when sentinel enters viewport
  enabled?: boolean;          // default true — usually `hasMore && !isFetchingMore`
  rootMargin?: string;        // default "200px" — trigger BEFORE reaching bottom
});
```

### Correct usage

```tsx
import { useGrid } from "media-ui-react";

function MediaGrid({
  items,
  onLoadMore,
  hasMore,
  isFetchingMore,
  onItemClick,
}) {
  const { getContainerProps, getItemProps, getSentinelProps } = useGrid({
    onLoadMore,
    enabled: hasMore && !isFetchingMore,
    rootMargin: "400px",
  });

  return (
    <>
      <div {...getContainerProps({ className: "grid grid-cols-4 gap-3" })}>
        {items.map((item, i) => (
          <button
            {...getItemProps(i, {
              className: "aspect-square rounded overflow-hidden",
              onClick: () => onItemClick(i),
            })}
          >
            <img src={item.src.medium} alt={item.alt} />
          </button>
        ))}
      </div>

      {/* Sentinel is a separate element BELOW the grid — do not nest inside it */}
      <div
        {...getSentinelProps({
          className: "h-20 flex items-center justify-center",
        })}
      >
        {isFetchingMore && <Spinner />}
      </div>
    </>
  );
}
```

### Rules

- ✅ Pass `enabled: hasMore && !isFetchingMore` to avoid firing while already fetching or when the list is exhausted.
- ✅ Give the sentinel real height (`h-20`) — a 0-height element won't trigger the IntersectionObserver.
- ✅ Use a large `rootMargin` (`"400px"`) to preload before the user hits the bottom.
- ❌ Don't put the sentinel inside a scroll container it can't reach.
- ❌ Don't render conditionally based on `hasMore` — that unmounts the sentinel and breaks the observer.

---

## 4. `useLightbox` — Modal viewer

### Options

```ts
useLightbox({
  totalItems: number;
  index: number | null;                       // null = closed
  onIndexChange: (next: number | null) => void;
  enableKeyboard?: boolean;                   // default true — ArrowLeft/Right/Escape
  closeOnEscape?: boolean;                    // default true
});
```

Body scroll is locked automatically while open.

### Correct usage

```tsx
import { useLightbox } from "media-ui-react";

function MediaLightbox({ items, index, onIndexChange }) {
  const {
    isOpen,
    getOverlayProps,
    getContentProps,
    getCloseButtonProps,
    getNextButtonProps, // returns { disabled: !hasNext, ... }
    getPrevButtonProps,
  } = useLightbox({ totalItems: items.length, index, onIndexChange });

  if (!isOpen || index === null) return null;
  const current = items[index];

  return (
    <div
      {...getOverlayProps({ className: "fixed inset-0 bg-black/90 z-50 flex" })}
    >
      <button {...getCloseButtonProps({ className: "absolute top-4 right-4" })}>
        ✕
      </button>
      <button {...getPrevButtonProps({ className: "absolute left-4" })}>
        ‹
      </button>

      <div {...getContentProps({ className: "m-auto max-w-4xl" })}>
        <img src={current.src.large2x} alt={current.alt} />
      </div>

      <button {...getNextButtonProps({ className: "absolute right-4" })}>
        ›
      </button>
    </div>
  );
}
```

### Rules

- ✅ Overlay click auto-closes (fires only when `e.target === e.currentTarget`). Don't add your own close-on-click handler.
- ✅ `getNextButtonProps` / `getPrevButtonProps` return `disabled` — style your button for the disabled state, don't conditionally render it (screen readers need it to stay in the DOM).
- ✅ Keep the parent controlled — the hook is a pure state adapter, not a store. You own `index` state.
- ❌ Don't call `document.body.style.overflow = "hidden"` yourself — `useLockBodyScroll` is already wired.
- ❌ Don't attach your own keydown listener for Escape/Arrow keys — the hook handles it.

---

## 5. `useReelSwiper` — Vertical snap paging

### Options

```ts
useReelSwiper({
  totalItems: number;
  onActiveIndexChange?: (index: number) => void;
  threshold?: number;   // default 0.6 — item is "active" when 60% visible
});
```

### Correct usage

```tsx
import { useReelSwiper } from "media-ui-react";

function VideoReels({ items, onLoadMore, hasMore }) {
  const { activeIndex, getContainerProps, getItemProps } = useReelSwiper({
    totalItems: items.length,
    onActiveIndexChange: (i) => console.log("now viewing", i),
  });

  // Preload more when near the end
  useEffect(() => {
    if (hasMore && activeIndex >= items.length - 2) onLoadMore?.();
  }, [activeIndex, items.length, hasMore, onLoadMore]);

  return (
    <div {...getContainerProps({ className: "reel-scroll h-screen" })}>
      {items.map((item, i) => (
        <div {...getItemProps(i, { className: "reel-item h-screen" })}>
          <video src={item.video_files[0]?.link} loop muted playsInline />
        </div>
      ))}
    </div>
  );
}
```

### Required CSS (consumer supplies)

The hook does **NOT** ship scroll-snap CSS. You must add it yourself:

```css
.reel-scroll {
  scroll-snap-type: y mandatory;
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
}
.reel-item {
  scroll-snap-align: start;
  scroll-snap-stop: always;
}
```

### Rules

- ✅ Container must have a fixed height (`h-screen`, `h-[600px]`, etc.) and `overflow-y: scroll`.
- ✅ Each item must match container height so snap points align.
- ✅ Use `activeIndex` to drive side effects (play/pause videos, track analytics, preload next page).
- ❌ Don't try to override the IntersectionObserver — configure via `threshold`.
- ❌ Don't call `scrollToIndex()` inside `onActiveIndexChange` — infinite loop.

---

## 6. The styling contract

Every prop-getter accepts a user-props object. Your props **merge intelligently** with the hook's:

| What you pass                             | What happens                                                           |
| ----------------------------------------- | ---------------------------------------------------------------------- |
| `className: "..."`                        | Passed through (hook adds no default classes)                          |
| `onClick: fn`                             | Runs alongside hook's handler via `callAll` — both fire                |
| `onKeyDown: fn`                           | Runs alongside hook's handler                                          |
| `ref` (in `getSentinelProps` / reel item) | Hook needs the ref — don't override it                                 |
| `role`, `aria-*`                          | You can override, but usually don't — the hook picks sensible defaults |

```tsx
// ✅ Both your onClick AND the hook's (e.g., overlay close) fire
<div {...getOverlayProps({ onClick: (e) => console.log("clicked overlay") })} />
```

---

## 7. Accessibility (what the hooks give you for free)

| Hook            | ARIA / a11y contributed                                                                                                                          |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `useGrid`       | `role="list"` on container, `role="listitem"` + `aria-posinset` on items, `aria-hidden` on sentinel                                              |
| `useLightbox`   | `role="dialog"`, `aria-modal`, `aria-label`, focus-safe `tabIndex`, Escape/Arrow keyboard nav, body scroll lock, `disabled` state on nav buttons |
| `useReelSwiper` | `role="region"` on container, `role="group"` + `aria-roledescription="slide"` + `aria-label="Reel N of M"` on items                              |

**You are still responsible for:**

- Providing meaningful `alt` text on images
- Ensuring focus visibility styling (`focus:ring-*`)
- Color contrast on overlays / captions

---

## 8. Anti-patterns (do NOT do these)

### ❌ Trying to import styled components

```tsx
// BAD — these exports don't exist
import { Grid, Lightbox } from "media-ui-react";
```

```tsx
// GOOD — only hooks are exported
import { useGrid, useLightbox } from "media-ui-react";
```

### ❌ Not spreading the prop-getter

```tsx
// BAD — hook contributes nothing
<div className="grid">
  {items.map((item, i) => (
    <div key={i}>...</div>
  ))}
</div>
```

```tsx
// GOOD
<div {...getContainerProps({ className: "grid" })}>
  {items.map((item, i) => (
    <div {...getItemProps(i)}>...</div>
  ))}
</div>
```

### ❌ Passing data to the components

```tsx
// BAD — components don't know about Pexels
<Grid items={pexelsData} />
```

```tsx
// GOOD — YOU render the items; the hook only manages behavior
const { getContainerProps, getItemProps } = useGrid({ onLoadMore });
<div {...getContainerProps()}>{items.map(...)}</div>
```

### ❌ Conditionally rendering the sentinel or nav buttons

```tsx
// BAD — unmounts the observed element / breaks a11y
{
  hasMore && <div {...getSentinelProps()} />;
}
{
  hasNext && <button {...getNextButtonProps()}>›</button>;
}
```

```tsx
// GOOD — keep them mounted, use disabled/visibility to hide
<div {...getSentinelProps({ className: hasMore ? "block" : "hidden" })} />
<button {...getNextButtonProps()} />  {/* returns disabled=true naturally */}
```

### ❌ Duplicating behavior the hook provides

```tsx
// BAD
useEffect(() => {
  const h = (e) => e.key === "Escape" && close();
  window.addEventListener("keydown", h);
  return () => window.removeEventListener("keydown", h);
}, []);
```

```tsx
// GOOD — useLightbox already does this
useLightbox({ ..., closeOnEscape: true });  // default is true
```

---

## 9. Wiring with `media-react` (in the app layer only)

The **app** is where these two packages meet. Never import from `media-react` inside `media-ui-react` code or vice versa.

```tsx
// ✅ CORRECT — this is the app's job
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
  const lb = useLightbox({
    totalItems: data?.length ?? 0,
    index: openIdx,
    onIndexChange: setOpenIdx,
  });

  // Track view when lightbox opens
  useEffect(() => {
    if (openIdx !== null && data)
      client.trackView(data[openIdx].id, data[openIdx].type);
  }, [openIdx]);

  return <>{/* render grid + lightbox using their prop-getters */}</>;
}
```

See the `media-react-data-wiring` skill for hooks/provider details.

---

## 10. Testing checklist for AI-generated code

Before returning code to the user, verify:

- [ ] No imports from `media-core` or `media-react` inside `media-ui-react`-related files
- [ ] Every hook return value is destructured and prop-getters are actually spread (`{...getContainerProps()}`)
- [ ] Sentinel has real height and is outside conditional rendering
- [ ] Lightbox nav buttons rely on returned `disabled`, not conditional rendering
- [ ] Reel container has fixed height + `overflow-y: scroll` + snap CSS
- [ ] No manual keyboard/scroll-lock listeners duplicating hook behavior
- [ ] `className` is passed through the prop-getter, not written directly on the element
- [ ] User handlers (`onClick`) merge with hook handlers via the prop-getter, not by writing them directly on the element
