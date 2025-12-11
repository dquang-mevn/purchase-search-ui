"use client";

import { fullTextSearchTitle } from "@/lib/db";
import Image from "next/image";
import { useState, useEffect } from "react";

// Define the shape of our data
interface SearchResult {
  item_id: string;
  title: string;
  image_url?: string | null;
  category?: string | null;
  bought?: string | null;
}

export default function FulltextSearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  // Debounce Logic: Keep track of the "delayed" query
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  // 1. Update debouncedQuery only after user stops typing for 500ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  // 2. Trigger the API call when the debounced query changes
  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const items = await fullTextSearchTitle(debouncedQuery);
        setResults(items || []);
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header & Search Bar */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Fulltext Search
          </h1>
          <div className="relative max-w-xl mx-auto">
            <input
              type="text"
              placeholder="Search by title, category, or ID..."
              className="w-full p-2 pl-6 rounded border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {loading && (
              <div className="absolute right-4 top-4">
                {/* Simple CSS Spinner */}
                <div className="animate-spin h-6 w-6 border-2 border-blue-500 rounded-full border-t-transparent"></div>
              </div>
            )}
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((item) => (
            <div
              key={item.item_id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col"
            >
              {/* Image Section */}
              <div className="h-48 w-full bg-gray-200 relative">
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    width={150}
                    height={150}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No Image
                  </div>
                )}
                <span className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {item.category}
                </span>
              </div>

              {/* Content Section */}
              <div className="p-4 flex flex-col grow">
                <h3
                  className="font-semibold text-gray-800 text-lg mb-2 line-clamp-2"
                  title={item.title}
                >
                  {item.title}
                </h3>

                <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
                  <span>ID: {item.item_id}</span>
                  <span>Bought: {item.bought}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {!loading && query.length > 1 && results.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-xl">No items found matching [{query}]</p>
          </div>
        )}

        {/* Initial State */}
        {!query && (
          <div className="text-center py-20 text-gray-400">
            <p>Type something above to start searching...</p>
          </div>
        )}
      </div>
    </div>
  );
}
