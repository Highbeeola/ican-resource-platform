"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, X, Loader2 } from "lucide-react";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(searchParams.get("q") || "");

  function handleInputChange(value: string) {
    setQuery(value);

    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) {
        params.set("q", value.trim());
      } else {
        params.delete("q");
      }
      router.push(`/resources?${params.toString()}`);
    });
  }

  function handleClear() {
    setQuery("");
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("q");
      router.push(`/resources?${params.toString()}`);
    });
  }

  return (
    <div className="relative flex-1 max-w-md w-full">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input
        type="text"
        value={query}
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder="Search subjects, pathfinders, or past questions..."
        className="w-full pl-10 pr-10 py-2.5 bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
      />
      {isPending ? (
        <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400 animate-spin" />
      ) : query ? (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      ) : null}
    </div>
  );
}
