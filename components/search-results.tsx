"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProductRecord } from "@/common/search-api.types";
import ItemListBlock from "./ItemListBlock";

interface SearchResultsProps {
  results: ProductRecord[];
  isLoading?: boolean;
  searchTime?: number;
}

export function SearchResults({
  results,
  isLoading = false,
  searchTime,
}: SearchResultsProps) {
  if (isLoading) {
    return (
      <Card className="w-full h-full flex flex-col">
        <CardHeader>
          <CardTitle>Search Results</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-muted-foreground">Searching products...</div>
        </CardContent>
      </Card>
    );
  }

  if (results.length === 0) {
    return (
      <Card className="w-full h-full flex flex-col">
        <CardHeader>
          <CardTitle>Search Results</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <div>No products found</div>
            <div className="text-sm mt-1">
              Try adjusting your search parameters
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="shrink-0">
        <CardTitle className="flex items-center justify-between">
          <span>Search Results</span>
          <div className="text-sm font-normal text-muted-foreground">
            {results.length} product{results.length !== 1 ? "s" : ""} found
            {searchTime && ` in ${searchTime}ms`}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full w-full">
          <div className="p-6 pt-0">
            <ItemListBlock
              items={results}
              ctaPath="/some-cta-path"
              tvDisplayWord="example-tv-display-word"
            />
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
