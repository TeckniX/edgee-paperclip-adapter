// Properly mock fetch BEFORE importing the module
const fetchMock = vi.fn();
// @ts-ignore
global.fetch = fetchMock;

// Now import the module - this will use our mocked fetch
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { AdapterEnvironmentTestContext } from "@paperclipai/adapter-utils";

describe("Edgee Adapter - Proper Import Test", () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it("testEnvironment should call fetch when API key is present", async () => {
    // Import the function - fetch is already mocked
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

    // Should have called fetch for validation
    expect(fetchMock).toHaveBeenCalledTimes(1);
    
    // Check that it was called with the right URL
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

  it("testEnvironment should NOT call fetch when API key is missing", async () => {
    // Import the function - fetch is already mocked
    const { testEnvironment } = await import("../src/server/test.js");

    const context: AdapterEnvironmentTestContext = {
      companyId: "test-company",
      adapterType: "edgee_ai",
      config: { edgeeApiKey: "" },
    };

    const result = await testEnvironment(context);

    // Should NOT have called fetch
    expect(fetchMock).not.toHaveBeenCalled();

    expect(result.status).toBe("fail");
    expect(result.checks.some(c => c.code === "edgee_api_key_missing")).toBe(true);
  });
});