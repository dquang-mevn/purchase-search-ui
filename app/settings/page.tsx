"use client";

import React, { useState } from "react";
import { Save, CheckCircle2, XCircle, Loader2, Server } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSearchApi } from "@/hooks/use-search";
import CsvImporter from "@/components/csv-importer";
import { useApiKey } from "@/hooks/use-api-key";

export default function SettingsPage() {
  const {
    searchEndpoint,
    setSearchEndpoint,
    handleSaveSearchEndpoint,
    checkHealth,
  } = useSearchApi();

  const { apiKey, setApiKey, saveApiKey } = useApiKey();

  // Status states
  const [isChecking, setIsChecking] = useState(false);
  const [healthStatus, setHealthStatus] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved">("idle");

  // Handle Health Check
  const handleCheckHealth = async () => {
    if (!searchEndpoint) return;

    setIsChecking(true);

    try {
      const isHealthy = await checkHealth();
      setHealthStatus(isHealthy ? "ok" : "error");
    } catch (error) {
      console.error(error);
    } finally {
      setIsChecking(false);
    }
  };

  // 3. Handle Save to LocalStorage
  const handleSave = () => {
    handleSaveSearchEndpoint();
    saveApiKey(apiKey);

    setSaveStatus("saved");

    // Reset "saved" message after 2 seconds
    setTimeout(() => setSaveStatus("idle"), 2000);
  };

  return (
    <div className="flex flex-col gap-4 min-h-screen items-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-md border bg-muted">
              <Server className="size-4" />
            </div>
            <div>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>
                Manage your API connection settings.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <Separator className="mb-6" />

        <CardContent className="space-y-6">
          {/* API URL Section */}
          <div className="space-y-2">
            <Label htmlFor="api-url">API Endpoint URL</Label>
            <div className="flex space-x-2">
              <Input
                id="api-url"
                placeholder="https://api.example.com/v1"
                value={searchEndpoint}
                onChange={(e) => {
                  setSearchEndpoint(e.target.value);
                }}
              />
              <Button
                variant="outline"
                onClick={handleCheckHealth}
                disabled={isChecking}
                className="w-32"
              >
                {isChecking ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  "Check"
                )}
              </Button>
            </div>

            {/* Health Status Feedback */}
            {healthStatus === "ok" && (
              <p className="flex items-center text-sm font-medium text-emerald-600">
                <CheckCircle2 className="mr-1.5 size-4" /> API Working
              </p>
            )}
            {healthStatus === "error" && (
              <p className="flex items-center text-sm font-medium text-destructive">
                <XCircle className="mr-1.5 size-4" /> Connection Failed
              </p>
            )}
          </div>

          {/* API Key Section */}
          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <Input
              id="api-key"
              type="password"
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-[0.8rem] text-muted-foreground">
              Your key is stored locally in your browser.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-2 border-t bg-muted/20 px-6 py-4">
          <Button onClick={handleSave} disabled={saveStatus === "saved"}>
            {saveStatus === "saved" ? (
              <>
                <CheckCircle2 className="mr-2 size-4" /> Saved
              </>
            ) : (
              <>
                <Save className="mr-2 size-4" /> Save Settings
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <CsvImporter />
    </div>
  );
}
