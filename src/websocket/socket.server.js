import {WebSocketServer} from "ws";
import {terminalGateway} from "./terminal.gateway.js";

export const initilizeWebSocker = (server) => {
    const wss = new WebSocketServer({ server });

    wss.on("connection", (ws) => {
        terminalGateway(ws);
    });
}