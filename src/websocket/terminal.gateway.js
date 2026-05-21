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
          socketJobRegistry.add(socket, jobId);

          socket.send(
            JSON.stringify({
              event: "started",
              jobId,
            }),
          );

          await LiveExecutionManager.execute({
            jobId,
            language: parsed.language,
            code: parsed.code,
            workspacePath: null,
            socket
          });

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
    } catch (error) {
        console.error("Failed to process message:", message, error);
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

    socketJobRegistry.remove(socket);
  });
};
