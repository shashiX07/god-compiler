import {spawn} from 'child_process';
import { EXECUTION_CONSTANTS } from '../../constants/execution.constants.js';
import { exitCode } from 'process';
export const streamRunner = (executablePath, cwd, socket) => {
    return new Promise((resolve,reject) => {
        const process = spawn(executablePath, [], { cwd });
        let timeoutTriggered = false;

        const timeout = setTimeout(() => {
            timeoutTriggered = true;
            process.kill('SIGKILL');
        }, EXECUTION_CONSTANTS.RUN_TIMEOUT);

        process.stdout.on("data", (data) => {
            socket.send(JSON.stringify({
                event: 'stdout',
                data: data.toString()
            }))
        });

        process.stderr.on("data", (data) => {
            socket.send(JSON.stringify({
                event: 'stderr',
                data: data.toString()
            }))
        })

        process.on("close", (code) => {
            clearTimeout(timeout);

            if (timeoutTriggered) {
                socket.send(JSON.stringify({
                    event: 'exit',
                    data: {
                        success: false,
                        timeout: true,
                        message: "Execution Timeout: Process killed after exceeding time limit",
                        exitCode: null
                    }
                }))
                return resolve();
            }

            socket.send(JSON.stringify({
                event: 'exit',
                exitCode: code,
            }));

            resolve();
        })
    })
}