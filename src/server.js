import http from 'http';
import app from './app.js';
import { env } from './config/env.js';
import { initilizeWebSocker } from './websocket/socket.server.js';


const server = http.createServer(app);
initilizeWebSocker(server);

server.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT}. visit http://localhost:${env.PORT}/`);
});