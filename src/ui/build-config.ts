import type { EdgeeAdapterConfig } from "../index.js";

export interface ConfigFormValues {
  edgeeApiKey?: string;
  edgeeModel?: string;
}

export function buildConfig(
  values: ConfigFormValues
): EdgeeAdapterConfig {
  return {
    edgeeApiKey: values.edgeeApiKey || "",
    edgeeModel: values.edgeeModel || "anthropic/claude-sonnet-4-5",
  };
}

export function parseConfig(
  config: EdgeeAdapterConfig
): ConfigFormValues {
  return {
    edgeeApiKey: config.edgeeApiKey,
    edgeeModel: config.edgeeModel,
  };
}

export default { buildConfig, parseConfig };