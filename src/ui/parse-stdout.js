function asString(value, fallback = "") {
    return typeof value === "string" ? value : fallback;
}
function parseObject(value) {
    if (typeof value !== "object" || value === null || Array.isArray(value))
        return {};
    return value;
}
export function parseEdgeeStdoutLine(line, ts) {
    const trimmed = line.trim();
    if (!trimmed)
        return [];
    try {
        const parsed = parseObject(JSON.parse(trimmed));
        if (parsed.text) {
            return [{ kind: "assistant", ts, text: asString(parsed.text) }];
        }
        if (parsed.error) {
            return [{ kind: "stderr", ts, text: asString(parsed.error) }];
        }
        return [{ kind: "stdout", ts, text: trimmed }];
    }
    catch {
        return [{ kind: "stdout", ts, text: trimmed }];
    }
}
//# sourceMappingURL=parse-stdout.js.map