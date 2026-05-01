// Unit test for the validateEdgeeApiKey function
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("Edgee Adapter - Unit Tests", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    // @ts-ignore
    global.fetch = fetchMock;
  });

  describe("validateEdgeeApiKey function", () => {
    it("should return success for valid API key", async () => {
      // Import the function directly
      const { validateEdgeeApiKey } = await import("../src/server/test.js");

      // Mock successful API response
      fetchMock.mockResolvedValue({
        text: async () => JSON.stringify({
          choices: [{ message: { content: "Test response" } }],
          usage: { prompt_tokens: 5, completion_tokens: 3 }
        }),
        status: 200,
        headers: new Map([["content-type", "application/json"]])
      });

      const result = await validateEdgeeApiKey("test-key", "anthropic/claude-sonnet-4-5");

      expect(fetchMock).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it("should return failure for invalid API key", async () => {
      // Import the function directly
      const { validateEdgeeApiKey } = await import("../src/server/test.js");

      // Mock error API response
      fetchMock.mockResolvedValue({
        text: async () => JSON.stringify({
          error: { message: "Invalid API key" }
        }),
        status: 401,
        headers: new Map([["content-type", "application/json"]])
      });

      const result = await validateEdgeeApiKey("invalid-key", "anthropic/claude-sonnet-4-5");

      expect(fetchMock).toHaveBeenCalled();
      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid API key");
    });

    it("should handle timeout", async () => {
      // Import the function directly
      const { validateEdgeeApiKey } = await import("../src/server/test.js");

      // Mock timeout
      fetchMock.mockRejectedValue(new Error("timeout"));

      const result = await validateEdgeeApiKey("test-key", "anthropic/claude-sonnet-4-5");

      expect(fetchMock).toHaveBeenCalled();
      expect(result.success).toBe(false);
      expect(result.error).toContain("timeout");
    });
  });
});