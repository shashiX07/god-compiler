import { WorkspaceManager } from "../workspace/workspace.manager.js";

import { CleanupManager } from "../workspace/cleanup.manager.js";

import { RuntimeFactory } from "../runtime/runtime.factory.js";

import { RuntimePipeline } from "../runtime/runtime.pipeline.js";

export class LiveExecutionManager {
  static async execute(context) {
    const { workspacePath } = await WorkspaceManager.createWorkspace(context.jobId);

    context.workspacePath = workspacePath;

    try {
      const runtime = RuntimeFactory.create(context.language);

      const result = await RuntimePipeline.run(runtime, context);

      // In interactive mode, the runner streams stdout/stderr/exit over the socket.
      // If we fail before spawning a process (e.g., compilation failure), emit something
      // the client already understands.
      if (result?.success === false && context.socket) {
        if (result.stdout) {
          context.socket.send(
            JSON.stringify({ event: "stdout", data: String(result.stdout) }),
          );
        }
        if (result.stderr) {
          context.socket.send(
            JSON.stringify({ event: "stderr", data: String(result.stderr) }),
          );
        }

        context.socket.send(
          JSON.stringify({
            event: "exit",
            data: result.message || "Compilation failed",
            exitCode: result.exitCode ?? 1,
          }),
        );
      }

      return result;
    } finally {
      await CleanupManager.cleanWorkspace(workspacePath);
    }
  }
}
