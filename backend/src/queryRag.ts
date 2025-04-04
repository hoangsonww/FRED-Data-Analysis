import { index } from "./pineconeClient";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

/**
 * @file queryRag.ts - Querying Pinecone for RAG (Retrieval-Augmented Generation).
 * This file contains the function to query the Pinecone index using a text query,
 * generate an embedding for the query, and retrieve the top-K matching documents.
 */

// Initialize Google Generative AI embedding model - dimensions is 768
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "models/text-embedding-004" });

/**
 * Queries the Pinecone index using an input query string.
 * Generates an embedding for the query, queries the Pinecone index in the "fred" namespace,
 * and returns the top-K matching documents. By default, it returns 5 best matches.
 *
 * @param queryText - The text query (e.g., "What was the Federal Funds rate in early 2020?")
 * @param topK - The number of top matching documents to return (default: 5)
 */
export async function queryRag(queryText: string, topK: number = 5) {
  console.log(`Generating embedding for query: "${queryText}"`);
  const embeddingResponse = await model.embedContent(queryText);
  const queryVector = embeddingResponse.embedding.values;
  if (!queryVector || !Array.isArray(queryVector)) {
    throw new Error("Invalid embedding response format.");
  }

  console.log("Querying Pinecone index...");
  const queryResponse = await index.namespace("fred").query({
    vector: queryVector,
    topK,
    includeMetadata: true,
  });

  console.log("Query Response:");
  console.log(JSON.stringify(queryResponse, null, 2));

  // Process and return the results as an array of objects.
  return (queryResponse.matches || []).map((match) => ({
    id: match.id,
    score: match.score,
    metadata: match.metadata,
  }));
}

// Example usage: query Pinecone and log the results for RAG integration.
(async () => {
  try {
    const sampleQuery = "What was the Federal Funds rate in early 2020?";
    const results = await queryRag(sampleQuery, 5);

    console.log("\nRetrieved results for RAG:");
    for (const result of results) {
      console.log(`ID: ${result.id}`);
      console.log(`Score: ${result.score}`);
      console.log("Metadata:", result.metadata);
      console.log("-----------");
    }
  } catch (error) {
    console.error("Error querying Pinecone:", error);
  }
})();
