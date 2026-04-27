import Edgee from "edgee";
import { type } from "../index.js";
import type { EdgeeAdapterConfig } from "../index.js";

export interface AdapterExecutionContext {
  prompt: string;
  systemPrompt?: string;
  model: string;
  config: EdgeeAdapterConfig;
  env: Record<string, string>;
}

export interface AdapterResult {
  transcript: TranscriptEntry[];
  usage?: UsageInfo;
  finishReason?: string;
  error?: string;
}

export interface TranscriptEntry {
  type: "text" | "tool-call" | "tool-result" | "error";
  content: string;
  timestamp: number;
}

export interface UsageInfo {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;
  compression?: CompressionInfo;
}

export interface CompressionInfo {
  savedTokens: number;
  reduction: number;
  costSavings: number;
  timeMs: number;
}

export async function execute(
  context: AdapterExecutionContext
): Promise<AdapterResult> {
  const { prompt, systemPrompt, config } = context;
  const { edgeeApiKey, edgeeModel } = config;

  if (!edgeeApiKey) {
    return {
      transcript: [
        {
          type: "error",
          content: "Edgee API key not configured. Please set edgeeApiKey in adapter config.",
          timestamp: Date.now(),
        },
      ],
      error: "Missing Edgee API key",
    };
  }

  try {
    const edgee = new Edgee(edgeeApiKey);

    const startTime = Date.now();
    const response = await edgee.send({
      model: edgeeModel as string,
      input: prompt,
      ...(systemPrompt && { systemPrompt }),
    });

    const endTime = Date.now();
    const timeMs = endTime - startTime;

    const transcript: TranscriptEntry[] = [
      {
        type: "text",
        content: response.text || "",
        timestamp: endTime,
      },
    ];

    const usage: UsageInfo = {
      inputTokens: response.usage?.prompt_tokens || 0,
      outputTokens: response.usage?.completion_tokens || 0,
      totalTokens: response.usage?.total_tokens || 0,
      cost: 0,
    };

    if (response.compression) {
      usage.cost = response.compression.cost_savings || 0;
      usage.compression = {
        savedTokens: response.compression.saved_tokens || 0,
        reduction: response.compression.reduction || 0,
        costSavings: response.compression.cost_savings || 0,
        timeMs,
      };
    }

    return {
      transcript,
      usage,
      finishReason: response.finishReason || "stop",
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      transcript: [
        {
          type: "error",
          content: `Edgee execution error: ${errorMessage}`,
          timestamp: Date.now(),
        },
      ],
      error: errorMessage,
    };
  }
}

export async function executeStream(
  context: AdapterExecutionContext,
  onChunk: (chunk: string) => void
): Promise<AdapterResult> {
  const { prompt, config } = context;
  void context.systemPrompt; // SDK doesn't support systemPrompt in stream mode
  const { edgeeApiKey, edgeeModel } = config;

  if (!edgeeApiKey) {
    return {
      transcript: [
        {
          type: "error",
          content: "Edgee API key not configured. Please set edgeeApiKey in adapter config.",
          timestamp: Date.now(),
        },
      ],
      error: "Missing Edgee API key",
    };
  }

  try {
    const edgee = new Edgee(edgeeApiKey);
    let fullText = "";
    let finishReason = "stop";

    for await (const chunk of edgee.stream(edgeeModel as string, prompt)) {
      if (chunk.text) {
        fullText += chunk.text;
        onChunk(chunk.text);
      }
      if (chunk.finishReason) {
        finishReason = chunk.finishReason;
      }
    }

    const endTime = Date.now();

    return {
      transcript: [
        {
          type: "text",
          content: fullText,
          timestamp: endTime,
        },
      ],
      finishReason,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      transcript: [
        {
          type: "error",
          content: `Edgee stream error: ${errorMessage}`,
          timestamp: Date.now(),
        },
      ],
      error: errorMessage,
    };
  }
}

export const adapter = {
  type,
  execute,
  executeStream,
};

export default adapter;