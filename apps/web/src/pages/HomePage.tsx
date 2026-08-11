import { useState } from "react";
import { useCurated } from "media-react";
import { MediaGrid } from "../components/MediaGrid";
import { MediaLightbox } from "../components/MediaLightbox";

export function HomePage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { data, isLoading, isError, error, loadMore, hasMore, isFetchingMore } =
    useCurated({ perPage: 20 });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold uppercase tracking-wider mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          Live from Pexels
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-ink-900 mb-3">
          Discover the world in{" "}
          <span className="text-amber-500">every frame</span>
        </h1>
        <p className="text-ink-500 text-lg max-w-2xl">
          AI-powered photography, sports media, and visual commerce — curated
          for creators, agencies, and brands.
        </p>
      </div>

      {isLoading && <SkeletonGrid />}

      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-sm">
          <strong className="font-semibold">Failed to load photos:</strong>{" "}
          {error?.message}
        </div>
      )}

      {data && (
        <MediaGrid
          items={data}
          onItemClick={setOpenIndex}
          onLoadMore={loadMore}
          hasMore={hasMore}
          isFetchingMore={isFetchingMore}
        />
      )}

      {data && (
        <MediaLightbox
          items={data}
          index={openIndex}
          onIndexChange={setOpenIndex}
        />
      )}
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Array.from({ length: 15 }).map((_, i) => (
        <div
          key={i}
          className="aspect-square bg-cream-200 rounded-2xl animate-pulse"
        />
      ))}
    </div>
  );
}
