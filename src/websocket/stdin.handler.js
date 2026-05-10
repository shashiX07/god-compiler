import { processRegistry } from "../execution/manager/process.registry.js";
import { validateStdin } from "../security/stdin.validator.js";
export const handleStdin = (input, jobId, socket) => {
    if (!validateStdin(input)) {
        console.error(`Invalid stdin input for job ID: ${jobId}`);
        socket.send(JSON.stringify({
            event: "error",
            data: "Invalid stdin input provided"
        }));
        return;
    }

    try {
        const processData = processRegistry.get(jobId);
        if (!processData) {
            console.error(`No active process found for job ID: ${jobId}`);
            return;
        }
        processData.process.stdin.write(input);
    } catch (error) {
        console.error("Error writing to process stdin:", error);
    }
}