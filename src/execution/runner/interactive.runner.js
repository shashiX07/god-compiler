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

export const interactiveRunner = (
    jobId,
    executablePath,
    cwd,
    socket,
    args = [],
    options = {},
) => {
    return new Promise((resolve, reject) => {
        const childProcess = spawn(executablePath, args, {
            cwd,
            detached: true,
            env: {
                ...process.env,
                ...(options.env || {}),
            },
        });
        const outputMonitor = new OutputMonitor(childProcess);

        let timeoutReason = null;
        let idleTimeout = null;
        let maxTimeout = null;

        const killProcess = (reason) => {
            if (timeoutReason) return;
            timeoutReason = reason;
            try {
                if (process.platform === 'win32') {
                    childProcess.kill('SIGKILL');
                } else {
                    process.kill(-childProcess.pid, 'SIGKILL');
                }
            } catch (error) {
                if (error?.code !== 'ESRCH') {
                    console.error("Error killing process on timeout:", error);
                }
            }
        };

        const startIdleTimeout = () => {
            return setTimeout(() => {
                killProcess("idle_timeout");
            }, EXECUTION_CONSTANTS.RUN_TIMEOUT);
        };

        const resetIdleTimeout = () => {
            if (!EXECUTION_CONSTANTS.RUN_TIMEOUT) return;
            clearTimeout(idleTimeout);
            idleTimeout = startIdleTimeout();
        };

        const clearTimeouts = () => {
            clearTimeout(idleTimeout);
            clearTimeout(maxTimeout);
        };

        idleTimeout = startIdleTimeout();
        maxTimeout = setTimeout(() => {
            killProcess("max_execution_timeout");
        }, EXECUTION_CONSTANTS.MAX_EXECUTION_TIMEOUT);

        processRegistry.add(jobId, {
            process: childProcess,
            socket,
            resetIdleTimeout,
            clearTimeouts,
        });

        for (const chunk of stdinBufferRegistry.drain(jobId)) {
            try {
                childProcess.stdin.write(chunk);
                resetIdleTimeout();
            } catch {
                // ignore buffered stdin write failures
            }
        }

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
            clearTimeouts();
            processRegistry.remove(jobId);

            if (timeoutReason) {
                const message = timeoutReason === "max_execution_timeout"
                    ? "Execution Timeout: Maximum execution time exceeded"
                    : "Execution Timeout: Process killed after exceeding time limit";
                sendSocketEvent(socket, {
                    event: "exit",
                    data: message,
                    timeout: true,
                    timeoutType: timeoutReason,
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
            clearTimeouts();
            processRegistry.remove(jobId);
            reject(error);
        });

    });
}
