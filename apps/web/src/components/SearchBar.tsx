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
    const t = setTimeout(() => onChange(local), 350);
    return () => clearTimeout(t);
  }, [local, onChange]);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  return (
    <div className="relative">
      <svg
        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500"
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
        className="w-full pl-12 pr-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 focus:border-brand-500 focus:outline-none text-white placeholder-neutral-500 transition"
      />
      {local && (
        <button
          onClick={() => setLocal("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white p-1"
          aria-label="Clear"
        >
          ✕
        </button>
      )}
    </div>
  );
}
