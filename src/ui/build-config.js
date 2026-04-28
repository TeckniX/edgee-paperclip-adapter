export function buildConfig(values) {
    return {
        edgeeModel: values.edgeeModel || "anthropic/claude-sonnet-4-5",
    };
}
export function parseConfig(config) {
    return {
        edgeeModel: config.edgeeModel,
    };
}
export default { buildConfig, parseConfig };
//# sourceMappingURL=build-config.js.map