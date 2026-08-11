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
          "fixed inset-0 z-50 bg-ink-900/95 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn",
      })}
    >
      {/* Close */}
      <button
        {...getCloseButtonProps({
          className:
            "absolute top-4 right-4 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-sm transition border border-white/10 z-10",
        })}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Prev */}
      <button
        {...getPrevButtonProps({
          className:
            "absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-sm transition border border-white/10 disabled:opacity-20 disabled:cursor-not-allowed z-10",
        })}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
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
            className="img-fade max-h-[75vh] w-auto object-contain rounded-2xl shadow-2xl"
          />
        ) : (
          <video
            key={current.id}
            src={current.video_files[0]?.link}
            poster={current.image}
            controls
            autoPlay
            className="img-fade max-h-[75vh] w-auto rounded-2xl shadow-2xl"
          />
        )}

        {/* Info bar */}
        <div className="flex items-center justify-between w-full max-w-3xl text-sm">
          <div>
            <p className="text-white font-semibold text-base">
              {current.type === "photo"
                ? current.photographer
                : current.user.name}
            </p>
            <p className="text-white/50 text-xs mt-0.5">
              {index! + 1} of {items.length}
            </p>
          </div>
          {current.type === "photo" && (
            <button
              onClick={() => {
                client.trackDownload(current.id, "photo", "large2x");
                window.open(current.src.original, "_blank");
              }}
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-ink-900 rounded-full text-sm font-semibold transition flex items-center gap-2 shadow-lg"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download
            </button>
          )}
        </div>
      </div>

      {/* Next */}
      <button
        {...getNextButtonProps({
          className:
            "absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-sm transition border border-white/10 disabled:opacity-20 disabled:cursor-not-allowed z-10",
        })}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  );
}
