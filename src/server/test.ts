import type {
  AdapterEnvironmentCheck,
  AdapterEnvironmentTestContext,
  AdapterEnvironmentTestResult,
} from "@paperclipai/adapter-utils";

function summarizeStatus(checks: AdapterEnvironmentCheck[]): AdapterEnvironmentTestResult["status"] {
  if (checks.some((check) => check.level === "error")) return "fail";
  if (checks.some((check) => check.level === "warn")) return "warn";
  return "pass";
}

function normalizeEnv(input: unknown): Record<string, string> {
  if (typeof input !== "object" || input === null || Array.isArray(input)) return {};
  const env: Record<string, string> = {};
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (typeof value === "string") env[key] = value;
  }
  return env;
}

export async function testEnvironment(
  ctx: AdapterEnvironmentTestContext,
): Promise<AdapterEnvironmentTestResult> {
  const checks: AdapterEnvironmentCheck[] = [];
  const config = typeof ctx.config === "object" && ctx.config !== null && !Array.isArray(ctx.config)
    ? ctx.config as Record<string, unknown>
    : {};

  const envConfig = typeof config.env === "object" && config.env !== null && !Array.isArray(config.env)
    ? config.env as Record<string, unknown>
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
  } else {
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
