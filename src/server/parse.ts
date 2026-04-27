import type { TranscriptEntry, UsageInfo } from "./execute.js";

export interface ParsedOutput {
  transcript: TranscriptEntry[];
  usage?: UsageInfo;
  finishReason?: string;
}

export function parseStdout(stdout: string): ParsedOutput {
  const lines = stdout.split("\n").filter(Boolean);
  const transcript: TranscriptEntry[] = [];
  let usage: UsageInfo | undefined;
  let finishReason: string | undefined;

  for (const line of lines) {
    try {
      const parsed = JSON.parse(line);

      if (parsed.type === "content" && parsed.text) {
        transcript.push({
          type: "text",
          content: parsed.text,
          timestamp: parsed.timestamp || Date.now(),
        });
      } else if (parsed.type === "usage") {
        usage = parsed.usage;
      } else if (parsed.type === "finish") {
        finishReason = parsed.reason;
      } else if (parsed.type === "error") {
        transcript.push({
          type: "error",
          content: parsed.message || "Unknown error",
          timestamp: parsed.timestamp || Date.now(),
        });
      }
    } catch {
      if (line.trim()) {
        transcript.push({
          type: "text",
          content: line,
          timestamp: Date.now(),
        });
      }
    }
  }

  return { transcript, usage, finishReason };
}

export function parseToolCalls(stdout: string): TranscriptEntry[] {
  const entries: TranscriptEntry[] = [];
  const lines = stdout.split("\n").filter(Boolean);

  for (const line of lines) {
    try {
      const parsed = JSON.parse(line);
      if (parsed.type === "tool-call") {
        entries.push({
          type: "tool-call",
          content: JSON.stringify(parsed.call),
          timestamp: parsed.timestamp || Date.now(),
        });
      } else if (parsed.type === "tool-result") {
        entries.push({
          type: "tool-result",
          content: parsed.result || "",
          timestamp: parsed.timestamp || Date.now(),
        });
      }
    } catch {
      // Skip non-JSON lines
    }
  }

  return entries;
}

export default { parseStdout, parseToolCalls };