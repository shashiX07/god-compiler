import path from "path";
import fs from "fs/promises";

import { BaseRuntime } from "../../runtime/runtime.types.js";
import { compileProgram } from "../../compiler/compile.cpp.js";
import { interactiveRunner } from "../../runner/interactive.runner.js";
import { KOTLIN_CONFIG } from "./kotlin.config.js";

export class KotlinRuntime extends BaseRuntime {
  async prepare(context) {
    await fs.writeFile(
      path.join(context.workspacePath, KOTLIN_CONFIG.sourceFile),
      context.code ?? "",
      "utf8",
    );
  }

  async compile(context) {
    return compileProgram(
      KOTLIN_CONFIG.compileCommand,
      [
        KOTLIN_CONFIG.sourceFile,
        "-include-runtime",
        "-d",
        KOTLIN_CONFIG.outputFile,
      ],
      context.workspacePath,
      KOTLIN_CONFIG.compileTimeout,
    );
  }

  async execute(context) {
    return interactiveRunner(
      context.jobId,
      KOTLIN_CONFIG.executeCommand,
      context.workspacePath,
      context.socket,
      ["-Dfile.encoding=UTF-8", "-jar", KOTLIN_CONFIG.outputFile],
    );
  }
}
