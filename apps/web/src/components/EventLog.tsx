import { useState } from "react";
import { useEvents, type SDKEventPayloads } from "media-react";

type LogEntry =
  | { id: number; type: "view"; payload: SDKEventPayloads["view"] }
  | { id: number; type: "download"; payload: SDKEventPayloads["download"] }
  | { id: number; type: "search"; payload: SDKEventPayloads["search"] }
  | { id: number; type: "error"; payload: SDKEventPayloads["error"] };

export function EventLog() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [open, setOpen] = useState(false);

  const addLog = <T extends LogEntry["type"]>(
    type: T,
    payload: Extract<LogEntry, { type: T }>["payload"]
  ) => {
    setLogs((current) =>
      [
        {
          id: Date.now() + Math.random(),
          type,
          payload,
        } as LogEntry,
        ...current,
      ].slice(0, 20)
    );
  };

  useEvents("view", (payload) => addLog("view", payload));
  useEvents("download", (payload) => addLog("download", payload));
  useEvents("search", (payload) => addLog("search", payload));
  useEvents("error", (payload) => addLog("error", payload));

  return (
    <aside
      className={`fixed bottom-3 right-3 left-3 sm:left-auto sm:w-[360px] z-30 ${
        open ? "max-w-[calc(100vw-1.5rem)]" : "max-w-[360px]"
      }`}
      aria-label="SDK event monitor"
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="w-full rounded-2xl border border-ink-200 bg-white/95 px-4 py-3 text-left shadow-card-hover backdrop-blur-md transition hover:border-amber-400"
      >
        <span className="flex items-center justify-between gap-3">
          <span className="flex min-w-0 items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-70" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500" />
            </span>

            <span className="truncate font-semibold text-ink-900">
              SDK Events
            </span>

            <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
              {logs.length}
            </span>
          </span>

          <svg
            className={`h-4 w-4 shrink-0 text-ink-400 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              d="m6 9 6 6 6-6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      {open && (
        <div className="mt-2 max-h-[min(55vh,360px)] overflow-y-auto rounded-2xl border border-ink-200 bg-white/95 p-2 shadow-card-hover backdrop-blur-md">
          {logs.length === 0 ? (
            <p className="p-4 text-center text-xs text-ink-400">
              No events yet. Interact with the app.
            </p>
          ) : (
            <div className="space-y-1">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex min-w-0 items-start gap-2 rounded-xl px-2.5 py-2.5 hover:bg-cream-100"
                >
                  <span
                    className={`shrink-0 rounded-md px-1.5 py-1 font-mono text-[10px] font-semibold ${colorFor(
                      log.type
                    )}`}
                  >
                    {log.type}
                  </span>

                  <span className="min-w-0 flex-1 break-words text-sm leading-5 text-ink-700">
                    {formatPayload(log)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </aside>
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
      return `"${log.payload.query}" → ${log.payload.resultsCount} results`;
    case "error":
      return log.payload.message;
  }
}
