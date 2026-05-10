import http from 'http';
import app from './app.js';
import { env } from './config/env.js';
import { initilizeWebSocker } from './websocket/socket.server.js';
import { startExecutionWatchdog } from './security/execution.watchdog.js';
import { startQueueWorker } from './execution/queue/queue.worker.js';
import "./execution/runtime/register.runtimes.js";


const server = http.createServer(app);
initilizeWebSocker(server);
startQueueWorker();
startExecutionWatchdog();
server.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT}. visit http://localhost:${env.PORT}/`);
});