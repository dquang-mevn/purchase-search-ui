"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  generateWithGemini,
} from "@/lib/gemini-helpers";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const OUTPUT_SCHEMA_STORAGE_KEY = "ai-studio-output-schema";
const DEFAULT_SCHEMA_TEXT = JSON.stringify(
  {
    "brand": {"type":"string"},
    "normalizedBrand": {"type":"string"},
    "detailedCategory": {"type": "string"}
  }
);

export default function AiStudioPage() {
  const [title, setTitle] = useState("DULTON エクステンションHHP ハニカムラック");
  const [prompt, setPrompt] = useState("" );
  const [response, setResponse] = useState<Record<string, unknown>>({});
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [requiredFields, setRequiredFields] = useState<string[]>([]);
  
  const [outputSchemaText, setOutputSchemaText] = useState(
    DEFAULT_SCHEMA_TEXT,
  );
  const [schemaError, setSchemaError] = useState<string | null>(null);

  const handleSetPrompt = (value: string) => {
    localStorage.setItem("ai-studio-prompt", value);
    setPrompt(value);
  };
  const handleSetGeminiApiKey = (value: string) => {
    localStorage.setItem("ai-studio-gemini-api-key", value);
    setGeminiApiKey(value);
  };

  const parsedSchema = useMemo(() => {
    try {
      const parsed = JSON.parse(outputSchemaText);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        setSchemaError("Output schema must be an object.");
        return null;
      }

      setSchemaError(null);
      return parsed;
    } catch (error) {
      setSchemaError("Invalid JSON. Please fix the output schema.");
      return null;
    }
  }, [outputSchemaText]);

  const propertyKeys = useMemo(() => {
    if (parsedSchema && typeof parsedSchema === "object") {
      return Object.keys(parsedSchema);
    }
    return [];
  }, [parsedSchema]);

  const handleGenerate = async () => {
    if (!parsedSchema) return;
    console.log({parsedSchema, requiredFields})
    localStorage.setItem(OUTPUT_SCHEMA_STORAGE_KEY, outputSchemaText);
    const generatedContent = await generateWithGemini(
      title,
      prompt,
      geminiApiKey,
      parsedSchema,
      requiredFields
    );
    setResponse(generatedContent);
  };

  useEffect(() => {
    const cachedPrompt = localStorage.getItem("ai-studio-prompt");
    setPrompt(
      cachedPrompt ||
        `Role: Query Understanding
Task: Extract Brand and Category
Input: "%s"
Rules:
- brand: Raw brand as appears in the query (keep original script). If the query clearly mentions a brand, you MUST output it.
- normalizedBrand: Brand name in UPPERCASE ENGLISH (e.g., 東芝->TOSHIBA, シャープ->SHARP, ナショナル->NATIONAL). If you output brand, you MUST output normalizedBrand. Only leave both empty when the query truly has no brand.
- detailedCategory: COARSE product type only (no variants/attributes). UPPERCASE ENGLISH CONSTANT, 1-2 tokens with underscore. Examples (short): COFFEE_MAKER, LAPTOP, SMARTPHONE, CAMERA, LENS, TV, WASHING_MACHINE, MICROWAVE, RICE_COOKER, AIR_CONDITIONER, VACUUM, ROBOT_VACUUM, REFRIGERATOR. Do NOT add qualifiers like ESPRESSO/MULTI-FUNCTION/MANUAL. Always pick the base type only. Use the most common everyday term; avoid niche synonyms (e.g., prefer RECORD_PLAYER over TURNTABLE).`,
    );
    const apiKey = localStorage.getItem("ai-studio-gemini-api-key");
    setGeminiApiKey(apiKey || "");
    const cachedSchema = localStorage.getItem(OUTPUT_SCHEMA_STORAGE_KEY);
    if (cachedSchema) {
      setOutputSchemaText(cachedSchema);
      try {
        const parsed = JSON.parse(cachedSchema);
        if (
          parsed &&
          typeof parsed === "object" &&
          !Array.isArray(parsed)
        ) {
          setRequiredFields(Object.keys(parsed));
        } else {
          setRequiredFields([]);
        }
      } catch (error) {
        setSchemaError("Stored schema is invalid. Using defaults.");
        setOutputSchemaText(DEFAULT_SCHEMA_TEXT);
        setRequiredFields([]);
      }
    }
  }, []);

  useEffect(() => {
    setRequiredFields(propertyKeys);
  }, [propertyKeys]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-6 py-4">
          <div className="text-center space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">
              Product Search AI Studio
            </h1>
            <p className="text-sm text-muted-foreground">For testing prompt</p>
            <div className="flex justify-center items-center gap-4">
              <div>
                <Link
                  className="justify-self-start text-blue-700 underline"
                  href={"/"}
                >
                  Home
                </Link>
              </div>
              <div className="flex-1 flex items-center gap-2">
                <label htmlFor="gemini-api-key" className="text-sm">
                  Gemini API Key
                </label>
                <input
                  type="text"
                  name="gemini-api-key"
                  value={geminiApiKey}
                  className="flex-1 px-2 py-1 border rounded-md"
                  onChange={(e) => handleSetGeminiApiKey(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Side by Side Layout */}
      <div className="flex h-[calc(100vh-120px)]">
        {/* Left Panel - Search Form */}
        <div className="w-1/2 border-r bg-muted/30 p-6 overflow-y-auto space-y-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Product title"
            className="h-9 md:col-span-2"
          />
          <Textarea
            value={prompt}
            onChange={(e) => handleSetPrompt(e.target.value)}
            placeholder="Prompt"
            className="h-40 md:col-span-2"
          />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Output structure</label>
              <span className="text-xs text-muted-foreground">
                Paste properties only or a full JSON schema object.
              </span>
              {schemaError && (
                <span className="text-xs text-red-600">{schemaError}</span>
              )}
            </div>
            <Textarea
              value={outputSchemaText}
              onChange={(e) => setOutputSchemaText(e.target.value)}
              className="font-mono h-48"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Required keys</label>
              <span className="text-xs text-muted-foreground">
                All keys will be required automatically
              </span>
            </div>
            <div className="space-y-1">
              {propertyKeys.length ? (
                propertyKeys.map((key) => (
                  <div key={key} className="text-sm text-foreground">
                    • {key}
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">
                  Define properties in the output schema to require them all.
                </p>
              )}
            </div>
          </div>

          <Button
            className="w-full"
            onClick={handleGenerate}
            disabled={!!schemaError || !parsedSchema}
          >
            Generate
          </Button>
        </div>

        {/* Center area - Search Results */}
        <div className="w-1/2 p-6 overflow-y-auto">
          <pre className="overflow-auto max-w-2xl max-h-[60vh] text-xs bg-gray-100 p-3 rounded border border-gray-200 select-text">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
