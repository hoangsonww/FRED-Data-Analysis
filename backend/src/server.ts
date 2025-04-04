import express, { Request, Response } from "express";
import cors from "cors";
import { chatWithAI } from "./chatWithAI";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

/**
 * @file server.ts - Express server for handling chat requests and MongoDB interactions.
 * This file sets up an Express server that listens for incoming requests,
 * handles chat interactions with an AI model,
 * and retrieves observation data from a MongoDB database.
 */

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());
// Parse incoming JSON requests
app.use(express.json());

// MongoDB configuration
const MONGO_URI = process.env.MONGO_URI!;
const MONGO_DB = "fredDataDB";
const MONGO_COLLECTION = "observations";

// MongoDB client instance - instantiated only once and reused
let dbClient: MongoClient | null = null;
async function connectToMongo(): Promise<ReturnType<MongoClient["db"]>> {
  if (!dbClient) {
    dbClient = new MongoClient(MONGO_URI);
    await dbClient.connect();
    console.log("Connected to MongoDB");
  }
  return dbClient.db(MONGO_DB);
}

/**
 * GET /
 * Root endpoint that provides API information.
 */
app.get("/", (req: Request, res: Response): void => {
  res.json({
    message: "Welcome to the FRED Data API",
    endpoints: {
      chat: "POST /chat - for AI chat interactions",
      observations: "GET /observations - retrieve all observation data",
    },
    usage: "Visit /chat or /observations to interact with the API.",
  });
});

/**
 * POST /chat
 * Expects a JSON payload with:
 *   - message: string (the user's message)
 *   - history?: Array<{ role: string, parts: Array<{ text: string }> }> (optional conversation history)
 *   - systemInstruction?: string (optional system instruction)
 * Returns: { response: string }
 */
app.post("/chat", async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, history, systemInstruction } = req.body;
    if (!message) {
      res.status(400).json({ error: "Missing message in request body" });
      return;
    }

    // If no history is provided, start with an empty conversation.
    const conversationHistory = history || [];

    const responseText = await chatWithAI(
      conversationHistory,
      message,
      systemInstruction,
    );
    res.json({ response: responseText });
  } catch (error) {
    console.error("Error in /chat:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /observations
 * Returns all observation documents from MongoDB.
 * This route can be used by the front-end to generate charts.
 */
app.get("/observations", async (req: Request, res: Response): Promise<void> => {
  try {
    const db = await connectToMongo();
    const observations = await db
      .collection(MONGO_COLLECTION)
      .find({})
      .toArray();
    res.json({ observations });
  } catch (error) {
    console.error("Error in /observations:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
