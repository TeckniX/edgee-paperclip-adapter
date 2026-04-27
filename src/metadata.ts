export const type = "edgee_compressed";
export const label = "Edgee Compressed";

export const models = [
  { id: "anthropic/claude-haiku-4-5", label: "Claude Haiku (Fast)" },
  { id: "anthropic/claude-sonnet-4-5", label: "Claude Sonnet (Balanced)" },
  { id: "anthropic/claude-opus-4-5", label: "Claude Opus (Power)" },
  { id: "openai/gpt-4o", label: "GPT-4o" },
  { id: "openai/gpt-4o-mini", label: "GPT-4o Mini" },
  { id: "google/gemma-2-9b", label: "Gemma 2 9B" },
  { id: "meta/llama-3.1-70b", label: "Llama 3.1 70B" },
  { id: "meta/llama-3.1-8b", label: "Llama 3.1 8B" },
  { id: "mistral/mistral-large", label: "Mistral Large" },
  { id: "mistral/mistral-small", label: "Mistral Small" },
];

export type EdgeeAdapterConfig = {
  wrappedAdapterType?: string;
  wrappedAdapterConfig?: Record<string, unknown>;
  edgeeApiKey: string;
  edgeeModel: string;
};

export type SupportedModel = (typeof models)[number]["id"];