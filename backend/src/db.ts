import { MongoClient } from "mongodb";
import { MONGO_URI, DB_NAME } from "./config";

const client = new MongoClient(MONGO_URI);
export const db = client.db(DB_NAME);

/**
 * @file db.ts - MongoDB client configuration.
 *
 * @author David Nguyen
 * @date 2024-04-08
 */

/**
 * Connect to MongoDB for the banking data ingestion pipeline.
 */
export async function connectDB() {
  await client.connect();
  console.log("Connected to MongoDB");
}

/**
 * Close the MongoDB connection.
 */
export async function closeDB() {
  await client.close();
  console.log("MongoDB connection closed");
}
