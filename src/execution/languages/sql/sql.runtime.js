import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";

import { BaseRuntime } from "../../runtime/runtime.types.js";
import { interactiveRunner } from "../../runner/interactive.runner.js";
import { SQL_CONFIG } from "./sql.config.js";

const PLAYGROUND_SRC = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  SQL_CONFIG.playgroundFile,
);

export class SqlRuntime extends BaseRuntime {
  async prepare(context) {
    const sourcePath = path.join(context.workspacePath, SQL_CONFIG.sourceFile);
    const playgroundPath = path.join(
      context.workspacePath,
      SQL_CONFIG.playgroundFile,
    );

    await fs.writeFile(sourcePath, context.code ?? "", "utf8");
    await fs.copyFile(PLAYGROUND_SRC, playgroundPath);
  }

  async compile() {
    return { success: true };
  }

  async execute(context) {
    return interactiveRunner(
      context.jobId,
      SQL_CONFIG.executeCommand,
      context.workspacePath,
      context.socket,
      [SQL_CONFIG.playgroundFile, SQL_CONFIG.sourceFile],
    );
  }
}
