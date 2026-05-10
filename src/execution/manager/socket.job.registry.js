class SocketJobRegistry {
  constructor() {
    this.registry = new Map();
  }

  add(socketId, jobId) {
    if (!this.registry.has(socketId)) {
      this.registry.set(socketId, new Set());
    }

    this.registry.get(socketId).add(jobId);
  }

  getJobs(socketId) {
    return this.registry.get(socketId) || new Set();
  }

  remove(socketId) {
    this.registry.delete(socketId);
  }

  removeSocket(socketId) {
    this.remove(socketId);
  }
}

export const socketJobRegistry = new SocketJobRegistry();
