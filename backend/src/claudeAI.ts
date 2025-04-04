import { Anthropic } from "@anthropic-ai/sdk";
import dotenv from "dotenv";
import { queryRag } from "./queryRag";

/**
 * @file chatWithClaude.ts
 * This file interacts with Anthropic's Claude AI using the same RAG approach.
 * It queries Pinecone for relevant context, appends citations, and generates a response via Claude.
 */

dotenv.config();

export const chatWithClaude = async (
  history: Array<{ role: "user" | "assistant"; content: string }>,
  message: string,
  systemInstruction?: string,
): Promise<string> => {
  if (!process.env.CLAUDE_API_KEY) {
    throw new Error("Missing CLAUDE_API_KEY in environment variables");
  }

  // Query Pinecone for relevant context
  const pineconeResults = await queryRag(message, 3);
  let additionalContext = "";

  if (pineconeResults.length > 0) {
    additionalContext = `\n\nRelevant Information (please cite the IDs in your answer):\n${pineconeResults
      .map((r) => `- ${r.metadata?.text ?? "No text available"} [${r.id}]`)
      .join("\n")}`;
  } else {
    additionalContext =
      "\n\nNo relevant knowledge found in Pinecone. Use your general knowledge to answer as accurately as possible.";
  }

  console.log(
    "🧠 Enriching Claude with Pinecone knowledge:",
    additionalContext,
  );

  const fullSystemInstruction =
    systemInstruction ||
    process.env.AI_INSTRUCTIONS ||
    "Answer based on the provided context. Focus on how the banking sector is affected, and be precise in your reasoning.";

  const anthropic = new Anthropic({
    apiKey: process.env.CLAUDE_API_KEY,
  });

  // Build messages for Claude
  const completePrompt = [
    {
      role: "user" as const,
      content: `${message}\n\n${additionalContext}`,
    },
    ...history,
  ];

  const response = await anthropic.messages.create({
    model: "claude-3-sonnet-20240229",
    max_tokens: 1024,
    system: fullSystemInstruction,
    messages: completePrompt,
  });

  if (!response || !response.content || !response.content.length) {
    throw new Error("Claude AI returned no content.");
  }

  const reply = response.content.map((part) => part.text).join("\n");
  return reply;
};

// ----- Example usage -----
(async () => {
  try {
    const conversationHistory: Array<{
      role: "user" | "assistant";
      content: string;
    }> = [];
    const userMessage =
      "How did monetary policy impact MPRIME from 2020 to 2024?";
    const aiResponse = await chatWithClaude(conversationHistory, userMessage);
    console.log("\nClaude Chatbot Response:");
    console.log(aiResponse);
  } catch (error) {
    console.error("Error during Claude chat:", error);
  }
})();
