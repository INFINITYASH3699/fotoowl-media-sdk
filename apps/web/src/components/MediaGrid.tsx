import { useGrid } from "media-ui-react";
import type { MediaItem } from "media-react";

interface MediaGridProps {
  items: MediaItem[];
  onLoadMore: () => void;
  hasMore: boolean;
  isFetchingMore: boolean;
  onItemClick: (index: number) => void;
}

export function MediaGrid({
  items,
  onLoadMore,
  hasMore,
  isFetchingMore,
  onItemClick,
}: MediaGridProps) {
  const { getContainerProps, getItemProps, getSentinelProps } = useGrid({
    onLoadMore,
    enabled: hasMore && !isFetchingMore,
    rootMargin: "400px",
  });

  return (
    <>
      <div
        {...getContainerProps({
          className:
            "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4",
        })}
      >
        {items.map((item, index) => (
          <button
            {...getItemProps(index, {
              className:
                "group relative aspect-square overflow-hidden rounded-2xl bg-cream-200 cursor-pointer shadow-card hover:shadow-card-hover transition-shadow duration-300 ring-1 ring-ink-200/50 hover:ring-amber-400/50",
              onClick: () => onItemClick(index),
            })}
          >
            {item.type === "photo" ? (
              <img
                src={item.src.medium}
                alt={item.alt || item.photographer}
                loading="lazy"
                className="img-fade w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                style={{ backgroundColor: item.avg_color }}
              />
            ) : (
              <>
                <img
                  src={item.image}
                  alt={item.user.name}
                  loading="lazy"
                  className="img-fade w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 right-2 bg-ink-900/80 text-white text-xs px-2 py-1 rounded-full backdrop-blur font-medium flex items-center gap-1">
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                  {formatDuration(item.duration)}
                </div>
              </>
            )}
            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-ink-900/85 via-ink-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-white text-xs font-medium truncate">
                {item.type === "photo" ? item.photographer : item.user.name}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Sentinel triggers loadMore */}
      <div
        {...getSentinelProps({
          className: "h-24 flex items-center justify-center mt-8",
        })}
      >
        {isFetchingMore && (
          <div className="flex items-center gap-2 text-ink-500 text-sm">
            <div className="w-4 h-4 border-2 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
            Loading more...
          </div>
        )}
        {!hasMore && items.length > 0 && (
          <p className="text-ink-400 text-sm">— End of results —</p>
        )}
      </div>
    </>
  );
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
