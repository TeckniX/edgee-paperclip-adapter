import Edgee from "edgee";
import { type } from "../index.js";
export async function execute(context) {
    const config = context.config;
    const edgeeApiKey = process.env.EDGEE_API_KEY;
    const { edgeeModel } = config;
    if (!edgeeApiKey) {
        return {
            exitCode: 1,
            signal: null,
            timedOut: false,
            errorMessage: "Edgee API key not configured. Please set EDGEE_API_KEY environment variable (can be sealed as secret).",
            usage: { inputTokens: 0, outputTokens: 0 },
        };
    }
    try {
        const edgee = new Edgee(edgeeApiKey);
        const model = edgeeModel || "anthropic/claude-sonnet-4-5";
        const response = await edgee.send({
            model,
            input: context.context?.prompt || "",
        });
        return {
            exitCode: 0,
            signal: null,
            timedOut: false,
            usage: {
                inputTokens: response.usage?.prompt_tokens || 0,
                outputTokens: response.usage?.completion_tokens || 0,
            },
            summary: response.text || "",
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
            exitCode: 1,
            signal: null,
            timedOut: false,
            errorMessage,
            usage: { inputTokens: 0, outputTokens: 0 },
        };
    }
}
const checkEdgeeApiKey = () => {
    const key = process.env.EDGEE_API_KEY;
    if (!key) {
        return {
            code: "no_api_key",
            level: "error",
            message: "Edgee API key not configured",
            detail: "Please set EDGEE_API_KEY environment variable (can be sealed as secret)",
        };
    }
    return {
        code: "api_key_found",
        level: "info",
        message: "Edgee API key is configured",
    };
};
export async function testEnvironment(_ctx) {
    const checks = [];
    const apiKeyCheck = checkEdgeeApiKey();
    checks.push(apiKeyCheck);
    const status = checks.some((c) => c.level === "error") ? "fail" : checks.some((c) => c.level === "warn") ? "warn" : "pass";
    return {
        adapterType: type,
        status,
        checks,
        testedAt: new Date().toISOString(),
    };
}
//# sourceMappingURL=execute.js.map