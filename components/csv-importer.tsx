"use client";

import { useState } from "react";
import {
  Upload,
  Trash2,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Download,
} from "lucide-react";
import { createTable, exportDatabase, importData, resetData } from "@/lib/db"; // Adjust path to your db.ts

// Shadcn UI Imports
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "./ui/progress";

export default function CsvImporter() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const [progressValue, setProgressValue] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus("idle");
      setMessage("");
      setProgressValue(0);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setStatus("loading");
    try {
      await createTable();

      await importData(file, (percent) => {
        setProgressValue(percent);
      });
      setStatus("success");
      setMessage(`Successfully imported ${file.name}`);
      setFile(null); // Clear file after success

      // Optional: clear the actual input element value if you have a ref
      const input = document.getElementById("csv-upload") as HTMLInputElement;
      if (input) input.value = "";
    } catch (error) {
      console.error(error);
      setStatus("error");
      setMessage("Failed to import CSV. Check console for details.");
    }
  };

  const handleDownload = async () => {
    try {
      await exportDatabase();
    } catch (e) {
      console.error(e);
      alert("Failed to download database.");
    }
  };

  const handleReset = async () => {
    if (
      confirm("Are you sure? This will delete ALL data in the 'items' table.")
    ) {
      setStatus("loading");
      try {
        await resetData("items");
        setStatus("success");
        setMessage("Database has been reset.");
      } catch (error) {
        console.error(error);
        setStatus("error");
        setMessage("Failed to reset database.");
      }
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-primary" />
          Data Manager
        </CardTitle>
        <CardDescription>
          Upload your inventory CSV or clear the local database.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* File Input Section */}
        <div className="grid w-full items-center gap-2">
          <Label htmlFor="csv-upload">Select CSV File</Label>
          <Input
            id="csv-upload"
            type="file"
            accept=".csv"
            disabled={status === "loading"}
            onChange={handleFileChange}
            className="cursor-pointer"
          />
        </div>

        {/* Show Progress Bar only when loading */}
        {status === "loading" && (
          <div className="space-y-1">
            <Progress value={progressValue} className="w-full h-2" />
            <p className="text-xs text-muted-foreground text-center">
              Processing... {progressValue}%
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Button
            onClick={handleImport}
            disabled={!file || status === "loading"}
            className="w-full sm:w-auto"
          >
            {status === "loading" && file ? (
              "Importing..."
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" /> Import Data
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={handleDownload}
            className="w-full sm:w-auto"
          >
            <Download className="mr-2 h-4 w-4" /> Export DB
          </Button>

          <Button
            variant="destructive"
            onClick={handleReset}
            disabled={status === "loading"}
            className="w-full sm:w-auto"
          >
            <Trash2 className="mr-2 h-4 w-4" /> Reset DB
          </Button>
        </div>

        {/* Status Feedback */}
        {status === "success" && (
          <Alert
            variant="default"
            className="border-green-500 text-green-700 bg-green-50"
          >
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {status === "error" && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
