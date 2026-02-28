import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const GEMINI_EMBEDDING_MODEL = "models/gemini-embedding-001";
const GEMINI_EMBEDDING_DIMENSIONS = 768;
const GEMINI_EMBEDDING_API_URL = `https://generativelanguage.googleapis.com/v1beta/${GEMINI_EMBEDDING_MODEL}:embedContent`;

type GeminiEmbeddingTaskType = "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY";

function normalizeEmbedding(values: number[]): number[] {
  const magnitude = Math.sqrt(
    values.reduce((sum, value) => sum + value * value, 0),
  );

  if (!Number.isFinite(magnitude) || magnitude === 0) {
    throw new Error(
      "Gemini embedding normalization failed due to zero magnitude.",
    );
  }

  return values.map((value) => value / magnitude);
}

export async function generateGeminiEmbedding(
  text: string,
  taskType: GeminiEmbeddingTaskType,
): Promise<number[]> {
  const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Missing GOOGLE_AI_API_KEY or GEMINI_API_KEY for Gemini embeddings.",
    );
  }

  const response = await axios.post(
    GEMINI_EMBEDDING_API_URL,
    {
      content: {
        parts: [{ text }],
      },
      taskType,
      outputDimensionality: GEMINI_EMBEDDING_DIMENSIONS,
    },
    {
      params: { key: apiKey },
      headers: { "Content-Type": "application/json" },
    },
  );

  const values = response.data?.embedding?.values;
  if (!Array.isArray(values)) {
    throw new Error("Invalid Gemini embedding response format.");
  }

  if (values.length !== GEMINI_EMBEDDING_DIMENSIONS) {
    throw new Error(
      `Expected ${GEMINI_EMBEDDING_DIMENSIONS}-dimensional embedding, received ${values.length}.`,
    );
  }

  return normalizeEmbedding(values);
}

export { GEMINI_EMBEDDING_DIMENSIONS, GEMINI_EMBEDDING_MODEL };
