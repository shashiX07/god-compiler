import path from "path";
import fs from "fs/promises";

import { BaseRuntime } from "../../runtime/runtime.types.js";
import { compileProgram } from "../../compiler/compile.cpp.js";
import { interactiveRunner } from "../../runner/interactive.runner.js";
import { TYPESCRIPT_CONFIG } from "./typescript.config.js";

export class TypeScriptRuntime extends BaseRuntime {
  async prepare(context) {
    const sourcePath = path.join(
      context.workspacePath,
      TYPESCRIPT_CONFIG.sourceFile,
    );
    await fs.writeFile(sourcePath, context.code ?? "", "utf8");
  }

  async compile(context) {
    return compileProgram(
      TYPESCRIPT_CONFIG.compileCommand,
      [
        "--pretty",
        "false",
        "--target",
        "ES2020",
        "--module",
        "commonjs",
        "--esModuleInterop",
        "--skipLibCheck",
        "--moduleResolution",
        "node",
        TYPESCRIPT_CONFIG.sourceFile,
      ],
      context.workspacePath,
      TYPESCRIPT_CONFIG.compileTimeout,
    );
  }

  async execute(context) {
    return interactiveRunner(
      context.jobId,
      TYPESCRIPT_CONFIG.executeCommand,
      context.workspacePath,
      context.socket,
      [TYPESCRIPT_CONFIG.outputFile],
    );
  }
}
