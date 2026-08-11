# Components Documentation

The `media-ui-react` package. Headless UI primitives — hooks that return prop-getters. **Zero shipped styles, zero SDK knowledge.**

> For AI-tool usage guidance, see [`skills/components.skill.md`](https://github.com/<your-username>/fotoowl-media-sdk/blob/main/skills/components.skill.md).

---

## The mental model

This package exports **hooks**, not components. Each hook returns functions that produce props. You spread them onto your own JSX:

```tsx
const { getContainerProps, getItemProps } = useGrid({ onLoadMore });

<div {...getContainerProps({ className: "my-grid" })}>
  {items.map((item, i) => (
    <div {...getItemProps(i, { onClick: () => open(i) })}>
      {/* Your markup. Your styles. Your callbacks. */}
    </div>
  ))}
</div>
```

**What the hook contributes:** ARIA attributes, refs (for intersection observers etc.), and default behavior handlers.
**What you keep:** All markup, all styling, all data.

---

## 1. `useGrid` — Infinite-scroll container

```tsx
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
```

### Options

| Option | Type | Default | Notes |
|---|---|---|---|
| `onLoadMore` | `() => void` | — | Called when the sentinel enters the viewport |
| `enabled` | `boolean` | `true` | Guard against firing while loading or after end |
| `rootMargin` | `string` | `"200px"` | Standard IntersectionObserver margin |

### Prop-getters

| Getter | Contributes | Notes |
|---|---|---|
| `getContainerProps(userProps?)` | `role="list"` | Spread on the grid container |
| `getItemProps(index, userProps?)` | `role="listitem"`, `aria-posinset`, `key` | Spread on each item |
| `getSentinelProps(userProps?)` | `ref`, `aria-hidden` | Spread on a below-grid trigger element (needs real height, e.g., `h-20`) |

### Example

```tsx
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
```

---

## 2. `useLightbox` — Modal viewer with keyboard nav

```tsx
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
```

### Options

| Option | Type | Default | Notes |
|---|---|---|---|
| `totalItems` | `number` | — | Required — bounds nav |
| `index` | `number \| null` | — | `null` = closed |
| `onIndexChange` | `(next: number \| null) => void` | — | Controlled state pattern |
| `enableKeyboard` | `boolean` | `true` | ArrowLeft, ArrowRight, Escape |
| `closeOnEscape` | `boolean` | `true` | |

### Built-in behavior

- Body scroll locked while `isOpen`
- `ArrowLeft` / `ArrowRight` navigate items
- `Escape` closes (if enabled)
- Overlay backdrop click closes (fires only when `target === currentTarget`)
- Next / Prev buttons return `disabled: true` at the boundaries — style the disabled state; don't conditionally render (screen readers need them present)

### Example

```tsx
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
```

---

## 3. `useReelSwiper` — Vertical snap paging

```tsx
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
```

### Options

| Option | Type | Default | Notes |
|---|---|---|---|
| `totalItems` | `number` | — | Required |
| `onActiveIndexChange` | `(index: number) => void` | — | Fires when active item changes |
| `threshold` | `number` | `0.6` | IntersectionRatio needed to become active |

### Required CSS (consumer supplies)

The hook does **NOT** ship scroll-snap CSS:

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

### Example

```tsx
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
```

Preload the next page when nearing the end:

```tsx
useEffect(() => {
  if (hasMore && activeIndex >= items.length - 2) loadMore();
}, [activeIndex, items.length]);
```

---

## 4. Utility hooks (exported for advanced use)

| Hook | Purpose |
|---|---|
| `useIntersectionObserver(ref, cb, opts?)` | Fires when the target enters the viewport |
| `useKeyDown(handler, enabled?)` | Global keydown listener while enabled |
| `useLockBodyScroll(enabled)` | Prevents background scroll while enabled |

---

## 5. Utility helpers

| Helper | Purpose |
|---|---|
| `mergeRefs(...refs)` | Combine multiple refs for a single node |
| `callAll(...fns)` | Combine multiple handlers (user's runs alongside hook's) |
| `cx(...classes)` | Tiny classname joiner |

`callAll` is what makes prop-getters merge cleanly — your `onClick` runs alongside the hook's default handler.

---

## 6. Accessibility summary

| Hook | Contributes for free |
|---|---|
| `useGrid` | `role="list"`, `role="listitem"`, `aria-posinset`, `aria-hidden` on sentinel |
| `useLightbox` | `role="dialog"`, `aria-modal`, `aria-label`, `tabIndex`, Escape/Arrow nav, scroll lock, `disabled` on nav buttons at edges |
| `useReelSwiper` | `role="region"`, `role="group"`, `aria-roledescription="slide"`, `aria-label="Reel N of M"` |

**You are still responsible for:**

- Meaningful alt text on images
- Visible focus indicators (`focus:ring-*`)
- Adequate color contrast

---

## 7. Wiring with `media-react`

The app is where UI meets data. `media-ui-react` never imports `media-react` or `media-core` — data flows in as props:

```tsx
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
```

That's it. Both packages stay independently swappable.
