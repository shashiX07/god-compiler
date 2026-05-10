class StdinBufferRegistry {
  constructor() {
    this.buffers = new Map();
  }

  push(jobId, chunk) {
    if (!jobId || typeof chunk !== "string" || chunk.length === 0) return;
    if (!this.buffers.has(jobId)) this.buffers.set(jobId, []);
    this.buffers.get(jobId).push(chunk);
  }

  drain(jobId) {
    const chunks = this.buffers.get(jobId);
    if (!chunks) return [];
    this.buffers.delete(jobId);
    return chunks;
  }
}

export const stdinBufferRegistry = new StdinBufferRegistry();
