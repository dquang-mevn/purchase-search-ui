"use client";

import { useState } from "react";

import { SearchResults } from "@/components/search-results";
import { useSearchApi } from "@/hooks/use-search";
import { ProductRecord } from "@/common/search-api.types";
import { SearchForm3 } from "@/components/search-form-3";

export default function Search() {
  const [results, setResults] = useState<ProductRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTime, setSearchTime] = useState<number>();

  const { search } = useSearchApi();

  // State for SearchForm2 values (to allow test case fill)
  const [formQuery, setFormQuery] = useState<string>("");
  const [formSearchType, setFormSearchType] = useState<string>("semantic");
  const [formSemanticQuery, setFormSemanticQuery] = useState<string>("");
  const [formSearchParams, setFormSearchParams] = useState<
    { id: string; field: string; operator: string; value: string }[]
  >([{ id: "1", field: "", operator: "", value: "" }]);
  const [formSortBy, setFormSortBy] = useState<string>("");
  const [formSortOrder, setFormSortOrder] = useState<string>("asc");
  const [formLimit, setFormLimit] = useState<string>("10");

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    const startTime = performance.now();
    try {
      const data = await search(query);
      setResults(data.results || []);
      const endTime = performance.now();
      setSearchTime(endTime - startTime);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
      setSearchTime(undefined);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-6 py-4">
          <div className="text-center space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">
              Product Search Demo
            </h1>
            <p className="text-sm text-muted-foreground">
              Dynamically search through product data with multiple parameters
            </p>
          </div>
        </div>
      </div>

      {/* Main Content - Side by Side Layout */}
      <div className="flex h-[calc(100vh-120px)]">
        {/* Left Panel - Search Form */}
        <div className="w-1/4 border-r bg-muted/30 p-6 overflow-y-auto">
          <SearchForm3
            onSearch={handleSearch}
            isLoading={isLoading}
            // Controlled props for test case fill
            query={formQuery}
            setQuery={setFormQuery}
            searchType={formSearchType}
            setSearchType={setFormSearchType}
            semanticQuery={formSemanticQuery}
            setSemanticQuery={setFormSemanticQuery}
            searchParams={formSearchParams}
            setSearchParams={setFormSearchParams}
            sortBy={formSortBy}
            setSortBy={setFormSortBy}
            sortOrder={formSortOrder}
            setSortOrder={setFormSortOrder}
            limit={formLimit}
            setLimit={setFormLimit}
          />
        </div>

        {/* Center area - Search Results */}
        <div className="w-3/4 p-6 overflow-y-auto">
          <SearchResults
            results={results}
            isLoading={isLoading}
            searchTime={searchTime}
          />
        </div>
      </div>
    </div>
  );
}
