import { asString, asNumber, parseObject, buildPaperclipEnv } from "@paperclipai/adapter-utils/server-utils";
import { parseEdgeeResponse } from "./parse.js";
import { type } from "../index.js";
async function callEdgeeApi(params) {
    const { apiKey, model, prompt, timeoutSec } = params;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutSec * 1000);
    try {
        const response = await fetch("https://api.edgee.ai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model,
                messages: [{ role: "user", content: prompt }],
            }),
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
        const text = await response.text();
        return { text, status: response.status, headers: Object.fromEntries(response.headers.entries()) };
    }
    catch (err) {
        clearTimeout(timeoutId);
        throw err;
    }
}
export async function execute(ctx) {
    const { runId, agent, config, context, onLog, onMeta } = ctx;
    const envConfig = parseObject(config.env);
    const env = { ...buildPaperclipEnv(agent) };
    env.PAPERCLIP_RUN_ID = runId;
    const apiKey = process.env.EDGEE_API_KEY ?? asString(envConfig.EDGEE_API_KEY, "");
    const model = asString(config.model, "anthropic/claude-sonnet-4-5");
    const timeoutSec = asNumber(config.timeoutSec, 120);
    if (!apiKey) {
        return {
            exitCode: 1,
            signal: null,
            timedOut: false,
            errorMessage: "Edgee API key not configured. Set EDGEE_API_KEY in Permissions & Configuration → Environment Variables, then seal as secret.",
            usage: { inputTokens: 0, outputTokens: 0 },
        };
    }
    const promptTemplate = asString(config.promptTemplate, "");
    const prompt = promptTemplate
        ? promptTemplate.replace(/\{\{prompt\}\}/g, context.prompt || "")
        : context.prompt || "";
    if (onMeta) {
        await onMeta({
            adapterType: type,
            command: "edgee-api",
        });
    }
    try {
        if (onLog) {
            await onLog("stdout", `[paperclip] Calling Edgee API with model: ${model}\n`);
        }
        const { text, status } = await callEdgeeApi({ apiKey, model, prompt, timeoutSec });
        if (onLog) {
            await onLog("stdout", `[paperclip] Edgee API response received (status: ${status})\n`);
        }
        const parsed = parseEdgeeResponse(text);
        if (parsed.errorMessage) {
            return {
                exitCode: 1,
                signal: null,
                timedOut: false,
                errorMessage: parsed.errorMessage,
                usage: parsed.usage,
                summary: parsed.summary,
            };
        }
        return {
            exitCode: 0,
            signal: null,
            timedOut: false,
            usage: parsed.usage,
            summary: parsed.summary,
            resultJson: { stdout: text },
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const timedOut = errorMessage.includes("abort");
        return {
            exitCode: 1,
            signal: null,
            timedOut,
            errorMessage: timedOut ? `Timed out after ${timeoutSec}s` : errorMessage,
            usage: { inputTokens: 0, outputTokens: 0 },
        };
    }
}
//# sourceMappingURL=execute.js.map