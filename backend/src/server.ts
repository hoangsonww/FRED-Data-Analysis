// server.ts
import express, { Request, Response } from "express";
import cors from "cors";
import favicon from "serve-favicon";
import path from "path";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import { chatWithAI } from "./chatWithAI";

dotenv.config();

/**
 * @file server.ts - Express server for chat, MongoDB, Swagger UI, and favicon.
 */

const app = express();
const PORT = process.env.PORT || 5050;

// ─── GLOBAL MIDDLEWARE ────────────────────────────────────────────────────────
// Allow all CORS origins
app.use(cors({ origin: "*" }));
// Parse JSON bodies
app.use(express.json());
// Serve favicon.ico from public/
app.use(favicon(path.join(__dirname, "..", "public", "favicon.ico")));

// ─── MONGODB SETUP ─────────────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI!;
const MONGO_DB = "fredDataDB";
const MONGO_COLLECTION = "observations";

let dbClient: MongoClient | null = null;
async function connectToMongo(): Promise<ReturnType<MongoClient["db"]>> {
  if (!dbClient) {
    dbClient = new MongoClient(MONGO_URI);
    await dbClient.connect();
    console.log("Connected to MongoDB");
  }
  return dbClient.db(MONGO_DB);
}

// ─── SWAGGER SPECIFICATION ────────────────────────────────────────────────────
const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "FRED Data API",
    version: "1.0.0",
    description:
      "API for chat interactions with AI and retrieval of FRED time-series observations.",
  },
  servers: [
    { url: "http://localhost:5050/", description: "Local server" },
    {
      url: "https://your-vercel-deployment-url.vercel.app/",
      description: "Vercel deployment",
    },
  ],
  paths: {
    "/chat": {
      post: {
        summary: "Chat with AI",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ChatRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "AI response",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ChatResponse" },
              },
            },
          },
          400: { description: "Bad request" },
          500: { description: "Server error" },
        },
      },
    },
    "/observations": {
      get: {
        summary: "Get observations",
        responses: {
          200: {
            description: "List of observations",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ObservationsResponse" },
              },
            },
          },
          500: { description: "Server error" },
        },
      },
    },
  },
  components: {
    schemas: {
      ChatRequest: {
        type: "object",
        required: ["message"],
        properties: {
          message: { type: "string" },
          history: {
            type: "array",
            items: {
              type: "object",
              properties: {
                role: { type: "string" },
                parts: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: { text: { type: "string" } },
                  },
                },
              },
            },
          },
          systemInstruction: { type: "string" },
        },
      },
      ChatResponse: {
        type: "object",
        properties: { response: { type: "string" } },
      },
      ObservationsResponse: {
        type: "object",
        properties: {
          observations: {
            type: "array",
            items: { type: "object" },
          },
        },
      },
    },
  },
};

// ─── SWAGGER JSON & UI ────────────────────────────────────────────────────────
// Serve raw JSON
app.get("/swagger.json", (_req, res) => {
  res.json(swaggerSpec);
});
// Serve Swagger UI
app.get("/api-docs", (_req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><title>FRED Data API Docs</title>
<link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@4/swagger-ui.css"/>
<link rel="icon" href="/favicon.ico"/>
<style>body{margin:0;padding:0}</style>
</head><body>
<div id="swagger-ui"></div>
<script src="https://unpkg.com/swagger-ui-dist@4/swagger-ui-bundle.js"></script>
<script src="https://unpkg.com/swagger-ui-dist@4/swagger-ui-standalone-preset.js"></script>
<script>
  window.onload = () => {
    SwaggerUIBundle({
      url: '/swagger.json',
      dom_id: '#swagger-ui',
      presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
      layout: 'BaseLayout'
    });
  };
</script>
</body></html>`);
});

// ─── REDIRECT ROOT → SWAGGER ───────────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.redirect("/api-docs");
});

// ─── REAL API ROUTES ────────────────────────────────────────────────────────────
// POST /chat
app.post("/chat", (req: Request, res: Response): void => {
  const { message, history, systemInstruction } = req.body;
  if (!message) {
    res.status(400).json({ error: "Missing message in request body" });
    return;
  }
  chatWithAI(history || [], message, systemInstruction)
    .then((responseText) => {
      res.json({ response: responseText });
    })
    .catch((error) => {
      console.error("Error in /chat:", error);
      res.status(500).json({ error: "Internal server error" });
    });
});

// GET /observations
app.get("/observations", (_req: Request, res: Response): void => {
  connectToMongo()
    .then((db) => db.collection(MONGO_COLLECTION).find({}).toArray())
    .then((observations) => {
      res.json({ observations });
    })
    .catch((error) => {
      console.error("Error in /observations:", error);
      res.status(500).json({ error: "Internal server error" });
    });
});

// ─── SERVER STARTUP ────────────────────────────────────────────────────────────
// If run directly, start listening
if (require.main === module) {
  app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
  });
}

// Export app for Vercel
export default app;
