import path from "path";
import fs from "fs/promises";

import { BaseRuntime } from "../../runtime/runtime.types.js";
import { compileCpp } from "../../compiler/compile.cpp.js";
import { interactiveRunner } from "../../runner/interactive.runner.js";
import { CPP_CONFIG } from "../cpp/cpp.config.js";

function hasStdioInclude(code) {
  return /#\s*include\s*<\s*stdio\.h\s*>/.test(code) || /#\s*include\s*<\s*cstdio\s*>/.test(code);
}

function alreadyUnbuffered(code) {
  return /\bsetvbuf\s*\(\s*stdout\b/.test(code) || /\bfflush\s*\(\s*stdout\s*\)/.test(code);
}

function injectUnbufferedStdioIntoMain(code) {
  if (alreadyUnbuffered(code)) return code;

  // Very small heuristic:
  //  - Find `main(...) {` (allowing whitespace/newlines)
  //  - Inject `setvbuf` right after the opening brace
  // This avoids touching global scope or requiring complex parsing.
  const re = /\bmain\s*\([^)]*\)\s*\{/m;
  const match = re.exec(code);
  if (!match) return code;

  const insertAt = match.index + match[0].length;

  // Keep it simple: fixed 2-space indent works fine even if style differs.
  const snippet =
    "\n  setvbuf(stdout, NULL, _IONBF, 0);\n  setvbuf(stderr, NULL, _IONBF, 0);\n";

  return code.slice(0, insertAt) + snippet + code.slice(insertAt);
}

function preprocessCCode(code) {
  let next = code ?? "";

  // Ensure stdio declarations exist for setvbuf/stdout.
  if (!hasStdioInclude(next)) {
    next = `#include <stdio.h>\n${next}`;
  }

  next = injectUnbufferedStdioIntoMain(next);
  return next;
}

export class CRuntime extends BaseRuntime {
  async prepare(context) {
    const sourcePath = path.join(context.workspacePath, CPP_CONFIG.sourceFile);
    const code = preprocessCCode(context.code);
    await fs.writeFile(sourcePath, code);
  }

  async compile(context) {
    return compileCpp(CPP_CONFIG.sourceFile, CPP_CONFIG.outputFile, context.workspacePath);
  }

  async execute(context) {
    return interactiveRunner(
      context.jobId,
      `./${CPP_CONFIG.outputFile}`,
      context.workspacePath,
      context.socket,
    );
  }
}
