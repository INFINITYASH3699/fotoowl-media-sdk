import { useEffect } from "react";
import { useLightbox } from "media-ui-react";
import { useMediaClient, type MediaItem } from "media-react";

interface MediaLightboxProps {
  items: MediaItem[];
  index: number | null;
  onIndexChange: (i: number | null) => void;
}

export function MediaLightbox({
  items,
  index,
  onIndexChange,
}: MediaLightboxProps) {
  const client = useMediaClient();
  const {
    isOpen,
    hasNext,
    hasPrev,
    getOverlayProps,
    getContentProps,
    getCloseButtonProps,
    getNextButtonProps,
    getPrevButtonProps,
  } = useLightbox({
    totalItems: items.length,
    index,
    onIndexChange,
  });

  const current = index !== null ? items[index] : null;

  // Track view whenever the visible item changes
  useEffect(() => {
    if (current) client.trackView(current.id, current.type);
  }, [current, client]);

  if (!isOpen || !current) return null;

  return (
    <div
      {...getOverlayProps({
        className:
          "fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn",
      })}
    >
      {/* Close button */}
      <button
        {...getCloseButtonProps({
          className:
            "absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur transition",
        })}
      >
        ✕
      </button>

      {/* Prev */}
      <button
        {...getPrevButtonProps({
          className:
            "absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur transition disabled:opacity-20 disabled:cursor-not-allowed",
        })}
      >
        ‹
      </button>

      {/* Content */}
      <div
        {...getContentProps({
          className:
            "relative max-w-6xl w-full max-h-[85vh] flex flex-col items-center gap-4",
        })}
      >
        {current.type === "photo" ? (
          <img
            src={current.src.large2x}
            alt={current.alt || current.photographer}
            className="img-fade max-h-[75vh] w-auto object-contain rounded-lg shadow-2xl"
          />
        ) : (
          <video
            key={current.id}
            src={current.video_files[0]?.link}
            poster={current.image}
            controls
            autoPlay
            className="img-fade max-h-[75vh] w-auto rounded-lg shadow-2xl"
          />
        )}

        {/* Info bar */}
        <div className="flex items-center justify-between w-full max-w-3xl text-sm text-neutral-400">
          <div>
            <p className="text-white font-medium">
              {current.type === "photo"
                ? current.photographer
                : current.user.name}
            </p>
            <p className="text-xs">
              {index! + 1} of {items.length}
            </p>
          </div>
          {current.type === "photo" && (
            <button
              onClick={() => {
                client.trackDownload(current.id, "photo", "large2x");
                window.open(current.src.original, "_blank");
              }}
              className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-neutral-200 transition"
            >
              Download
            </button>
          )}
        </div>
      </div>

      {/* Next */}
      <button
        {...getNextButtonProps({
          className:
            "absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur transition disabled:opacity-20 disabled:cursor-not-allowed",
        })}
      >
        ›
      </button>
    </div>
  );
}
