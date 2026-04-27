import { type, label, models } from "../index.js";
import { parseTranscript } from "./parse-stdout.js";
import { buildConfig, parseConfig, UI_METADATA } from "./build-config.js";

export { parseTranscript, buildConfig, parseConfig, UI_METADATA };

export const uiAdapter = {
  type,
  label,
  models,
  parseTranscript,
  buildConfig,
  parseConfig,
  formFields: UI_METADATA.fields,
};

export default uiAdapter;