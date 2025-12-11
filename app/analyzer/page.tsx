"use client";

import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import { generateWithGemini } from "@/lib/gemini-helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

type AnalyzedRow = {
  keyword: string;
  brand: string;
  normalizedBrand: string;
  category: string;
};

const DEFAULT_PROMPT = `Role: Query Understanding
Task: Extract Brand and Category
Input: "%s"
Rules:
- brand: Raw brand as appears in the query. If the query clearly mentions a brand, you MUST output it. Product line/model names are NOT brands (e.g., AirPods, Galaxy S23). For such models, output the actual manufacturer brand instead when clear (AirPods -> Apple, Galaxy S23 -> Samsung); otherwise leave brand empty.
- normalizedBrand: Brand name in UPPERCASE ENGLISH (e.g., 東芝->TOSHIBA, シャープ->SHARP, ナショナル->NATIONAL, AirPods->APPLE). If you output brand, you MUST output normalizedBrand. Only leave both empty when the query truly has no brand.
- category: COARSE product type only (no variants/attributes). UPPERCASE ENGLISH CONSTANT, 1-2 tokens with underscore. Examples (short): COFFEE_MAKER, LAPTOP, SMARTPHONE, CAMERA, LENS, TV, WASHING_MACHINE, MICROWAVE, RICE_COOKER, AIR_CONDITIONER, VACUUM, ROBOT_VACUUM, REFRIGERATOR. Do NOT add qualifiers like ESPRESSO/MULTI-FUNCTION/MANUAL. Always pick the base type only. Use the most common everyday term; avoid niche synonyms (e.g., prefer RECORD_PLAYER over TURNTABLE). If category is unclear/ambiguous, return an empty string "" (do NOT guess).`;

const OUTPUT_SCHEMA = {
  brand: { type: "string" },
  normalizedBrand: { type: "string" },
  category: { type: "string" },
};

const REQUIRED_FIELDS = ["brand", "normalizedBrand", "category"];
const MAX_CONCURRENCY = 8; // workers
const RATE_LIMIT_MAX_PER_SEC = 16; // cap to ~960 req/min (under 1000)

export default function Analyzer() {
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [fileName, setFileName] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [results, setResults] = useState<AnalyzedRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cachedKey = localStorage.getItem("analyzer-gemini-key");
    const cachedPrompt = localStorage.getItem("analyzer-prompt");
    if (cachedKey) setGeminiApiKey(cachedKey);
    if (cachedPrompt) setPrompt(cachedPrompt);
  }, []);

  const handleApiKeyChange = (value: string) => {
    setGeminiApiKey(value);
    localStorage.setItem("analyzer-gemini-key", value);
  };

  const handlePromptChange = (value: string) => {
    setPrompt(value);
    localStorage.setItem("analyzer-prompt", value);
  };

  const extractKeyword = (row: Record<string, string>) => {
    const preferredKeys = [
      "keyword",
      "keywords",
      "query",
      "search",
      "title",
      "name",
    ];
    for (const key of preferredKeys) {
      if (row[key]?.trim()) return row[key].trim();
      if (row[key.toUpperCase()]?.trim()) return row[key.toUpperCase()].trim();
      const camel = key
        .split("")
        .map((c, idx) => (idx === 0 ? c.toUpperCase() : c))
        .join("");
      if ((row as Record<string, string>)[camel]?.trim())
        return (row as Record<string, string>)[camel].trim();
    }

    // Fallback: first non-empty cell
    const firstValue = Object.values(row).find((val) => (val || "").trim());
    return firstValue?.trim() || "";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setResults([]);
    setProgress(0);
    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (parsed) => {
        const rows = (parsed.data as Record<string, string>[]) || [];
        const extracted = rows
          .map((row) => extractKeyword(row))
          .filter((kw) => kw);
        const unique = Array.from(new Set(extracted));

        if (!unique.length) {
          setError("No keywords found. Make sure your CSV has a keyword column.");
          setKeywords([]);
          return;
        }

        setKeywords(unique);
      },
      error: (err) => {
        console.error(err);
        setError("Failed to read CSV file.");
      },
    });
  };

  const canAnalyze = useMemo(
    () => !!geminiApiKey && !!keywords.length && !loading,
    [geminiApiKey, keywords.length, loading],
  );

  const handleAnalyze = async () => {
    if (!geminiApiKey) {
      setError("Please provide your Gemini API key.");
      return;
    }
    if (!keywords.length) {
      setError("No keywords to analyze. Upload a CSV first.");
      return;
    }

    setLoading(true);
    setError(null);
    setProgress(0);
    const nextResults: AnalyzedRow[] = new Array(keywords.length);

    try {
      const timestamps: number[] = [];
      const acquireSlot = async () => {
        while (true) {
          const now = Date.now();
          while (timestamps.length && now - timestamps[0] >= 1000) {
            timestamps.shift();
          }
          if (timestamps.length < RATE_LIMIT_MAX_PER_SEC) {
            timestamps.push(now);
            return;
          }
          const waitFor = 1000 - (now - timestamps[0]);
          await new Promise((resolve) => setTimeout(resolve, waitFor));
        }
      };

      let nextIndex = 0;
      let finished = 0;

      const runWorker = async () => {
        while (true) {
          const currentIndex = nextIndex;
          nextIndex += 1;
          if (currentIndex >= keywords.length) break;

          const keyword = keywords[currentIndex];
          try {
            await acquireSlot();
            const response = await generateWithGemini(
              keyword,
              prompt,
              geminiApiKey,
              OUTPUT_SCHEMA,
              REQUIRED_FIELDS,
            );

            nextResults[currentIndex] = {
              keyword,
              brand: (response as Record<string, string>).brand || "",
              category: (response as Record<string, string>).category || "",
              normalizedBrand:
                (response as Record<string, string>).normalizedBrand || "",
            };
          } catch (err) {
            console.error(err);
            nextResults[currentIndex] = {
              keyword,
              brand: "",
              category: "",
              normalizedBrand: "",
            };
          }

          finished += 1;
          setProgress(Math.round((finished / keywords.length) * 100));
        }
      };

      const workers = Array.from({ length: MAX_CONCURRENCY }, runWorker);
      await Promise.all(workers);
      setResults(nextResults);
    } catch (err) {
      console.error(err);
      setError("Analysis failed. Check your API key and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!results.length) {
      setError("No results to export.");
      return;
    }
    const csv = Papa.unparse(
      results.map(({ keyword, brand, category, normalizedBrand }) => ({
        keyword,
        brand,
        category,
        normalizedBrand,
      })),
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "analysis-results.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-6 py-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Analyzer</h1>
            <p className="text-muted-foreground">
              Upload a CSV of search keywords and predict brand, normalized brand, and category. Fields can stay empty if unknown.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>1) CSV upload</CardTitle>
            <CardDescription>
              Pick a CSV that contains keywords (column name like
              keyword/query/title).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={loading}
            />
            {fileName && (
              <p className="text-sm text-muted-foreground">Loaded: {fileName}</p>
            )}
            {keywords.length > 0 && (
              <p className="text-sm text-foreground">
                Found {keywords.length} keywords.
              </p>
            )}
            {error && (
              <p className="text-sm text-red-600">
                {error}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>2) Settings</CardTitle>
            <CardDescription>
              API key is stored locally. Update the prompt if you need
              different rules.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Gemini API key</label>
              <Input
                value={geminiApiKey}
                onChange={(e) => handleApiKeyChange(e.target.value)}
                placeholder="Enter your Gemini API key"
                type="password"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Prompt</label>
              <Textarea
                className="h-48"
                value={prompt}
                onChange={(e) => handlePromptChange(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button
              className="w-full"
              onClick={handleAnalyze}
              disabled={!canAnalyze}
            >
              {loading ? "Analyzing..." : "Analyze keywords"}
            </Button>
            {loading && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-xs text-muted-foreground">
                  Processing {progress}% ({results.length}/{keywords.length})
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>3) Preview</CardTitle>
            <CardDescription>
              Quick look at keywords before/after analysis.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm font-medium">Sample keywords</p>
            <div className="max-h-32 overflow-y-auto rounded border bg-muted/50 p-2 text-sm">
              {keywords.slice(0, 10).map((kw, idx) => (
                <div key={`${kw}-${idx}`} className="text-foreground">
                  • {kw}
                </div>
              ))}
              {keywords.length === 0 && (
                <p className="text-muted-foreground">No keywords loaded yet.</p>
              )}
              {keywords.length > 10 && (
                <p className="text-xs text-muted-foreground">
                  +{keywords.length - 10} more
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="container mx-auto px-6 pb-10">
        <Card>
          <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Results</CardTitle>
              <CardDescription>
                Brand, normalized brand, and category will appear after analysis.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={!results.length || loading}
            >
              Export CSV
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Keyword</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Normalized Brand</TableHead>
                    <TableHead>Category</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-sm">
                        No results yet.
                      </TableCell>
                    </TableRow>
                  )}
                  {results.map((row, idx) => (
                    <TableRow key={`${row.keyword}-${idx}`}>
                      <TableCell className="max-w-xs truncate">
                        {row.keyword}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {row.brand}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {row.normalizedBrand}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {row.category}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}