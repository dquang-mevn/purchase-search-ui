"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X } from "lucide-react";

export interface SearchParam {
  id: string;
  field: string;
  operator: string;
  value: string;
}

interface SearchFormProps {
  onSearch: (params: SearchParam[], sortBy?: string, sortOrder?: string, limit?: string) => void;
  isLoading?: boolean;
}

const FIELD_OPTIONS = [
  { value: "name", label: "Product Name" },
  { value: "category", label: "Category" },
  { value: "price", label: "Price" },
  { value: "profit", label: "Profit" },
  { value: "is_sold", label: "Is Sold" },
  { value: "fixed_condition", label: "Condition" },
  { value: "sold_exit_service", label: "Exit Service" },
  { value: "bought_price", label: "Bought Price" },
  { value: "sales_status", label: "Sales Status" },
  { value: "inventory_status", label: "Inventory Status" },
  { value: "keywords", label: "Keywords" },
  { value: "city", label: "City" },
  { value: "pref", label: "Prefecture" },
];

const OPERATOR_OPTIONS = [
  // String operations
  { value: "equals", label: "Equals (=)" },
  { value: "not_equals", label: "Not Equals (≠)" },
  { value: "contains", label: "Contains (*text*) - Case Sensitive" },
  { value: "icontains", label: "Contains (*text*) - Case Insensitive" },
  { value: "not_contains", label: "Not Contains (!*text*)" },
  { value: "starts_with", label: "Starts With (text*)" },
  { value: "ends_with", label: "Ends With (*text)" },
  { value: "exact_match", label: "Exact Match" },
  { value: "case_insensitive", label: "Case Insensitive" },

  // Numeric operations
  { value: "greater_than", label: "Greater Than (>)" },
  { value: "less_than", label: "Less Than (<)" },
  { value: "greater_equal", label: "Greater or Equal (≥)" },
  { value: "less_equal", label: "Less or Equal (≤)" },
  { value: "between", label: "Between (range)" },
  { value: "not_between", label: "Not Between" },

  // Array/List operations
  { value: "in", label: "In List" },
  { value: "not_in", label: "Not In List" },

  // Null/Empty operations
  { value: "is_null", label: "Is Null/Empty" },
  { value: "is_not_null", label: "Is Not Null/Empty" },

  // Regular expressions
  { value: "regex", label: "Regex Pattern" },
  { value: "not_regex", label: "Not Regex Pattern" },

  // Fuzzy matching
  { value: "fuzzy", label: "Fuzzy Match (~)" },
  { value: "wildcard", label: "Wildcard (*?)" },

  // Semantic search
  { value: "semantic", label: "Semantic Search (AI)" },
];

export function SearchForm({ onSearch, isLoading = false }: SearchFormProps) {
  const [searchParams, setSearchParams] = useState<SearchParam[]>([
    { id: "1", field: "", operator: "", value: "" }
  ]);
  const [queryString, setQueryString] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<string>("asc");
  const [limit, setLimit] = useState<string>("12");

  const addSearchParam = () => {
    const newParam: SearchParam = {
      id: Date.now().toString(),
      field: "",
      operator: "",
      value: ""
    };
    setSearchParams([...searchParams, newParam]);
  };

  const removeSearchParam = (id: string) => {
    if (searchParams.length > 1) {
      setSearchParams(searchParams.filter(param => param.id !== id));
    }
  };

  const updateSearchParam = (id: string, updates: Partial<SearchParam>) => {
    setSearchParams(searchParams.map(param =>
      param.id === id ? { ...param, ...updates } : param
    ));
  };

  const getOperatorSuffix = (operator: string): string => {
    const suffixMap: Record<string, string> = {
      // String operations
      'equals': '',                    // No suffix for exact match
      'not_equals': '__ne',
      'contains': '__contains',
      'icontains': '__icontains',
      'not_contains': '__not_contains',
      'starts_with': '__startswith',
      'ends_with': '__endswith',
      'exact_match': '__exact',
      'case_insensitive': '__iexact',

      // Numeric operations
      'greater_than': '__gt',
      'less_than': '__lt',
      'greater_equal': '__gte',
      'less_equal': '__lte',
      'between': '__range',
      'not_between': '__not_range',

      // Array/List operations
      'in': '__in',
      'not_in': '__notin',

      // Null/Empty operations
      'is_null': '__isnull',
      'is_not_null': '__isnotnull',

      // Regular expressions
      'regex': '__regex',
      'not_regex': '__not_regex',

      // Fuzzy matching
      'fuzzy': '__fuzzy',
      'wildcard': '__wildcard',

      // Semantic search
      'semantic': '__semantic',
    };

    return suffixMap[operator] || '';
  };

  const generateQueryString = (params: SearchParam[]): string => {
    const validParams = params.filter(param =>
      param.field && param.operator && param.value
    );

    if (validParams.length === 0) return "";

    const queryParams = new URLSearchParams();

    validParams.forEach((param) => {
      const suffix = getOperatorSuffix(param.operator);
      const paramName = `${param.field}${suffix}`;

      // Handle special cases for value formatting
      let paramValue = param.value;

      // For __isnull, convert to true/false
      if (param.operator === 'is_null') {
        paramValue = 'true';
      } else if (param.operator === 'is_not_null') {
        paramValue = 'false';
      }

      queryParams.append(paramName, paramValue);
    });

    // Add sort and limit parameters
    if (sortBy && sortBy !== "none") {
      queryParams.append('sort_by', sortBy);
      queryParams.append('order', sortOrder);
    }

    if (limit && limit !== "12" && !isNaN(Number(limit)) && Number(limit) > 0) {
      queryParams.append('limit', limit);
    }

    return queryParams.toString();
  };

  const handleSearch = () => {
    const validParams = searchParams.filter(param =>
      param.field && param.operator && param.value
    );

    // Generate and set query string with current sort/limit values
    const generatedQueryString = generateQueryString(searchParams);
    setQueryString(generatedQueryString);

    // Pass all search data including sort and limit
    const finalSortBy = sortBy === "none" ? undefined : sortBy;
    const finalLimit = limit && !isNaN(Number(limit)) && Number(limit) > 0 ? limit : undefined;
    onSearch(validParams, finalSortBy, sortOrder, finalLimit);
  };

  const canAddMore = searchParams.length < 10;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Search Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {searchParams.map((param, index) => (
          <div key={param.id} className="p-3 border rounded-lg bg-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                Parameter {index + 1}
              </span>
              {searchParams.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSearchParam(param.id)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Select
                value={param.field}
                onValueChange={(value) => updateSearchParam(param.id, { field: value })}
              >
                <SelectTrigger className="h-8 w-full">
                  <SelectValue placeholder="Field" />
                </SelectTrigger>
                <SelectContent>
                  {FIELD_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={param.operator}
                onValueChange={(value) => updateSearchParam(param.id, { operator: value })}
              >
                <SelectTrigger className="h-8 w-full">
                  <SelectValue placeholder="Operator" />
                </SelectTrigger>
                <SelectContent>
                  {OPERATOR_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                value={param.value}
                onChange={(e) => updateSearchParam(param.id, { value: e.target.value })}
                placeholder="Value"
                className="h-8"
              />
            </div>
          </div>
        ))}

        {/* Sort and Limit Section */}
        <div className="border-t pt-4 space-y-4">
          <h4 className="text-sm font-medium text-foreground">Sort</h4>

          <div className="grid grid-cols-2 gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-8 w-full">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No sorting</SelectItem>
                {FIELD_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortOrder} onValueChange={setSortOrder} disabled={!sortBy || sortBy === "none"}>
              <SelectTrigger className="h-8 w-full">
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <h4 className="text-sm font-medium text-foreground">Limit</h4>
          <div>
            <Input
              type="number"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              placeholder="Limit (default: 12)"
              className="h-8"
              min="1"
              max="1000"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <Button
            variant="outline"
            onClick={addSearchParam}
            disabled={!canAddMore}
            className="flex items-center justify-center gap-2 h-9"
          >
            <Plus className="h-4 w-4" />
            Add Parameter
          </Button>

          <Button
            onClick={handleSearch}
            disabled={isLoading}
            className="h-10"
          >
            {isLoading ? "Searching..." : "Search"}
          </Button>
        </div>

        {searchParams.length >= 10 && (
          <p className="text-xs text-muted-foreground text-center">
            Maximum of 10 search parameters allowed.
          </p>
        )}

        {queryString && (
          <div className="mt-6 p-4 bg-muted/50 rounded-lg border">
            <h4 className="text-sm font-medium mb-2 text-foreground">Generated Query String:</h4>
            <div className="bg-background p-3 rounded border text-xs font-mono break-all">
              <span className="text-muted-foreground">Base API URL + </span>
              <span className="text-primary">?{queryString}</span>
            </div>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => navigator.clipboard.writeText(queryString)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Copy Query String
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(`https://your-modx-site.com/api/search?${queryString}`)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Copy Full URL
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
