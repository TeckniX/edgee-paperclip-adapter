import { execute, testEnvironment } from "./execute.js";
import { type, models, agentConfigurationDoc } from "../index.js";
export function createServerAdapter() {
    return {
        type,
        execute,
        testEnvironment,
        models,
        agentConfigurationDoc,
        getConfigSchema: () => {
            const modelOptions = models.map(m => ({
                label: m.label,
                value: m.id,
            }));
            return {
                fields: [
                    {
                        key: "edgeeApiKey",
                        label: "Edgee API Key",
                        type: "text",
                        required: true,
                        hint: "Your Edgee API key for token compression via Edgee AI Gateway",
                    },
                    {
                        key: "edgeeModel",
                        label: "Edgee Model",
                        type: "select",
                        options: modelOptions,
                        default: "anthropic/claude-sonnet-4-5",
                        hint: "Model to use via Edgee gateway (defaults to Claude Sonnet)",
                    },
                ],
            };
        },
    };
}
//# sourceMappingURL=index.js.map