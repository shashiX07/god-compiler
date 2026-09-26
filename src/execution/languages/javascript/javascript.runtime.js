import path from "path";
import fs from "fs/promises";

import { BaseRuntime } from "../../runtime/runtime.types.js";
import { interactiveRunner } from "../../runner/interactive.runner.js";
import { JAVASCRIPT_CONFIG } from "./javascript.config.js";

function looksLikeEsm(code) {
  return /^\s*import\s/m.test(code ?? "") || /^\s*export\s/m.test(code ?? "");
}

export class JavaScriptRuntime extends BaseRuntime {
  async prepare(context) {
    const sourcePath = path.join(
      context.workspacePath,
      JAVASCRIPT_CONFIG.sourceFile,
    );
    await fs.writeFile(sourcePath, context.code ?? "", "utf8");

    if (looksLikeEsm(context.code)) {
      await fs.writeFile(
        path.join(context.workspacePath, "package.json"),
        JSON.stringify({ type: "module", private: true }),
        "utf8",
      );
    }
  }

  async compile() {
    return { success: true };
  }

  async execute(context) {
    return interactiveRunner(
      context.jobId,
      JAVASCRIPT_CONFIG.executeCommand,
      context.workspacePath,
      context.socket,
      [JAVASCRIPT_CONFIG.sourceFile],
    );
  }
}
