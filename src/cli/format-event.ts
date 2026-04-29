import pc from "picocolors";

export function printEdgeeStreamEvent(raw: string, _debug: boolean): void {
  const line = raw.trim();
  if (!line) return;

  try {
    const parsed = JSON.parse(line);
    if (typeof parsed === "object" && parsed !== null) {
      if (parsed.text) {
        console.log(pc.green(`assistant: ${parsed.text}`));
        return;
      }
      if (parsed.error) {
        console.log(pc.red(`error: ${parsed.error}`));
        return;
      }
    }
  } catch {
    // not JSON
  }

  console.log(line);
}
