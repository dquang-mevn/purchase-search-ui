import { useState, useEffect, useCallback } from "react";

export function useSearchParams() {
  // 1. Initialize state with the current window location (SSR safe)
  const [params, setParams] = useState<string>(() =>
    typeof window !== "undefined" ? window.location.search : ""
  );

  // 2. Listen for browser navigation (Back/Forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      setParams(window.location.search);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // 3. Set search params to query params
  const setSearchParams = useCallback(async (value: string) => {
    // Prevent execution on server
    if (typeof window === "undefined") return;

    // Create a new URL object based on current location
    const url = new URL(window.location.href);

    // Set the search property (e.g., "?query=react")
    // If the input 'value' doesn't start with '?', this handles it automatically
    url.search = value;

    // Update the browser URL without reloading the page
    window.history.pushState({}, "", url);

    // Update local state to trigger a re-render
    setParams(url.search);
  }, []);

  return {
    params,
    setSearchParams,
  };
}
