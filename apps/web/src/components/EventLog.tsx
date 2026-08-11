import { useState } from "react";
import { useEvents, type SDKEventPayloads } from "media-react";

type LogEntry =
  | { type: "view"; payload: SDKEventPayloads["view"] }
  | { type: "download"; payload: SDKEventPayloads["download"] }
  | { type: "search"; payload: SDKEventPayloads["search"] }
  | { type: "error"; payload: SDKEventPayloads["error"] };

export function EventLog() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [open, setOpen] = useState(false);

  useEvents("view", (payload) =>
    setLogs((l) => {
      const entry: LogEntry = { type: "view", payload };
      return [entry, ...l].slice(0, 20);
    })
  );
  useEvents("download", (payload) =>
    setLogs((l) => {
      const entry: LogEntry = { type: "download", payload };
      return [entry, ...l].slice(0, 20);
    })
  );
  useEvents("search", (payload) =>
    setLogs((l) => {
      const entry: LogEntry = { type: "search", payload };
      return [entry, ...l].slice(0, 20);
    })
  );
  useEvents("error", (payload) =>
    setLogs((l) => {
      const entry: LogEntry = { type: "error", payload };
      return [entry, ...l].slice(0, 20);
    })
  );

  return (
    <div className="fixed bottom-4 right-4 z-30 w-80">
      <button
        onClick={() => setOpen(!open)}
        className="w-full bg-white border border-ink-200 rounded-2xl px-4 py-3 flex items-center justify-between text-sm text-ink-900 hover:border-amber-400 shadow-card hover:shadow-card-hover transition-all group"
      >
        <span className="flex items-center gap-2.5">
          <span className="relative flex w-2 h-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
          </span>
          <span className="font-semibold">SDK Events</span>
          <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">
            {logs.length}
          </span>
        </span>
        <svg
          className={`w-4 h-4 text-ink-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <div className="mt-2 bg-white border border-ink-200 rounded-2xl max-h-80 overflow-y-auto p-2 space-y-1 shadow-card-hover">
          {logs.length === 0 && (
            <p className="text-ink-400 text-xs p-3 text-center">
              No events yet. Interact with the app!
            </p>
          )}
          {logs.map((log, i) => (
            <div
              key={i}
              className="text-xs px-2.5 py-2 rounded-lg hover:bg-cream-100 flex items-start gap-2 transition-colors"
            >
              <span
                className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-semibold shrink-0 ${colorFor(
                  log.type
                )}`}
              >
                {log.type}
              </span>
              <span className="text-ink-700 flex-1 break-all leading-relaxed">
                {formatPayload(log)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function colorFor(type: LogEntry["type"]): string {
  switch (type) {
    case "view":
      return "bg-blue-100 text-blue-700";
    case "download":
      return "bg-green-100 text-green-700";
    case "search":
      return "bg-amber-100 text-amber-700";
    case "error":
      return "bg-red-100 text-red-700";
  }
}

function formatPayload(log: LogEntry): string {
  switch (log.type) {
    case "view":
      return `${log.payload.mediaType} #${log.payload.mediaId}`;
    case "download":
      return `${log.payload.mediaType} #${log.payload.mediaId} (${
        log.payload.quality ?? "?"
      })`;
    case "search":
      return `"${log.payload.query}" → ${log.payload.resultsCount}`;
    case "error":
      return log.payload.message;
  }
}
