import { WorkspaceManager } from "../workspace/workspace.manager.js";

import { CleanupManager } from "../workspace/cleanup.manager.js";

import { RuntimeFactory } from "../runtime/runtime.factory.js";

import { RuntimePipeline } from "../runtime/runtime.pipeline.js";
import { collectPngArtifacts } from "../workspace/artifact.manager.js";

export class LiveExecutionManager {
  static async execute(context) {
    const { workspacePath } = await WorkspaceManager.createWorkspace(context.jobId);

    context.workspacePath = workspacePath;

    try {
      let runtime;
      try {
        runtime = RuntimeFactory.create(context.language);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (context.socket) {
          context.socket.send(
            JSON.stringify({
              event: "error",
              data: message,
            }),
          );
          context.socket.send(
            JSON.stringify({
              event: "exit",
              data: message,
              exitCode: 1,
            }),
          );
        }
        return {
          success: false,
          phase: "prepare",
          message,
          exitCode: 1,
        };
      }

      const result = await RuntimePipeline.run(runtime, context);
      result.files = await collectPngArtifacts(workspacePath);

      for (const file of result.files) {
        if (context.socket?.readyState === context.socket.OPEN) {
          context.socket.send(
            JSON.stringify({
              event: "file",
              name: file.name,
              mimeType: file.mimeType,
              data: file.data,
            }),
          );
        }
      }

      // The runner streams stdout/stderr, but exit is emitted here so generated
      // files always arrive before the client closes the session.
      if (context.socket?.readyState === context.socket.OPEN) {
        if (result?.success === false) {
          // If we fail before spawning a process (e.g., compilation failure),
          // emit output that the client did not receive during execution.
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
        }

        const exitData =
          result.message ||
          (result.timeout
            ? "Execution timeout"
            : `Process exited with code ${result.exitCode ?? 0}`);
        context.socket.send(
          JSON.stringify({
            event: "exit",
            data: exitData,
            timeout: Boolean(result.timeout),
            exitCode: result.exitCode ?? (result.success === false ? 1 : 0),
          }),
        );
      }

      return result;
    } finally {
      await CleanupManager.cleanWorkspace(workspacePath);
    }
  }
}
