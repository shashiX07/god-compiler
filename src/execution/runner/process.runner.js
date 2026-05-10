import { spawn } from "child_process";
import { OutputGuard } from "./output.guard.js";
import { EXECUTION_CONSTANTS } from "../../constants/execution.constants.js";

export const runProcess = (executablePath, cwd) => {
    return new Promise((resolve, reject) => {
        const child = spawn(executablePath, [], { cwd });
        const guard = new OutputGuard(child); 

        let stdout = "";
        let stderr = "";
        let timeoutTriggered = false;

        const timeout = setTimeout(() => {
            timeoutTriggered = true;
            child.kill("SIGKILL");
        }, EXECUTION_CONSTANTS.RUN_TIMEOUT);

        child.stdout.on("data", (data) => {
            const chunk = data.toString();
            guard.addChunk(chunk); 
            stdout += chunk;
        });

        child.stderr.on("data", (data) => {
            const chunk = data.toString();
            guard.addChunk(chunk);
            stderr += chunk;
        });

        child.on("close", (code) => {
            clearTimeout(timeout);

            if (timeoutTriggered) {
                return resolve({
                    success: false,
                    timeout: true,
                    stdout,
                    stderr: "Execution Timeout: Process killed after exceeding time limit",
                    exitCode: null,
                });
            }

            if (guard.isExceeded) {
                return resolve({
                    success: false,
                    timeout: false,
                    stdout,
                    stderr: "Output Limit Exceeded: Process killed after exceeding output size limit",
                    exitCode: null,
                });
            }

            resolve({
                success: code === 0,
                timeout: false,
                stdout,
                stderr,
                exitCode: code
            });
        });

        child.on("error", (err) => {
            clearTimeout(timeout);
            reject(err);
        });
    });
};