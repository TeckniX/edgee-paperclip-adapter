# Edgee Compressed Adapter

A [Paperclip](https://docs.paperclip.ing) adapter that routes all LLM requests through [Edgee AI Gateway](https://www.edgee.ai) for token compression and cost savings.

## Key Features

- **Token Compression** — Reduces token usage by 10-70% through intelligent compression
- **Cost Savings** — Lower API costs while maintaining response quality
- **Multi-Provider Support** — Works with Anthropic, OpenAI, Google, Meta, Mistral models
- **Usage Tracking** — Built-in tracking of tokens saved and cost reductions

## Installation

### Install from npm

```bash
npm install @tecknix/edgee-paperclip-adapter
```

## Quick Start

### 1. Create an Edgee agent in Paperclip

In the Paperclip UI, create an agent with adapter type `edgee_compressed`:

```json
{
  "name": "Edgee Coder",
  "adapterType": "edgee_compressed",
  "adapterConfig": {
    "edgeeApiKey": "your-edgee-api-key",
    "edgeeModel": "anthropic/claude-sonnet-4-5"
  }
}
```

### 2. Assign work

Create issues in Paperclip and assign them to your Edgee-enabled agent. Each run will automatically route through Edgee for compression.

## Configuration Reference

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `edgeeApiKey` | string | Your Edgee API key |

### Optional Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `edgeeModel` | string | `anthropic/claude-sonnet-4-5` | Model to use via Edgee |

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

## Development

### Prerequisites

- Node.js 20+
- Paperclip server for local testing
- Edgee API key from [edgee.ai](https://www.edgee.ai)

### Clone and Setup

```bash
git clone https://github.com/edgee-ai/edgee-paperclip-adapter
cd edgee-paperclip-adapter
npm install
```

### Type Check

```bash
npm run typecheck
```

### Test

```bash
npm run test
```

## Architecture

```
Paperclip                     Edgee                    LLM Provider
    │                           │                          │
    ├─ Heartbeat fires ────────▶│                          │
    │                           │                          │
    │                           ├─ Compress prompt ──────▶│
    │                           │                          │
    │                           │◀─ Compressed response ───┤
    │                           │                          │
    │◀─ Return results ────────┤                          │
    │                           │                          │
```

1. Paperclip calls `execute()` with the prompt
2. Adapter routes the request through Edgee AI Gateway
3. Edgee compresses the prompt and response
4. Compressed response returns with usage stats

## License

MIT