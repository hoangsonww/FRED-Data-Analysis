import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";

dotenv.config();

/**
 * @file pineconeClient.ts - Pinecone client configuration.
 * This file initializes the Pinecone client and exports the index object for use in other modules.
 * It uses the Pinecone database to store and retrieve vector embeddings.
 */

// @ts-ignore
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pinecone.index(process.env.PINECONE_INDEX_NAME as string);

export { index };
