function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function parseObject(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

export function parseEdgeeResponse(text: string) {
  let sessionId: string | null = null;
  const messages: string[] = [];
  let usage = {
    inputTokens: 0,
    outputTokens: 0,
  };
  let costUsd = 0;
  let errorMessage: string | null = null;

  try {
    const parsed = JSON.parse(text);
    const response = parseObject(parsed);

    const summary = asString(response.text, "").trim();
    if (summary) messages.push(summary);

    const usageData = parseObject(response.usage);
    usage = {
      inputTokens: asNumber(usageData.prompt_tokens, 0) || asNumber(usageData.input_tokens, 0),
      outputTokens: asNumber(usageData.completion_tokens, 0) || asNumber(usageData.output_tokens, 0),
    };

    costUsd = asNumber(response.cost, 0);

    if (response.error) {
      errorMessage = asString(response.error, "Edgee API error");
    }
  } catch {
    if (text.trim()) messages.push(text.trim());
  }

  return {
    sessionId,
    summary: messages.join("\n\n").trim(),
    usage,
    costUsd,
    errorMessage,
  };
}
