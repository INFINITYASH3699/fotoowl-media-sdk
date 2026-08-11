import { useState, useEffect } from "react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search photos...",
  autoFocus = false,
}: SearchBarProps) {
  const [local, setLocal] = useState(value);

  // Debounce input
  useEffect(() => {
    const t = setTimeout(() => onChange(local), 600);
    return () => clearTimeout(t);
  }, [local, onChange]);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  return (
    <div className="relative group">
      <svg
        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400 group-focus-within:text-amber-500 transition-colors"
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
      <input
        autoFocus={autoFocus}
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-12 pr-12 py-3.5 rounded-full bg-white border border-ink-200 focus:border-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-400/15 text-ink-900 placeholder-ink-400 shadow-card transition-all"
      />
      {local && (
        <button
          onClick={() => setLocal("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-cream-200 hover:bg-ink-200 text-ink-500 hover:text-ink-900 flex items-center justify-center transition"
          aria-label="Clear"
        >
          <svg
            className="w-3.5 h-3.5"
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
      )}
    </div>
  );
}
