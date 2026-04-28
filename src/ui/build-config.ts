import type { EdgeeAdapterConfig } from "../index.js";

export interface ConfigFormValues {
  edgeeModel?: string;
}

export function buildConfig(
  values: ConfigFormValues
): EdgeeAdapterConfig {
  return {
    edgeeModel: values.edgeeModel || "anthropic/claude-sonnet-4-5",
  };
}

export function parseConfig(
  config: EdgeeAdapterConfig
): ConfigFormValues {
  return {
    edgeeModel: config.edgeeModel,
  };
}

export default { buildConfig, parseConfig };