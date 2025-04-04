import { fetchAllBankingSeries } from "./fetchAllSeries"; // Module that calls storeFredData for each series
import { upsertFredData } from "./upsertFredData"; // Module that upserts MongoDB data to Pinecone
import dotenv from "dotenv";

dotenv.config();

/**
 * Main function to orchestrate the data ingestion and upsert process.
 * Simply run this file to execute the entire pipeline, from fetching
 * data from FRED, cleaning and processing it, storing it in MongoDB,
 * and finally upserting it to Pinecone. It also runs a sample query
 * with the Google Gemini API to demonstrate the integration and the
 * ability of Retrieval-Augmented Generation (RAG) to provide
 * contextualized answers.
 */
async function main() {
  console.log("=== Starting FRED Data Ingestion ===");
  await fetchAllBankingSeries();
  console.log("=== FRED Data Ingestion Completed ===");

  console.log("=== Starting Upsert to Pinecone ===");
  await upsertFredData();
  console.log("=== Upsert to Pinecone Completed ===");
}

main().catch((error) => {
  console.error("Fatal error in the process:", error);
});
