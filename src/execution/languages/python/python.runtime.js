import path from "path";
import fs from "fs/promises";

import { BaseRuntime } from "../../runtime/runtime.types.js";

import { interactiveRunner } from "../../runner/interactive.runner.js";

import { PYTHON_CONFIG } from "./python.config.js";

export class PythonRuntime extends BaseRuntime {
  async prepare(context) {
    const sourcePath = path.join(
      context.workspacePath,
      PYTHON_CONFIG.sourceFile,
    );

    await fs.writeFile(sourcePath, context.code);
  }

  async compile() {
    return {
      success: true,
    };
  }

  async execute(context) {
    return interactiveRunner(
      context.jobId,
      PYTHON_CONFIG.executeCommand,
      context.workspacePath,
      context.socket,
      [PYTHON_CONFIG.sourceFile],
    );
  }
}
