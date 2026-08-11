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
            "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3",
        })}
      >
        {items.map((item, index) => (
          <button
            {...getItemProps(index, {
              className:
                "group relative aspect-square overflow-hidden rounded-lg bg-neutral-900 cursor-pointer",
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
                <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur">
                  ▶ {formatDuration(item.duration)}
                </div>
              </>
            )}
            <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition">
              <p className="text-white text-xs truncate">
                {item.type === "photo" ? item.photographer : item.user.name}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Sentinel triggers loadMore */}
      <div
        {...getSentinelProps({
          className: "h-20 flex items-center justify-center mt-6",
        })}
      >
        {isFetchingMore && (
          <div className="flex items-center gap-2 text-neutral-400 text-sm">
            <div className="w-4 h-4 border-2 border-neutral-600 border-t-white rounded-full animate-spin" />
            Loading more...
          </div>
        )}
        {!hasMore && items.length > 0 && (
          <p className="text-neutral-600 text-sm">— End of results —</p>
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
