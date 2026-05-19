import path from "path";
import fs from "fs/promises";

import { BaseRuntime } from "../../runtime/runtime.types.js";
import { compileProgram } from "../../compiler/compile.cpp.js";
import { interactiveRunner } from "../../runner/interactive.runner.js";
import { RUST_CONFIG } from "./rust.config.js";

export class RustRuntime extends BaseRuntime {
  async prepare(context) {
    const sourcePath = path.join(context.workspacePath, RUST_CONFIG.sourceFile);
    await fs.writeFile(sourcePath, context.code);
  }

  async compile(context) {
    return compileProgram(
      RUST_CONFIG.compileCommand,
      [RUST_CONFIG.sourceFile, "-o", RUST_CONFIG.outputFile],
      context.workspacePath,
    );
  }

  async execute(context) {
    return interactiveRunner(
      context.jobId,
      `./${RUST_CONFIG.outputFile}`,
      context.workspacePath,
      context.socket,
    );
  }
}
