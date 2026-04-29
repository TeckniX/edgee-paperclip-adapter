function asNumber(value, fallback = 0) {
    return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}
function asString(value, fallback = "") {
    return typeof value === "string" ? value : fallback;
}
function parseObject(value) {
    if (typeof value !== "object" || value === null || Array.isArray(value))
        return {};
    return value;
}
export function parseEdgeeResponse(text) {
    let sessionId = null;
    const messages = [];
    let usage = {
        inputTokens: 0,
        outputTokens: 0,
    };
    let costUsd = 0;
    let errorMessage = null;
    try {
        const parsed = JSON.parse(text);
        const response = parseObject(parsed);
        const summary = asString(response.text, "").trim();
        if (summary)
            messages.push(summary);
        const usageData = parseObject(response.usage);
        usage = {
            inputTokens: asNumber(usageData.prompt_tokens, 0) || asNumber(usageData.input_tokens, 0),
            outputTokens: asNumber(usageData.completion_tokens, 0) || asNumber(usageData.output_tokens, 0),
        };
        costUsd = asNumber(response.cost, 0);
        if (response.error) {
            errorMessage = asString(response.error, "Edgee API error");
        }
    }
    catch {
        if (text.trim())
            messages.push(text.trim());
    }
    return {
        sessionId,
        summary: messages.join("\n\n").trim(),
        usage,
        costUsd,
        errorMessage,
    };
}
//# sourceMappingURL=parse.js.map