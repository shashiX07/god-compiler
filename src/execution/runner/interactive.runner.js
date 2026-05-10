import { spawn } from 'child_process';
import { EXECUTION_CONSTANTS } from '../../constants/execution.constants.js';
import { processRegistry } from '../manager/process.registry.js';


export const interactiveRunner = (jobId, executablePath, cwd, socket) => {
    return new Promise((resolve, reject) => {
        const childProcess = spawn(executablePath, [], { cwd, detached: true });
        processRegistry.add(jobId, {process: childProcess, socket});

        let timeoutTriggered = false;

        const timeout = setTimeout(() => {
            timeoutTriggered = true;
            try {
                process.kill(-childProcess.pid, 'SIGKILL');
            } catch (error) {
                console.error("Error killing process on timeout:", error);
            }
        }, EXECUTION_CONSTANTS.RUN_TIMEOUT);

        childProcess.stdout.on("data", (data) => {
            socket.send(JSON.stringify({
                event: 'stdout',
                data: data.toString()
            }));
        });

        childProcess.stderr.on("data", (data) => {
            socket.send(JSON.stringify({
                event: "stderr",
                data: data.toString()
            }));
        })

        childProcess.on("close", (code) => {
            clearTimeout(timeout);
            processRegistry.remove(jobId);

            if (timeoutTriggered) {
                socket.send(JSON.stringify({
                    event: "exit",
                    data: "Execution Timeout: Process killed after exceeding time limit",
                    timeout: true,
                    exitCode: null
                }));
                return resolve();
            }
            socket.send(JSON.stringify({
                event: "exit",
                data: "Process exited with code " + code,
                exitCode: code
            }));

            resolve();
        });

    });
}