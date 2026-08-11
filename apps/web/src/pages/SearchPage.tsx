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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-ink-900 mb-1">
          Search
        </h1>
        <p className="text-ink-500 mb-6">
          Find any photo across millions on Pexels.
        </p>
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Try 'sunset', 'mountains', 'coffee'..."
          autoFocus
        />
        {query && data && (
          <p className="text-ink-500 text-sm mt-3">
            <span className="font-semibold text-ink-900">
              {totalResults.toLocaleString()}
            </span>{" "}
            results for{" "}
            <span className="font-semibold text-amber-600">
              &ldquo;{query}&rdquo;
            </span>
          </p>
        )}
      </div>

      {!query && (
        <div className="text-center py-24">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-100 mb-4">
            <svg
              className="w-8 h-8 text-amber-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <p className="text-ink-700 text-lg font-medium mb-1">
            Start typing to search
          </p>
          <p className="text-ink-400 text-sm">Powered by Pexels API</p>
        </div>
      )}

      {isLoading && <SkeletonGrid />}

      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-sm">
          <strong className="font-semibold">Search failed:</strong>{" "}
          {error?.message}
        </div>
      )}

      {data && data.length === 0 && !isLoading && (
        <div className="text-center py-24 text-ink-500">
          <p className="text-lg">
            No results for{" "}
            <span className="font-semibold text-ink-900">
              &ldquo;{query}&rdquo;
            </span>
          </p>
          <p className="text-sm mt-1">Try a different keyword</p>
        </div>
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
