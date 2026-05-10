class SocketRegistery {
    constructor() {
        this.sockets = new Map();
    }
    add(socketID, socket) {
        this.sockets.set(socketID, socket);
    }
    get(socketID) {
        return this.sockets.get(socketID);
    }
    remove(socketID) {
        this.sockets.delete(socketID);
    }
}

export const socketRegistry = new SocketRegistery();
