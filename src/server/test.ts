import Edgee from "edgee";

export interface TestResult {
  success: boolean;
  message: string;
  details?: Record<string, unknown>;
}

export async function testEnvironment(config: {
  edgeeApiKey: string;
  edgeeModel?: string;
}): Promise<TestResult> {
  if (!config.edgeeApiKey) {
    return {
      success: false,
      message: "Edgee API key is not configured",
    };
  }

  try {
    const edgee = new Edgee(config.edgeeApiKey);

    const response = await edgee.send({
      model: config.edgeeModel || "anthropic/claude-haiku-4-5",
      input: "Hello",
    });

    if (response.text) {
      return {
        success: true,
        message: "Edgee connection successful",
        details: {
          model: config.edgeeModel || "anthropic/claude-haiku-4-5",
          responseLength: response.text.length,
          compression: response.compression
            ? {
                savedTokens: response.compression.saved_tokens,
                reduction: response.compression.reduction,
              }
            : null,
        },
      };
    } else {
      return {
        success: false,
        message: "Edgee returned empty response",
        details: { response },
      };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `Edgee connection failed: ${message}`,
    };
  }
}

export default { testEnvironment };