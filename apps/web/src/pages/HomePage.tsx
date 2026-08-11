import { useState } from "react";
import { useCurated } from "media-react";
import { MediaGrid } from "../components/MediaGrid";
import { MediaLightbox } from "../components/MediaLightbox";

export function HomePage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { data, isLoading, isError, error, loadMore, hasMore, isFetchingMore } =
    useCurated({ perPage: 20 });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Discover</h1>
        <p className="text-neutral-400 mt-1">Curated photos from Pexels</p>
      </div>

      {isLoading && <SkeletonGrid />}

      {isError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-300">
          Failed to load photos: {error?.message}
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
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {Array.from({ length: 15 }).map((_, i) => (
        <div
          key={i}
          className="aspect-square bg-neutral-900 rounded-lg animate-pulse"
        />
      ))}
    </div>
  );
}
