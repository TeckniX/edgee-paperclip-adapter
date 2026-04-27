import { type, label, models } from "../index.js";
import { formatEvent, formatStart, formatOutput, formatError, formatFinish, formatUsage } from "./format-event.js";

export { formatEvent, formatStart, formatOutput, formatError, formatFinish, formatUsage };

export const cliAdapter = {
  type,
  label,
  models,
  formatEvent,
  formatStart,
  formatOutput,
  formatError,
  formatFinish,
  formatUsage,
};

export default cliAdapter;