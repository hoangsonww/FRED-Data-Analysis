import { OpenAI } from "openai";
import dotenv from "dotenv";
import { queryRag } from "./queryRag";

/**
 * @file chatWithOpenAI.ts
 * This file uses OpenAI's GPT models to generate answers enriched with Pinecone-based retrieval.
 * Implements Retrieval-Augmented Generation (RAG) and citation-based context construction.
 *
 * @author David Nguyen
 * @date 2024-04-08
 */

dotenv.config();

export const chatWithOpenAI = async (
  history: Array<{ role: "user" | "assistant" | "system"; content: string }>,
  message: string,
  systemInstruction?: string,
): Promise<string> => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY in environment variables");
  }

  // Query Pinecone for context
  const pineconeResults = await queryRag(message, 3);
  let additionalContext = "";

  if (pineconeResults.length > 0) {
    additionalContext = `\n\nRelevant Information (please cite the IDs in your answer):\n${pineconeResults
      .map((r) => `- ${r.metadata?.text ?? "No text available"} [${r.id}]`)
      .join("\n")}`;
  } else {
    additionalContext =
      "\n\nNo relevant knowledge found in Pinecone. Use your general understanding to answer thoughtfully.";
  }

  console.log(
    "🧠 Enriching OpenAI with Pinecone knowledge:",
    additionalContext,
  );

  const fullSystemInstruction =
    systemInstruction ||
    process.env.AI_INSTRUCTIONS ||
    "Answer the user's question using the context provided. Include how the banking sector is affected when relevant.";

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const messages = [
    { role: "system", content: fullSystemInstruction },
    ...history,
    { role: "user", content: `${message}\n\n${additionalContext}` },
  ];

  const completion = await openai.chat.completions.create({
    model: "gpt-4", // or "gpt-3.5-turbo"
    messages,
    temperature: 1,
    max_tokens: 1000,
  });

  const reply = completion.choices[0]?.message?.content;
  if (!reply) {
    throw new Error("No response text received from OpenAI.");
  }

  return reply;
};

// ----- Example usage -----
(async () => {
  try {
    const conversationHistory: Array<{
      role: "user" | "assistant" | "system";
      content: string;
    }> = [];
    const userMessage =
      "What will happen to the banking sector if the Federal Reserve raises interest rates?";
    const aiResponse = await chatWithOpenAI(conversationHistory, userMessage);
    console.log("\nOpenAI Chatbot Response:");
    console.log(aiResponse);
  } catch (error) {
    console.error("Error during OpenAI chat:", error);
  }
})();
