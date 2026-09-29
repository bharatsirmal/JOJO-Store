"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useState } from "react";

export function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams?.get("q") || "");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (query.trim()) {
      params.set("q", query.trim());
    } else {
      params.delete("q");
    }
    router.push(`/products?${params.toString()}`);
  };

  return (
    <form 
      onSubmit={handleSearch}
      role="search"
      className="flex min-h-11 items-center gap-2 border border-slate-200 rounded-full px-4 py-2 focus-within:border-slate-400 focus-within:ring-1 focus-within:ring-slate-400 transition-all bg-white"
    >
      <Search className="w-4 h-4 text-slate-400" />
      <input 
        type="text" 
        aria-label="Search pieces"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search pieces" 
        className="outline-none bg-transparent text-sm w-32 sm:w-48 placeholder:text-slate-400 text-slate-800"
      />
    </form>
  );
}
