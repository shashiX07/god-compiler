import path from "path";
import fs from "fs/promises";

import { BaseRuntime } from "../../runtime/runtime.types.js";
import { compileProgram } from "../../compiler/compile.cpp.js";
import { interactiveRunner } from "../../runner/interactive.runner.js";
import { JAVA_CONFIG, extractJavaPublicClass } from "./java.config.js";

export class JavaRuntime extends BaseRuntime {
  async prepare(context) {
    context.javaClassName = extractJavaPublicClass(context.code);
    const sourcePath = path.join(
      context.workspacePath,
      `${context.javaClassName}.java`,
    );
    await fs.writeFile(sourcePath, context.code ?? "", "utf8");
  }

  async compile(context) {
    return compileProgram(
      JAVA_CONFIG.compileCommand,
      ["-encoding", "UTF-8", `${context.javaClassName}.java`],
      context.workspacePath,
      JAVA_CONFIG.compileTimeout,
    );
  }

  async execute(context) {
    return interactiveRunner(
      context.jobId,
      JAVA_CONFIG.executeCommand,
      context.workspacePath,
      context.socket,
      ["-Dfile.encoding=UTF-8", context.javaClassName],
    );
  }
}
