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
        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2 flex items-center justify-between text-sm text-white hover:bg-neutral-800 transition"
      >
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          SDK Events ({logs.length})
        </span>
        <span>{open ? "▼" : "▲"}</span>
      </button>

      {open && (
        <div className="mt-2 bg-neutral-900 border border-neutral-800 rounded-lg max-h-80 overflow-y-auto p-2 space-y-1">
          {logs.length === 0 && (
            <p className="text-neutral-500 text-xs p-2">
              No events yet. Interact with the app!
            </p>
          )}
          {logs.map((log, i) => (
            <div
              key={i}
              className="text-xs px-2 py-1.5 rounded bg-neutral-800/50 flex items-start gap-2"
            >
              <span
                className={`px-1.5 py-0.5 rounded font-mono text-[10px] ${colorFor(
                  log.type
                )}`}
              >
                {log.type}
              </span>
              <span className="text-neutral-300 flex-1 break-all">
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
      return "bg-blue-500/20 text-blue-300";
    case "download":
      return "bg-green-500/20 text-green-300";
    case "search":
      return "bg-purple-500/20 text-purple-300";
    case "error":
      return "bg-red-500/20 text-red-300";
  }
}

function formatPayload(log: LogEntry): string {
  switch (log.type) {
    case "view":
      return `${log.payload.mediaType} #${log.payload.mediaId}`;
    case "download":
      return `${log.payload.mediaType} #${log.payload.mediaId} (${log.payload.quality ?? "?"})`;
    case "search":
      return `"${log.payload.query}" → ${log.payload.resultsCount}`;
    case "error":
      return log.payload.message;
  }
}