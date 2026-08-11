import { useState } from "react";
import { useSearch } from "media-react";
import { SearchBar } from "../components/SearchBar";
import { MediaGrid } from "../components/MediaGrid";
import { MediaLightbox } from "../components/MediaLightbox";

export function SearchPage() {
  const [query, setQuery] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const {
    data,
    isLoading,
    isError,
    error,
    loadMore,
    hasMore,
    isFetchingMore,
    totalResults,
  } = useSearch(query, { perPage: 20, enabled: query.length > 1 });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Search</h1>
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Try nature, food, travel..."
          autoFocus
        />
        {query && data && (
          <p className="text-neutral-400 text-sm mt-3">
            {totalResults.toLocaleString()} results for “{query}”
          </p>
        )}
      </div>

      {!query && (
        <div className="text-center py-20 text-neutral-500">
          <p className="text-lg mb-2">Start typing to search</p>
          <p className="text-sm">Powered by Pexels</p>
        </div>
      )}

      {isLoading && <SkeletonGrid />}

      {isError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-300">
          Search failed: {error?.message}
        </div>
      )}

      {data && data.length === 0 && !isLoading && (
        <p className="text-neutral-500 text-center py-20">
          No results found for “{query}”
        </p>
      )}

      {data && data.length > 0 && (
        <>
          <MediaGrid
            items={data}
            onItemClick={setOpenIndex}
            onLoadMore={loadMore}
            hasMore={hasMore}
            isFetchingMore={isFetchingMore}
          />
          <MediaLightbox
            items={data}
            index={openIndex}
            onIndexChange={setOpenIndex}
          />
        </>
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
