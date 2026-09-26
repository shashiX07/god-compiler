import { createInterpretedRuntime } from "../shared/interpreted.runtime.js";
import { PHP_CONFIG } from "./php.config.js";

function ensurePhpTag(code) {
  const source = String(code ?? "").replace(/^\uFEFF/, "");
  if (/^\s*<\?php/i.test(source) || /^\s*<\?=/i.test(source)) {
    return source;
  }
  return `<?php\n${source}`;
}

export const PhpRuntime = createInterpretedRuntime({
  sourceFile: PHP_CONFIG.sourceFile,
  executeCommand: PHP_CONFIG.executeCommand,
  transform: ensurePhpTag,
});
