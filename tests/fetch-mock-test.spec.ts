// Test that directly verifies fetch is called in testEnvironment
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("Fetch Mock Test for testEnvironment", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    // @ts-ignore
    global.fetch = fetchMock;
    // Clear process.env.EDGEE_API_KEY to ensure we use the config value
    // @ts-ignore
    delete process.env.EDGEE_API_KEY;
  });

  it("should call fetch when API key is in config.env", async () => {
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
          EDGEE_API_KEY: "test-key-from-config"
        }
      },
    };

    const result = await testEnvironment(context);

    // Verify fetch was called
    expect(fetchMock).toHaveBeenCalledTimes(1);
    
    // Verify it was called with the correct parameters
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.edgee.ai/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Authorization": "Bearer test-key-from-config",
          "Content-Type": "application/json"
        })
      })
    );

    // Verify the result
    expect(result.status).toBe("pass");
    expect(result.checks.some(c => c.code === "edgee_api_key_valid")).toBe(true);
  });

  it("should call fetch when API key is in process.env", async () => {
    const { testEnvironment } = await import("../src/server/test.js");

    // Set the API key in process.env
    // @ts-ignore
    process.env.EDGEE_API_KEY = "test-key-from-process-env";

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
          // No EDGEE_API_KEY here - should come from process.env
        }
      },
    };

    const result = await testEnvironment(context);

    // Verify fetch was called
    expect(fetchMock).toHaveBeenCalledTimes(1);
    
    // Verify it was called with the correct parameters
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.edgee.ai/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Authorization": "Bearer test-key-from-process-env",
          "Content-Type": "application/json"
        })
      })
    );

    // Verify the result
    expect(result.status).toBe("pass");
    expect(result.checks.some(c => c.code === "edgee_api_key_valid")).toBe(true);
  });
});