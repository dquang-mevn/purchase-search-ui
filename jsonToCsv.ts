import * as fs from "fs";
import * as path from "path";

// 1. Define Interfaces for Type Safety
interface ItemData {
  item_id: string;
  title: string;
  image_url: string;
  category: string;
  bought: string;
  // Add other fields here if needed in the future, currently optional
  [key: string]: any;
}

interface JsonFileStructure {
  total: number;
  data: ItemData[];
}

// 2. Configuration
const INPUT_DIR = path.join(__dirname, "data"); // Points to ./data
const OUTPUT_FILE = path.join(__dirname, "data.csv");
const TARGET_FIELDS = ["item_id", "title", "image_url", "category", "bought"];

/**
 * Helper to escape CSV fields correctly.
 * Wraps text in quotes if it contains commas, newlines, or double quotes.
 */
const escapeCsvField = (field: any): string => {
  if (field === null || field === undefined) return "";

  const stringField = String(field);

  // If the field contains special CSV characters, wrap in quotes and escape existing quotes
  if (
    stringField.includes(",") ||
    stringField.includes('"') ||
    stringField.includes("\n")
  ) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }

  return stringField;
};

async function processJsonFiles() {
  console.log(`Starting conversion...`);
  console.log(`Reading from: ${INPUT_DIR}`);

  // Check if data directory exists
  if (!fs.existsSync(INPUT_DIR)) {
    console.error(`Error: Directory "${INPUT_DIR}" not found.`);
    return;
  }

  // Initialize Output Stream
  const writeStream = fs.createWriteStream(OUTPUT_FILE);

  // Write Header Row
  writeStream.write(TARGET_FIELDS.join(",") + "\n");

  try {
    // Read all files in the directory
    const files = fs.readdirSync(INPUT_DIR);
    const jsonFiles = files.filter((file) =>
      file.toLowerCase().endsWith(".json"),
    );

    console.log(`Found ${jsonFiles.length} JSON files.`);

    let totalRecords = 0;

    for (const file of jsonFiles) {
      const filePath = path.join(INPUT_DIR, file);

      try {
        // Read and Parse JSON
        const fileContent = fs.readFileSync(filePath, "utf-8");
        const parsedData: JsonFileStructure = JSON.parse(fileContent);

        if (parsedData.data && Array.isArray(parsedData.data)) {
          // Loop through the "data" array in the JSON
          parsedData.data.forEach((item) => {
            const csvRow = [
              escapeCsvField(item.item_id),
              escapeCsvField(item.title),
              escapeCsvField(item.image_url),
              escapeCsvField(item.category),
              escapeCsvField(item.bought),
            ].join(",");

            writeStream.write(csvRow + "\n");
            totalRecords++;
          });
        }
      } catch (err) {
        console.error(`Error processing file ${file}:`, err);
      }
    }

    console.log(`\nSuccess! Extracted ${totalRecords} rows.`);
    console.log(`Saved to: ${OUTPUT_FILE}`);
  } catch (error) {
    console.error("Critical error:", error);
  } finally {
    writeStream.end();
  }
}

processJsonFiles();
