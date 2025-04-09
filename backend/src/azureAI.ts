import { OpenAIClient, AzureKeyCredential } from "@azure/openai";
import dotenv from "dotenv";
import { queryRag } from "./queryRag";

/**
 * @file chatWithAzure.ts
 * This file interacts with Azure OpenAI’s chat model using the same RAG approach.
 * It queries Pinecone for relevant context, appends citations, and generates a response via Azure OpenAI.
 *
 * @author David Nguyen
 * @date 2024-04-08
 */

dotenv.config();

export const chatWithAzure = async (
  history: Array<{ role: "user" | "assistant"; content: string }>,
  message: string,
  systemInstruction?: string,
): Promise<string> => {
  if (
    !process.env.AZURE_OPENAI_API_KEY ||
    !process.env.AZURE_OPENAI_ENDPOINT ||
    !process.env.AZURE_OPENAI_DEPLOYMENT_ID
  ) {
    throw new Error(
      "Missing Azure OpenAI configuration in environment variables (AZURE_OPENAI_API_KEY, AZURE_OPENAI_ENDPOINT, or AZURE_OPENAI_DEPLOYMENT_ID).",
    );
  }

  // Query Pinecone for relevant context
  const pineconeResults = await queryRag(message, 3);
  let additionalContext = "";

  if (pineconeResults.length > 0) {
    additionalContext =
      "\n\nRelevant Information (please cite the IDs in your answer):\n" +
      pineconeResults
        .map((r) => `- ${r.metadata?.text ?? "No text available"} [${r.id}]`)
        .join("\n");
  } else {
    additionalContext =
      "\n\nNo relevant knowledge found in Pinecone. Use your general knowledge to answer as accurately as possible.";
  }

  console.log("🧠 Enriching Azure with Pinecone knowledge:", additionalContext);

  const fullSystemInstruction =
    systemInstruction ||
    process.env.AI_INSTRUCTIONS ||
    "Answer based on the provided context. Focus on how the banking sector is affected, and be precise in your reasoning.";

  // Build messages for Azure chat
  const completePrompt = [
    { role: "system", content: fullSystemInstruction },
    ...history,
    {
      role: "user",
      content: `${message}\n\n${additionalContext}`,
    },
  ];

  // Create an Azure OpenAI client instance.
  const client = new OpenAIClient(
    process.env.AZURE_OPENAI_ENDPOINT,
    new AzureKeyCredential(process.env.AZURE_OPENAI_API_KEY),
  );

  // Retrieve the deployment ID of your Azure OpenAI chat model.
  const deploymentId = process.env.AZURE_OPENAI_DEPLOYMENT_ID;

  // Call the Azure OpenAI chat completions endpoint.
  const result = await client.getChatCompletions(deploymentId, {
    messages: completePrompt,
    maxTokens: 1024,
    temperature: 0.7,
  });

  if (!result.choices || result.choices.length === 0) {
    throw new Error("Azure AI returned no content.");
  }

  const reply = result.choices[0].message.content;
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
      "What will happen to the banking sector if the Federal Reserve raises interest rates?";
    const aiResponse = await chatWithAzure(conversationHistory, userMessage);
    console.log("\nAzure Chatbot Response:");
    console.log(aiResponse);
  } catch (error) {
    console.error("Error during Azure chat:", error);
  }
})();
