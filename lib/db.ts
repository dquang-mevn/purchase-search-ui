"use client";

import { drizzle } from "drizzle-orm/sqlite-proxy";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import Papa from "papaparse";
import { like, sql } from "drizzle-orm";
import { SQLocalDrizzle } from "sqlocal/drizzle";

let sqlocalDriver: SQLocalDrizzle | null = null;
let dbInstance: Promise<ReturnType<typeof drizzle>> | null = null;

const getDb = () => {
  if (typeof window === "undefined") {
    // Return a dummy for server-side rendering (avoids crash)
    return null;
  }

  if (!dbInstance) {
    // Only import and initialize inside the browser
    dbInstance = import("sqlocal/drizzle").then(({ SQLocalDrizzle }) => {
      const client = new SQLocalDrizzle("database.sqlite3");
      sqlocalDriver = client;
      const { driver, batchDriver } = client;
      return drizzle(driver, batchDriver);
    });
  }
  return dbInstance;
};

export const items = sqliteTable("items", {
  item_id: text("item_id").primaryKey().unique().notNull(),
  title: text("title").notNull(),
  image_url: text("image_url"),
  category: text("category"),
  bought: text("bought"),
});

type ItemInsert = typeof items.$inferInsert;

export const createTable = async () => {
  console.log("Creating [items] table...");

  const query = sql.raw(`
      CREATE TABLE IF NOT EXISTS items (
        item_id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        image_url TEXT,
        category TEXT NOT NULL,
        bought TEXT NOT NULL
      );
    `);
  try {
    const db = await getDb();
    if (!db) throw new Error("Browser only");
    await db.run(query);
    console.log("Table 'items' created (or already exists).");
  } catch (error) {
    console.error("Error creating table:", error);
    throw error;
  }
};

export const importData = async (
  file: File,
  onProgress: (progress: number) => void,
) => {
  const db = await getDb();
  if (!db) throw new Error("Browser only");

  return new Promise<void>((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const data = results.data as ItemInsert[];
          const totalRows = data.length;

          if (data.length === 0) {
            console.warn("CSV is empty");
            resolve();
            return;
          }

          // Split data into chunks to avoid "Maximum call stack size exceeded"
          const BATCH_SIZE = 50;

          for (let i = 0; i < data.length; i += BATCH_SIZE) {
            const chunk = data.slice(i, i + BATCH_SIZE);

            // Insert current chunk
            await db.insert(items).values(chunk).onConflictDoNothing(); // or onConflictDoUpdate based on your needs

            // Log progress
            console.log(`Inserted rows ${i} to ${i + chunk.length}`);

            // Calculate percentage
            const currentProgress = Math.round(
              ((i + chunk.length) / totalRows) * 100,
            );

            // Report back to UI
            onProgress(currentProgress);
          }

          console.log(`Successfully imported ${data.length} rows.`);
          resolve();
        } catch (error) {
          console.error("Error inserting data into DB:", error);
          reject(error);
        }
      },
      error: (error: Error) => {
        reject(error);
      },
    });
  });
};

export const exportDatabase = async () => {
  // Ensure DB is loaded
  await getDb();

  if (!sqlocalDriver) throw new Error("Database not initialized");

  // Get the file blob from OPFS
  const fileBlob = await sqlocalDriver.getDatabaseFile();

  // Create a download link programmatically
  const url = URL.createObjectURL(fileBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "items.sqlite3"; // The name of the file you will download
  document.body.appendChild(a);
  a.click();

  // Cleanup
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const resetData = async (tableName: string) => {
  const db = await getDb();
  if (!db) throw new Error("Browser only");
  try {
    await db.run(sql.raw(`DELETE FROM ${tableName}`));
    console.log(`Table ${tableName} cleared.`);
  } catch (error) {
    console.error(`Error clearing table ${tableName}:`, error);
  }
};

export const fullTextSearchTitle = async (
  keyword: string,
  limitCount = 100,
) => {
  const db = await getDb();
  if (!db) throw new Error("Browser only");
  try {
    const searchResult = await db
      .select()
      .from(items)
      .where(like(items.title, `%${keyword}%`))
      .limit(limitCount); // %keyword% matches partial strings

    return searchResult;
  } catch (error) {
    console.error("Search failed:", error);
    return [];
  }
};
