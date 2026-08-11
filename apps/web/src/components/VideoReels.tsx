import { useEffect, useRef } from "react";
import { useReelSwiper } from "media-ui-react";
import { useMediaClient, type MediaItem } from "media-react";

interface VideoReelsProps {
  items: MediaItem[];
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export function VideoReels({ items, onLoadMore, hasMore }: VideoReelsProps) {
  const client = useMediaClient();
  const videosRef = useRef<Map<number, HTMLVideoElement>>(new Map());

  const { activeIndex, getContainerProps, getItemProps } = useReelSwiper({
    totalItems: items.length,
    onActiveIndexChange: (i) => {
      const item = items[i];
      if (item) client.trackView(item.id, item.type);
    },
  });

  // Auto play active, pause others
  useEffect(() => {
    videosRef.current.forEach((v, idx) => {
      if (idx === activeIndex) {
        v.play().catch(() => {});
      } else {
        v.pause();
        v.currentTime = 0;
      }
    });
  }, [activeIndex]);

  // Trigger loadMore when near the end
  useEffect(() => {
    if (hasMore && onLoadMore && activeIndex >= items.length - 2) {
      onLoadMore();
    }
  }, [activeIndex, items.length, hasMore, onLoadMore]);

  return (
    <div
      {...getContainerProps({
        className: "reel-scroll h-[calc(100vh-4rem)] w-full",
      })}
    >
      {items.map((item, index) => {
        if (item.type !== "video") return null;
        const videoUrl =
          item.video_files.find((f) => f.quality === "hd")?.link ??
          item.video_files[0]?.link;

        return (
          <div
            {...getItemProps(index, {
              className:
                "reel-item relative h-[calc(100vh-4rem)] w-full flex items-center justify-center bg-black",
            })}
          >
            <video
              ref={(el) => {
                if (el) videosRef.current.set(index, el);
                else videosRef.current.delete(index);
              }}
              src={videoUrl}
              poster={item.image}
              loop
              muted
              playsInline
              className="max-h-full max-w-full object-contain"
            />

            {/* Overlay info */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
              <div className="max-w-lg">
                <p className="text-white font-semibold text-lg mb-1">
                  {item.user.name}
                </p>
                <p className="text-neutral-300 text-sm">
                  {formatDuration(item.duration)} · Reel {index + 1}/
                  {items.length}
                </p>
              </div>
            </div>

            {/* Active indicator */}
            <div className="absolute top-4 right-4 flex flex-col gap-1">
              {items.slice(0, Math.min(items.length, 10)).map((_, i) => (
                <div
                  key={i}
                  className={`w-1 h-6 rounded-full ${
                    i === activeIndex ? "bg-white" : "bg-white/30"
                  }`}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
