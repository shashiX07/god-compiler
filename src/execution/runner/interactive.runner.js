import { spawn } from 'child_process';
import { EXECUTION_CONSTANTS } from '../../constants/execution.constants.js';
import { processRegistry } from '../manager/process.registry.js';
import { OutputMonitor } from '../../security/output.monitor.js';
import { stdinBufferRegistry } from '../manager/stdin.buffer.registry.js';


const sendSocketEvent = (socket, payload) => {
    if (socket && socket.readyState === socket.OPEN) {
        socket.send(JSON.stringify(payload));
    }
};

export const interactiveRunner = (jobId, executablePath, cwd, socket, args = []) => {
    return new Promise((resolve, reject) => {
        const childProcess = spawn(executablePath, args, { cwd, detached: true });
        const outputMonitor = new OutputMonitor(childProcess);
        processRegistry.add(jobId, {process: childProcess, socket});
        for (const chunk of stdinBufferRegistry.drain(jobId)) {
            try {
                childProcess.stdin.write(chunk);
            } catch {
                // ignore buffered stdin write failures
            }
        }

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
            outputMonitor.track(data);
            sendSocketEvent(socket, {
                event: 'stdout',
                data: data.toString()
            });
        });

        childProcess.stderr.on("data", (data) => {
            outputMonitor.track(data);
            sendSocketEvent(socket, {
                event: "stderr",
                data: data.toString()
            });
        })

        childProcess.on("close", (code) => {
            clearTimeout(timeout);
            processRegistry.remove(jobId);

            if (timeoutTriggered) {
                sendSocketEvent(socket, {
                    event: "exit",
                    data: "Execution Timeout: Process killed after exceeding time limit",
                    timeout: true,
                    exitCode: null
                });
                return resolve();
            }
            sendSocketEvent(socket, {
                event: "exit",
                data: "Process exited with code " + code,
                exitCode: code
            });

            resolve();
        });

        childProcess.on("error", (error) => {
            clearTimeout(timeout);
            processRegistry.remove(jobId);
            reject(error);
        });

    });
}
