import { describe, it, expect, vi } from "vitest";

describe("Simple fetch mock test", () => {
  it("should mock fetch correctly", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      text: async () => '{"test": "value"}',
      status: 200,
      headers: new Map()
    });
    
    // Mock global fetch
    global.fetch = fetchMock;
    
    // Call fetch
    const response = await fetch("https://example.com");
    const text = await response.text();
    
    expect(fetchMock).toHaveBeenCalledWith("https://example.com");
    expect(text).toBe('{"test": "value"}');
  });
});