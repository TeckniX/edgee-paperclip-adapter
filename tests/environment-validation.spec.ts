// Test that testEnvironment function properly validates API key by calling Edgee API
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("Edgee Adapter - Environment Validation", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    // @ts-ignore
    global.fetch = fetchMock;
  });

  it("testEnvironment should call fetch when API key is provided via env", async () => {
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

    const context = {
      companyId: "test-company",
      adapterType: "edgee_ai",
      config: {
        env: {
          EDGEE_API_KEY: "valid-key"
        }
      },
    };

    const result = await testEnvironment(context);

    // Should have called fetch for validation
    expect(fetchMock).toHaveBeenCalledTimes(1);
    
    // Check that it was called with the right URL and headers
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
  });

  it("testEnvironment should NOT call fetch when no API key is provided", async () => {
    const { testEnvironment } = await import("../src/server/test.js");

    const context = {
      companyId: "test-company",
      adapterType: "edgee_ai",
      config: {
        env: {
          // No EDGEE_API_KEY
        }
      },
    };

    const result = await testEnvironment(context);

    // Should NOT have called fetch
    expect(fetchMock).not.toHaveBeenCalled();

    expect(result.status).toBe("fail");
    expect(result.checks.some(c => c.code === "edgee_api_key_missing")).toBe(true);
  });

  it("testEnvironment should handle API errors during validation", async () => {
    const { testEnvironment } = await import("../src/server/test.js");

    // Mock error API response
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
      config: {
        env: {
          EDGEE_API_KEY: "invalid-key"
        }
      },
    };

    const result = await testEnvironment(context);

    // Should have called fetch for validation
    expect(fetchMock).toHaveBeenCalledTimes(1);

    expect(result.status).toBe("fail");
    expect(result.checks.some(c => c.code === "edgee_api_key_invalid")).toBe(true);
  });

  it("testEnvironment should handle timeout during validation", async () => {
    const { testEnvironment } = await import("../src/server/test.js");

    // Mock timeout
    fetchMock.mockRejectedValue(new Error("timeout"));

    const context = {
      companyId: "test-company",
      adapterType: "edgee_ai",
      config: {
        env: {
          EDGEE_API_KEY: "test-key"
        }
      },
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