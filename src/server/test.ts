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

async function validateEdgeeApiKey(apiKey: string, model: string): Promise<{ success: boolean; error?: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout for validation

    try {
      const response = await fetch("https://api.edgee.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: "Hello" }],
          max_tokens: 5, // Limit response to minimize token usage
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        return { 
          success: false, 
          error: `HTTP ${response.status}: ${errorText.substring(0, 100)}` 
        };
      }

      const responseData = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
      if (responseData.choices?.[0]?.message?.content) {
        return { success: true };
      } else {
        return { success: false, error: "Unexpected response format" };
      }
    } catch (err) {
      clearTimeout(timeoutId);
      if ((err as any).name === "AbortError") {
        return { success: false, error: "Validation request timed out" };
      }
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
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

    // Validate the API key by making a lightweight call to Edgee
    const model = typeof config.model === "string" && config.model.trim() !== "" 
      ? config.model.trim() 
      : "anthropic/claude-sonnet-4-5"; // Default model

    const validationResult = await validateEdgeeApiKey(apiKey, model);
    
    if (validationResult.success) {
      checks.push({
        code: "edgee_api_key_valid",
        level: "info",
        message: "Edgee API key is valid and working",
      });
    } else {
      checks.push({
        code: "edgee_api_key_invalid",
        level: "error",
        message: "Edgee API key is invalid or not working",
        detail: validationResult.error,
      });
    }
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
    adapterType: "edgee_ai",
    status: summarizeStatus(checks),
    checks,
    testedAt: new Date().toISOString(),
  };
}
