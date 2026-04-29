function parseEnvVars(text) {
    const env = {};
    for (const line of text.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#"))
            continue;
        const eq = trimmed.indexOf("=");
        if (eq <= 0)
            continue;
        const key = trimmed.slice(0, eq).trim();
        const value = trimmed.slice(eq + 1);
        if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key))
            continue;
        env[key] = value;
    }
    return env;
}
export function buildEdgeeConfig(v) {
    const ac = {};
    if (v.model)
        ac.model = v.model;
    ac.timeoutSec = 120;
    ac.graceSec = 20;
    const env = parseEnvVars(v.envVars || "");
    if (Object.keys(env).length > 0)
        ac.env = env;
    return ac;
}
//# sourceMappingURL=build-config.js.map