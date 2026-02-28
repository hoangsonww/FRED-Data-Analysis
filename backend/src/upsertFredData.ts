import { MongoClient } from "mongodb";
import { index } from "./pineconeClient";
import dotenv from "dotenv";
import {
  GEMINI_EMBEDDING_DIMENSIONS,
  generateGeminiEmbedding,
} from "./geminiEmbedding";

dotenv.config();

/**
 * @file upsertFredData.ts - Upsert FRED observation data from MongoDB to Pinecone.
 * This file retrieves FRED observation data from MongoDB, generates or reuses embeddings
 * using Google Generative AI, caches them to avoid re-generation, and upserts the vectors
 * into Pinecone in manageable batches.
 *
 * @author David Nguyen
 * @date 2024-04-08
 */

// MongoDB configuration
const MONGO_URI = process.env.MONGO_URI!;
const MONGO_DB = "fredDataDB";
const MONGO_COLLECTION = "observations";

/**
 * Upsert FRED observation data from MongoDB to Pinecone.
 * If an observation already includes a cached embedding, it reuses it.
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

  // Process each observation document
  for (const doc of observations) {
    // Construct a textual representation.
    const text = `FRED series ${doc.seriesId} observation on ${doc.date.toISOString()} had value ${doc.value}.`;

    let embedding: number[] | undefined = doc.embedding;
    const hasExpectedDimensions =
      Array.isArray(embedding) &&
      embedding.length === GEMINI_EMBEDDING_DIMENSIONS;

    // If embedding already exists (cached), reuse it; otherwise, generate and cache it.
    if (!hasExpectedDimensions) {
      try {
        if (Array.isArray(embedding)) {
          console.log(
            `Regenerating cached embedding with ${embedding.length} dimensions for: "${text}"`,
          );
        }
        console.log(`Generating embedding for: "${text}"`);
        embedding = await generateGeminiEmbedding(text, "RETRIEVAL_DOCUMENT");

        if (!embedding || !Array.isArray(embedding)) {
          throw new Error("Invalid embedding response format.");
        }

        // Update the document in MongoDB with the new embedding to cache it for future runs.
        await collection.updateOne({ _id: doc._id }, { $set: { embedding } });
      } catch (error) {
        console.error(`Error processing document ${doc._id}:`, error);
        continue;
      }
    } else {
      console.log(`Using cached embedding for: "${text}"`);
    }

    // Create a unique vector ID (combine seriesId and date)
    const vectorId = `${doc.seriesId}_${new Date(doc.date).toISOString().split("T")[0]}`;
    vectors.push({
      id: vectorId,
      // @ts-ignore
      values: embedding,
      metadata: {
        seriesId: doc.seriesId,
        date: new Date(doc.date),
        value: doc.value,
        text,
      },
    });
  }

  // Batch upsert to Pinecone; use a batch size to ensure the payload is below 4 MB.
  const batchSize = 100;
  let totalUpserted = 0;

  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, i + batchSize);
    try {
      // @ts-ignore
      await index.namespace("fred").upsert(batch);
      totalUpserted += batch.length;
      console.log(
        `Upserted batch ${Math.floor(i / batchSize) + 1} (${batch.length} vectors).`,
      );
    } catch (error) {
      console.error("Error upserting batch starting at index", i, error);
    }
  }

  console.log(`Successfully upserted ${totalUpserted} vectors to Pinecone.`);
  await client.close();
}

// Execute the upsert function
upsertFredData().catch((error) => {
  console.error("Error in upserting FRED data to Pinecone:", error);
});
