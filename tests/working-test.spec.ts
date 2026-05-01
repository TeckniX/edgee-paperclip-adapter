// Test that directly verifies our implementation works
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("Working Test for testEnvironment", () => {
  // Store the original fetch
  const originalFetch = global.fetch;
  
  beforeEach(() => {
    // Create a fresh mock for each test
    const fetchMock = vi.fn();
    // Replace global.fetch with our mock
    // @ts-ignore
    global.fetch = fetchMock;
  });
  
  afterEach(() => {
    // Restore original fetch
    // @ts-ignore
    global.fetch = originalFetch;
  });

  it("testEnvironment calls fetch when API key is present", async () => {
    // Import the function
    const { testEnvironment } = await import("../src/server/test.js");
    
    // Setup mock to return a successful response
    // @ts-ignore
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      text: async () => JSON.stringify({
        choices: [{ message: { content: "Test" } }],
        usage: { prompt_tokens: 1, completion_tokens: 1 }
      }),
      status: 200,
      headers: new Map([["content-type", "application/json"]])
    });

    // Call testEnvironment with API key in config
    const result = await testEnvironment({
      companyId: "test-company",
      adapterType: "edgee_ai",
      config: { edgeeApiKey: "test-key" },
    });

    // Verify fetch was called
    expect(global.fetch).toHaveBeenCalled();
    
    // Verify the result indicates success
    expect(result.status).toBe("pass");
    expect(result.checks.some(check => check.code === "edgee_api_key_valid")).toBe(true);
  });

  it("testEnvironment does NOT call fetch when API key is missing", async () => {
    // Import the function
    const { testEnvironment } = await import("../src/server/test.js");
    
    // Call testEnvironment without API key
    const result = await testEnvironment({
      companyId: "test-company",
      adapterType: "edgee_ai",
      config: { edgeeApiKey: "" },
    });

    // Verify fetch was NOT called
    expect(global.fetch).not.toHaveBeenCalled();
    
    // Verify the result indicates failure
    expect(result.status).toBe("fail");
    expect(result.checks.some(check => check.code === "edgee_api_key_missing")).toBe(true);
  });
});