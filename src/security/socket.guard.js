const MAX_MESSAGE_PER_MINUTE = 100; // 100 messages per minute
export class SocketGuard {
    constructor() {
        this.clients = new Map();
    }
    track(socket) {
        const now = Date.now();
        if (!this.clients.has(socket.id)) {
            this.clients.set(socket.id, []);
        }
        const timestamps = this.clients.get(socket.id);
        timestamps.push(now);
        const recent = timestamps.filter(ts => now - ts < 60000);
        this.clients.set(socket.id, recent);
        return(
            recent.length <= MAX_MESSAGE_PER_MINUTE
        )
    }
}

export const socketGuard = new SocketGuard();