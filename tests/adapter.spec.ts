import { describe, it, expect, beforeEach, vi } from "vitest";
import { execute, testEnvironment } from "../src/server/execute.js";
import type { AdapterExecutionContext, AdapterEnvironmentTestContext } from "@paperclipai/adapter-utils";

describe("Edgee Adapter", () => {
  describe("execute", () => {
    it("should return error when API key is missing", async () => {
      const context: AdapterExecutionContext = {
        runId: "test-run",
        agent: { id: "test-agent", companyId: "test-company", name: "Test", adapterType: "edgee_compressed", adapterConfig: {} },
        runtime: { sessionId: null, sessionParams: null, sessionDisplayId: null, taskKey: null },
        config: { edgeeApiKey: "", edgeeModel: "anthropic/claude-sonnet-4-5" },
        context: { prompt: "Hello" },
        onLog: vi.fn(),
      };

      const result = await execute(context);

      expect(result.exitCode).toBe(1);
      expect(result.errorMessage).toContain("API key not configured");
    });

    it("should return error when API key is empty string", async () => {
      const context: AdapterExecutionContext = {
        runId: "test-run",
        agent: { id: "test-agent", companyId: "test-company", name: "Test", adapterType: "edgee_compressed", adapterConfig: {} },
        runtime: { sessionId: null, sessionParams: null, sessionDisplayId: null, taskKey: null },
        config: { edgeeApiKey: "", edgeeModel: "anthropic/claude-sonnet-4-5" },
        context: { prompt: "Hello" },
        onLog: vi.fn(),
      };

      const result = await execute(context);

      expect(result.errorMessage).toContain("API key not configured");
    });
  });

  describe("testEnvironment", () => {
    it("should fail when API key is missing", async () => {
      const context: AdapterEnvironmentTestContext = {
        companyId: "test-company",
        adapterType: "edgee_compressed",
        config: { edgeeApiKey: "" },
      };

      const result = await testEnvironment(context);

      expect(result.status).toBe("fail");
      expect(result.checks.some(c => c.code === "no_api_key")).toBe(true);
    });

    it("should pass when API key is present", async () => {
      const context: AdapterEnvironmentTestContext = {
        companyId: "test-company",
        adapterType: "edgee_compressed",
        config: { edgeeApiKey: "test-key" },
      };

      const result = await testEnvironment(context);

      expect(result.status).toBe("pass");
      expect(result.checks.some(c => c.code === "api_key_found")).toBe(true);
    });
  });
});