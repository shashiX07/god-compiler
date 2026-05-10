import {spawn} from "child_process";
export const compileCpp = (sourceFile, outputFile, cwd) => {
    return new Promise((resolve, reject) => {
        const compilerProcess = spawn('g++', [sourceFile, '-o', outputFile], {cwd});
        let stdout = '';
        let stderr = '';
        let isTimeout = false;
        const timeout = setTimeout(() => {
            isTimeout = true;
            compilerProcess.kill('SIGKILL');
        }, 10000); // 10 seconds timeout for compilation

        compilerProcess.stdout.on('data', (data) => {
            stdout += data.toString();
        });
        compilerProcess.stderr.on('data', (data) => {
            stderr += data.toString();
        });
        compilerProcess.on('close', (code) => {
            if (isTimeout) {
                return resolve({
                    success: false,
                    timeout: true,
                    stdout,
                    stderr: 'Compilation Timeout: Process killed after exceeding time limit',
                    exitCode: null
                });
            }
            if (code === 0) {
                resolve({stdout, stderr});
            } else {
                reject(new Error(`Compilation failed with code ${code}: ${stderr}`));
            }
        });
        compilerProcess.on('error', (error) => {
            clearTimeout(timeout);
            reject(new Error(`Failed to start compilation process: ${error.message}`));
        });
    });
}