import { z } from "zod";
import type { EdgeeAdapterConfig, SupportedModel } from "../index.js";

export const CONFIG_FORM_SCHEMA = z.object({
  wrappedAdapterType: z
    .string()
    .default("claude_local")
    .describe("The adapter to wrap (claude_local, opencode_local, etc.)"),
  edgeeApiKey: z.string().describe("Your Edgee API key"),
  edgeeModel: z
    .enum([
      "anthropic/claude-haiku-4-5",
      "anthropic/claude-sonnet-4-5",
      "anthropic/claude-opus-4-5",
      "openai/gpt-4o",
      "openai/gpt-4o-mini",
      "openai/gpt-4-turbo",
      "google/gemma-2-9b",
      "google/gemma-2-27b",
      "meta/llama-3.1-70b",
      "meta/llama-3.1-8b",
      "mistral/mistral-large",
      "mistral/mistral-small",
    ])
    .default("anthropic/claude-haiku-4-5")
    .describe("Model to use via Edgee"),
  customModel: z
    .string()
    .optional()
    .describe("Custom model string (if not in preset list)"),
});

export type ConfigFormValues = z.infer<typeof CONFIG_FORM_SCHEMA>;

export interface AdapterConfigInput {
  wrappedAdapterType?: string;
  wrappedAdapterConfig?: Record<string, unknown>;
  edgeeApiKey?: string;
  edgeeModel?: string;
  customModel?: string;
}

export function buildConfig(
  values: ConfigFormValues
): EdgeeAdapterConfig {
  const model = values.customModel || values.edgeeModel;

  return {
    wrappedAdapterType: values.wrappedAdapterType || "claude_local",
    wrappedAdapterConfig: {},
    edgeeApiKey: values.edgeeApiKey || "",
    edgeeModel: model as SupportedModel,
  };
}

export function parseConfig(
  config: EdgeeAdapterConfig
): ConfigFormValues {
  return {
    wrappedAdapterType: config.wrappedAdapterType || "claude_local",
    edgeeApiKey: config.edgeeApiKey,
    edgeeModel: (config.edgeeModel || "anthropic/claude-haiku-4-5") as ConfigFormValues["edgeeModel"],
    customModel: undefined,
  };
}

export const UI_METADATA = {
  fields: [
    {
      key: "wrappedAdapterType",
      label: "Wrapped Adapter",
      type: "select",
      options: [
        { value: "claude_local", label: "Claude Local" },
        { value: "opencode_local", label: "OpenCode Local" },
        { value: "codex_local", label: "Codex Local" },
        { value: "gemini_local", label: "Gemini Local" },
        { value: "process", label: "Process" },
        { value: "http", label: "HTTP" },
      ],
      default: "claude_local",
    },
    {
      key: "edgeeApiKey",
      label: "Edgee API Key",
      type: "secret",
      placeholder: "Enter your Edgee API key",
    },
    {
      key: "edgeeModel",
      label: "Edgee Model",
      type: "select",
      options: [
        { value: "anthropic/claude-haiku-4-5", label: "Claude Haiku (Fast)" },
        { value: "anthropic/claude-sonnet-4-5", label: "Claude Sonnet (Balanced)" },
        { value: "anthropic/claude-opus-4-5", label: "Claude Opus (Power)" },
        { value: "openai/gpt-4o", label: "GPT-4o" },
        { value: "openai/gpt-4o-mini", label: "GPT-4o Mini" },
        { value: "google/gemma-2-9b", label: "Gemma 2 9B" },
        { value: "meta/llama-3.1-70b", label: "Llama 3.1 70B" },
        { value: "mistral/mistral-large", label: "Mistral Large" },
      ],
      default: "anthropic/claude-haiku-4-5",
    },
  ],
};

export default { buildConfig, parseConfig, CONFIG_FORM_SCHEMA, UI_METADATA };