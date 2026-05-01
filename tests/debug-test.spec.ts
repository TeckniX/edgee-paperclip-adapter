// Debug test to see what's happening
import { describe, it, expect, vi } from "vitest";

describe("Debug test", () => {
  it("should show when fetch is called", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      text: async () => JSON.stringify({ test: "value" }),
      status: 200,
      headers: new Map()
    });
    
    // Mock global fetch
    global.fetch = fetchMock;
    
    console.log("Before import, fetchMock calls:", fetchMock.mock.calls.length);
    
    // Import after mocking
    const { testEnvironment } = await import("../src/server/test.js");
    
    console.log("After import, before call, fetchMock calls:", fetchMock.mock.calls.length);
    
    // Call a simple function that should use fetch
    const context = {
      companyId: "test-company",
      adapterType: "edgee_ai",
      config: { edgeeApiKey: "test-key" },
    };
    
    const result = await testEnvironment(context as any);
    
    console.log("After call, fetchMock calls:", fetchMock.mock.calls.length);
    console.log("Fetch mock calls:", fetchMock.mock.calls);
    
    expect(true).toBe(true);
  });
});