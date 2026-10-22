import http from 'http';
import app from './app.js';
import { env } from './config/env.js';
import { initilizeWebSocker } from './websocket/socket.server.js';
import { startExecutionWatchdog } from './security/execution.watchdog.js';
import { startQueueWorker } from './execution/queue/queue.worker.js';
import "./execution/runtime/register.runtimes.js";
import { paths } from './config/paths.js';
import { CleanupManager } from './execution/workspace/cleanup.manager.js';


const server = http.createServer(app);
initilizeWebSocker(server);
startQueueWorker();
startExecutionWatchdog();

let shuttingDown = false;
const shutdown = async (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`Received ${signal}; cleaning temporary execution files.`);
    server.close(async () => {
        await CleanupManager.cleanWorkspace(paths.TEMP_EXECUTIONS);
        process.exit(0);
    });
};

process.once('SIGTERM', () => void shutdown('SIGTERM'));
process.once('SIGINT', () => void shutdown('SIGINT'));

server.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT}. visit http://localhost:${env.PORT}/`);
});