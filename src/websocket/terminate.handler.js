import { processRegistry } from "../execution/manager/process.registry.js";
export const terminateExecution = (jobId, socket) => {
    const processData = processRegistry.get(jobId);
    if (!processData) {
        console.error(`No active process found for job ID: ${jobId}`);
        socket.send(JSON.stringify({
            event: "error",
            data: "No active process found for the given job ID"
        }));
        return;
    }
    try {
        if (process.platform === 'win32') {
            processData.process.kill('SIGKILL');
        } else {
            process.kill(-processData.process.pid, 'SIGKILL');
        }
        socket.send(JSON.stringify({
            event: "terminated",
            data: "Process terminated successfully"
        }));
    } catch (error) {
        if (error?.code !== 'ESRCH') {
            console.error("Error terminating process:", error);
        }
        socket.send(JSON.stringify({
            event: "error",
            data: "Failed to terminate the process"
        }));
    }
}