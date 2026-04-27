import { type, label, models } from "../index.js";
import { execute, executeStream } from "./execute.js";
import { parseStdout } from "./parse.js";
import { testEnvironment } from "./test.js";

export { parseStdout, testEnvironment };

export const serverAdapter = {
  type,
  label,
  models,
  execute,
  executeStream,
};

export default serverAdapter;