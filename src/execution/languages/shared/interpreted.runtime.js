import path from "path";
import fs from "fs/promises";

import { BaseRuntime } from "../../runtime/runtime.types.js";
import { interactiveRunner } from "../../runner/interactive.runner.js";

export function createInterpretedRuntime({
  sourceFile,
  executeCommand,
  extraArgs = [],
  transform,
  env,
}) {
  return class InterpretedRuntime extends BaseRuntime {
    async prepare(context) {
      const sourcePath = path.join(context.workspacePath, sourceFile);
      const code = transform ? transform(context.code) : context.code;
      await fs.writeFile(sourcePath, code ?? "", "utf8");
    }

    async compile() {
      return { success: true };
    }

    async execute(context) {
      return interactiveRunner(
        context.jobId,
        executeCommand,
        context.workspacePath,
        context.socket,
        [...extraArgs, sourceFile],
        env ? { env } : undefined,
      );
    }
  };
}
