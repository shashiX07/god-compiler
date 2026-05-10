import { spawn } from "child_process";

export const compileCpp = (sourceFile, outputFile, cwd) => {
    return new Promise((resolve) => {
        const compilerProcess = spawn("g++", [sourceFile, "-o", outputFile], { cwd });

        let stdout = "";
        let stderr = "";
        let isTimeout = false;

        const timeout = setTimeout(() => {
            isTimeout = true;
            try {
                compilerProcess.kill("SIGKILL");
            } catch {
                // ignore
            }
        }, 10000); // 10 seconds timeout for compilation

        compilerProcess.stdout.on("data", (data) => {
            stdout += data.toString();
        });

        compilerProcess.stderr.on("data", (data) => {
            stderr += data.toString();
        });

        compilerProcess.on("close", (code) => {
            clearTimeout(timeout);

            if (isTimeout) {
                return resolve({
                    success: false,
                    timeout: true,
                    stdout,
                    stderr: "Compilation Timeout: Process killed after exceeding time limit",
                    exitCode: null,
                });
            }

            if (code === 0) {
                return resolve({
                    success: true,
                    timeout: false,
                    stdout,
                    stderr,
                    exitCode: 0,
                });
            }

            resolve({
                success: false,
                timeout: false,
                stdout,
                stderr: stderr || `Compilation failed with code ${code}`,
                exitCode: code,
            });
        });

        compilerProcess.on("error", (error) => {
            clearTimeout(timeout);
            resolve({
                success: false,
                timeout: false,
                stdout,
                stderr: `Failed to start compilation process: ${error.message}`,
                exitCode: null,
            });
        });
    });
};