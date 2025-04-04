import { MongoClient } from "mongodb";
import { index } from "./pineconeClient";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

/**
 * @file upsertFredData.ts - Upsert FRED observation data from MongoDB to Pinecone.
 * This file contains the function to retrieve FRED observation data from MongoDB,
 * generate embeddings using Google Generative AI, and upsert them into Pinecone.
 * This is part of the data ingestion pipeline for the banking data.
 */

dotenv.config();

// Initialize Google Generative AI embedding model
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");
// Google AI's Text Embedding Model with 768 dimensions
const model = genAI.getGenerativeModel({ model: "models/text-embedding-004" });

// MongoDB configuration
const MONGO_URI = process.env.MONGO_URI!;
const MONGO_DB = "fredDataDB";
const MONGO_COLLECTION = "observations";

/**
 * Upsert FRED observation data from MongoDB to Pinecone.
 */
export async function upsertFredData() {
  // Connect to MongoDB
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db(MONGO_DB);
  const collection = db.collection(MONGO_COLLECTION);

  // Retrieve all observation documents from FRED
  const observations = await collection.find({}).toArray();

  // Prepare an array to hold Pinecone vectors
  const vectors: Array<{
    id: string;
    values: number[];
    metadata: {
      seriesId: string;
      date: Date;
      value: number;
      text: string;
    };
  }> = [];

  // Process each observation document to generate its embedding vector
  for (const doc of observations) {
    // Construct a textual representation of the observation.
    // Example: "FRED series TOTALSL observation on 2020-01-01 had value 2354.8443."
    const text = `FRED series ${doc.seriesId} observation on ${doc.date.toISOString()} had value ${doc.value}.`;

    try {
      console.log(`Generating embedding for: "${text}"`);
      const embeddingResponse = await model.embedContent(text);
      const embedding = embeddingResponse.embedding.values;

      if (!embedding || !Array.isArray(embedding)) {
        throw new Error("Invalid embedding response format.");
      }

      // Create a unique vector ID (for example, combining seriesId and date)
      const vectorId = `${doc.seriesId}_${doc.date.toISOString().split("T")[0]}`;

      // Push the vector and its metadata to the batch
      vectors.push({
        id: vectorId,
        values: embedding,
        metadata: {
          seriesId: doc.seriesId,
          date: doc.date,
          value: doc.value,
          text,
        },
      });
    } catch (error) {
      console.error(`Error processing document ${doc._id}:`, error);
    }
  }

  // Upsert vectors into Pinecone under a specific namespace (e.g., "fred")
  if (vectors.length > 0) {
    // @ts-ignore
    await index.namespace("fred").upsert(vectors);
    console.log(`Successfully upserted ${vectors.length} vectors to Pinecone.`);
  } else {
    console.log("No vectors to upsert.");
  }

  await client.close();
}

// Execute the upsert function
upsertFredData().catch((error) => {
  console.error("Error in upserting FRED data to Pinecone:", error);
});
