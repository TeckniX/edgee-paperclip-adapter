import type { ServerAdapterModule, AdapterConfigSchema, ConfigFieldOption } from "@paperclipai/adapter-utils";
import { execute, testEnvironment } from "./execute.js";
import { type, models, agentConfigurationDoc } from "../index.js";

export function createServerAdapter(): ServerAdapterModule {
  return {
    type,
    execute,
    testEnvironment,
    models,
    agentConfigurationDoc,
    getConfigSchema: (): AdapterConfigSchema => {
      const modelOptions: ConfigFieldOption[] = models.map(m => ({
        label: m.label,
        value: m.id,
      }));
      return {
        fields: [
          {
            key: "edgeeModel",
            label: "Edgee Model",
            type: "select",
            options: modelOptions,
            default: "anthropic/claude-sonnet-4-5",
            hint: "Model to use via Edgee gateway (defaults to Claude Sonnet). Set EDGEE_API_KEY env var (can be sealed as secret).",
          },
        ],
      };
    },
  };
}