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

export const agentConfigurationDoc = `# edgee_compressed agent configuration

Adapter: edgee_compressed

Core fields:
- edgeeApiKey (string, required): Your Edgee API key for token compression
- edgeeModel (string, optional): Model to use via Edgee gateway
- wrappedAdapterType (string, optional): Legacy field (not used in current version)
- wrappedAdapterConfig (object, optional): Legacy field (not used in current version)

Operational fields:
- timeoutSec (number, optional): Execution timeout in seconds
- graceSec (number, optional): Grace period before SIGKILL

Notes:
- This adapter routes all LLM requests through Edgee AI Gateway for token compression
- Compression reduces token usage and costs while maintaining response quality
- Works with any model supported by Edgee (Anthropic, OpenAI, Google, Meta, Mistral)
`;

export type EdgeeAdapterConfig = {
  wrappedAdapterType?: string;
  wrappedAdapterConfig?: Record<string, unknown>;
  edgeeApiKey: string;
  edgeeModel: string;
};

export type SupportedModel = typeof models[number]["id"];