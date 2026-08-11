import { useState } from "react";
import { useVideo } from "media-react";
import { VideoReels } from "../components/VideoReels";
import { SearchBar } from "../components/SearchBar";

export function ReelsPage() {
  const [query, setQuery] = useState("");
  const { data, isLoading, isError, error, loadMore, hasMore } = useVideo(
    query,
    {
      perPage: 10,
    }
  );

  return (
    <div className="relative">
      {/* Floating search bar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-full max-w-md px-4">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search videos... (or leave blank for popular)"
        />
      </div>

      {isLoading && (
        <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-neutral-700 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {isError && (
        <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-300">
            Failed to load videos: {error?.message}
          </div>
        </div>
      )}

      {data && data.length > 0 && (
        <VideoReels items={data} onLoadMore={loadMore} hasMore={hasMore} />
      )}

      {data && data.length === 0 && !isLoading && (
        <div className="h-[calc(100vh-4rem)] flex items-center justify-center text-neutral-500">
          No videos found
        </div>
      )}
    </div>
  );
}
