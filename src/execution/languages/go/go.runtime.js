import path from "path";
import fs from "fs/promises";

import { BaseRuntime } from "../../runtime/runtime.types.js";
import { compileProgram } from "../../compiler/compile.cpp.js";
import { interactiveRunner } from "../../runner/interactive.runner.js";
import { GO_CONFIG } from "./go.config.js";

export class GoRuntime extends BaseRuntime {
  async prepare(context) {
    await fs.writeFile(
      path.join(context.workspacePath, GO_CONFIG.sourceFile),
      context.code ?? "",
      "utf8",
    );
    await fs.writeFile(
      path.join(context.workspacePath, GO_CONFIG.moduleFile),
      GO_CONFIG.moduleSource,
      "utf8",
    );
  }

  async compile(context) {
    return compileProgram(
      GO_CONFIG.compileCommand,
      ["build", "-o", GO_CONFIG.outputFile, GO_CONFIG.sourceFile],
      context.workspacePath,
      GO_CONFIG.compileTimeout,
      {
        GO111MODULE: "on",
        GOPROXY: "off",
      },
    );
  }

  async execute(context) {
    return interactiveRunner(
      context.jobId,
      `./${GO_CONFIG.outputFile}`,
      context.workspacePath,
      context.socket,
      [],
      {
        env: {
          GO111MODULE: "on",
          GOPROXY: "off",
        },
      },
    );
  }
}
