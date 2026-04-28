import type { EdgeeAdapterConfig } from "../index.js";
export interface ConfigFormValues {
    edgeeApiKey?: string;
    edgeeModel?: string;
}
export declare function buildConfig(values: ConfigFormValues): EdgeeAdapterConfig;
export declare function parseConfig(config: EdgeeAdapterConfig): ConfigFormValues;
declare const _default: {
    buildConfig: typeof buildConfig;
    parseConfig: typeof parseConfig;
};
export default _default;
//# sourceMappingURL=build-config.d.ts.map