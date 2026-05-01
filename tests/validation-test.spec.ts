// Mock fetch before importing the module
const fetchMock = vi.fn();
// @ts-ignore
global.fetch = fetchMock;

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { AdapterEnvironmentTestContext } from "@paperclipai/adapter-utils";

describe("Edgee Adapter - Validation Tests", () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it("testEnvironment should call fetch when API key is present", async () => {
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

    // Call the function and wait for it
    const result = await testEnvironment(context);

    // Check that fetch was called
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
    
    // Check the result
    expect(result.status).toBe("pass");
    expect(result.checks.some(c => c.code === "edgee_api_key_valid")).toBe(true);
  });

  it("testEnvironment should NOT call fetch when API key is missing", async () => {
    // Import the function inside the test to ensure our mock is in place
    const { testEnvironment } = await import("../src/server/test.js");

    const context: AdapterEnvironmentTestContext = {
      companyId: "test-company",
      adapterType: "edgee_ai",
      config: { edgeeApiKey: "" },
    };

    // Call the function and wait for it
    const result = await testEnvironment(context);

    // Check that fetch was NOT called
    expect(fetchMock).not.toHaveBeenCalled();
    
    // Check the result
    expect(result.status).toBe("fail");
    expect(result.checks.some(c => c.code === "edgee_api_key_missing")).toBe(true);
  });
});