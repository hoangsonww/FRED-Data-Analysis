import dotenv from "dotenv";
dotenv.config();

/**
 * @file config.ts - Configuration file for the banking data ingestion pipeline.
 * This file contains constants and environment variables used throughout the application.
 *
 * @author David Nguyen
 * @date 2024-04-08
 */

export const FRED_API_KEY = process.env.FRED_API_KEY || "";
export const FRED_START_DATE = "2010-01-01";
export const FRED_END_DATE = new Date().toISOString().split("T")[0];

export const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY || "";
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
export const GEMINI_API_URL = process.env.GEMINI_API_URL || "";

export const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";
export const DB_NAME = "banking_data";
export const COLLECTION_NAME = "fred_data";

export const PINECONE_API_KEY = process.env.PINECONE_API_KEY || "";
export const PINECONE_ENV = process.env.PINECONE_ENV || "us-west1-gcp";
export const PINECONE_INDEX_NAME = "banking-index";
