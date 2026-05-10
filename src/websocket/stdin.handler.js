import { processRegistry } from "../execution/manager/process.registry.js";
import { stdinBufferRegistry } from "../execution/manager/stdin.buffer.registry.js";
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
            // Process might not be spawned yet — buffer and flush on runner start.
            stdinBufferRegistry.push(jobId, input);
            return;
        }
        processData.process.stdin.write(input);
    } catch (error) {
        console.error("Error writing to process stdin:", error);
    }
}