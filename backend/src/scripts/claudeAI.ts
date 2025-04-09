import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  GenerationConfig,
} from "@google/generative-ai";
import dotenv from "dotenv";
import { queryRag } from "../queryRag";

/**
 * @file chatWithAI.ts
 * This file contains the function to interact with the Google Gemini AI model.
 * It retrieves relevant knowledge from Pinecone and generates a response
 * based on the user's message and the retrieved context.
 */

dotenv.config();

/**
 * Sends a chat message to Gemini AI, first searching Pinecone for relevant knowledge.
 * The retrieved knowledge is appended to the conversation history as additional context,
 * including citation IDs. When generating the answer, the AI is instructed to include these
 * citations correctly.
 *
 * Implements RAG (Retrieval-Augmented Generation) by querying Pinecone for relevant
 * knowledge based on the user's message. This ensures the AI always has the most relevant
 * and up-to-date information to provide accurate answers, reducing hallucinations and ensuring
 * it always cites sources when answering the user's queries.
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
  const pineconeResults = await queryRag(message, 3);
  let additionalContext = "";

  if (pineconeResults.length > 0) {
    // Include the citation ID (from Pinecone) after each knowledge snippet.
    additionalContext = `\n\nRelevant Information (please use the citation IDs in your answer):\n${pineconeResults
      .map((r) => `- ${r.metadata?.text ?? "No text available"} [${r.id}]`)
      .join("\n")}`;
  } else {
    additionalContext =
      "\n\nNo relevant knowledge found in Pinecone. Use your general knowledge to answer accurately.";
  }

  console.log("🧠 Enriching AI with Pinecone knowledge:", additionalContext);

  // Ensure system instruction is a string
  const fullSystemInstruction: string =
    systemInstruction ||
    (process.env.AI_INSTRUCTIONS as string) ||
    "Answer questions based on the context provided, specifically also state how banking sector is impacted, and so on.";

  // Initialize Gemini AI
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: fullSystemInstruction,
  });

  const generationConfig: GenerationConfig = {
    temperature: 1,
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

  // If the text response is a function, call it to get the string value.
  const responseText =
    typeof result.response.text === "function"
      ? result.response.text()
      : result.response.text;

  return responseText;
};

// ----- Example usage -----
(async () => {
  try {
    // Example conversation history; can be empty for a new conversation.
    const conversationHistory: Array<{
      role: string;
      parts: Array<{ text: string }>;
    }> = [];
    const userMessage =
      "What will happen to the banking sector if the Federal Reserve raises interest rates?";
    const aiResponse = await chatWithAI(conversationHistory, userMessage);
    console.log("\nChatbot Response:");
    console.log(aiResponse);
  } catch (error) {
    console.error("Error during chat:", error);
  }
})();
