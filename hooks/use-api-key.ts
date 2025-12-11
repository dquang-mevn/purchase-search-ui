"use client";

import { useEffect, useState } from "react";

const AI_STUDIO_GEMINI_API_KEY = "ai-studio-gemini-api-key";

export const useApiKey = () => {
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const saveApiKey = async (apiKey: string) => {
    setGeminiApiKey(apiKey);
    localStorage.setItem(AI_STUDIO_GEMINI_API_KEY, apiKey);
  };

  useEffect(() => {
    const apiKey = localStorage.getItem(AI_STUDIO_GEMINI_API_KEY);
    setGeminiApiKey(apiKey || "");
  }, []);

  return {
    apiKey: geminiApiKey,
    setApiKey: setGeminiApiKey,
    saveApiKey,
  };
};
