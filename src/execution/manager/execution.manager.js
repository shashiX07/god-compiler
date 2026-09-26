import { v4 as uuidv4 } from "uuid";

import { WorkspaceManager } from "../workspace/workspace.manager.js";
import { CleanupManager } from "../workspace/cleanup.manager.js";
import { JobRegistry } from "./job.registry.js";
import { JOB_STATES } from "./state.machine.js";
import { concurrencyGuard } from "../queue/concurrency.guard.js";
import { RuntimeFactory } from "../runtime/runtime.factory.js";
import { RuntimePipeline } from "../runtime/runtime.pipeline.js";

export class ExecutionManager {
  static async executeCpp(code) {
    return this.execute(code, "cpp");
  }

  static async execute(code, language = "cpp") {
    if (!concurrencyGuard.canRun()) {
      return {
        success: false,
        message:
          "Server is busy. You are in the queue. Please wait for your turn.",
      };
    }
    concurrencyGuard.start();
    const jobID = uuidv4();
    const { workspacePath } = await WorkspaceManager.createWorkspace(jobID);
    const job = {
      id: jobID,
      state: JOB_STATES.CREATED,
      workspacePath,
      createdAt: new Date(),
    };
    JobRegistry.create(job);
    try {
      job.state = JOB_STATES.COMPILING;
      let runtime;
      try {
        runtime = RuntimeFactory.create(language);
      } catch (error) {
        job.state = JOB_STATES.FAILED;
        return {
          success: false,
          phase: "prepare",
          message: error instanceof Error ? error.message : String(error),
        };
      }

      const result = await RuntimePipeline.run(runtime, {
        jobId: jobID,
        language,
        code,
        workspacePath,
        socket: null,
      });
      job.state =
        result?.success === false ? JOB_STATES.FAILED : JOB_STATES.COMPLETED;
      return result;
    } catch (error) {
      console.error("Error during execution:", error);
      job.state = JOB_STATES.FAILED;
      return {
        success: false,
        phase: "compilation/execution",
        message: "Error during code execution: \n" + error.message,
      };
    } finally {
      await CleanupManager.cleanWorkspace(workspacePath);
      job.state = JOB_STATES.CLEAN;
      JobRegistry.remove(jobID);
      concurrencyGuard.end();
    }
  }
}
