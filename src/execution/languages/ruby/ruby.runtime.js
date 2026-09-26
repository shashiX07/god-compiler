import { createInterpretedRuntime } from "../shared/interpreted.runtime.js";
import { RUBY_CONFIG } from "./ruby.config.js";

export const RubyRuntime = createInterpretedRuntime({
  sourceFile: RUBY_CONFIG.sourceFile,
  executeCommand: RUBY_CONFIG.executeCommand,
});
