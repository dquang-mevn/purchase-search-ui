"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { generateWithGemini } from "@/lib/gemini-helpers";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AiStudioPage() {
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState<Record<string, string>>({});
  const [geminiApiKey, setGeminiApiKey] = useState("");

  const handleSetPrompt = (value: string) => {
    localStorage.setItem("ai-studio-prompt", value);
    setPrompt(value);
  };
  const handleSetGeminiApiKey = (value: string) => {
    localStorage.setItem("ai-studio-gemini-api-key", value);
    setGeminiApiKey(value);
  };

  const handleGenerate = async () => {
    const generatedContent = await generateWithGemini(
      title,
      prompt,
      geminiApiKey,
    );
    setResponse(generatedContent);
  };

  useEffect(() => {
    const cachedPrompt = localStorage.getItem("ai-studio-prompt");
    setPrompt(cachedPrompt || "");
    const apiKey = localStorage.getItem("ai-studio-gemini-api-key");
    setGeminiApiKey(apiKey || "");
  }, []);

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
            <div className="flex justify-center items-center">
              <div>
                <Link
                  className="justify-self-start text-blue-700 underline"
                  href={"/"}
                >
                  Home
                </Link>
              </div>
              <div className="flex-1">
                <label htmlFor="gemini-api-key">Gemini API Key</label>
                <input
                  type="text"
                  name="gemini-api-key"
                  value={geminiApiKey}
                  className="ml-4 px-2 py-1 border rounded-md"
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
        <div className="w-1/2 border-r bg-muted/30 p-6 overflow-y-auto">
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
            className="mt-4 h-96 md:col-span-2"
          />
          <Button className="mt-4 w-full" onClick={handleGenerate}>
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
