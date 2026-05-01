export const type = "edgee_ai";
export const label = "Edgee AI";

// Models from https://www.edgee.ai/models
export const models: Array<{ id: string; label: string }> = [
  { id: "anthropic/claude-haiku-4-5", label: "Claude Haiku (Fast)" },
  { id: "anthropic/claude-sonnet-4-5", label: "Claude Sonnet (Balanced)" },
  { id: "anthropic/claude-opus-4-5", label: "Claude Opus (Power)" },
  { id: "openai/gpt-4.1", label: "GPT-4.1" },
  { id: "openai/gpt-4.1-mini", label: "GPT-4.1 Mini" },
  { id: "openai/gpt-4.1-nano", label: "GPT-4.1 Nano" },
  { id: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { id: "google/gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite" },
  { id: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro" },
  { id: "meta/llama-3.1-70b", label: "Llama 3.1 70B" },
  { id: "meta/llama-3.1-8b", label: "Llama 3.1 8B" },
  { id: "mistral/mistral-large-latest", label: "Mistral Large Latest" },
  { id: "mistral/mistral-small-latest", label: "Mistral Small Latest" },
  { id: "deepseek/deepseek-chat", label: "DeepSeek Chat" },
  { id: "deepseek/deepseek-reasoner", label: "DeepSeek Reasoner" },
  { id: "xai/grok-4-1-fast-non-reasoning", label: "Grok 4.1 Fast" },
  { id: "zai/glm-4.5", label: "GLM-4.5" },
];

export const agentConfigurationDoc = `# edgee_ai agent configuration

Adapter: edgee_ai

Use when:
- You want to reduce token usage and costs through Edgee AI Gateway
- You need to compress LLM requests while maintaining response quality

Don't use when:
- You require direct API access without compression
- Your use case has specific compliance requirements for direct model access

Core fields:
- model (string, optional): Model to use via Edgee gateway (for example anthropic/claude-sonnet-4-5)
- EDGEE_API_KEY (env variable, required): Set in Permissions & Configuration → Environment Variables, then seal as secret

Operational fields:
- timeoutSec (number, optional): Execution timeout in seconds
- graceSec (number, optional): Grace period before SIGKILL
`;
export { createServerAdapter } from "./server/index.js";