import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  GenerationConfig,
} from "@google/generative-ai";
import dotenv from "dotenv";
import { queryRag } from "./queryRag";

/**
 * @file chatWithAI.ts
 * This file contains the function to interact with the Google Gemini AI model.
 * It retrieves relevant knowledge from Pinecone and generates a response
 * based on the user's message and the retrieved context.
 *
 * The prompt has been refined to instruct the AI to provide definitive, data-backed responses.
 * Every statement must be supported by citations referencing the provided context, and any prediction
 * (such as future FED interest rate movements) must be based on historical data-backed reasoning.
 *
 * Additionally, if the provided context is limited, you must incorporate your verified internal economic
 * knowledge to explain key economic events driving the trends. Your answer MUST be definitive with no uncertainty.
 *
 * @author David Nguyen
 * @date 2024-04-08
 */

dotenv.config();

/**
 * Sends a chat message to Gemini AI, first searching Pinecone for relevant knowledge.
 * The retrieved knowledge is appended to the conversation history as additional context,
 * including citation IDs. When generating the answer, the AI is instructed to include these
 * citations precisely and integrate its own comprehensive and verified historical knowledge on
 * economic events to deliver a conclusive and definitive response.
 *
 * Implements RAG (Retrieval-Augmented Generation) by querying Pinecone for relevant
 * knowledge based on the user's message. This ensures the AI always has sufficient information to provide
 * accurate, definite, and fully cited answers.
 *
 * @param history - The conversation history (an array of message objects).
 * @param message - The new user message.
 * @param systemInstruction - (Optional) A system instruction to guide the AI.
 * @returns A promise resolving with the AI's response text.
 */
export const chatWithAI = async (
  history: Array<{ role: string; parts: Array<{ text: string }> }>,
  message: string,
  systemInstruction?: string,
): Promise<string> => {
  if (!process.env.GOOGLE_AI_API_KEY) {
    throw new Error("Missing GOOGLE_AI_API_KEY in environment variables");
  }

  // Query Pinecone for relevant context
  const pineconeResults = await queryRag(message, 3000);
  let additionalContext = "";

  if (pineconeResults.length > 0) {
    // Include the citation ID (from Pinecone) after each knowledge snippet.
    additionalContext = `\n\nRelevant Information (please use the citation IDs exactly as given in your answer):\n${pineconeResults
      .map((r) => `- ${r.metadata?.text ?? "No text available"} [${r.id}]`)
      .join("\n")}`;
  } else {
    additionalContext =
      "\n\nNo relevant knowledge found in Pinecone. However, use your comprehensive historical and economic expertise to provide a definitive, data-backed answer with no uncertainty.";
  }

  console.log("🧠 Enriching AI with Pinecone knowledge:", additionalContext);

  // Refined system instruction: MUST provide a definitive and unequivocal answer using both provided context and your verified general economic data.
  const fullSystemInstruction: string =
    systemInstruction ||
    (process.env.AI_INSTRUCTIONS as string) ||
    "You are a data analytics expert with comprehensive verified historical knowledge of economic events. " +
    "Answer the user's question with absolute certainty, providing a definitive and conclusive response. " +
    "Your answer must be data-backed and every statement must be supported by a citation from the provided context (using citation IDs exactly as given), " +
    "as well as your general historical knowledge. " +
    "When predicting future values such as FED interest rates, state the exact predicted values and explain the specific economic events (e.g., recessions, inflationary pressures, shifts in employment, major Fed policy changes) that drive these predictions. " +
    "Do not use any uncertain language (words like 'might', 'could', or 'possibly'). Your response must be presented with complete confidence.";

  // Initialize Gemini AI with refined instructions
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: fullSystemInstruction,
  });

  // Adjusted generation configuration for more deterministic responses
  const generationConfig: GenerationConfig = {
    temperature: 0.4,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
  ];

  // Append the user message and additional context to the conversation history.
  history.push({ role: "user", parts: [{ text: message }] });
  history.push({ role: "user", parts: [{ text: additionalContext }] });

  // Start chat session
  const chatSession = model.startChat({
    generationConfig,
    safetySettings,
    history,
  });

  const result = await chatSession.sendMessage(message);

  if (!result.response || !result.response.text) {
    throw new Error("Failed to get text response from the AI.");
  }

  const responseText =
    typeof result.response.text === "function"
      ? result.response.text()
      : result.response.text;

  return responseText;
};

// ----- Example usage -----
(async () => {
  try {
    const conversationHistory: Array<{ role: string; parts: Array<{ text: string }> }> = [];
    const userMessage =
      "Predict the future FED interest rate based on historical data and explain the key economic events that have affected it. Please provide data-backed reasoning with citations.";
    const aiResponse = await chatWithAI(conversationHistory, userMessage);
    console.log("\nChatbot Response:");
    console.log(aiResponse);
  } catch (error) {
    console.error("Error during chat:", error);
  }
})();
