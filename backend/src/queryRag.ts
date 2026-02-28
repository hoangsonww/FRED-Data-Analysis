import { index } from "./pineconeClient";
import dotenv from "dotenv";
import { generateGeminiEmbedding } from "./geminiEmbedding";

dotenv.config();

/**
 * @file queryRag.ts - Querying Pinecone for RAG (Retrieval-Augmented Generation).
 * This file contains the function to query the Pinecone index using a text query,
 * generate an embedding for the query, and retrieve the top-K matching documents.
 *
 * @author David Nguyen
 * @date 2024-04-08
 */

/**
 * Queries the Pinecone index using an input query string.
 * Generates an embedding for the query, queries the Pinecone index in the "fred" namespace,
 * and returns the top-K matching documents. By default, it returns 200 best matches.
 *
 * @param queryText - The text query (e.g., "What was the Federal Funds rate in early 2020?")
 * @param topK - The desired number of top matching documents to return (default: 200 for a comprehensive search).
 */
export async function queryRag(queryText: string, topK: number = 200) {
  console.log(`Generating embedding for query: "${queryText}"`);
  const queryVector = await generateGeminiEmbedding(
    queryText,
    "RETRIEVAL_QUERY",
  );
  if (!queryVector || !Array.isArray(queryVector)) {
    throw new Error("Invalid embedding response format.");
  }

  console.log("Querying Pinecone index with topK =", topK);
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
// (async () => {
//   try {
//     const sampleQuery = "What was the Federal Funds rate in early 2020?";
//     const results = await queryRag(sampleQuery);
//
//     console.log("\nRetrieved results for RAG:");
//     for (const result of results) {
//       console.log(`ID: ${result.id}`);
//       console.log(`Score: ${result.score}`);
//       console.log("Metadata:", result.metadata);
//       console.log("-----------");
//     }
//   } catch (error) {
//     console.error("Error querying Pinecone:", error);
//   }
// })();
