import path from "path";
import fs from "fs/promises";

import { BaseRuntime } from "../../runtime/runtime.types.js";
import { interactiveRunner } from "../../runner/interactive.runner.js";
import { BASH_CONFIG } from "./bash.config.js";

function normalizeShellSource(code) {
  const source = (code ?? "").replace(/\r\n/g, "\n");
  if (source.startsWith("#!")) return source;
  return `#!/usr/bin/env bash\n${source}`;
}

export class BashRuntime extends BaseRuntime {
  async prepare(context) {
    const sourcePath = path.join(
      context.workspacePath,
      BASH_CONFIG.sourceFile,
    );

    await fs.writeFile(sourcePath, normalizeShellSource(context.code), "utf8");
  }

  async compile() {
    return {
      success: true,
    };
  }

  async execute(context) {
    return interactiveRunner(
      context.jobId,
      BASH_CONFIG.executeCommand,
      context.workspacePath,
      context.socket,
      [BASH_CONFIG.sourceFile],
    );
  }
}
