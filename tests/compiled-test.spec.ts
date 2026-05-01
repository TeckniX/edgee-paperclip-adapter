// Test using the compiled JS directly
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("Compiled JS Test", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    // @ts-ignore
    global.fetch = fetchMock;
  });

  it("should call fetch when testing environment with valid key", async () => {
    // Import the compiled JS directly
    // @ts-ignore
    const { testEnvironment } = await import("../dist/server/test.js");

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
      config: { edgeeApiKey: "valid-key", edgeeModel: "anthropic/claude-sonnet-4-5" },
    };

    const result = await testEnvironment(context);

    // Check that fetch was called
    expect(fetchMock).toHaveBeenCalledTimes(1);
    
    // Check the result
    expect(result.status).toBe("pass");
  });
});