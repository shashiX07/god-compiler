import { spawn } from "child_process";

export const compileProgram = (compiler, args, cwd, timeoutMs = 10000, extraEnv) => {
    return new Promise((resolve) => {
        const compilerProcess = spawn(compiler, args, {
            cwd,
            env: extraEnv ? { ...process.env, ...extraEnv } : process.env,
        });

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
        }, timeoutMs);

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
            const missing = error?.code === "ENOENT"
                ? `Compiler '${compiler}' is not installed on this server.`
                : error.message;
            resolve({
                success: false,
                timeout: false,
                stdout,
                stderr: `Failed to start compilation process: ${missing}`,
                exitCode: null,
            });
        });
    });
};

export const compileCpp = (sourceFile, outputFile, cwd) => {
    return compileProgram("g++", [sourceFile, "-o", outputFile], cwd);
};
