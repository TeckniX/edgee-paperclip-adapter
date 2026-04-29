export const type = "edgee_compressed";
export const label = "Edgee Compressed";
export const models = [
    { id: "anthropic/claude-haiku-4-5", label: "Claude Haiku (Fast)" },
    { id: "anthropic/claude-sonnet-4-5", label: "Claude Sonnet (Balanced)" },
    { id: "anthropic/claude-opus-4-5", label: "Claude Opus (Power)" },
];
export const agentConfigurationDoc = `# edgee_compressed agent configuration

Adapter: edgee_compressed

Use when:
- You want to reduce token usage and costs through Edgee AI Gateway
- You need to compress LLM requests while maintaining response quality

Don't use when:
- You require direct API access without compression
- Your use case has specific compliance requirements for direct model access

Core fields:
- model (string, optional): Model to use via Edgee gateway (for example anthropic/claude-sonnet-4-5)
- EDGEE_API_KEY (env variable, required): Set in Permissions & Configuration → Environment Variables, then seal as secret

Operational fields:
- timeoutSec (number, optional): Execution timeout in seconds
- graceSec (number, optional): Grace period before SIGKILL
`;
//# sourceMappingURL=index.js.map