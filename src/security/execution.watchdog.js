import { processRegistry } from "../execution/manager/process.registry.js";

export const startExecutionWatchdog = () => {
  setInterval(() => {
    // 1. Safety check: Ensure processRegistry and processes exist
    if (!processRegistry || !processRegistry.processes) {
    //   console.warn("[WATCHDOG] Process registry not initialized yet.");
      return;
    }

    const processesMap = processRegistry.processes;

    // 2. Iterate safely using the Map entries
    for (const [jobId, data] of processesMap.entries()) {
      try {
        const childProcess = data.process;

        // 3. Check if process is dead or exited
        if (
          !childProcess ||
          childProcess.killed ||
          childProcess.exitCode !== null
        ) {
        //   console.log(`[WATCHDOG] Cleaning up stale jobId: ${jobId}`);
          processRegistry.remove(jobId);
        }
      } catch (err) {
        console.error(`[WATCHDOG] Error checking jobId ${jobId}:`, err);
        processRegistry.remove(jobId); // Cleanup if data is malformed
      }
    }
  }, 5000);
};
