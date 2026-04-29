function summarizeStatus(checks) {
    if (checks.some((check) => check.level === "error"))
        return "fail";
    if (checks.some((check) => check.level === "warn"))
        return "warn";
    return "pass";
}
function normalizeEnv(input) {
    if (typeof input !== "object" || input === null || Array.isArray(input))
        return {};
    const env = {};
    for (const [key, value] of Object.entries(input)) {
        if (typeof value === "string")
            env[key] = value;
    }
    return env;
}
export async function testEnvironment(ctx) {
    const checks = [];
    const config = typeof ctx.config === "object" && ctx.config !== null && !Array.isArray(ctx.config)
        ? ctx.config
        : {};
    const envConfig = typeof config.env === "object" && config.env !== null && !Array.isArray(config.env)
        ? config.env
        : {};
    const env = normalizeEnv(envConfig);
    const apiKey = process.env.EDGEE_API_KEY ?? env.EDGEE_API_KEY ?? "";
    if (!apiKey) {
        checks.push({
            code: "edgee_api_key_missing",
            level: "error",
            message: "Edgee API key not configured",
            detail: "Set EDGEE_API_KEY in Permissions & Configuration → Environment Variables, then seal as secret",
        });
    }
    else {
        checks.push({
            code: "edgee_api_key_found",
            level: "info",
            message: "Edgee API key is configured",
        });
    }
    const model = typeof config.model === "string" ? config.model.trim() : "";
    if (model) {
        checks.push({
            code: "edgee_model_configured",
            level: "info",
            message: `Configured model: ${model}`,
        });
    }
    return {
        adapterType: "edgee_compressed",
        status: summarizeStatus(checks),
        checks,
        testedAt: new Date().toISOString(),
    };
}
//# sourceMappingURL=test.js.map