// Final test for testEnvironment function - testing the actual behavior
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("Edgee Adapter - testEnvironment Function", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    // @ts-ignore
    global.fetch = fetchMock;
  });

  it("should return fail status when API key is missing", async () => {
    const { testEnvironment } = await import("../src/server/test.js");

    const context = {
      companyId: "test-company",
      adapterType: "edgee_ai",
      config: { edgeeApiKey: "" },
    };

    const result = await testEnvironment(context);

    expect(result.status).toBe("fail");
    expect(result.checks.some(c => c.code === "edgee_api_key_missing")).toBe(true);
    // Should not call fetch when no API key
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("should return pass status when API key is present and valid", async () => {
    const { testEnvironment } = await import("../src/server/test.js");

    // Mock successful validation response
    fetchMock.mockResolvedValue({
      text: async () => JSON.stringify({
        choices: [{ message: { content: "Test response" } }],
        usage: { prompt_tokens: 5, completion_tokens: 3 }
      }),
      status: 200,
      headers: new Map([["content-type", "application/json"]])
    });

    const context = {
      companyId: "test-company",
      adapterType: "edgee_ai",
      config: { edgeeApiKey: "valid-key", edgeeModel: "anthropic/claude-sonnet-4-5" },
    };

    const result = await testEnvironment(context);

    // Should have called fetch for validation
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.edgee.ai/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Authorization": "Bearer valid-key",
          "Content-Type": "application/json"
        })
      })
    );

    expect(result.status).toBe("pass");
    expect(result.checks.some(c => c.code === "edgee_api_key_valid")).toBe(true);
    expect(result.checks.some(c => c.code === "edgee_api_key_found")).toBe(true);
  });

  it("should return fail status when API key is present but invalid", async () => {
    const { testEnvironment } = await import("../src/server/test.js");

    // Mock error validation response
    fetchMock.mockResolvedValue({
      text: async () => JSON.stringify({
        error: { message: "Invalid API key" }
      }),
      status: 401,
      headers: new Map([["content-type", "application/json"]])
    });

    const context = {
      companyId: "test-company",
      adapterType: "edgee_ai",
      config: { edgeeApiKey: "invalid-key", edgeeModel: "anthropic/claude-sonnet-4-5" },
    };

    const result = await testEnvironment(context);

    // Should have called fetch for validation
    expect(fetchMock).toHaveBeenCalledTimes(1);

    expect(result.status).toBe("fail");
    expect(result.checks.some(c => c.code === "edgee_api_key_invalid")).toBe(true);
    expect(result.checks.some(c => c.code === "edgee_api_key_found")).toBe(true);
  });

  it("should handle timeout during validation", async () => {
    const { testEnvironment } = await import("../src/server/test.js");

    // Mock timeout
    fetchMock.mockRejectedValue(new Error("timeout"));

    const context = {
      companyId: "test-company",
      adapterType: "edgee_ai",
      config: { edgeeApiKey: "test-key", edgeeModel: "anthropic/claude-sonnet-4-5" },
    };

    const result = await testEnvironment(context);

    // Should have called fetch for validation
    expect(fetchMock).toHaveBeenCalledTimes(1);

    expect(result.status).toBe("fail");
    expect(result.checks.some(c => c.code === "edgee_api_key_invalid")).toBe(true);
    // Check that the error detail mentions timeout
    expect(result.checks.some(c => c.detail?.includes("timed out"))).toBe(true);
  });
});