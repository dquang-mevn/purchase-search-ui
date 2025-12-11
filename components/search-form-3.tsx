"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Plus, X } from "lucide-react";
import { useSearchApi } from "@/hooks/use-search";
import { useSearchParams } from "@/hooks/use-search-params";

export interface SearchParam {
  id: string;
  field: string;
  operator: string;
  value: string;
}

interface SearchFormProps {
  onSearch: (queryString: string) => void;
  isLoading?: boolean;
  query?: string;
  setQuery?: (v: string) => void;
  searchType?: string;
  setSearchType?: (v: string) => void;
  semanticQuery?: string;
  setSemanticQuery?: (v: string) => void;
  searchParams?: SearchParam[];
  setSearchParams?: (v: SearchParam[]) => void;
  sortBy?: string;
  setSortBy?: (v: string) => void;
  sortOrder?: string;
  setSortOrder?: (v: string) => void;
  limit?: string;
  setLimit?: (v: string) => void;
}

const FIELD_OPTIONS = [
  {
    value: "title",
    label: "Title",
    type: "string",
    defaultOperator: "icontains",
  },
  {
    value: "category",
    label: "Category",
    type: "string",
    defaultOperator: "none",
  },
  {
    value: "min_score",
    label: "Min Score",
    type: "number",
    defaultOperator: "none",
  },
  {
    value: "bought_price",
    label: "Bought Price",
    type: "number",
    defaultOperator: "greater_equal",
  },
  {
    value: "condition",
    label: "Condition",
    type: "string",
    defaultOperator: "none",
  },
  {
    value: "pref",
    label: "Prefecture",
    type: "string",
    defaultOperator: "none",
  },
  {
    value: "item_id",
    label: "Item ID",
    type: "string",
    defaultOperator: "none",
  },
  {
    value: "address",
    label: "Address",
    type: "string",
    defaultOperator: "icontains",
  },
  { value: "zip", label: "Zip Code", type: "string", defaultOperator: "none" },
  { value: "sex", label: "Sex", type: "string", defaultOperator: "none" },
  {
    value: "age_group",
    label: "Age Group",
    type: "number",
    defaultOperator: "none",
  },
  {
    value: "temp_profit_amount",
    label: "Profit",
    type: "number",
    defaultOperator: "greater_equal",
  },
  {
    value: "sold_price",
    label: "Sold Price",
    type: "number",
    defaultOperator: "greater_equal",
  },
  {
    value: "sell_price",
    label: "Sell Price",
    type: "number",
    defaultOperator: "greater_equal",
  },
  {
    value: "bought",
    label: "Bought Date",
    type: "date",
    defaultOperator: "greater_equal",
  },
  {
    value: "flow_dispatched",
    label: "Dispatched Date",
    type: "date",
    defaultOperator: "none",
  },
  {
    value: "exit_service",
    label: "Exit Service (Array)",
    type: "list",
    defaultOperator: "none",
  },
  {
    value: "sold_exit_service",
    label: "Sold Exit Service",
    type: "string",
    defaultOperator: "none",
  },
  {
    value: "business_domain",
    label: "Business Domain",
    type: "string",
    defaultOperator: "none",
  },
  {
    value: "offer_type",
    label: "Offer Type",
    type: "string",
    defaultOperator: "none",
  },
  { value: "window", label: "Window", type: "string", defaultOperator: "none" },
  {
    value: "sale_count",
    label: "Sale Count",
    type: "number",
    defaultOperator: "greater_equal",
  },
];

const OPERATOR_OPTIONS = [
  { value: "none", label: "Default", for: "all" },
  { value: "exact_match", label: "Exact Match (=)", for: "string" },
  {
    value: "case_insensitive",
    label: "Exact Match (Aa) (iexact)",
    for: "string",
  },
  {
    value: "contains",
    label: "Contains (*text*) - Case Sensitive",
    for: "string",
  },
  {
    value: "icontains",
    label: "Contains (*text*) - Case Insensitive",
    for: "string",
  },
  { value: "not_contains", label: "Not Contains (!*text*)", for: "string" },
  { value: "starts_with", label: "Starts With (text*)", for: "string" },
  { value: "ends_with", label: "Ends With (*text)", for: "string" },
  { value: "greater_than", label: "Greater Than (>)", for: "number" },
  { value: "less_than", label: "Less Than (<)", for: "number" },
  { value: "greater_equal", label: "Greater or Equal (≥)", for: "number" },
  { value: "less_equal", label: "Less or Equal (≤)", for: "number" },
  { value: "between", label: "Between (range)", for: "number" },
  { value: "not_between", label: "Not Between", for: "number" },
  { value: "in", label: "In List (e.g., a,b,c)", for: "list" },
  { value: "not_in", label: "Not In List (e.g., a,b,c)", for: "list" },
  { value: "is_null", label: "Is Null/Empty", for: "all" },
  { value: "is_not_null", label: "Is Not Null/Empty", for: "all" },
];

// --- 1. REVERSE MAP FOR PARSING ---
const SUFFIX_TO_OPERATOR: Record<string, string> = {
  __contains: "contains",
  __icontains: "icontains",
  __not_contains: "not_contains",
  __startswith: "starts_with",
  __endswith: "ends_with",
  __exact: "exact_match",
  __iexact: "case_insensitive",
  __gt: "greater_than",
  __lt: "less_than",
  __gte: "greater_equal",
  __lte: "less_equal",
  __range: "between",
  __not_range: "not_between",
  __in: "in",
  __notin: "not_in",
  __isnull: "is_null",
  __isnotnull: "is_not_null",
};

export function SearchForm3({
  onSearch,
  isLoading = false,
  query: controlledQuery,
  setQuery: setControlledQuery,
  searchType: controlledSearchType,
  semanticQuery: controlledSemanticQuery,
  searchParams: controlledSearchParams,
  setSearchParams: setControlledSearchParams,
  sortBy: controlledSortBy,
  setSortBy: setControlledSortBy,
  sortOrder: controlledSortOrder,
  setSortOrder: setControlledSortOrder,
  limit: controlledLimit,
  setLimit: setControlledLimit,
}: SearchFormProps) {
  const LOCAL_STORAGE_KEY = "searchForm2State";
  const { searchEndpoint } = useSearchApi();
  const { params: paramsFromUrl } = useSearchParams(); // Removed setSearchParamsToUrl as we usually don't want to double-set on load

  // Ref to prevent double firing in React strict mode or rapid re-renders
  const hasInitializedFromUrl = useRef(false);

  // --- STATE ---
  const [uncontrolledQuery, setUncontrolledQuery] = useState<string>("");
  const [uncontrolledSearchType, setUncontrolledSearchType] =
    useState<string>("semantic");
  const [uncontrolledSemanticQuery, setUncontrolledSemanticQuery] =
    useState<string>("");
  const [uncontrolledSearchParams, setUncontrolledSearchParams] = useState<
    SearchParam[]
  >([{ id: "1", field: "", operator: "", value: "" }]);
  const [uncontrolledSortBy, setUncontrolledSortBy] = useState<string>("");
  const [uncontrolledSortOrder, setUncontrolledSortOrder] =
    useState<string>("asc");
  const [uncontrolledLimit, setUncontrolledLimit] = useState<string>("10");
  const [queryString, setQueryString] = useState<string>("");

  // Use controlled or uncontrolled state
  const query =
    controlledQuery !== undefined ? controlledQuery : uncontrolledQuery;
  const setQuery =
    setControlledQuery !== undefined
      ? setControlledQuery
      : setUncontrolledQuery;
  const searchType =
    controlledSearchType !== undefined
      ? controlledSearchType
      : uncontrolledSearchType;
  const semanticQuery =
    controlledSemanticQuery !== undefined
      ? controlledSemanticQuery
      : uncontrolledSemanticQuery;
  const searchParams =
    controlledSearchParams !== undefined
      ? controlledSearchParams
      : uncontrolledSearchParams;
  const setSearchParams =
    setControlledSearchParams !== undefined
      ? setControlledSearchParams
      : setUncontrolledSearchParams;
  const sortBy =
    controlledSortBy !== undefined ? controlledSortBy : uncontrolledSortBy;
  const setSortBy =
    setControlledSortBy !== undefined
      ? setControlledSortBy
      : setUncontrolledSortBy;
  const sortOrder =
    controlledSortOrder !== undefined
      ? controlledSortOrder
      : uncontrolledSortOrder;
  const setSortOrder =
    setControlledSortOrder !== undefined
      ? setControlledSortOrder
      : setUncontrolledSortOrder;
  const limit =
    controlledLimit !== undefined ? controlledLimit : uncontrolledLimit;
  const setLimit =
    setControlledLimit !== undefined
      ? setControlledLimit
      : setUncontrolledLimit;

  // --- 2. NEW EFFECT: PARSE URL AND TRIGGER SEARCH ---
  useEffect(() => {
    // Only run if we are in browser and haven't initialized yet
    if (typeof window === "undefined" || hasInitializedFromUrl.current) return;

    // Use paramsFromUrl (string) to check presence
    if (paramsFromUrl && paramsFromUrl.length > 1) {
      // length > 1 to ignore empty "?"
      hasInitializedFromUrl.current = true;

      const urlParams = new URLSearchParams(paramsFromUrl);
      const newSearchParams: SearchParam[] = [];

      // A. Parse Standard Params
      if (urlParams.has("query")) setQuery(urlParams.get("query") || "");
      if (urlParams.has("limit")) setLimit(urlParams.get("limit") || "10");

      // B. Parse Sort Param (sortBy_field=order)
      let foundSort = false;
      urlParams.forEach((value, key) => {
        if (key.startsWith("sortBy_")) {
          setSortBy(key.replace("sortBy_", ""));
          setSortOrder(value);
          foundSort = true;
        }
      });
      if (!foundSort) setSortBy(""); // Reset if not found

      // C. Parse Filter Params
      urlParams.forEach((value, key) => {
        // Skip reserved keys
        if (key === "query" || key === "limit" || key.startsWith("sortBy_"))
          return;

        // Determine Field and Operator
        // Logic: Split by "__". The last part is the suffix if it matches our list.
        // If no "__" or suffix doesn't match, assume default operator or 'none'.

        let field = key;
        let operator = "none";

        // Try to find a known suffix at the end of the key
        const parts = key.split("__");
        if (parts.length > 1) {
          const possibleSuffix = "__" + parts[parts.length - 1];
          if (SUFFIX_TO_OPERATOR[possibleSuffix]) {
            operator = SUFFIX_TO_OPERATOR[possibleSuffix];
            // Rejoin the rest as the field name (handle cases where field has __ inside, though rare)
            field = parts.slice(0, -1).join("__");
          }
        }

        newSearchParams.push({
          id: Math.random().toString(36).substr(2, 9),
          field,
          operator,
          value:
            operator === "is_null" || operator === "is_not_null" ? "" : value, // Value is ignored for null checks
        });
      });

      if (newSearchParams.length > 0) {
        setSearchParams(newSearchParams);
      } else {
        // Reset to empty default if only query string was present
        setSearchParams([{ id: "1", field: "", operator: "", value: "" }]);
      }

      // D. Trigger Search Immediately
      const cleanQuery = paramsFromUrl.replace(/^\?/, ""); // Remove leading ?
      setQueryString(cleanQuery);
      onSearch(cleanQuery);
    }
  }, [
    paramsFromUrl,
    setQuery,
    setLimit,
    setSortBy,
    setSortOrder,
    setSearchParams,
    onSearch,
  ]);

  // --- 3. UPDATED EFFECT: LOAD FROM LOCAL STORAGE ---
  useEffect(() => {
    if (typeof window === "undefined") return;

    // PRIORITY CHECK: If URL params exist, DO NOT load from local storage.
    // The URL effect above will handle state initialization.
    if (paramsFromUrl && paramsFromUrl.length > 1) return;

    if (
      controlledQuery !== undefined ||
      controlledSearchType !== undefined ||
      controlledSemanticQuery !== undefined ||
      controlledSearchParams !== undefined ||
      controlledSortBy !== undefined ||
      controlledSortOrder !== undefined ||
      controlledLimit !== undefined
    ) {
      return;
    }
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.query !== undefined) setUncontrolledQuery(parsed.query);
        if (parsed.searchType !== undefined)
          setUncontrolledSearchType(parsed.searchType);
        if (parsed.semanticQuery !== undefined)
          setUncontrolledSemanticQuery(parsed.semanticQuery);
        if (
          Array.isArray(parsed.searchParams) &&
          parsed.searchParams.length > 0
        )
          setUncontrolledSearchParams(parsed.searchParams);
        if (parsed.sortBy !== undefined) setUncontrolledSortBy(parsed.sortBy);
        if (parsed.sortOrder !== undefined)
          setUncontrolledSortOrder(parsed.sortOrder);
        if (parsed.limit !== undefined) setUncontrolledLimit(parsed.limit);
      }
    } catch (e) {
      console.error("Failed to load saved search form state:", e);
    }
  }, [paramsFromUrl]); // Added paramsFromUrl dependency

  // ... [Existing LocalStorage SAVE effect remains the same] ...
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (
      controlledQuery !== undefined ||
      controlledSearchType !== undefined ||
      controlledSemanticQuery !== undefined ||
      controlledSearchParams !== undefined ||
      controlledSortBy !== undefined ||
      controlledSortOrder !== undefined ||
      controlledLimit !== undefined
    ) {
      return;
    }
    const state = {
      query,
      searchType,
      semanticQuery,
      searchParams,
      sortBy,
      sortOrder,
      limit,
    };
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error(e);
    }
  }, [
    query,
    searchType,
    semanticQuery,
    searchParams,
    sortBy,
    sortOrder,
    limit,
    controlledQuery,
    controlledSearchType,
    controlledSemanticQuery,
    controlledSearchParams,
    controlledSortBy,
    controlledSortOrder,
    controlledLimit,
  ]);

  // ... [Rest of the component (Handlers, JSX) remains exactly the same] ...

  const addSearchParam = () => {
    const newParam: SearchParam = {
      id: Date.now().toString(),
      field: "",
      operator: "",
      value: "",
    };
    setSearchParams([...searchParams, newParam]);
  };

  const removeSearchParam = (id: string) => {
    if (searchParams.length > 1) {
      setSearchParams(searchParams.filter((param) => param.id !== id));
    } else {
      setSearchParams([{ id: "1", field: "", operator: "", value: "" }]);
    }
  };

  const updateSearchParam = (id: string, updates: Partial<SearchParam>) => {
    setSearchParams(
      searchParams.map((param) =>
        param.id === id ? { ...param, ...updates } : param,
      ),
    );
  };

  const getOperatorSuffix = (operator: string): string => {
    const suffixMap: Record<string, string> = {
      contains: "__contains",
      icontains: "__icontains",
      not_contains: "__not_contains",
      starts_with: "__startswith",
      ends_with: "__endswith",
      exact_match: "__exact",
      case_insensitive: "__iexact",
      greater_than: "__gt",
      less_than: "__lt",
      greater_equal: "__gte",
      less_equal: "__lte",
      between: "__range",
      not_between: "__not_range",
      in: "__in",
      not_in: "__notin",
      is_null: "__isnull",
      is_not_null: "__isnotnull",
      regex: "__regex",
      not_regex: "__not_regex",
      semantic: "__semantic",
    };
    return suffixMap[operator] || "";
  };

  const generateQueryString = (): string => {
    const queryParams = new URLSearchParams();

    if (query) {
      queryParams.append("query", query);
    }

    const validParams = searchParams.filter(
      (param) =>
        param.field &&
        param.operator &&
        (param.value || ["is_null", "is_not_null"].includes(param.operator)),
    );

    validParams.forEach((param) => {
      const suffix = getOperatorSuffix(param.operator);
      const paramName = `${param.field}${suffix}`;
      let paramValue = param.value;
      if (param.operator === "is_null" || param.operator === "is_not_null") {
        paramValue = "true";
      }

      if (param.operator === "is_null" || param.operator === "is_not_null") {
        queryParams.append(paramName, paramValue);
      } else if (param.value) {
        queryParams.append(paramName, paramValue);
      }
    });

    if (sortBy && sortBy !== "none") {
      const sortParamName = `sortBy_${sortBy}`;
      queryParams.append(sortParamName, sortOrder);
    }

    if (limit && limit !== "10" && !isNaN(Number(limit)) && Number(limit) > 0) {
      queryParams.append("limit", limit);
    }

    return queryParams.toString();
  };

  const handleSearch = () => {
    const generatedQueryString = generateQueryString();
    setQueryString(generatedQueryString);
    onSearch(generatedQueryString);
  };

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).catch((err) => {
        console.warn("Clipboard API failed, falling back to execCommand.", err);
        fallbackCopyToClipboard(text);
      });
    } else {
      fallbackCopyToClipboard(text);
    }
  };

  const fallbackCopyToClipboard = (text: string) => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.width = "2em";
      textArea.style.height = "2em";
      textArea.style.padding = "0";
      textArea.style.border = "none";
      textArea.style.outline = "none";
      textArea.style.boxShadow = "none";
      textArea.style.background = "transparent";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    } catch (e) {
      console.error("Fallback clipboard copy failed:", e);
    }
  };

  const canAddMore = searchParams.length < 10;

  return (
    <Card
      className="w-full max-w-2xl mx-auto"
      style={{ fontFamily: "sans-serif" }}
    >
      <CardHeader>
        <CardTitle className="text-lg">Search Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4 p-3 border rounded-lg">
          <h4 className="text-sm font-medium text-gray-700">Main Search</h4>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Main query... (e.g., Herman Miller)"
            className="h-9 md:col-span-2"
          />
        </div>

        <h4 className="text-sm font-medium text-gray-700 pt-2">Filters</h4>
        {searchParams.map((param, index) => (
          <div key={param.id} className="p-3 border rounded-lg bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">
                Filter {index + 1}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeSearchParam(param.id)}
                className="h-6 w-6 p-0 bg-transparent hover:bg-gray-200 text-gray-600"
              >
                <X />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Select
                value={param.field}
                onValueChange={(value) => {
                  const field = FIELD_OPTIONS.find((i) => i.value === value);
                  const operator = field?.defaultOperator || "none";
                  updateSearchParam(param.id, {
                    field: value,
                    operator: operator,
                  });
                }}
              >
                <SelectTrigger className="h-9 w-full">
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
                onValueChange={(value) =>
                  updateSearchParam(param.id, { operator: value })
                }
                disabled={!param.field}
              >
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder="Operator" />
                </SelectTrigger>
                <SelectContent>
                  {OPERATOR_OPTIONS.filter((item) => {
                    const field = FIELD_OPTIONS.find(
                      (i) => i.value === param.field,
                    );
                    return (
                      item.for === "all" ||
                      item.for === (field?.type || "string")
                    );
                  }).map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                value={param.value}
                onChange={(e) =>
                  updateSearchParam(param.id, { value: e.target.value })
                }
                placeholder="Value"
                className="h-9"
                disabled={
                  !param.operator ||
                  param.operator === "is_null" ||
                  param.operator === "is_not_null"
                }
              />
            </div>
          </div>
        ))}
        <Button
          variant="outline"
          onClick={addSearchParam}
          disabled={!canAddMore}
          className="flex items-center justify-center gap-2 h-9 w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
        >
          <Plus />
          Add Filter
        </Button>

        <div className="border-t pt-4 space-y-4">
          <h4 className="text-sm font-medium text-gray-700">Sort & Limit</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder="Sort by" />
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
              value={sortOrder}
              onValueChange={setSortOrder}
              disabled={!sortBy || sortBy === "none"}
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="number"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              placeholder="Limit (default: 10)"
              className="h-9"
              min="1"
              max="50"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <Button
            onClick={handleSearch}
            disabled={isLoading}
            className="h-10 text-lg cursor-pointer"
          >
            {isLoading ? "Searching..." : "Search"}
          </Button>
        </div>

        {searchParams.length >= 10 && (
          <p className="text-xs text-gray-500 text-center">
            Maximum of 10 filters allowed.
          </p>
        )}

        {queryString && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
            <h4 className="text-sm font-medium mb-2 text-gray-800">
              Generated Query String:
            </h4>
            <div className="bg-gray-900 text-white p-3 rounded border text-xs font-mono break-all">
              <span className="text-gray-400">/api/v1/search?</span>
              <span className="text-yellow-300">{queryString}</span>
            </div>
            <div className="mt-2 flex gap-4">
              <button
                onClick={() => copyToClipboard(queryString)}
                className="text-xs text-blue-600 hover:underline cursor-pointer"
              >
                Copy Query String
              </button>
              <button
                onClick={() =>
                  copyToClipboard(`${searchEndpoint}/search?${queryString}`)
                }
                className="text-xs text-blue-600 hover:underline cursor-pointer"
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
