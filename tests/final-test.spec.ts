// Final test - mock fetch at the very beginning before any imports
const fetchMock = vi.fn();
// @ts-ignore
global.fetch = fetchMock;

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { AdapterEnvironmentTestContext } from "@paperclipai/adapter-utils";

describe("Edgee Adapter - Final Test", () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it("testEnvironment should fail when API key is missing", async () => {
    // Import after mocking fetch
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

  it("testEnvironment should call fetch when API key is present", async () => {
    // Import after mocking fetch
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

    // Should have called fetch once
    expect(fetchMock).toHaveBeenCalledTimes(1);
    
    // Check that it was called with the right parameters
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.edgee.ai/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Authorization": "Bearer valid-key",
          "Content-Type": "application/json"
        }),
        body: expect.any(String)
      })
    );
    
    // Check the result
    expect(result.status).toBe("pass");
    expect(result.checks.some(c => c.code === "edgee_api_key_valid")).toBe(true);
    expect(result.checks.some(c => c.code === "edgee_api_key_found")).toBe(true);
  });
});