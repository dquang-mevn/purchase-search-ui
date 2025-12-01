import React from "react";
import { Button } from "./ui/button";
import type { SearchParam } from "./search-form-2";

// Define a type for the test case
interface SearchTestCase {
  label: string;
  query?: string;
  searchType?: string;
  semanticQuery?: string;
  searchParams: SearchParam[];
  sortBy?: string;
  sortOrder?: string;
  limit?: string;
}

// Expanded test cases for all fields and operators, using sample.json as reference
const TEST_CASES: SearchTestCase[] = [
  // String fields
  {
    label: "Item ID exact match",
    searchParams: [
      { id: "1", field: "item_id", operator: "exact_match", value: "W9297805" },
    ],
  },
  {
    label: "Title contains (case-insensitive)",
    searchParams: [
      { id: "1", field: "title", operator: "icontains", value: "tcl" },
    ],
  },
  {
    label: "Category in list",
    searchParams: [
      { id: "1", field: "category", operator: "in", value: "家電,家具" },
    ],
  },
  {
    label: "Condition is null",
    searchParams: [
      { id: "1", field: "condition", operator: "is_null", value: "" },
    ],
  },
  {
    label: "Prefecture exact match",
    searchParams: [
      { id: "1", field: "pref", operator: "exact_match", value: "茨城県" },
    ],
  },
  {
    label: "Address not contains",
    searchParams: [
      { id: "1", field: "address", operator: "not_contains", value: "東京" },
    ],
  },
  {
    label: "Zip code starts with",
    searchParams: [
      { id: "1", field: "zip", operator: "starts_with", value: "310" },
    ],
  },
  {
    label: "Sex exact match",
    searchParams: [
      { id: "1", field: "sex", operator: "exact_match", value: "男性" },
    ],
  },
  {
    label: "Age group between",
    searchParams: [
      { id: "1", field: "age_group", operator: "between", value: "18,30" },
    ],
  },
  // Numeric fields
  {
    label: "Bought price greater than",
    searchParams: [
      { id: "1", field: "bought_price", operator: "greater_than", value: "5000" },
    ],
  },
  {
    label: "Profit less than",
    searchParams: [
      { id: "1", field: "temp_profit_amount", operator: "less_than", value: "5000" },
    ],
  },
  {
    label: "Sold price not between",
    searchParams: [
      { id: "1", field: "sold_price", operator: "not_between", value: "9000,12000" },
    ],
  },
  {
    label: "Sell price equals",
    searchParams: [
      { id: "1", field: "sell_price", operator: "exact_match", value: "10000" },
    ],
  },
  // Date fields
  {
    label: "Bought date after",
    searchParams: [
      { id: "1", field: "bought", operator: "greater_than", value: "2024-01-01" },
    ],
  },
  {
    label: "Dispatched date before",
    searchParams: [
      { id: "1", field: "flow_dispatched", operator: "less_than", value: "2024-12-01" },
    ],
  },
  // Array field
  {
    label: "Exit service contains ReRe",
    searchParams: [
      { id: "1", field: "exit_service", operator: "contains", value: "ReRe" },
    ],
  },
  {
    label: "Exit service in list",
    searchParams: [
      { id: "1", field: "exit_service", operator: "in", value: "ReRe,ヤフオク" },
    ],
  },
  // More string fields
  {
    label: "Sold exit service exact match",
    searchParams: [
      { id: "1", field: "sold_exit_service", operator: "exact_match", value: "ヤフオク" },
    ],
  },
  {
    label: "Business domain icontains",
    searchParams: [
      { id: "1", field: "business_domain", operator: "icontains", value: "東京" },
    ],
  },
  {
    label: "Offer type not in list",
    searchParams: [
      { id: "1", field: "offer_type", operator: "not_in", value: "宅配,出張" },
    ],
  },
  {
    label: "Window regex match",
    searchParams: [
      { id: "1", field: "window", operator: "regex", value: "WEB|LINE" },
    ],
  },
  // Numeric field
  {
    label: "Sale count greater or equal",
    searchParams: [
      { id: "1", field: "sale_count", operator: "greater_equal", value: "10" },
    ],
  },
  // Null/empty
  {
    label: "Sold exit service is not null",
    searchParams: [
      { id: "1", field: "sold_exit_service", operator: "is_not_null", value: "" },
    ],
  },
  // Semantic/hybrid
  {
    label: "Semantic search for 'テレビ'",
    query: "テレビ",
    searchType: "semantic",
    searchParams: [],
  },
  {
    label: "Hybrid search: '家電' with semantic '液晶'",
    query: "家電",
    searchType: "hybrid",
    semanticQuery: "液晶",
    searchParams: [
      { id: "1", field: "category", operator: "exact_match", value: "家電" },
    ],
  },
  // Sorting and limit
  {
    label: "Sort by bought_price desc, limit 5",
    searchParams: [
      { id: "1", field: "category", operator: "exact_match", value: "家電" },
    ],
    sortBy: "bought_price",
    sortOrder: "desc",
    limit: "5",
  },
  // Multiple filters
  {
    label: "Multiple filters: category, price, date",
    searchParams: [
      { id: "1", field: "category", operator: "exact_match", value: "家電" },
      { id: "2", field: "bought_price", operator: "greater_equal", value: "5000" },
      { id: "3", field: "bought", operator: "greater_than", value: "2024-01-01" },
    ],
  },
  // Regex and not_regex
  {
    label: "Title regex match",
    searchParams: [
      { id: "1", field: "title", operator: "regex", value: "TCL.*テレビ" },
    ],
  },
  {
    label: "Title not regex match",
    searchParams: [
      { id: "1", field: "title", operator: "not_regex", value: "2023年製" },
    ],
  },
  // Not contains
  {
    label: "Title not contains '良好'",
    searchParams: [
      { id: "1", field: "title", operator: "not_contains", value: "良好" },
    ],
  },
  // Ends with
  {
    label: "Title ends with '家電'",
    searchParams: [
      { id: "1", field: "title", operator: "ends_with", value: "家電" },
    ],
  },
  // Starts with
  {
    label: "Title starts with 'TCL'",
    searchParams: [
      { id: "1", field: "title", operator: "starts_with", value: "TCL" },
    ],
  },
];

interface SearchTestCasesPanelProps {
  onSelectTestCase: (testCase: SearchTestCase) => void;
}

/**
 * Usage:
 * <SearchTestCasesPanel onSelectTestCase={(testCase) => {
 *   // Set state in SearchForm2, e.g. setSearchParams(testCase.searchParams), etc.
 * }} />
 */
export const SearchTestCasesPanel: React.FC<SearchTestCasesPanelProps> = ({ onSelectTestCase }) => {
  return (
    <div className="w-full max-w-md mx-auto mb-6 p-4 border rounded-lg bg-gray-50">
      <h3 className="text-base font-semibold mb-3">Quick Test Cases</h3>
      <ul className="space-y-2">
        {TEST_CASES.map((tc, idx) => (
          <li key={idx}>
            <Button
              variant="outline"
              className="w-full text-left justify-start"
              onClick={() => onSelectTestCase(tc)}
            >
              {tc.label}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export type { SearchTestCase };
