import axios from "axios";

type GeminiModelListItem = {
  name?: string;
  displayName?: string;
  supportedGenerationMethods?: string[];
};

const GEMINI_MODEL_LIST_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1/models";
const MODEL_CACHE_TTL_MS = 5 * 60 * 1000;

let cachedModelNames: string[] = [];
let cacheExpiresAt = 0;
let nextModelIndex = 0;

const normalizeModelName = (name?: string): string => {
  if (!name) {
    return "";
  }
  return name.startsWith("models/") ? name.slice("models/".length) : name;
};

const isGeminiChatModel = (model: GeminiModelListItem): boolean => {
  const normalized = normalizeModelName(model.name);
  const lower = normalized.toLowerCase();
  if (!lower.includes("gemini")) {
    return false;
  }
  if (lower.includes("embedding")) {
    return false;
  }
  if (lower.includes("pro")) {
    return false;
  }
  const displayLower = (model.displayName || "").toLowerCase();
  if (displayLower.includes("pro")) {
    return false;
  }
  const methods = model.supportedGenerationMethods || [];
  return methods.includes("generateContent");
};

export async function fetchGeminiModelNames(
  apiKey: string,
  options?: { forceRefresh?: boolean },
): Promise<string[]> {
  if (!apiKey) {
    throw new Error("Missing GOOGLE_AI_API_KEY in environment variables");
  }
  const now = Date.now();
  if (!options?.forceRefresh && cachedModelNames.length > 0) {
    if (now < cacheExpiresAt) {
      return cachedModelNames;
    }
  }

  const response = await axios.get(GEMINI_MODEL_LIST_ENDPOINT, {
    params: { key: apiKey },
  });
  const models: GeminiModelListItem[] = response.data?.models || [];
  const modelNames = models
    .filter(isGeminiChatModel)
    .map((model) => normalizeModelName(model.name))
    .filter((name): name is string => Boolean(name));

  if (modelNames.length === 0) {
    throw new Error("No eligible Gemini models found after filtering.");
  }

  cachedModelNames = modelNames;
  cacheExpiresAt = now + MODEL_CACHE_TTL_MS;
  if (nextModelIndex >= cachedModelNames.length) {
    nextModelIndex = 0;
  }

  return cachedModelNames;
}

export async function withGeminiModelFallback<T>(
  requestFn: (modelName: string) => Promise<T>,
  options?: {
    apiKey?: string;
    forceRefresh?: boolean;
    onError?: (modelName: string, error: unknown) => void;
  },
): Promise<T> {
  const apiKey = options?.apiKey || process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GOOGLE_AI_API_KEY in environment variables");
  }

  const modelNames = await fetchGeminiModelNames(apiKey, {
    forceRefresh: options?.forceRefresh,
  });
  const startIndex =
    modelNames.length === 0 ? 0 : nextModelIndex % modelNames.length;
  let lastError: unknown;

  for (let offset = 0; offset < modelNames.length; offset += 1) {
    const index = (startIndex + offset) % modelNames.length;
    const modelName = modelNames[index];
    try {
      const result = await requestFn(modelName);
      nextModelIndex = (index + 1) % modelNames.length;
      return result;
    } catch (error) {
      lastError = error;
      if (options?.onError) {
        options.onError(modelName, error);
      }
    }
  }

  const lastMessage =
    lastError instanceof Error ? lastError.message : String(lastError);
  throw new Error(
    `All Gemini models failed (${modelNames.join(", ")}). Last error: ${lastMessage}`,
  );
}
