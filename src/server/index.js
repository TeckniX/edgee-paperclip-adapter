import { execute, testEnvironment } from "./execute.js";
import { type, models, agentConfigurationDoc } from "../index.js";
export function createServerAdapter() {
    return {
        type,
        execute,
        testEnvironment,
        models,
        agentConfigurationDoc,
    };
}
//# sourceMappingURL=index.js.map