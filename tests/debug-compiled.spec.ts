// Debug test to see if validateEdgeeApiKey is being called in compiled JS
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("Debug Compiled JS", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let validateMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    validateMock = vi.fn();
    // @ts-ignore
    global.fetch = fetchMock;
    
    // Also mock the validateEdgeeApiKey function directly
    // @ts-ignore
    global.validateEdgeeApiKey = validateMock;
  });

  it("should call validateEdgeeApiKey when testing environment with valid key", async () => {
    // Import the compiled JS directly
    // @ts-ignore
    const { testEnvironment } = await import("../dist/server/test.js");

    // Mock the validateEdgeeApiKey function to return success
    validateMock.mockResolvedValue({ success: true });

    // Mock fetch as well (though it shouldn't be called if we mock validateEdgeeApiKey)
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

    // Check that validateEdgeeApiKey was called
    expect(validateMock).toHaveBeenCalledTimes(1);
    expect(validateMock).toHaveBeenCalledWith("valid-key", "anthropic/claude-sonnet-4-5");
    
    // Check that fetch was NOT called (since we mocked validateEdgeeApiKey)
    expect(fetchMock).not.toHaveBeenCalled();
    
    // Check the result
    expect(result.status).toBe("pass");
  });
});