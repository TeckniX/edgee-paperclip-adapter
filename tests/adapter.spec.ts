import { describe, it, expect, vi, beforeEach } from "vitest";
import { execute, executeStream } from "../src/server/execute.js";
import { parseStdout } from "../src/server/parse.js";
import { testEnvironment } from "../src/server/test.js";

describe("Edgee Adapter", () => {
  describe("execute", () => {
    it("should return error when API key is missing", async () => {
      const context = {
        prompt: "Hello",
        model: "anthropic/claude-haiku-4-5",
        config: {
          wrappedAdapterType: "claude_local",
          wrappedAdapterConfig: {},
          edgeeApiKey: "",
          edgeeModel: "anthropic/claude-haiku-4-5",
        },
        env: {},
      };

      const result = await execute(context);

      expect(result.error).toContain("API key not configured");
      expect(result.transcript[0].type).toBe("error");
    });

    it("should parse stdout correctly", () => {
      const stdout = JSON.stringify({ type: "content", text: "Hello world", timestamp: 1234567890 });
      const parsed = parseStdout(stdout);

      expect(parsed.transcript).toHaveLength(1);
      expect(parsed.transcript[0].content).toBe("Hello world");
    });
  });

  describe("testEnvironment", () => {
    it("should fail when API key is missing", async () => {
      const result = await testEnvironment({ edgeeApiKey: "" });

      expect(result.success).toBe(false);
      expect(result.message).toContain("API key");
    });
  });
});