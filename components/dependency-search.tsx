"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { searchPackages } from "@/lib/api";

interface DependencySearchProps {
  onSelect: (pkg: string) => void;
  selected: string[];
}

export function DependencySearch({ onSelect, selected }: DependencySearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const doSearch = useCallback(
    async (q: string) => {
      if (q.length < 1) {
        setResults([]);
        setOpen(false);
        return;
      }
      setLoading(true);
      try {
        const data = await searchPackages(q, 15);
        const filtered = data.results.filter((r) => !selected.includes(r));
        setResults(filtered);
        setOpen(filtered.length > 0);
        setHighlightIndex(-1);
      } catch {
        setResults([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    },
    [selected]
  );

  const handleChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(value), 250);
  };

  const handleSelect = (pkg: string) => {
    onSelect(pkg);
    setQuery("");
    setResults([]);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && highlightIndex >= 0) {
      e.preventDefault();
      handleSelect(results[highlightIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search PyPI packages..."
          className="bg-secondary border-border text-foreground pl-8 pr-8 placeholder:text-muted-foreground"
        />
        {loading && (
          <Loader2 className="absolute right-2.5 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>
      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border border-border bg-popover shadow-lg">
          <ul className="max-h-48 overflow-y-auto py-1">
            {results.map((pkg, i) => (
              <li key={pkg}>
                <button
                  type="button"
                  className={`flex w-full items-center px-3 py-1.5 text-sm transition-colors ${
                    i === highlightIndex
                      ? "bg-accent text-accent-foreground"
                      : "text-popover-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                  onClick={() => handleSelect(pkg)}
                  onMouseEnter={() => setHighlightIndex(i)}
                >
                  <span className="font-mono text-xs">{pkg}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
