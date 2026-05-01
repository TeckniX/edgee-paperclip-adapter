// Proper test that mocks the internal validateEdgeeApiKey function
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("Edgee Adapter - Proper Test", () => {
  let validateMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    validateMock = vi.fn();
    // @ts-ignore
    global.validateEdgeeApiKey = validateMock;
  });

  it("testEnvironment should call validateEdgeeApiKey when API key is present", async () => {
    // Import the function
    const { testEnvironment } = await import("../src/server/test.js");

    // Mock validateEdgeeApiKey to return success
    validateMock.mockResolvedValue({ success: true });

    const context = {
      companyId: "test-company",
      adapterType: "edgee_ai",
      config: { edgeeApiKey: "valid-key", edgeeModel: "anthropic/claude-sonnet-4-5" },
    };

    const result = await testEnvironment(context);

    // Check that validateEdgeeApiKey was called
    expect(validateMock).toHaveBeenCalledTimes(1);
    expect(validateMock).toHaveBeenCalledWith("valid-key", "anthropic/claude-sonnet-4-5");
    
    // Check the result
    expect(result.status).toBe("pass");
    expect(result.checks.some(c => c.code === "edgee_api_key_valid")).toBe(true);
  });

  it("testEnvironment should NOT call validateEdgeeApiKey when API key is missing", async () => {
    // Import the function
    const { testEnvironment } = await import("../src/server/test.js");

    const context = {
      companyId: "test-company",
      adapterType: "edgee_ai",
      config: { edgeeApiKey: "" },
    };

    const result = await testEnvironment(context);

    // Check that validateEdgeeApiKey was NOT called
    expect(validateMock).not.toHaveBeenCalled();
    
    // Check the result
    expect(result.status).toBe("fail");
    expect(result.checks.some(c => c.code === "edgee_api_key_missing")).toBe(true);
  });
});