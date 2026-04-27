import type { ServerAdapterModule } from "@paperclipai/adapter-utils";

import { type, label, models, type EdgeeAdapterConfig, type SupportedModel } from "./metadata.js";
import { execute, testEnvironment } from "./server/execute.js";

export { type, label, models, type EdgeeAdapterConfig, type SupportedModel };

export function createServerAdapter(): ServerAdapterModule {
  return {
    type,
    models,
    execute,
    testEnvironment,
    supportsLocalAgentJwt: false,
    supportsInstructionsBundle: false,
    requiresMaterializedRuntimeSkills: false,
    agentConfigurationDoc: `# edgee_compressed agent configuration

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
`,
  };
}