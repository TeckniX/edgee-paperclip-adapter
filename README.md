# Edgee Compressed Adapter

A [Paperclip](https://paperclip.ing) adapter that routes all LLM requests through [Edgee AI Gateway](https://www.edgee.ai) for token compression and cost savings.

Edgee is an AI Gateway that optimizes LLM requests by compressing prompts and responses, reducing token usage by up to 70% while maintaining response quality.

## Key Features

- **Token Compression** — Reduces token usage by 10-70% through intelligent compression
- **Cost Savings** — Lower API costs while maintaining response quality
- **Multi-Provider Support** — Works with Anthropic, OpenAI, Google, Meta, Mistral models
- **Streaming Support** — Real-time streaming responses with compression
- **Usage Tracking** — Built-in tracking of tokens saved and cost reductions

## Installation

```bash
npm install @paperclipai/edgee-paperclip-adapter
```

### Prerequisites

- [Edgee account](https://www.edgee.ai) with an API key
- Paperclip server instance

## Quick Start

### 1. Register the adapter in your Paperclip server

Add to your Paperclip server's adapter registry (`server/src/adapters/registry.ts`):

```typescript
import * as edgeeLocal from "@paperclipai/edgee-paperclip-adapter";
import {
  execute,
  executeStream,
  testEnvironment,
  parseStdout,
} from "@paperclipai/edgee-paperclip-adapter/server";

registry.set("edgee_compressed", {
  ...edgeeLocal,
  execute,
  executeStream,
  testEnvironment,
  parseStdout,
});
```

### 2. Create an agent in Paperclip

In the Paperclip UI or via API, create an agent with adapter type `edgee_compressed`:

```json
{
  "name": "Edgee Coder",
  "adapterType": "edgee_compressed",
  "adapterConfig": {
    "edgeeApiKey": "your-edgee-api-key",
    "edgeeModel": "anthropic/claude-sonnet-4-5",
    "timeoutSec": 300
  }
}
```

### 3. Assign work

Create issues in Paperclip and assign them to your Edgee-enabled agent. Each run will automatically route through Edgee for compression.

## Configuration Reference

### Core Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `edgeeApiKey` | string | *(required)* | Your Edgee API key |
| `edgeeModel` | string | `anthropic/claude-haiku-4-5` | Model to use via Edgee |
| `wrappedAdapterType` | string | *(none)* | Legacy field (not used) |
| `wrappedAdapterConfig` | object | `{}` | Legacy field (not used) |

### Operational Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `timeoutSec` | number | `300` | Execution timeout in seconds |
| `graceSec` | number | `10` | Grace period before SIGKILL |

### Supported Models

| Provider | Model ID | Label |
|----------|----------|-------|
| Anthropic | `anthropic/claude-haiku-4-5` | Claude Haiku (Fast) |
| Anthropic | `anthropic/claude-sonnet-4-5` | Claude Sonnet (Balanced) |
| Anthropic | `anthropic/claude-opus-4-5` | Claude Opus (Power) |
| OpenAI | `openai/gpt-4o` | GPT-4o |
| OpenAI | `openai/gpt-4o-mini` | GPT-4o Mini |
| Google | `google/gemma-2-9b` | Gemma 2 9B |
| Meta | `meta/llama-3.1-70b` | Llama 3.1 70B |
| Meta | `meta/llama-3.1-8b` | Llama 3.1 8B |
| Mistral | `mistral/mistral-large` | Mistral Large |
| Mistral | `mistral/mistral-small` | Mistral Small |

## Architecture

```
┌──────────────────┐               ┌──────────────────┐
│  Paperclip       │               │  Edgee           │
│  Heartbeat       │───execute()──▶│  AI Gateway      │
│  Scheduler       │               │                  │
│                  │  prompt       │  Compression     │
│  Issue System    │──────────────▶│  Engine          │
│                  │               │                  │
│  Cost Tracking   │◀──compressed──│  Cost            │
│                  │   response    │  Optimization    │
│  Usage Metrics  │               │                  │
└──────────────────┘               └──────────────────┘
```

The adapter works by:

1. **Receiving** the prompt from Paperclip heartbeat
2. **Routing** the request through Edgee AI Gateway
3. **Compressing** tokens on input and output
4. **Returning** the compressed response with usage stats
5. **Reporting** compression metrics back to Paperclip

### Compression Details

Edgee uses intelligent prompt compression to reduce token counts:

- **Prompt Compression** — Optimizes system prompts and user messages
- **Response Compression** — Compresses LLM responses without losing meaning
- **Semantic Deduplication** — Removes redundant context
- **Smart Caching** — Avoids recomputing for similar requests

Typical savings:
- **10-30%** on typical coding tasks
- **30-70%** on long context conversations
- **Cost reduction** mirrors token savings

## Development

```bash
git clone https://github.com/your-repo/edgee-paperclip-adapter
cd edgee-paperclip-adapter
cd packages/adapters/edgee
npm install
npm run typecheck
npm run test
npm run build
```

## License

MIT — see LICENSE

## Links

- [Edgee AI Gateway](https://www.edgee.ai) — Token compression service
- [Edgee TypeScript SDK](https://github.com/edgee-ai/typescript-sdk) — Official SDK
- [Paperclip](https://github.com/paperclipai/paperclip) — Orchestration platform
- [Paperclip Docs](https://docs.paperclip.ing) — Documentation