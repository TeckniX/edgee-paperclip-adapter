import { parseStdout } from "../server/parse.js";

export interface TranscriptEntry {
  type: "text" | "tool-call" | "tool-result" | "error";
  content: string;
  timestamp: number;
}

export interface RunTranscriptEntry {
  id: string;
  type: "input" | "output" | "tool_call" | "tool_result" | "error";
  content: string;
  timestamp: number;
  model?: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    cost: number;
  };
}

export function parseTranscript(stdout: string): RunTranscriptEntry[] {
  const parsed = parseStdout(stdout);
  const entries: RunTranscriptEntry[] = [];

  let entryId = 0;

  for (const entry of parsed.transcript) {
    entries.push({
      id: `entry-${entryId++}`,
      type: entryToTranscriptType(entry.type),
      content: entry.content,
      timestamp: entry.timestamp,
    });
  }

  if (parsed.usage) {
    entries.push({
      id: `usage-${entryId++}`,
      type: "output",
      content: formatUsage(parsed.usage),
      timestamp: Date.now(),
      usage: {
        inputTokens: parsed.usage.inputTokens,
        outputTokens: parsed.usage.outputTokens,
        totalTokens: parsed.usage.totalTokens,
        cost: parsed.usage.cost,
      },
    });
  }

  return entries;
}

function entryToTranscriptType(
  type: string
): "input" | "output" | "tool_call" | "tool_result" | "error" {
  switch (type) {
    case "text":
      return "output";
    case "tool-call":
      return "tool_call";
    case "tool-result":
      return "tool_result";
    case "error":
      return "error";
    default:
      return "output";
  }
}

function formatUsage(usage: {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;
}): string {
  return `Usage: ${usage.inputTokens} input, ${usage.outputTokens} output, ${usage.totalTokens} total. Cost: $${usage.cost.toFixed(6)}`;
}

export default { parseTranscript };