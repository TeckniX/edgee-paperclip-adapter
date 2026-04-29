import type { TranscriptEntry } from "@paperclipai/adapter-utils";

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function parseObject(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

export function parseEdgeeStdoutLine(line: string, ts: string): TranscriptEntry[] {
  const trimmed = line.trim();
  if (!trimmed) return [];

  try {
    const parsed = parseObject(JSON.parse(trimmed));

    if (parsed.text) {
      return [{ kind: "assistant", ts, text: asString(parsed.text) }];
    }

    if (parsed.error) {
      return [{ kind: "stderr", ts, text: asString(parsed.error) }];
    }

    return [{ kind: "stdout", ts, text: trimmed }];
  } catch {
    return [{ kind: "stdout", ts, text: trimmed }];
  }
}
