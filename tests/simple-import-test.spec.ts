import { describe, it, expect } from "vitest";

describe("Simple Import Test", () => {
  it("should import testEnvironment function", async () => {
    const { testEnvironment } = await import("../src/server/test.js");
    expect(typeof testEnvironment).toBe("function");
  });

  it("should import execute function", async () => {
    const { execute } = await import("../src/server/execute.js");
    expect(typeof execute).toBe("function");
  });
});