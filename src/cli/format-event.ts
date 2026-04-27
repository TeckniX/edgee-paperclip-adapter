export interface CliEvent {
  type: "start" | "output" | "error" | "finish" | "usage";
  timestamp: number;
  data?: {
    content?: string;
    model?: string;
    usage?: {
      inputTokens: number;
      outputTokens: number;
      totalTokens: number;
      cost: number;
      compression?: {
        savedTokens: number;
        reduction: number;
        costSavings: number;
      };
    };
    finishReason?: string;
  };
}

export function formatEvent(event: CliEvent): string {
  const timestamp = new Date(event.timestamp).toISOString().split("T")[1].slice(0, -1);

  switch (event.type) {
    case "start":
      return `[${timestamp}] 🤖 Starting Edgee adapter`;
    case "output":
      return event.data?.content || "";
    case "error":
      return `[${timestamp}] ❌ ${event.data?.content || "Unknown error"}`;
    case "finish":
      const reason = event.data?.finishReason || "unknown";
      return `[${timestamp}] ✅ Finished (${reason})`;
    case "usage":
      if (!event.data?.usage) return "";
      const u = event.data.usage;
      let usageLine = `[${timestamp}] 📊 Usage: ${u.inputTokens} in, ${u.outputTokens} out, ${u.totalTokens} total ($${u.cost.toFixed(6)})`;
      if (u.compression) {
        usageLine += ` | Compression: ${u.compression.savedTokens} tokens saved (${u.compression.reduction}%) | Savings: $${u.compression.costSavings.toFixed(6)}`;
      }
      return usageLine;
    default:
      return "";
  }
}

export function formatStart(model: string): string {
  return formatEvent({
    type: "start",
    timestamp: Date.now(),
    data: { model },
  });
}

export function formatOutput(content: string): string {
  return formatEvent({
    type: "output",
    timestamp: Date.now(),
    data: { content },
  });
}

export function formatError(error: string): string {
  return formatEvent({
    type: "error",
    timestamp: Date.now(),
    data: { content: error },
  });
}

export function formatFinish(finishReason?: string): string {
  return formatEvent({
    type: "finish",
    timestamp: Date.now(),
    data: { finishReason },
  });
}

export function formatUsage(usage: {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;
  compression?: {
    savedTokens: number;
    reduction: number;
    costSavings: number;
  };
}): string {
  return formatEvent({
    type: "usage",
    timestamp: Date.now(),
    data: { usage },
  });
}

export default { formatEvent, formatStart, formatOutput, formatError, formatFinish, formatUsage };