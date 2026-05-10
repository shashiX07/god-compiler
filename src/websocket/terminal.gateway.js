import { v4 as uuidv4 } from 'uuid';
import { socketRegistry } from './socket.registry.js';
import { LiveExecutionManager } from '../execution/manager/live.execution.manager.js';
 
export const terminalGateway = (socket) => {
    const socketID = uuidv4();
    socketRegistry.add(socketID, socket);
    socket.on("message", async (rawMessage) => {
        try {
            const message = rawMessage.toString();
            const parsed = JSON.parse(message);
            if (parsed.event === "execute") {
                const { language, code } = parsed;
                if (language !== 'cpp') {
                    socket.send(JSON.stringify({
                        event: "error",
                        data: "Unsupported language only cpp is supported"
                    }))
                    return;
                }
                await LiveExecutionManager.executeCpp(code, socket);
            }
        } catch (error) {
            console.error("Error in terminal gateway:", error);
            socket.send(JSON.stringify({
                event: "error",
                data: "Internal Server Error"
            }));
        }
    });

    socket.on("close", () => {
        socketRegistry.remove(socketID);
    })
}