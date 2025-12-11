"use client";

import { useState } from "react";

export function useSearchApi() {
  const [searchEndpoint, setSearchEndpoint] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("search-endpoint") || "";
    }
    return "";
  });

  const handleSaveSearchEndpoint = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("search-endpoint", searchEndpoint);
    }
  };

  const checkHealth = async () => {
    try {
      const response = await fetch(searchEndpoint + "/health");
      if (!response.ok) {
        throw new Error("Health check failed");
      }
      const data = await response.json();
      console.log("Health check successful:", data);
      return true;
    } catch (error) {
      console.error("Health check error:", error);
      return false;
    }
  };

  const search = async (query: string): Promise<any> => {
    const response = await fetch(`${searchEndpoint}/search?${query}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Search request failed");
    }
    const data = await response.json();
    return data;
  };

  return {
    searchEndpoint,
    setSearchEndpoint,
    handleSaveSearchEndpoint,
    checkHealth,
    search,
  };
}
