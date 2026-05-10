import { v4 as uuid } from "uuid";

import { LiveExecutionManager } from "../execution/manager/live.execution.manager.js";

import { handleStdin } from "./stdin.handler.js";

import { terminateExecution } from "./terminate.handler.js";

import { socketJobRegistry } from "../execution/manager/socket.job.registry.js";

import { socketGuard } from "../security/socket.guard.js";

export const terminalGateway = (socket) => {
  socket.on("message", async (message) => {
    try {
      const parsed = JSON.parse(message);

      switch (parsed.event) {
        case "execute": {
          const jobId = uuid();

          socket.send(
            JSON.stringify({
              event: "started",
              jobId,
            }),
          );

          await LiveExecutionManager.executeCpp(jobId, parsed.code, socket);

          break;
        }

        case "stdin": {
          handleStdin(parsed.data, parsed.jobId, socket);

          break;
        }

        case "terminate": {
          terminateExecution(parsed.jobId, socket);

          break;
        }
      }
    } catch {
      socket.send(
        JSON.stringify({
          event: "error",
          data: "Internal server error",
        }),
      );
    }
  });

  socket.on("close", () => {
    const jobs = socketJobRegistry.getJobs(socket);

    for (const jobId of jobs) {
        terminateExecution(jobId, socket);
    }

    socketJobRegistry.removeSocket(socket);
  });
};
