import path from "path";
import fs from "fs/promises";

import { BaseRuntime } from "../../runtime/runtime.types.js";

import { compileCpp } from "../../compiler/compile.cpp.js";

import { interactiveRunner } from "../../runner/interactive.runner.js";

import { CPP_CONFIG } from "./cpp.config.js";

export class CppRuntime extends BaseRuntime {
  async prepare(context) {
    const sourcePath = path.join(context.workspacePath, CPP_CONFIG.sourceFile);

    await fs.writeFile(sourcePath, context.code);
  }

  async compile(context) {
    return compileCpp(
      CPP_CONFIG.sourceFile,
      CPP_CONFIG.outputFile,
      context.workspacePath,
    );
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
