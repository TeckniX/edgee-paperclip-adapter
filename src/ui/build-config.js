export function buildConfig(values) {
    return {
        edgeeApiKey: values.edgeeApiKey || "",
        edgeeModel: values.edgeeModel || "anthropic/claude-sonnet-4-5",
    };
}
export function parseConfig(config) {
    return {
        edgeeApiKey: config.edgeeApiKey,
        edgeeModel: config.edgeeModel,
    };
}
export default { buildConfig, parseConfig };
//# sourceMappingURL=build-config.js.map