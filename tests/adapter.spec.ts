import { describe, it, expect, vi, beforeEach } from "vitest";
import type { AdapterExecutionContext, AdapterEnvironmentTestContext } from "@paperclipai/adapter-utils";

let fetchMock: ReturnType<typeof vi.fn>;

describe("Edgee Adapter", () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.resetAllMocks();
    
    // Create a fresh fetch mock for each test
    fetchMock = vi.fn();
    
    // Mock the global fetch function
    global.fetch = fetchMock;
  });

  describe("execute", () => {
    it("should return error when API key is missing", async () => {
      // Import here to ensure we get the mocked fetch
      const { execute } = await import("../src/server/execute.js");

      const context: AdapterExecutionContext = {
        runId: "test-run",
        agent: { id: "test-agent", companyId: "test-company", name: "Test", adapterType: "edgee_ai", adapterConfig: {} },
        runtime: { sessionId: null, sessionParams: null, sessionDisplayId: null, taskKey: null },
        config: { edgeeApiKey: "", edgeeModel: "anthropic/claude-sonnet-4-5" },
        context: { prompt: "Hello" },
        onLog: vi.fn(),
      };

      const result = await execute(context);

      expect(result.exitCode).toBe(1);
      expect(result.errorMessage).toContain("API key not configured");
    });

    it("should call Edgee API with correct parameters", async () => {
      // Import here to ensure we get the mocked fetch
      const { execute } = await import("../src/server/execute.js");

      const mockFetchResponse = {
        text: async () => JSON.stringify({
          choices: [{ message: { content: "Hello world" } }],
          usage: { prompt_tokens: 10, completion_tokens: 5 }
        }),
        status: 200,
        headers: new Map([["content-type", "application/json"]])
      };

      fetchMock.mockResolvedValue(mockFetchResponse);

      const context: AdapterExecutionContext = {
        runId: "test-run",
        agent: { id: "test-agent", companyId: "test-company", name: "Test", adapterType: "edgee_ai", adapterConfig: {} },
        runtime: { sessionId: null, sessionParams: null, sessionDisplayId: null, taskKey: null },
        config: { edgeeApiKey: "test-key", edgeeModel: "anthropic/claude-sonnet-4-5" },
        context: { prompt: "Hello" },
        onLog: vi.fn(),
        onMeta: vi.fn(),
      };

      const result = await execute(context);

      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.edgee.ai/v1/chat/completions",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Authorization": "Bearer test-key",
            "Content-Type": "application/json"
          }),
          body: JSON.stringify({
            model: "anthropic/claude-sonnet-4-5",
            messages: [{ role: "user", content: "Hello" }]
          })
        })
      );

      expect(result.exitCode).toBe(0);
      expect(result.resultJson).toBeDefined();
      expect(result.resultJson.stdout).toContain('"content":"Hello world"');
    });

    it("should handle API errors gracefully", async () => {
      // Import here to ensure we get the mocked fetch
      const { execute } = await import("../src/server/execute.js");

      const mockFetchResponse = {
        text: async () => JSON.stringify({
          error: { message: "Invalid API key" }
        }),
        status: 401,
        headers: new Map([["content-type", "application/json"]])
      };

      fetchMock.mockResolvedValue(mockFetchResponse);

      const context: AdapterExecutionContext = {
        runId: "test-run",
        agent: { id: "test-agent", companyId: "test-company", name: "Test", adapterType: "edgee_ai", adapterConfig: {} },
        runtime: { sessionId: null, sessionParams: null, sessionDisplayId: null, taskKey: null },
        config: { edgeeApiKey: "invalid-key", edgeeModel: "anthropic/claude-sonnet-4-5" },
        context: { prompt: "Hello" },
        onLog: vi.fn(),
      };

      const result = await execute(context);

      expect(fetchMock).toHaveBeenCalled();
      expect(result.exitCode).toBe(1);
      expect(result.errorMessage).toContain("Invalid API key");
    });
  });

  describe("testEnvironment", () => {
    it("should fail when API key is missing", async () => {
      // Import here to ensure we get the mocked fetch
      const { testEnvironment } = await import("../src/server/test.js");

      const context: AdapterEnvironmentTestContext = {
        companyId: "test-company",
        adapterType: "edgee_ai",
        config: { edgeeApiKey: "" },
      };

      const result = await testEnvironment(context);

      expect(result.status).toBe("fail");
      expect(result.checks.some(c => c.code === "edgee_api_key_missing")).toBe(true);
    });

    it("should pass when API key is present and valid", async () => {
      // Import here to ensure we get the mocked fetch
      const { testEnvironment } = await import("../src/server/test.js");

      const mockFetchResponse = {
        text: async () => JSON.stringify({
          choices: [{ message: { content: "Test response" } }],
          usage: { prompt_tokens: 5, completion_tokens: 3 }
        }),
        status: 200,
        headers: new Map([["content-type", "application/json"]])
      };

      fetchMock.mockResolvedValue(mockFetchResponse);

      const context: AdapterEnvironmentTestContext = {
        companyId: "test-company",
        adapterType: "edgee_ai",
        config: { edgeeApiKey: "valid-key", edgeeModel: "anthropic/claude-sonnet-4-5" },
      };

      const result = await testEnvironment(context);

      expect(fetchMock).toHaveBeenCalled();
      expect(result.status).toBe("pass");
      expect(result.checks.some(c => c.code === "edgee_api_key_valid")).toBe(true);
      expect(result.checks.some(c => c.code === "edgee_api_key_found")).toBe(true);
    });

    it("should fail when API key is invalid", async () => {
      // Import here to ensure we get the mocked fetch
      const { testEnvironment } = await import("../src/server/test.js");

      const mockFetchResponse = {
        text: async () => JSON.stringify({
          error: { message: "Invalid API key" }
        }),
        status: 401,
        headers: new Map([["content-type", "application/json"]])
      };

      fetchMock.mockResolvedValue(mockFetchResponse);

      const context: AdapterEnvironmentTestContext = {
        companyId: "test-company",
        adapterType: "edgee_ai",
        config: { edgeeApiKey: "invalid-key", edgeeModel: "anthropic/claude-sonnet-4-5" },
      };

      const result = await testEnvironment(context);

      expect(fetchMock).toHaveBeenCalled();
      expect(result.status).toBe("fail");
      expect(result.checks.some(c => c.code === "edgee_api_key_invalid")).toBe(true);
      expect(result.checks.some(c => c.code === "edgee_api_key_found")).toBe(true);
    });

    it("should handle timeout during validation", async () => {
      // Import here to ensure we get the mocked fetch
      const { testEnvironment } = await import("../src/server/test.js");

      fetchMock.mockRejectedValue(new Error("timeout"));

      const context: AdapterEnvironmentTestContext = {
        companyId: "test-company",
        adapterType: "edgee_ai",
        config: { edgeeApiKey: "test-key", edgeeModel: "anthropic/claude-sonnet-4-5" },
      };

      const result = await testEnvironment(context);

      expect(fetchMock).toHaveBeenCalled();
      expect(result.status).toBe("fail");
      expect(result.checks.some(c => c.code === "edgee_api_key_invalid")).toBe(true);
      expect(result.checks.some(c => c.detail?.includes("timed out"))).toBe(true);
    });
  });
});