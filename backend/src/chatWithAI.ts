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
 * The prompt has been refined so that the AI provides definitive, unequivocal,
 * data-backed responses that assume the provided dataset is comprehensive. Every
 * statement must be supported by citations from the provided context and/or verified historical data.
 * When predicting future values, the answer must include exact predicted values and
 * clearly identify the specific economic events driving these trends.
 *
 * No uncertainty or statements suggesting incomplete data are permitted.
 *
 * @author David Nguyen
 * @date 2024-04-08
 */

dotenv.config();

/**
 * Sends a chat message to Gemini AI, first searching Pinecone for relevant knowledge.
 * The retrieved context is appended to the conversation history along with citation IDs.
 * The AI is instructed to produce a definitive, expert-level answer based on both the provided
 * context and its comprehensive verified internal knowledge—without any uncertainty.
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
    additionalContext = `\n\nRelevant Information (please include the citation IDs exactly as given in your answer):\n${pineconeResults
      .map((r) => `- ${r.metadata?.text ?? "No text available"} [${r.id}]`)
      .join("\n")}`;
  } else {
    additionalContext =
      "\n\nNo additional context returned from Pinecone. However, use your comprehensive verified economic knowledge to provide a definitive and completely conclusive answer.";
  }

  console.log("🧠 Enriching AI with Pinecone knowledge:", additionalContext);

  // Revised system instruction: The provided dataset is fully comprehensive.
  const fullSystemInstruction: string =
    systemInstruction ||
    (process.env.AI_INSTRUCTIONS as string) ||
    "You are an expert data analyst with comprehensive and verified knowledge of economic events. " +
      "Assume that the provided dataset is complete and fully comprehensive. " +
      "Answer the user's question with absolute certainty and provide a definitive, authoritative answer " +
      "without any hedging or uncertainty. " +
      "Your response must integrate the provided citation context alongside your verified historical data, " +
      "and must clearly state exact predictions and the specific economic events (such as recessions, inflation spikes, " +
      "shifts in employment, and clear changes in Fed policy) that drive changes in the FED funds rate. " +
      "Do not mention any gaps, incomplete data, or the need for additional datasets. Every conclusion must be stated as 100% definitive.";

  // Initialize Gemini AI with refined instructions
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: fullSystemInstruction,
  });

  // Adjust generation configuration for deterministic responses
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
    const conversationHistory: Array<{
      role: string;
      parts: Array<{ text: string }>;
    }> = [];
    const userMessage =
      "Predict the future FED interest rate based on historical data and explain the key economic events that have affected it. Please provide data-backed reasoning with citations.";
    const aiResponse = await chatWithAI(conversationHistory, userMessage);
    console.log("\nChatbot Response:");
    console.log(aiResponse);
  } catch (error) {
    console.error("Error during chat:", error);
  }
})();
