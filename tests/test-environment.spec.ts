import { describe, it, expect, vi, beforeEach } from "vitest";
import type { AdapterEnvironmentTestContext } from "@paperclipai/adapter-utils";

// We'll test the testEnvironment function directly by importing it
// and mocking fetch at the right time

describe("Edgee Adapter - testEnvironment function", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    // Mock global fetch
    global.fetch = fetchMock;
  });

  it("should fail when API key is missing", async () => {
    // Import the function inside the test to ensure our mock is in place
    const { testEnvironment } = await import("../src/server/test.js");

    const context: AdapterEnvironmentTestContext = {
      companyId: "test-company",
      adapterType: "edgee_ai",
      config: { edgeeApiKey: "" },
    };

    const result = await testEnvironment(context);

    expect(result.status).toBe("fail");
    expect(result.checks.some(c => c.code === "edgee_api_key_missing")).toBe(true);
    // Should not have called fetch since no key
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("should pass when API key is present and valid", async () => {
    // Import the function inside the test to ensure our mock is in place
    const { testEnvironment } = await import("../src/server/test.js");

    // Mock successful API response
    fetchMock.mockResolvedValue({
      text: async () => JSON.stringify({
        choices: [{ message: { content: "Test response" } }],
        usage: { prompt_tokens: 5, completion_tokens: 3 }
      }),
      status: 200,
      headers: new Map([["content-type", "application/json"]])
    });

    const context: AdapterEnvironmentTestContext = {
      companyId: "test-company",
      adapterType: "edgee_ai",
      config: { edgeeApiKey: "valid-key", edgeeModel: "anthropic/claude-sonnet-4-5" },
    };

    const result = await testEnvironment(context);

    expect(fetchMock).toHaveBeenCalled();
    expect(result.status).toBe("pass");
    expect(result.checks.some(c => c.code === "edgee_api_key_valid")).toBe(true);
    expect(result.checks.some(c => c.code === "edgee_api_key_found")).toBe(true);
  });

  it("should fail when API key is invalid", async () => {
    // Import the function inside the test to ensure our mock is in place
    const { testEnvironment } = await import("../src/server/test.js");

    // Mock error API response
    fetchMock.mockResolvedValue({
      text: async () => JSON.stringify({
        error: { message: "Invalid API key" }
      }),
      status: 401,
      headers: new Map([["content-type", "application/json"]])
    });

    const context: AdapterEnvironmentTestContext = {
      companyId: "test-company",
      adapterType: "edgee_ai",
      config: { edgeeApiKey: "invalid-key", edgeeModel: "anthropic/claude-sonnet-4-5" },
    };

    const result = await testEnvironment(context);

    expect(fetchMock).toHaveBeenCalled();
    expect(result.status).toBe("fail");
    expect(result.checks.some(c => c.code === "edgee_api_key_invalid")).toBe(true);
    expect(result.checks.some(c => c.code === "edgee_api_key_found")).toBe(true);
  });

  it("should handle timeout during validation", async () => {
    // Import the function inside the test to ensure our mock is in place
    const { testEnvironment } = await import("../src/server/test.js");

    // Mock timeout
    fetchMock.mockRejectedValue(new Error("timeout"));

    const context: AdapterEnvironmentTestContext = {
      companyId: "test-company",
      adapterType: "edgee_ai",
      config: { edgeeApiKey: "test-key", edgeeModel: "anthropic/claude-sonnet-4-5" },
    };

    const result = await testEnvironment(context);

    expect(fetchMock).toHaveBeenCalled();
    expect(result.status).toBe("fail");
    expect(result.checks.some(c => c.code === "edgee_api_key_invalid")).toBe(true);
    expect(result.checks.some(c => c.detail?.includes("timed out"))).toBe(true);
  });
});