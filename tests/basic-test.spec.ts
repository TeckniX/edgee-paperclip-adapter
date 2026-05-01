import { describe, it, expect, vi } from "vitest";

describe("Basic Edgee Adapter Tests", () => {
  it("execute should return error when API key is missing", async () => {
    // Import the execute function
    const { execute } = await import("../src/server/execute.js");

    const context = {
      runId: "test-run",
      agent: { id: "test-agent", companyId: "test-company", name: "Test", adapterType: "edgee_ai", adapterConfig: {} },
      runtime: { sessionId: null, sessionParams: null, sessionDisplayId: null, taskKey: null },
      config: { edgeeApiKey: "", edgeeModel: "anthropic/claude-sonnet-4-5" },
      context: { prompt: "Hello" },
      onLog: vi.fn(),
    };

    const result = await execute(context);

    expect(result.exitCode).toBe(1);
    expect(result.errorMessage).toContain("API key not configured");
  });

  it("testEnvironment should fail when API key is missing", async () => {
    // Import the testEnvironment function
    const { testEnvironment } = await import("../src/server/test.js");

    const context = {
      companyId: "test-company",
      adapterType: "edgee_ai",
      config: { edgeeApiKey: "" },
    };

    const result = await testEnvironment(context);

    expect(result.status).toBe("fail");
    expect(result.checks.some(c => c.code === "edgee_api_key_missing")).toBe(true);
  });
});