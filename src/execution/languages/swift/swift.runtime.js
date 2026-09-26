import path from "path";
import fs from "fs/promises";

import { BaseRuntime } from "../../runtime/runtime.types.js";
import { compileProgram } from "../../compiler/compile.cpp.js";
import { interactiveRunner } from "../../runner/interactive.runner.js";
import { SWIFT_CONFIG } from "./swift.config.js";

export class SwiftRuntime extends BaseRuntime {
  async prepare(context) {
    await fs.writeFile(
      path.join(context.workspacePath, SWIFT_CONFIG.sourceFile),
      context.code ?? "",
      "utf8",
    );
  }

  async compile(context) {
    return compileProgram(
      SWIFT_CONFIG.compileCommand,
      ["-o", SWIFT_CONFIG.outputFile, SWIFT_CONFIG.sourceFile],
      context.workspacePath,
      SWIFT_CONFIG.compileTimeout,
    );
  }

  async execute(context) {
    return interactiveRunner(
      context.jobId,
      `./${SWIFT_CONFIG.outputFile}`,
      context.workspacePath,
      context.socket,
    );
  }
}
