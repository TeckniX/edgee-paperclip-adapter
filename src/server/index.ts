import type { ServerAdapterModule } from "@paperclipai/adapter-utils";
import { execute, testEnvironment } from "./execute.js";
import { type, models, agentConfigurationDoc } from "../index.js";

export function createServerAdapter(): ServerAdapterModule {
  return {
    type,
    execute,
    testEnvironment,
    models,
    agentConfigurationDoc,
  };
}