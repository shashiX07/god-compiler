import path from "path";
import fs from "fs/promises";

import { BaseRuntime } from "../../runtime/runtime.types.js";
import { compileProgram } from "../../compiler/compile.cpp.js";
import { interactiveRunner } from "../../runner/interactive.runner.js";
import { CSHARP_CONFIG } from "./csharp.config.js";

export class CSharpRuntime extends BaseRuntime {
  async prepare(context) {
    await fs.writeFile(
      path.join(context.workspacePath, CSHARP_CONFIG.sourceFile),
      context.code ?? "",
      "utf8",
    );
  }

  async compile(context) {
    return compileProgram(
      CSHARP_CONFIG.compileCommand,
      [`-out:${CSHARP_CONFIG.outputFile}`, CSHARP_CONFIG.sourceFile],
      context.workspacePath,
      CSHARP_CONFIG.compileTimeout,
    );
  }

  async execute(context) {
    return interactiveRunner(
      context.jobId,
      CSHARP_CONFIG.executeCommand,
      context.workspacePath,
      context.socket,
      [CSHARP_CONFIG.outputFile],
    );
  }
}
